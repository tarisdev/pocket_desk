import { $, $$ } from '@utils/dom';
import { applyTheme, cycleTheme, setupThemeListener } from '@utils/theme';
import { initialState, loadTheme, saveTheme, METRIC_KEYS } from '@state/index';
import type { AppState, TelemetryPayload } from '@state/index';
import {
  loadSetupScreen,
  setupSetupScreenEventListeners,
} from '@screens/setup';
import { loadDevicesScreen, renderDevicesTable } from '@screens/devices';
import { renderMetricsScreen } from '@screens/metrics';
import {
  renderActionsScreen,
  setupActionsEventListeners,
} from '@screens/actions';
import {
  loadSettingsScreen,
  setupSettingsEventListeners,
  setupThemeButtons,
} from '@screens/settings';
import { i18n, init as initI18n, t, formatTime } from '@i18n/index';
import type { DesktopAPI } from './desktop';

interface ScreenModule {
  render?: () => void;
  load?: (desktop: DesktopAPI) => Promise<void>;
}

const screens: Record<string, ScreenModule> = {};

// Global state (fresh nested containers so screens never mutate initialState)
const state: AppState = {
  ...initialState,
  metricsHistory: { ...initialState.metricsHistory },
  actions: [],
  logs: [],
  settings: {},
};
state.themeIdx = loadTheme();

function setTheme(idx: number): void {
  state.themeIdx = idx;
  saveTheme(idx);
  applyTheme(idx);
}

function applyTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const paramsAttr = el.getAttribute('data-i18n-params');
    let params: Record<string, string | number> | undefined;
    if (paramsAttr) {
      try {
        params = JSON.parse(paramsAttr) as Record<string, string | number>;
      } catch {
        params = undefined;
      }
    }
    try {
      if (el instanceof HTMLInputElement) {
        el.placeholder = t(key, params);
      } else {
        el.textContent = t(key, params);
      }
    } catch (e) {
      console.error(`[i18n] failed to apply "${key}":`, e);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && el instanceof HTMLInputElement) {
      try {
        el.placeholder = t(key);
      } catch (e) {
        console.error(`[i18n] failed to apply placeholder "${key}":`, e);
      }
    }
  });
}

