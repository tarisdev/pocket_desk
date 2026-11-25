// TelemetryPayload type - mirrors main process definition to avoid cross-process imports
import type { DesktopDevice } from '@renderer/desktop';

export interface TelemetryPayload {
  cpu: { usagePercent: number; loadAvg?: number; cores?: number };
  memory: { usedBytes: number; totalBytes: number; usagePercent: number };
  disks: Array<{
    mount: string;
    usedBytes: number;
    totalBytes: number;
    usagePercent: number;
  }>;
  network: { uploadBytesPerSecond: number; downloadBytesPerSecond: number };
  battery: { percent: number; charging: boolean } | null;
  capabilities: { gpu: boolean; temperatures: boolean };
}

export interface AppState {
  currentScreen: string;
  connectionState: 'disconnected' | 'connecting' | 'connected';
  metrics: TelemetryPayload | null;
  lastTelemetryTime: number | null;
  metricsHistory: Record<string, number[]>;
  actions: Array<{ name: string; type: string; target: string }>;
  logs: string[];
  settings: Record<string, unknown>;
  devices?: DesktopDevice[];
  themeIdx: number;
}

export const initialState: AppState = {
  currentScreen: 'setup',
  connectionState: 'disconnected',
  metrics: null,
  lastTelemetryTime: null,
  metricsHistory: {
    cpu: [],
    memory: [],
    disk: [],
    network: [],
    battery: [],
  },
  actions: [],
  logs: [],
  settings: {},
  themeIdx: 0,
};

const THEME_KEY = 'pocket-desk-theme';
const themes = ['system', 'light', 'dark'];
const MAX_HISTORY = 60;
const MAX_LOGS = 80;

export function loadTheme(): number {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && themes.includes(saved)) return themes.indexOf(saved);
  } catch {
    /* noop */
  }
  return 0;
}

export function saveTheme(idx: number): void {
  try {
    localStorage.setItem(THEME_KEY, themes[idx]);
  } catch {
    /* noop */
  }
}

export function getThemeName(idx: number): string {
  return themes[idx];
}

export function pushHistory(
  history: Record<string, number[]>,
  key: string,
  value: number
): void {
  const h = history[key];
  if (!h) return;
  h.push(value);
  if (h.length > MAX_HISTORY) h.shift();
}

export function addLog(logs: string[], msg: string): void {
  logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (logs.length > MAX_LOGS) logs.pop();
}

export const METRIC_KEYS = [
  'cpu',
  'memory',
  'disk',
  'network',
  'battery',
] as const;
export const MAX_HISTORY_CONST = MAX_HISTORY;
