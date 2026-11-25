const { contextBridge, ipcRenderer } = require('electron');

console.log('[preload] Starting preload script');

if (!contextBridge || !ipcRenderer) {
  console.error(
    '[preload] electron contextBridge/ipcRenderer not available in preload context'
  );
}

try {
  const api = {
    getStatus: () => ipcRenderer.invoke('desktop:get-status'),
    getDevices: () => ipcRenderer.invoke('desktop:get-devices'),
    regenerateToken: () => ipcRenderer.invoke('desktop:regenerate-token'),
    revokeDevice: (token) => ipcRenderer.invoke('desktop:revoke-device', token),
    sendToDevice: (token, message) =>
      ipcRenderer.invoke('desktop:send-to-device', token, message),
    getSettings: () => ipcRenderer.invoke('desktop:get-settings'),
    saveSettings: (s) => ipcRenderer.invoke('desktop:save-settings', s),
    openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
    onTelemetry: (cb) => {
      const handler = (_event, msg) => cb(msg);
      ipcRenderer.on('desktop:telemetry', handler);
      return () => ipcRenderer.off('desktop:telemetry', handler);
    },
    onDevices: (cb) => {
      const handler = (_event, devices) => cb(devices);
      ipcRenderer.on('desktop:devices', handler);
      return () => ipcRenderer.off('desktop:devices', handler);
    },
  };

  contextBridge.exposeInMainWorld('desktop', api);
  console.log('[preload] Desktop API exposed successfully (window.desktop)');
} catch (err) {
  console.error('[pocket-desk] preload bridge failed:', err);
}
