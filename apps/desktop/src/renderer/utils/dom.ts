export const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

export const $$ = <T extends HTMLElement = HTMLElement>(
  selector: string
): NodeListOf<T> => document.querySelectorAll(selector);

export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function unescapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export function humanBytes(b: number | null | undefined): string {
  if (b == null) return '\u2014';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let v = b,
    i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '\u2014';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = bytes,
    i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function colorRgb(hex: string): string {
  const c = hex.charAt(0) === '#' ? hex.slice(1) : hex;
  if (c.length === 3) {
    return `${parseInt(c[0] + c[0], 16)},${parseInt(c[1] + c[1], 16)},${parseInt(c[2] + c[2], 16)}`;
  }
  return `${parseInt(c.slice(0, 2), 16)},${parseInt(c.slice(2, 4), 16)},${parseInt(c.slice(4, 6), 16)}`;
}

export function formatUptime(): string {
  const secs = Math.floor(
    typeof process !== 'undefined' && process.uptime ? process.uptime() : 0
  );
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}
