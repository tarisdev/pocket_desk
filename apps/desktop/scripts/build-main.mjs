import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = resolve(__dirname, '..', 'src');

// Simple approach: externalize electron and use a runtime wrapper
// The wrapper will be a separate file that patches the module system
await build({
  entryPoints: [join(srcDir, 'main.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  outdir: join(__dirname, '..', 'dist'),
  outExtension: { '.js': '.cjs' },
  external: [
    'electron',
    'express',
    'ws',
    'qrcode',
    'systeminformation',
    '@pocket-desk/protocol',
    'node:http',
    'node:path',
    'node:fs',
    'node:url',
    'node:crypto',
    'node:os',
  ],
  alias: {
    '@main': join(srcDir, 'main'),
    '@renderer': join(srcDir, 'renderer'),
    '@utils': join(srcDir, 'renderer', 'utils'),
    '@screens': join(srcDir, 'renderer', 'screens'),
    '@state': join(srcDir, 'renderer', 'state'),
    '@i18n': join(srcDir, 'renderer', 'i18n'),
  },
  mainFields: ['module', 'main'],
  conditions: ['import', 'module', 'node'],
});
