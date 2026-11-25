import { app, BrowserWindow } from '@main/utils/electron';
import http from 'node:http';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

import {
  PORT,
  COMPUTER_NAME,
  IS_DEV,
  VITE_URL,
  DEFAULT_SETTINGS,
} from '@main/config/index';
import { SessionManager } from '@main/session/index';
import { PairingManager } from '@main/pairing/index';
import { TelemetryCollector } from '@main/telemetry/index';
import { WebSocketManager } from '@main/websocket/index';
import { registerIpcHandlers } from '@main/ipc/index';

const mainDir = __dirname;

const settings: typeof DEFAULT_SETTINGS = { ...DEFAULT_SETTINGS };

const sessionManager = new SessionManager(broadcastDevices);
const pairingManager = new PairingManager();

const expressApp = express();
expressApp.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '600');
  next();
});

expressApp.get('/pairing/qr', async (_req, res) => {
  try {
    const svg = await pairingManager.generateQR();
    res.type('image/svg+xml').send(svg);
  } catch (e) {
    res.status(500).send('Failed to generate QR');
  }
});

expressApp.get('/health', (_req, res) =>
  res.json({ ok: true, computer: COMPUTER_NAME, port: PORT })
);

const server = http.createServer(expressApp);

let mainWindow: BrowserWindow | null = null;

const telemetryCollector = new TelemetryCollector(
  sessionManager.getSessions(),
  mainWindow,
  settings.telemetryInterval,
  (msg) => mainWindow?.webContents.send('desktop:telemetry', msg)
);

function broadcastDevices(): void {
  mainWindow?.webContents.send(
    'desktop:devices',
    sessionManager.getDeviceList()
  );
}

const wsManager = new WebSocketManager(server, sessionManager, pairingManager, {
  onPairingSuccess: broadcastDevices,
  onDeviceDisconnect: broadcastDevices,
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Pocket Desk desktop agent listening on ' + PORT);
  console.log('Computer: ' + COMPUTER_NAME);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

function createWindow(): BrowserWindow {
  const preloadPath = path.join(mainDir, 'preload.cjs');
  const htmlPath = path.join(mainDir, 'renderer', 'index.html');
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 520,
    title: 'Pocket Desk',
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  telemetryCollector.setMainWindow(mainWindow);

  if (IS_DEV) {
    mainWindow.webContents.openDevTools();
  }

  if (IS_DEV && VITE_URL) {
    mainWindow.loadURL(VITE_URL);
  } else {
    mainWindow.loadFile(htmlPath);
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  return mainWindow;
}

function startDevPreloadWatcher(): void {
  const preloadSrc = path.join(mainDir, '..', 'src', 'preload.cjs');
  const preloadDest = path.join(mainDir, 'preload.cjs');
  if (!fs.existsSync(preloadSrc)) return;

  let timer: NodeJS.Timeout | null = null;
  try {
    fs.watch(path.dirname(preloadSrc), (_event, filename) => {
      if (filename && String(filename) !== 'preload.cjs') return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          fs.copyFileSync(preloadSrc, preloadDest);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.reload();
            console.log('[dev] preload rebuilt; renderer reloaded');
          }
        } catch (e) {
          console.error('[dev] preload reload failed:', e);
        }
      }, 120);
    });
  } catch (e) {
    console.error('[dev] preload watcher failed:', e);
  }
}

app.whenReady().then(() => {
  createWindow();
  if (IS_DEV) startDevPreloadWatcher();
  telemetryCollector.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

registerIpcHandlers({
  sessionManager,
  pairingManager,
  telemetryCollector,
  settings,
  mainWindow: null,
});
