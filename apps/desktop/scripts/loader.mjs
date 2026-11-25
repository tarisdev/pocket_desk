import pkg from 'tsconfig-paths';
const { resolve: resolveTs, matchPath: matchPathTs } = pkg;
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register tsconfig-paths
resolveTs({
  baseUrl: join(__dirname, '..'),
  paths: {
    '@main/*': ['src/main/*'],
    '@renderer/*': ['src/renderer/*'],
    '@utils/*': ['src/renderer/utils/*'],
    '@screens/*': ['src/renderer/screens/*'],
    '@state/*': ['src/renderer/state/*'],
    '@i18n/*': ['src/renderer/i18n/*'],
  },
});

// Custom loader hook
export async function resolve(specifier, context, defaultResolve) {
  // Try to resolve with tsconfig-paths first
  const resolved = resolveTs(specifier, { baseUrl: join(__dirname, '..') });
  if (resolved) {
    return defaultResolve(resolved, context, defaultResolve);
  }
  return defaultResolve(specifier, context, defaultResolve);
}

export { load } from 'node:module';
