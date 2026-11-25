import { $, humanBytes, formatBytes } from '@utils/dom';
import { renderSparkline, statusColor } from '@utils/sparkline';
import { t, formatTime } from '@i18n/index';
import type { TelemetryPayload } from '@state/index';

const MAX_HISTORY = 60;

type MetricsHistory = Record<string, number[]>;

function setText(id: string, value: string | number): void {
  const el = $(id);
  if (el) el.textContent = String(value);
}

function setWidth(id: string, value: number): void {
  const el = $(id) as HTMLElement | null;
  if (el) {
    el.style.width = `${Math.min(100, Math.max(0, value))}%`;
  }
}

export function renderMetricsScreen(
  metrics: TelemetryPayload | null,
  lastTelemetryTime: number | null,
  metricsHistory: MetricsHistory,
  settings: Record<string, unknown>
): void {
  const hasTelemetry = lastTelemetryTime != null;

  const cpuPct = metrics?.cpu?.usagePercent ?? 0;
  const memPct = metrics?.memory?.usagePercent ?? 0;
  const memUsed = metrics?.memory?.usedBytes ?? 0;
  const memTotal = metrics?.memory?.totalBytes ?? 0;
  const diskPct = metrics?.disks?.length
    ? (metrics.disks[0]?.usagePercent ?? 0)
    : 0;

  const netUp = metrics?.network?.uploadBytesPerSecond ?? 0;
  const netDown = metrics?.network?.downloadBytesPerSecond ?? 0;
  const netTotal = netUp + netDown;
  const netPct = Math.min(100, (netTotal / 1024 / 1024) * 10);

  const battPct = metrics?.battery?.percent ?? 0;
  const battCharging = metrics?.battery?.charging ?? false;

  // Update metric cards
  const updateCard = (id: string, pct: number, color: string): void => {
    setWidth(`${id}-bar`, pct);

    const sparkId = `spark-${id.replace('metric-', '')}`;
    const history = metricsHistory[id.replace('metric-', '')];

    const spark = $(sparkId);

    if (spark && history?.length) {
      renderSparkline(sparkId, history, color);
    }
  };

  setText('m-cpu', `${cpuPct.toFixed(1)}%`);
  updateCard('metric-cpu', cpuPct, statusColor(cpuPct));

  setText(
    'cpu-detail',
    `${metrics?.cpu?.loadAvg?.toFixed(2) ?? '—'} ${t('metrics.loadAvg')}`
  );

  setText('m-mem', `${memPct.toFixed(1)}%`);
  updateCard('metric-memory', memPct, statusColor(memPct));

  setText('mem-detail', `${formatBytes(memUsed)} / ${formatBytes(memTotal)}`);

  setText('m-disk', `${diskPct.toFixed(1)}%`);
  updateCard('metric-disk', diskPct, statusColor(diskPct));

  const diskCount = metrics?.disks?.length ?? 0;

  setText(
    'disk-detail',
    `${diskCount} ${t('common.drive')}${diskCount !== 1 ? 's' : ''}`
  );

  const upPct = Math.min(100, (netUp / 1024 / 1024) * 20);
  const downPct = Math.min(100, (netDown / 1024 / 1024) * 20);

  setText('m-net', `↑${humanBytes(netUp)} ↓${humanBytes(netDown)}`);

  setWidth('net-up-bar', upPct);
  setWidth('net-down-bar', downPct);

  updateCard('metric-network', netPct, statusColor(netPct, 50, 80));

  setText('net-detail', `${t('metrics.total')}: ${humanBytes(netTotal)}`);

  const battColor = battPct < 20 ? statusColor(battPct) : '#a855f7';

  setText('m-batt', `${Math.round(battPct)}% ${battCharging ? '⚡' : ''}`);

  updateCard('metric-battery', battPct, battColor);

  setText(
    'batt-detail',
    battCharging ? t('metrics.charging') : t('common.onBattery')
  );

  // Only record history once real telemetry has arrived, otherwise the sparklines would fill with zeros.
  if (hasTelemetry) {
    pushHistory(metricsHistory, 'cpu', cpuPct);
    pushHistory(metricsHistory, 'memory', memPct);
    pushHistory(metricsHistory, 'disk', diskPct);
    pushHistory(metricsHistory, 'network', netPct);
    pushHistory(metricsHistory, 'battery', battPct);
  }

  setText('m-cpu-cores', metrics?.cpu?.cores ?? '—');

  setText(
    'm-mem-detail',
    `${formatBytes(memUsed)} / ${formatBytes(memTotal)} (${memPct.toFixed(1)}%)`
  );

  setText(
    'm-disk-pct',
    metrics?.disks?.length ? `${Math.round(diskPct)}%` : '—'
  );

  setText('m-up', humanBytes(netUp));
  setText('m-down', humanBytes(netDown));

  setText(
    'm-charging',
    metrics?.battery ? (battCharging ? t('common.yes') : t('common.no')) : 'n/a'
  );

  setText('m-load', metrics?.cpu?.loadAvg?.toFixed(2) ?? '—');

  setText('m-uptime', formatUptime());

  setText(
    'state-telemetry',
    hasTelemetry ? t('common.streaming') : t('common.idle')
  );

  setText(
    'state-telemetry-trend',
    hasTelemetry
      ? `${t('common.lastUpdate')} ${formatTime(new Date(lastTelemetryTime))}`
      : t('common.noData')
  );

  const liveBadge = $('metrics-live-badge');
  if (liveBadge) {
    (liveBadge as HTMLElement).style.display = hasTelemetry
      ? 'inline-flex'
      : 'none';
  }

  setText(
    'metrics-interval',
    t('metrics.interval', {
      interval: `${settings.telemetryInterval ?? 1000}ms`,
    })
  );

  const empty = $('metrics-empty');
  const detail = $('metrics-detail');

  if (empty && detail) {
    (empty as HTMLElement).style.display = hasTelemetry ? 'none' : 'block';

    (detail as HTMLElement).style.display = hasTelemetry ? 'block' : 'none';
  }
}

function pushHistory(
  history: MetricsHistory,
  key: string,
  value: number
): void {
  if (!history[key]) {
    history[key] = [];
  }

  const values = history[key];

  values.push(value);

  if (values.length > MAX_HISTORY) {
    values.shift();
  }
}

function formatUptime(): string {
  const secs = Math.floor(
    typeof process !== 'undefined' && process.uptime ? process.uptime() : 0
  );

  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (d > 0) {
    return t('datetime.uptimeDays', { d, h, m });
  }

  if (h > 0) {
    return t('datetime.uptimeHours', { h, m });
  }

  return t('datetime.uptimeMinutes', { m, s });
}
