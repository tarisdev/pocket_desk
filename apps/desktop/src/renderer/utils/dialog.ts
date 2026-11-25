import { $, escapeHtml } from '@utils/dom';
import { t } from '@i18n/index';

let currentResolve: ((val: boolean) => void) | null = null;

export function confirmDialog(title: string, body: string): Promise<boolean> {
  return new Promise((resolve) => {
    currentResolve = resolve;
    const root = $('dialog-root');
    if (!root) {
      currentResolve = null;
      resolve(false);
      return;
    }
    const id = 'confirm-dialog';
    const el = document.createElement('div');
    el.id = id;
    el.className = 'dialog-backdrop';
    el.innerHTML = `
      <div class="dialog">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
        <div class="dialog-actions">
          <button class="btn" id="confirm-cancel">${t('dialog.cancel')}</button>
          <button class="btn danger" id="confirm-ok">${t('dialog.ok')}</button>
        </div>
      </div>
    `;
    root.innerHTML = '';
    root.appendChild(el);
    el.querySelector('#confirm-cancel')?.addEventListener('click', () =>
      closeDialog(false)
    );
    el.querySelector('#confirm-ok')?.addEventListener('click', () =>
      closeDialog(true)
    );
    el.addEventListener('click', (e) => {
      if (e.target === el) closeDialog(false);
    });
  });
}

function closeDialog(val: boolean): void {
  const el = $('confirm-dialog');
  if (el) el.remove();
  if (currentResolve) {
    currentResolve(val);
    currentResolve = null;
  }
}

export function toast(
  msg: string,
  type: 'success' | 'error' | 'info' = 'info'
): void {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="ic"></i><div>${escapeHtml(msg)}</div>`;
  document.body.appendChild(el);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, 3000);
}
