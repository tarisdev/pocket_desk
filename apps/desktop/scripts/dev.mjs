// Pocket Desk desktop development orchestrator.
//
// Responsibilities:
//   1. Compile the Electron main process (tsc) once, then keep it in watch mode.
//   2. Run the Vite dev server for the renderer (HMR for CSS + app.js).
//   3. Launch Electron against the dev server, and restart it (single instance)
//      whenever the compiled main process changes.
//   4. Copy the plain-JS preload into dist/ on start (preload reload is handled
//      inside main.ts while in dev mode).
//   5. Tear down every child process on exit so no orphans are left behind.
//
// The production build (tsc + copy) is untouched; this script is dev-only.

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, '..');

const tscBin = require.resolve('typescript/bin/tsc');
const electronBin = require('electron');
const distDir = path.join(desktopDir, 'dist');
const preloadSrc = path.join(desktopDir, 'src', 'preload.cjs');
const preloadDest = path.join(distDir, 'preload.cjs');

const VITE_PORT = Number(process.env.POCKET_DESK_VITE_PORT ?? 5173);
const VITE_URL = `http://localhost:${VITE_PORT}`;

let viteServer = null;
let tscProc = null;
let electronProc = null;
let restarting = false;
let shuttingDown = false;

const log = (msg) => console.log(`[dev] ${msg}`);

function copyPreload() {
  try {
    if (fs.existsSync(preloadSrc)) fs.copyFileSync(preloadSrc, preloadDest);
  } catch (e) {
    console.error('[dev] failed to copy preload.cjs:', e);
  }
}

function buildOnce() {
  log('compiling main process (tsc)...');
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [tscBin, '-p', 'tsconfig.json'], {
      cwd: desktopDir,
      stdio: 'inherit',
    });
    proc.on('exit', (code) => {
      if (code !== 0) {
        console.error(
          `[dev] initial tsc exited with code ${code}; continuing with last output`
        );
      }
      resolve();
    });
  });
}

// Start `tsc --watch`. Resolves once the initial build finishes and the watcher
// is ready, so the restart watcher can be armed afterwards (no spurious restart).
function startTscWatch() {
  const proc = spawn(
    process.execPath,
    [tscBin, '-p', 'tsconfig.json', '--watch', '--preserveWatchOutput'],
    {
      cwd: desktopDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  tscProc = proc;
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    let buf = '';
    proc.stdout.on('data', (d) => {
      const s = d.toString();
      process.stdout.write(s);
      buf += s;
      if (buf.includes('Watching for file changes')) done();
    });
    proc.stderr.on('data', (d) => process.stderr.write(d.toString()));
    proc.on('exit', () => done());
    setTimeout(done, 8000); // fallback if the ready line is not observed
  });
}

// Terminate an Electron process tree (main + renderer + gpu helpers).
function killElectronTree(proc) {
  if (!proc || proc.pid == null) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      process.kill(-proc.pid, 'SIGTERM');
    }
  } catch {
    /* best effort */
  }
  try {
    proc.kill();
  } catch {
    /* best effort */
  }
}

function killElectronTreeSync(proc) {
  if (!proc || proc.pid == null) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      try {
        process.kill(-proc.pid, 'SIGTERM');
      } catch {
        /* noop */
      }
    }
  } catch {
    /* best effort */
  }
  try {
    proc.kill();
  } catch {
    /* best effort */
  }
}

function spawnElectron() {
  if (electronProc || shuttingDown) return;
  log('launching electron...');
  // Ensure Electron runs as an app (not as plain Node) and keeps a console.
  const childEnv = { ...process.env };
  delete childEnv.ELECTRON_RUN_AS_NODE;
  delete childEnv.ELECTRON_NO_ATTACH_CONSOLE;
  childEnv.POCKET_DESK_DEV = '1';
  childEnv.POCKET_DESK_VITE_URL = VITE_URL;
  const proc = spawn(electronBin, ['.'], {
    cwd: desktopDir,
    env: childEnv,
    stdio: 'inherit',
  });
  electronProc = proc;
  proc.on('exit', (code, signal) => {
    if (electronProc === proc) electronProc = null;
    log(`electron exited (code=${code}, signal=${signal})`);
  });
}

// Restart Electron on main-process changes. Never runs two instances at once and
// ignores renderer/CSS-only changes (those are handled by the Vite dev server).
function restartElectron(reason) {
  if (restarting || shuttingDown) return;
  restarting = true;
  log(`restarting electron (${reason})`);
  const proc = electronProc;
  electronProc = null;

  let done = false;
  const finish = () => {
    if (done || shuttingDown) return;
    done = true;
    restarting = false;
    spawnElectron();
  };

  if (proc) {
    proc.once('exit', finish);
    killElectronTree(proc);
    setTimeout(finish, 3000); // fallback if the exit event is not observed
  } else {
    restarting = false;
    spawnElectron();
  }
}

function startMainWatcher() {
  if (!fs.existsSync(distDir)) return;
  let timer = null;
  try {
    fs.watch(distDir, (_event, filename) => {
      if (filename && String(filename) !== 'main.js') return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => restartElectron('main process changed'), 180);
    });
  } catch (e) {
    console.error('[dev] main watcher failed:', e);
  }
}

async function startVite() {
  log(`starting renderer dev server on ${VITE_URL} ...`);
  // Load vite.config.mjs so the @tailwindcss/vite plugin is active: CSS authored
  // with Tailwind v4 (@theme / @apply) is compiled and hot-reloaded by the dev
  // server. Inline root/server override the file only where they differ.
  viteServer = await createServer({
    configFile: path.join(desktopDir, 'vite.config.mjs'),
    root: path.join(desktopDir, 'src', 'renderer'),
    clearScreen: false,
    logLevel: 'info',
    server: { port: VITE_PORT, strictPort: true },
  });
  await viteServer.listen();
  viteServer.printUrls();
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  log('shutting down...');
  if (electronProc) {
    killElectronTreeSync(electronProc);
    electronProc = null;
  }
  if (tscProc) {
    try {
      tscProc.kill();
    } catch {
      /* noop */
    }
    tscProc = null;
  }
  const exit = () => process.exit(code);
  if (viteServer) {
    Promise.resolve(viteServer.close()).then(exit, exit);
  } else {
    exit();
  }
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  await buildOnce();
  copyPreload();
  await startVite();
  await startTscWatch();
  startMainWatcher();
  spawnElectron();
}

main().catch((e) => {
  console.error('[dev] fatal error:', e);
  shutdown(1);
});
