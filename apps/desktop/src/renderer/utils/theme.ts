import { $, $$ } from '@utils/dom';
import { loadTheme, saveTheme } from '@state/index';

const themes = ['system', 'light', 'dark'];

export function applyTheme(themeIdx: number): void {
  const theme = themes[themeIdx];
  document.documentElement.setAttribute('data-theme', theme);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);

  const icon = $('theme-icon');
  if (icon) {
    icon.setAttribute(
      'data-lucide',
      theme === 'dark' ? 'sun' : theme === 'light' ? 'moon' : 'monitor'
    );
  }

  $$('.theme-btn').forEach((b) => {
    b.classList.toggle('primary', b.dataset.theme === theme);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function initTheme(themeIdx: number): number {
  const loadedIdx = loadTheme();
  applyTheme(loadedIdx);
  return loadedIdx;
}

export function cycleTheme(themeIdx: number): number {
  const newIdx = (themeIdx + 1) % themes.length;
  saveTheme(newIdx);
  applyTheme(newIdx);
  return newIdx;
}

export function setupThemeListener(): void {
  try {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        const currentIdx = loadTheme();
        if (themes[currentIdx] === 'system') applyTheme(currentIdx);
      });
  } catch {
    /* noop */
  }
}
