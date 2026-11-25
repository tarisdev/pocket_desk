import type { TelemetryData } from '@context/state/types';

export interface ParsedTelemetry {
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  up: number | null;
  down: number | null;
  battery: number | null;
  charging: boolean | null;
}

interface TelemetryPayload {
  cpu?: { usagePercent: number };
  memory?: { usagePercent: number };
  ram?: { usagePercent: number };
  disks?: Array<{ usagePercent: number }>;
  network?: {
    uploadBytesPerSecond: number;
    downloadBytesPerSecond: number;
  };
  battery?: {
    percent: number;
    charging: boolean;
  };
}

export function parseTelemetryPayload(
  payload: TelemetryPayload
): ParsedTelemetry {
  return {
    cpu: payload?.cpu?.usagePercent ?? null,
    // Support both 'memory' and 'ram' field names for compatibility
    ram: payload?.memory?.usagePercent ?? payload?.ram?.usagePercent ?? null,
    disk: payload.disks?.[0]?.usagePercent ?? null,
    up: payload?.network?.uploadBytesPerSecond ?? null,
    down: payload?.network?.downloadBytesPerSecond ?? null,
    battery: payload?.battery?.percent ?? null,
    charging: payload?.battery?.charging ?? null,
  };
}

export function applyTelemetry(
  current: TelemetryData,
  parsed: ParsedTelemetry
): TelemetryData {
  return {
    ...current,
    ...parsed,
  };
}
