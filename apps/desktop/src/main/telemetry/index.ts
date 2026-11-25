import si from 'systeminformation';
import type { Session } from '@main/session/index';

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

export interface TelemetryMessage {
  version: number;
  type: 'telemetry.snapshot';
  timestamp: number;
  payload: TelemetryPayload;
}

export class TelemetryCollector {
  private timer: NodeJS.Timeout | null = null;
  private interval: number;
  private sessions: Map<string, Session>;
  private mainWindow: Electron.BrowserWindow | null;
  private onTelemetryUpdate?: (msg: string) => void;

  constructor(
    sessions: Map<string, Session>,
    mainWindow: Electron.BrowserWindow | null,
    interval: number,
    onTelemetryUpdate?: (msg: string) => void
  ) {
    this.sessions = sessions;
    this.mainWindow = mainWindow;
    this.interval = interval;
    this.onTelemetryUpdate = onTelemetryUpdate;
  }

  setInterval(interval: number) {
    this.interval = interval;
    this.restart();
  }

  setMainWindow(window: Electron.BrowserWindow | null) {
    this.mainWindow = window;
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    void this.collectAndBroadcast();
    this.timer = setInterval(() => this.collectAndBroadcast(), this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restart() {
    this.stop();
    this.start();
  }

  private async collectAndBroadcast() {
    try {
      const [cpuR, memR, disksR, netR, battR] = await Promise.allSettled([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.battery(),
      ]);

      const cpu = cpuR.status === 'fulfilled' ? cpuR.value : ({} as any);
      const mem = memR.status === 'fulfilled' ? memR.value : ({} as any);
      const disks = disksR.status === 'fulfilled' ? disksR.value : [];
      const net = netR.status === 'fulfilled' ? netR.value : [];
      const batt =
        battR.status === 'fulfilled'
          ? battR.value
          : ({ hasBattery: false } as any);

      const payload: TelemetryPayload = {
        cpu: {
          usagePercent: cpu.currentLoad,
          loadAvg: Array.isArray(cpu.avgLoad) ? cpu.avgLoad[0] : cpu.avgLoad,
          cores: cpu.cpus?.length,
        },
        memory: {
          usedBytes: mem.used,
          totalBytes: mem.total,
          usagePercent: mem.total ? (mem.used / mem.total) * 100 : 0,
        },
        disks: disks.map((d) => ({
          mount: d.mount,
          usedBytes: d.used,
          totalBytes: d.size,
          usagePercent: d.use,
        })),
        network: {
          uploadBytesPerSecond: net[0]?.tx_sec ?? 0,
          downloadBytesPerSecond: net[0]?.rx_sec ?? 0,
        },
        battery: batt.hasBattery
          ? { percent: batt.percent, charging: batt.isCharging }
          : null,
        capabilities: { gpu: false, temperatures: false },
      };

      const msg: TelemetryMessage = {
        version: 1,
        type: 'telemetry.snapshot',
        timestamp: Date.now(),
        payload,
      };

      const msgStr = JSON.stringify(msg);

      for (const session of this.sessions.values()) {
        if (session.socket.readyState === 1) {
          try {
            session.socket.send(msgStr);
          } catch {
            /* noop */
          }
        }
      }

      this.mainWindow?.webContents.send('desktop:telemetry', msgStr);
      this.onTelemetryUpdate?.(msgStr);
    } catch (err) {
      console.error('Telemetry collection failed:', err);
    }
  }
}
