const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
process.chdir(root);

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  if (!fs.existsSync(path.join(root, 'package.json'))) {
    console.error('package.json not found');
    process.exit(1);
  }
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8')
  );
  const workspaces = pkg.workspaces || [];
  console.log('Workspaces:', workspaces.join(', '));

  console.log('Checking Node.js/npm versions...');
  run('node --version');
  run('npm --version');

  console.log('Installing dependencies...');
  run('npm install');

  console.log('Verifying workspaces...');
  for (const ws of workspaces) {
    const dir = path.join(root, ws.replace(/\/\*$/, ''));
    if (!fs.existsSync(dir)) {
      // glob workspace
      continue;
    }
  }
  run('npm ls --depth=0');
  console.log('Setup complete.');
}

try {
  main();
} catch (e) {
  console.error('Setup failed:', e.message);
  process.exit(1);
}
