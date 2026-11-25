import { $, colorRgb } from '@utils/dom';

export function renderSparkline(
  id: string,
  values: number[],
  color: string
): void {
  const svg = $(id);
  if (!svg) return;
  const w = svg.clientWidth || 200;
  const h = 34;
  const pad = 2;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  if (values.length === 0) {
    svg.innerHTML = '';
    return;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1 || 1)) * innerW;
      const y = pad + innerH - ((v - min) / range) * innerH;
      return `${x},${y}`;
    })
    .join(' ');
  const area =
    values.length > 1
      ? `M${pad},${pad + innerH} L${pts} L${pad + innerW},${pad + innerH} Z`
      : '';
  svg.innerHTML = `
    ${area ? `<path fill="rgba(${colorRgb(color)},0.10)" d="${area}" />` : ''}
    <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}" />
  `;
}

export function statusColor(pct: number, warn = 80, crit = 95): string {
  const root = getComputedStyle(document.documentElement);
  const err = root.getPropertyValue('--color-error').trim() || '#ef4444';
  const warnC = root.getPropertyValue('--color-warning').trim() || '#f59e0b';
  const prim = root.getPropertyValue('--color-primary').trim() || '#38bdf8';
  if (pct >= crit) return err;
  if (pct >= warn) return warnC;
  return prim;
}
