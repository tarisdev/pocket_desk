import { register } from 'tsconfig-paths';

register({
  baseUrl: new URL('..', import.meta.url).pathname,
  paths: {
    '@main/*': ['src/main/*'],
    '@renderer/*': ['src/renderer/*'],
    '@utils/*': ['src/renderer/utils/*'],
    '@screens/*': ['src/renderer/screens/*'],
    '@state/*': ['src/renderer/state/*'],
    '@i18n/*': ['src/renderer/i18n/*'],
  },
});