// Dynamic strings are not covered by data-i18n, so they are re-resolved on every language change.
function updateDynamicTranslations(): void {
  const connectionText = $('connection-text');
  if (connectionText) {
    const stateKey = `status.${state.connectionState}` as const;
    connectionText.textContent = t(stateKey);
  }

  const titleEl = $('topbar-title') as HTMLElement | null;
  const subEl = $('topbar-sub') as HTMLElement | null;
  if (titleEl) titleEl.textContent = t(`nav.${state.currentScreen}`);
  if (subEl) subEl.textContent = t(`${state.currentScreen}.subtitle`);

  const devicesCount = $('devices-count');
  if (devicesCount && state.devices?.length !== undefined) {
    devicesCount.textContent = t('devices.count', {
      count: state.devices.length,
    });
  }

  const metricsInterval = $('metrics-interval');
  if (metricsInterval) {
    const interval = state.settings?.telemetryInterval ?? 1000;
    metricsInterval.textContent = t('metrics.interval', {
      interval: `${interval}ms`,
    });
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Language change handler
function onLanguageChange(lng: string): void {
  applyTranslations();
  updateDynamicTranslations();

  if (screens[state.currentScreen]?.render) {
    screens[state.currentScreen].render!();
  }

  // Refresh theme button highlight without re-registering listeners
  applyTheme(state.themeIdx);
}

// DOM helpers
const nav = (screenName: string): void => {
  $$('.screen').forEach((el) => el.classList.remove('active'));
  $$('.navitem').forEach((el) => el.classList.remove('active'));
  const target = $(`screen-${screenName}`);
  if (target) target.classList.add('active');
  const btn = document.querySelector(`.navitem[data-screen="${screenName}"]`);
  if (btn) btn.classList.add('active');
  state.currentScreen = screenName;
  updateDynamicTranslations();

  if (screens[screenName]?.render) screens[screenName].render!();
};

const setConnection = (
  connectionState: 'disconnected' | 'connecting' | 'connected'
): void => {
  state.connectionState = connectionState;
  const pill = $('connection-pill');
  const text = $('connection-text');
  if (!pill || !text) return;
  pill.className = 'status-pill ' + connectionState;
  text.textContent = t(`status.${connectionState}`);
  renderSystemStats();
};

const trendClass = (el: Element, kind: string): void => {
  el.className = 'trend ' + kind;
};

const renderSystemStats = (): void => {
  const hasData = state.lastTelemetryTime != null;
  const cpu = hasData ? (state.metrics?.cpu?.usagePercent ?? 0) : 0;
  const mem = hasData ? (state.metrics?.memory?.usagePercent ?? 0) : 0;
  const connected = state.connectionState === 'connected';

  const agentVal = $('state-agent');
  const agentTrend = $('state-agent-trend');
  if (agentVal) agentVal.textContent = hasData ? `${cpu.toFixed(0)}%` : '—';
  if (agentTrend) {
    if (!hasData) {
      trendClass(agentTrend, 'down');
      agentTrend.textContent = t('common.inactive');
    } else if (!connected) {
      trendClass(agentTrend, 'neutral');
      agentTrend.textContent = t('common.streaming');
    } else if (cpu >= 80) {
      trendClass(agentTrend, 'down');
      agentTrend.textContent = t('common.high');
    } else if (cpu >= 50) {
      trendClass(agentTrend, 'neutral');
      agentTrend.textContent = t('common.normal');
    } else {
      trendClass(agentTrend, 'up');
      agentTrend.textContent = t('common.low');
    }
  }

  const telVal = $('state-telemetry');
  const telTrend = $('state-telemetry-trend');
  if (telVal) telVal.textContent = hasData ? `${mem.toFixed(0)}%` : '—';
  if (telTrend) {
    if (!hasData) {
      trendClass(telTrend, 'down');
      telTrend.textContent = t('common.noData');
    } else if (!connected) {
      trendClass(telTrend, 'neutral');
      telTrend.textContent = t('common.streaming');
    } else if (mem >= 85) {
      trendClass(telTrend, 'down');
      telTrend.textContent = t('common.high');
    } else if (mem >= 60) {
      trendClass(telTrend, 'neutral');
      telTrend.textContent = t('common.normal');
    } else {
      trendClass(telTrend, 'up');
      telTrend.textContent = t('common.low');
    }
  }

  const lu = $('state-last-update');
  if (lu)
    lu.textContent = hasData
      ? formatTime(new Date(state.lastTelemetryTime!))
      : '—';
};

// Initialize screens
screens.setup = {
  load: loadSetupScreen,
};
screens.devices = {
  render: () => loadDevicesScreen(window.desktop),
};
screens.metrics = {
  render: () =>
    renderMetricsScreen(
      state.metrics,
      state.lastTelemetryTime,
      state.metricsHistory,
      state.settings
    ),
};
screens.actions = {
  render: () => renderActionsScreen(state.actions, window.desktop),
};
screens.settings = {
  load: async (_desktop) => {
    loadSettingsScreen(state.settings);
  },
};

const desktop: DesktopAPI | undefined = window.desktop;
if (!desktop) {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="p-6 text-error-text bg-error-bg border border-error-border rounded max-w-150 mx-auto mb-8" data-i18n="common.error">Preload bridge not available (window.desktop missing). Check Electron preload path and contextIsolation.</div>`
  );
} else {
  loadSetupScreen(desktop);
  loadDevicesScreen(desktop);
  loadSettingsScreen(state.settings);

  setupSetupScreenEventListeners(
    desktop,
    () => loadDevicesScreen(desktop),
    () => loadSetupScreen(desktop)
  );
  setupActionsEventListeners(state.actions, desktop, () =>
    screens.actions.render?.()
  );

  setupSettingsEventListeners(
    desktop,
    state.settings,
    () => loadSetupScreen(desktop),
    () => loadDevicesScreen(desktop)
  );
  setupThemeButtons(setTheme);
}

// Navigation
// Navigation
document.querySelectorAll('.navitem').forEach((el) => {
  el.addEventListener('click', () =>
    nav((el as HTMLElement).dataset.screen || '')
  );
});

$('btn-theme')?.addEventListener('click', () => {
  state.themeIdx = cycleTheme(state.themeIdx);
});

$('btn-language')?.addEventListener('click', async () => {
  const current = i18n.getLanguage();
  await i18n.changeLanguage(current === 'en' ? 'vi' : 'en');
});

$('lang-en')?.addEventListener('click', async () => {
  await i18n.changeLanguage('en');
});
$('lang-vi')?.addEventListener('click', async () => {
  await i18n.changeLanguage('vi');
});

// Validate the structure of an incoming telemetry payload before trusting it.
function isTelemetryPayload(v: unknown): v is TelemetryPayload {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  const cpu = p.cpu as Record<string, unknown> | undefined;
  const mem = p.memory as Record<string, unknown> | undefined;
  const net = p.network as Record<string, unknown> | undefined;
  const finite = (n: unknown): n is number =>
    typeof n === 'number' && Number.isFinite(n);
  return (
    !!cpu &&
    finite(cpu.usagePercent) &&
    !!mem &&
    finite(mem.usagePercent) &&
    finite(mem.usedBytes) &&
    finite(mem.totalBytes) &&
    Array.isArray(p.disks) &&
    !!net &&
    finite(net.uploadBytesPerSecond) &&
    finite(net.downloadBytesPerSecond) &&
    (p.battery === null ||
      (typeof p.battery === 'object' &&
        p.battery !== null &&
        finite((p.battery as Record<string, unknown>).percent)))
  );
}

// Desktop bridge
if (desktop) {
  desktop.onTelemetry((msg: string) => {
    try {
      const parsed = JSON.parse(msg) as {
        type?: string;
        payload?: unknown;
      };
      if (parsed?.type !== 'telemetry.snapshot') return;
      if (!isTelemetryPayload(parsed.payload)) {
        console.warn('[telemetry] ignoring malformed payload');
        return;
      }
      state.metrics = parsed.payload;
      state.lastTelemetryTime = Date.now();
      if (state.currentScreen === 'metrics')
        renderMetricsScreen(
          state.metrics,
          state.lastTelemetryTime,
          state.metricsHistory,
          state.settings
        );
      renderSystemStats();
    } catch (e) {
      console.error('[telemetry] failed to process message:', e);
    }
  });

  desktop.onDevices((devices) => {
    state.devices = devices;
    setConnection(devices.length > 0 ? 'connected' : 'disconnected');
    if (state.currentScreen === 'devices') renderDevicesTable(devices);
    loadSetupScreen(desktop);
  });
}

async function boot(): Promise<void> {
  try {
    await initI18n();
    i18n.onLanguageChange(onLanguageChange);
    initHistory();
    applyTranslations();
    applyTheme(state.themeIdx);
    setupThemeListener();
    nav('setup');

    // Keep connection stats and the metrics view fresh even when telemetry is idle.
    setInterval(() => {
      renderSystemStats();
      if (state.currentScreen === 'metrics')
        renderMetricsScreen(
          state.metrics,
          state.lastTelemetryTime,
          state.metricsHistory,
          state.settings
        );
    }, 2000);
  } catch (e) {
    console.error('[boot] initialization failed:', e);
  }
}

void boot();

function initHistory(): void {
  METRIC_KEYS.forEach((k) => {
    state.metricsHistory[k] = [];
  });
}
