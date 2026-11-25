export interface DesktopDevice {
  deviceName: string;
  token: string;
  connectedAt: number;
  ipAddress: string;
  lastActivity: number;
}

export interface DesktopSettings {
  port: number;
  telemetryInterval: number;
  startOnBoot: boolean;
  lanOnly: boolean;
}

export interface DesktopAPI {
  getStatus: () => Promise<{
    computer: string;
    port: number;
    paired: number;
    token: string;
    tokenUsed: boolean;
  }>;
  getDevices: () => Promise<DesktopDevice[]>;
  regenerateToken: () => Promise<string>;
  revokeDevice: (token: string) => Promise<{ ok: boolean }>;
  sendToDevice: (
    token: string,
    message: string
  ) => Promise<{ ok: boolean; error?: string }>;
  getSettings: () => Promise<DesktopSettings>;
  saveSettings: (
    settings: Partial<DesktopSettings>
  ) => Promise<DesktopSettings>;
  openExternal: (url: string) => Promise<void>;
  onTelemetry: (callback: (message: string) => void) => () => void;
  onDevices: (callback: (devices: DesktopDevice[]) => void) => () => void;
}

declare global {
  interface Window {
    desktop: DesktopAPI;
  }
  const lucide: { createIcons: () => void };
}

export {};
