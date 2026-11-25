import { $, escapeHtml } from '@utils/dom';
import { confirmDialog, toast } from '@utils/dialog';
import { t, formatDateTime } from '@i18n/index';
import type { DesktopAPI, DesktopDevice } from '@renderer/desktop';

export async function loadDevicesScreen(desktop: DesktopAPI): Promise<void> {
  try {
    const devices = await desktop.getDevices();
    renderDevicesTable(devices);
  } catch (e) {
    console.error('failed to load devices:', e);
  }
}

export function renderDevicesTable(devices: DesktopDevice[]): void {
  const tbody = $('devices-list');
  const countEl = $('devices-count');
  if (!tbody) return;

  if (countEl)
    countEl.textContent = t('devices.count', { count: devices.length });
  tbody.innerHTML = '';

  if (devices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i data-lucide="smartphone" class="ic"></i><div class="mt-2" data-i18n="devices.noDevices">${t('devices.noDevices')}</div><div class="note mt-1" data-i18n="devices.pairMobilePhone">${t('devices.pairMobilePhone')}</div></td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  for (const d of devices) {
    const tr = document.createElement('tr');
    const pairedAt = formatDateTime(new Date(d.connectedAt));
    const lastActivity = formatDateTime(
      new Date(d.lastActivity || d.connectedAt)
    );
    const escapedName = escapeHtml(d.deviceName || t('common.unknown'));
    const shortToken = d.token ? d.token.slice(0, 8) : '—';
    const ip = escapeHtml(String(d.ipAddress ?? '—'));
    tr.innerHTML = `
      <td>
        <div class="flex items-center gap-2">
          <i data-lucide="smartphone" class="ic text-muted"></i>
          <div>
            <div class="font-semibold">${escapedName}</div>
            <div class="text-sm text-muted font-mono">${shortToken}</div>
          </div>
        </div>
      </td>
      <td class="text-sm font-mono text-muted">${ip}</td>
      <td>${pairedAt}</td>
      <td>${lastActivity}</td>
      <td><span class="badge ok"><span class="dot"></span>${t('devices.online')}</span></td>
      <td><button class="btn btn-sm danger" data-token="${escapeHtml(d.token || '')}" data-name="${escapeHtml(escapedName)}"><i data-lucide="trash-2" class="ic"></i>${t('devices.revoke')}</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll<HTMLElement>('button[data-token]').forEach((b) => {
    b.addEventListener('click', async () => {
      const confirmed = await confirmDialog(
        t('devices.revokeDeviceTitle'),
        t('devices.revokeConfirm', { name: b.dataset.name || '' })
      );
      if (!confirmed) return;
      const token = b.dataset.token;
      if (!token) return;
      const desktop = window.desktop;
      if (desktop) {
        await desktop.revokeDevice(token);
        await loadDevicesScreen(desktop);
        console.log(`revoked device ${token.slice(0, 8)}`);
        toast(t('toast.deviceRevoked'), 'info');
      }
    });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
