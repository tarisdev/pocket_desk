import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

register({
  baseUrl: __dirname,
  paths: {
    '@main/*': ['src/main/*'],
    '@renderer/*': ['src/renderer/*'],
    '@utils/*': ['src/renderer/utils/*'],
    '@screens/*': ['src/renderer/screens/*'],
    '@state/*': ['src/renderer/state/*'],
    '@i18n/*': ['src/renderer/i18n/*'],
  },
});
