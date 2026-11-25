import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin: inlines HTML partials referenced by
 * `<!-- @include "partials/xxx.html" -->` comments into index.html.
 * Works in both dev (Vite dev server) and build (vite build) modes.
 */
function htmlPartialsPlugin() {
  return {
    name: 'html-partials',
    transformIndexHtml(html) {
      return html.replace(
        /<!--\s*@include\s+"([^"]+)"\s*-->/g,
        (_match, partialPath) => {
          const fullPath = path.resolve(
            __dirname,
            'src',
            'renderer',
            partialPath
          );
          try {
            return fs.readFileSync(fullPath, 'utf8');
          } catch {
            console.warn(`[html-partials] Partial not found: ${partialPath}`);
            return _match;
          }
        }
      );
    },
  };
}

// Renderer dev server + production build for the Electron app.
//
// The renderer is plain HTML/CSS/JS (no framework). Vite serves two purposes:
//   1. Dev: an HMR dev server so CSS + app.js changes hot-update the renderer
//      without restarting Electron (wired up in scripts/dev.mjs).
//   2. Build: compile Tailwind CSS v4 and bundle app.js into dist/renderer so
//      the packaged app ships real CSS (never the raw @theme source).
//
// Tailwind CSS v4 is integrated via the @tailwindcss/vite plugin. `base: "./"`
// makes built asset URLs relative so Electron's loadFile(".../index.html")
// (file://) resolves them correctly.
export default defineConfig({
  base: './',
  root: 'src/renderer',
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist', 'renderer'),
    emptyOutDir: true,
  },
  plugins: [htmlPartialsPlugin(), tailwindcss()],
  resolve: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/renderer/utils'),
      '@screens': path.resolve(__dirname, 'src/renderer/screens'),
      '@state': path.resolve(__dirname, 'src/renderer/state'),
      '@i18n': path.resolve(__dirname, 'src/renderer/i18n'),
    },
  },
});
