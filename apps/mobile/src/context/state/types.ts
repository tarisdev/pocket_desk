export type Status = 'disconnected' | 'connecting' | 'connected' | 'paired';

export interface TelemetryData {
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  up: number | null;
  down: number | null;
  battery: number | null;
  charging: boolean | null;
}

export interface ConnectionState {
  status: Status;
  computerName: string | null;
  latency: number | null;
  lastSync: string | null;
}

export interface AppSettings {
  keepAwake: boolean;
  refreshRate: number;
  orientation: 'portrait' | 'landscape';
}

export interface WidgetState {
  widgets: string[];
  visible: Record<string, boolean>;
}
