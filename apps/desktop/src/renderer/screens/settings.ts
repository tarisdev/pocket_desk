import { $, $$ } from '@utils/dom';
import { toast } from '@utils/dialog';
import { t } from '@i18n/index';
import type { DesktopAPI } from '@renderer/desktop';

export function loadSettingsScreen(settings: Record<string, unknown>): void {
  const PORT_DEFAULT = 47831;
  const portEl = $('set-port') as HTMLInputElement | null;
  if (portEl) portEl.value = String(settings.port ?? PORT_DEFAULT);
  const intervalEl = $('set-interval') as HTMLInputElement | null;
  if (intervalEl) intervalEl.value = String(settings.telemetryInterval ?? 1000);
  const bootEl = $('set-boot') as HTMLInputElement | null;
  if (bootEl) bootEl.checked = !!settings.startOnBoot;
  const lanEl = $('set-lan') as HTMLInputElement | null;
  if (lanEl) lanEl.checked = !!settings.lanOnly;
}

export function setupSettingsEventListeners(
  desktop: DesktopAPI,
  settings: Record<string, unknown>,
  loadStatus: () => Promise<void>,
  loadDevices: () => Promise<void>
): void {
  $('btn-save-settings')?.addEventListener('click', async () => {
    const portEl = $('set-port') as HTMLInputElement | null;
    const intervalEl = $('set-interval') as HTMLInputElement | null;
    const bootEl = $('set-boot') as HTMLInputElement | null;
    const lanEl = $('set-lan') as HTMLInputElement | null;
    await desktop.saveSettings({
      port: Number(portEl?.value) || 47831,
      telemetryInterval: Number(intervalEl?.value) || 1000,
      startOnBoot: bootEl?.checked,
      lanOnly: lanEl?.checked,
    });
    await loadStatus();
    console.log('settings saved');
    toast(t('toast.settingsSaved'), 'success');
  });
}

export function setupThemeButtons(setTheme: (idx: number) => void): void {
  const themes = ['system', 'light', 'dark'];
  $$<HTMLElement>('.theme-btn').forEach((b) => {
    b.addEventListener('click', () => {
      const theme = b.dataset.theme;
      if (!theme) return;
      const idx = themes.indexOf(theme);
      if (idx >= 0) setTheme(idx);
    });
  });
}
