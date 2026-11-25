import { $, $$, escapeHtml } from '@utils/dom';
import { confirmDialog, toast } from '@utils/dialog';
import { t } from '@i18n/index';
import type { DesktopAPI } from '@renderer/desktop';

export function renderActionsScreen(
  actions: Array<{ name: string; type: string; target: string }>,
  desktop: DesktopAPI
): void {
  const tbody = $('actions-list');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (actions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i data-lucide="zap" class="ic"></i><div class="mt-2" data-i18n="actions.noActions">${t('actions.noActions')}</div><div class="note mt-1" data-i18n="actions.addActionNote">${t('actions.addActionNote')}</div></td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  for (const a of actions) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="font-semibold">${escapeHtml(a.name)}</div></td>
      <td><span class="badge info">${escapeHtml(a.type)}</span></td>
      <td class="mono">${escapeHtml(a.target)}</td>
      <td><span class="badge ok"><span class="dot"></span>${t('common.ready')}</span></td>
      <td>
        <button class="btn btn-sm primary" data-action="${escapeHtml(JSON.stringify(a))}" title="${t('actions.execute')}"><i data-lucide="play" class="ic"></i></button>
        <button class="btn btn-sm danger" data-name="${escapeHtml(a.name)}" title="${t('common.remove')}"><i data-lucide="trash-2" class="ic"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll<HTMLElement>('button[data-action]').forEach((b) => {
    b.addEventListener('click', async () => {
      const action = JSON.parse(b.dataset.action || '{}');
      await executeAction(action, desktop);
    });
  });

  tbody.querySelectorAll<HTMLElement>('button[data-name]').forEach((b) => {
    b.addEventListener('click', async () => {
      const confirmed = await confirmDialog(
        t('actions.removeActionTitle'),
        t('actions.removeConfirm', { name: b.dataset.name || '' })
      );
      if (!confirmed) return;
      const idx = actions.findIndex((a) => a.name === (b.dataset.name || ''));
      if (idx >= 0) actions.splice(idx, 1);
      renderActionsScreen(actions, desktop);
      console.log(`action removed: ${b.dataset.name}`);
      toast(t('toast.actionRemoved', { name: b.dataset.name || '' }), 'info');
    });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function setupActionsEventListeners(
  actions: Array<{ name: string; type: string; target: string }>,
  desktop: DesktopAPI,
  render: () => void
): void {
  $('btn-add-action')?.addEventListener('click', async () => {
    const name = ($('action-name') as HTMLInputElement | null)?.value.trim();
    const type = ($('action-type') as HTMLSelectElement | null)?.value;
    const target = (
      $('action-target') as HTMLInputElement | null
    )?.value.trim();
    if (!name || !target) return;
    actions.push({ name, type: type || 'open_url', target });
    const nameEl = $('action-name') as HTMLInputElement | null;
    const targetEl = $('action-target') as HTMLInputElement | null;
    if (nameEl) nameEl.value = '';
    if (targetEl) targetEl.value = '';
    render();
    console.log(`action added: ${name}`);
    toast(t('toast.actionAdded', { name }), 'success');
  });
}

async function executeAction(
  action: { name: string; type: string; target: string },
  desktop: DesktopAPI
): Promise<void> {
  const btn = Array.from($$<HTMLElement>('button[data-action]')).find(
    (b) => b.dataset.action === JSON.stringify(action)
  );
  if (btn) {
    btn.classList.add('loading-disabled');
    btn.innerHTML = '<i data-lucide="loader" class="ic"></i>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  try {
    if (action.type === 'open_url') {
      await desktop.openExternal(action.target);
      console.log(`opened ${action.target}`);
      toast(t('toast.opened', { target: action.target }), 'success');
    } else {
      await desktop.openExternal(action.target);
      console.log(`executed ${action.type}: ${action.target}`);
      toast(t('toast.executed', { name: action.name }), 'success');
    }
  } catch (e) {
    console.error(`action failed:`, e);
    toast(
      t('toast.actionFailed', {
        error: String((e as Error)?.message ?? e),
      }),
      'error'
    );
  } finally {
    if (btn) {
      btn.classList.remove('loading-disabled');
      btn.innerHTML = '<i data-lucide="play" class="ic"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}
