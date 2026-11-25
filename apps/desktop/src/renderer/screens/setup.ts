import { $, $$ } from '@utils/dom';
import { t } from '@i18n/index';
import { toast } from '@utils/dialog';
import type { DesktopAPI } from '@renderer/desktop';

const HTTP = `http://localhost:47831`;

export async function loadSetupScreen(desktop: DesktopAPI): Promise<void> {
  try {
    const st = await desktop.getStatus();
    const elComputer = $('status-computer');
    if (elComputer) elComputer.textContent = st.computer;
    const elPaired = $('status-paired');
    if (elPaired) elPaired.textContent = String(st.paired);
    const elToken = $('status-token');
    if (elToken) elToken.textContent = st.token;
    const elPort = $('status-port');
    if (elPort) elPort.textContent = String(st.port);
    const elManualWs = $('manual-ws');
    if (elManualWs) elManualWs.textContent = `ws://<ip>:${st.port}/ws`;
    const elManualWsSettings = $('manual-ws-settings');
    if (elManualWsSettings)
      elManualWsSettings.textContent = `ws://<ip>:${st.port}/ws`;
    const elFootPort = $('foot-port');
    if (elFootPort) elFootPort.textContent = String(st.port);

    try {
      const resp = await fetch(`${HTTP}/pairing/qr?t=${Date.now()}`);
      if (resp.ok) {
        const svg = await resp.text();
        const elQrImg = $('qr-img');
        if (elQrImg) elQrImg.innerHTML = svg;
        const elQrFallback = $('qr-fallback');
        if (elQrFallback) (elQrFallback as HTMLElement).style.display = 'none';
      } else {
        throw new Error('qr status ' + resp.status);
      }
    } catch (e) {
      const elQrImg = $('qr-img');
      if (elQrImg) elQrImg.innerHTML = '';
      const elQrFallback = $('qr-fallback');
      if (elQrFallback) (elQrFallback as HTMLElement).style.display = 'block';
      console.error('failed to load QR:', e);
    }
    console.log(`agent ready on port ${st.port}`);
  } catch (e) {
    const elComputer = $('status-computer');
    if (elComputer) elComputer.textContent = t('common.unknown');
    console.error('failed to read agent status:', e);
  }
}

export function setupSetupScreenEventListeners(
  desktop: DesktopAPI,
  loadDevices: () => void,
  loadStatus: () => void
): void {
  $('btn-regenerate')?.addEventListener('click', async () => {
    await desktop.regenerateToken();
    await loadStatus();
    await loadDevices();
    console.log('pairing token regenerated');
    toast(t('toast.pairingCodeRegenerated'), 'info');
  });

  const btnRegenSettings = $('btn-regenerate-settings');
  if (btnRegenSettings) {
    btnRegenSettings.addEventListener('click', async () => {
      await desktop.regenerateToken();
      await loadStatus();
      await loadDevices();
      console.log('pairing token regenerated');
      toast(t('toast.pairingCodeRegenerated'), 'info');
    });
  }

  $('btn-copy')?.addEventListener('click', async () => {
    const token = $('status-token')?.textContent;
    if (!token || token === '—') return;
    await navigator.clipboard.writeText(token);
    console.log('token copied');
    toast(t('toast.pairingCodeCopied'), 'success');
  });
}
