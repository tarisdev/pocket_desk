# Pocket Desk

Monorepo for Pocket Desk Phase 1.

## Structure

- apps/mobile: Expo React Native app
- apps/desktop: Electron desktop agent (React UI + Node.js main process, WebSocket server)
- packages/protocol: shared protocol

## Dev

```
npm install
npm run build:desktop    # compile main + preload
npm run dev:desktop      # launch Electron
npm run dev:mobile       # launch Expo
```

Desktop listens on port 47831 (configurable via settings). Pairing QR is shown on the Setup screen; mobile enters `ws://<ip>:47831/ws` and the token, then connects.

## Typecheck

```
npm run typecheck
```
