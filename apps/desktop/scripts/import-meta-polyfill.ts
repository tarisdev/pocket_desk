// Polyfill for import.meta.url in CommonJS
import { fileURLToPath } from 'node:url';

if (typeof import.meta === 'undefined') {
  // @ts-ignore
  globalThis.import = { meta: { url: new URL(import.meta.url).href } };
}

// For CommonJS compatibility, provide __filename and __dirname
if (typeof __filename === 'undefined') {
  // @ts-ignore
  globalThis.__filename = fileURLToPath(import.meta.url);
}
if (typeof __dirname === 'undefined') {
  // @ts-ignore
  globalThis.__dirname =
    import.meta.dirname ?? fileURLToPath(new URL('.', import.meta.url));
}
