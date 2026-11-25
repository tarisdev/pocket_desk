import { ipcMain, shell } from '@main/utils/electron';
import type { BrowserWindow } from '@main/utils/electron';
import { SessionManager } from '@main/session/index';
import { PairingManager } from '@main/pairing/index';
import { TelemetryCollector } from '@main/telemetry/index';
import type { Settings } from '@main/config/index';
import { DEFAULT_SETTINGS, PORT, COMPUTER_NAME } from '@main/config/index';

export interface IpcDependencies {
  sessionManager: SessionManager;
  pairingManager: PairingManager;
  telemetryCollector: TelemetryCollector;
  settings: Settings;
  mainWindow: BrowserWindow | null;
}

export function registerIpcHandlers(deps: IpcDependencies): void {
  const {
    sessionManager,
    pairingManager,
    telemetryCollector,
    settings,
    mainWindow,
  } = deps;

  ipcMain.handle('desktop:get-status', () => ({
    computer: COMPUTER_NAME,
    port: PORT,
    paired: sessionManager.size,
    token: pairingManager.getToken(),
    tokenUsed: pairingManager.isUsed(),
  }));

  ipcMain.handle('desktop:get-devices', () => sessionManager.getDeviceList());

  ipcMain.handle('desktop:regenerate-token', () => {
    const newToken = pairingManager.regenerate();
    return newToken;
  });

  ipcMain.handle('desktop:revoke-device', (_, token: string) => {
    const session = sessionManager.getSession(token);
    if (session) {
      try {
        session.socket.close();
      } catch {
        /* noop */
      }
      sessionManager.removeSession(token);
    }
    return { ok: true };
  });

  ipcMain.handle(
    'desktop:send-to-device',
    (_, token: string, message: string) => {
      const session = sessionManager.getSession(token);
      if (!session || !session.socket || session.socket.readyState !== 1) {
        return { ok: false, error: 'device not connected' };
      }
      try {
        session.socket.send(
          JSON.stringify({
            version: 1,
            type: 'desktop.message',
            timestamp: Date.now(),
            payload: { text: message },
          })
        );
        sessionManager.updateActivity(token);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
  );

  ipcMain.handle('desktop:get-settings', () => settings);

  ipcMain.handle(
    'desktop:save-settings',
    (_, newSettings: Partial<Settings>) => {
      Object.assign(settings, newSettings);
      if (newSettings.telemetryInterval !== undefined) {
        telemetryCollector.setInterval(newSettings.telemetryInterval);
      }
      return settings;
    }
  );

  ipcMain.handle('desktop:open-external', (_, url: string) =>
    shell.openExternal(url)
  );
}
