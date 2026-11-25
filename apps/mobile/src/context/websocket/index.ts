import type { Status } from '../state/types';
import { parseTelemetryPayload } from '../telemetry';

interface WebSocketCallbacks {
  onStatusChange: (status: Status) => void;
  onComputerNameChange: (name: string | null) => void;
  onLatencyChange: (latency: number) => void;
  onLastSyncChange: (lastSync: string) => void;
  onTelemetryUpdate: (
    telemetry: ReturnType<typeof parseTelemetryPayload>
  ) => void;
  onError: (error: Error) => void;
}

interface WebSocketConfig {
  endpoint: string;
  token: string;
  deviceName: string;
  isMounted: () => boolean;
  onReconnect: () => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private callbacks: WebSocketCallbacks;
  private manualDisconnect = false;
  private retry = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionStart = 0;

  constructor(config: WebSocketConfig, callbacks: WebSocketCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  setEndpoint(endpoint: string): void {
    this.config.endpoint = endpoint;
  }

  setToken(token: string): void {
    this.config.token = token;
  }

  connect(): void {
    this.clearReconnectTimeout();
    this.manualDisconnect = false;

    if (this.ws) {
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      )
        return;
      try {
        this.ws.close();
      } catch {
        /* noop */
      }
      this.ws = null;
    }

    this.callbacks.onStatusChange('connecting');
    this.connectionStart = Date.now();

    const ws = new WebSocket(this.config.endpoint);
    this.ws = ws;

    ws.onopen = () => this.handleOpen(ws);
    ws.onmessage = (e) => this.handleMessage(e);
    ws.onerror = (err) => this.handleError(err);
    ws.onclose = () => this.handleClose();
  }

  disconnect(): void {
    this.clearReconnectTimeout();
    this.manualDisconnect = true;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* noop */
      }
      this.ws = null;
    }
    this.callbacks.onStatusChange('disconnected');
    this.callbacks.onComputerNameChange(null);
  }

  sendAction(actionId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          version: 1,
          type: 'action.execute',
          requestId: String(Date.now()),
          timestamp: Date.now(),
          payload: { actionId },
        })
      );
    }
  }

  private handleOpen(ws: WebSocket): void {
    if (!this.config.isMounted()) {
      try {
        ws.close();
      } catch {
        /* noop */
      }
      return;
    }
    this.retry = 0;
    this.callbacks.onStatusChange('connected');
    if (this.config.token) {
      try {
        ws.send(
          JSON.stringify({
            version: 1,
            type: 'pairing.request',
            requestId: String(Date.now()),
            timestamp: Date.now(),
            payload: {
              deviceName: this.config.deviceName,
              pairingToken: this.config.token,
            },
          })
        );
      } catch (sendErr) {
        console.error(
          '[WebSocketManager] Failed to send pairing request',
          sendErr
        );
      }
    }
  }

  private handleMessage(e: MessageEvent): void {
    try {
      const msg = JSON.parse(String(e.data));
      if (msg.type === 'pairing.result') {
        if (msg.payload?.success) {
          this.callbacks.onStatusChange('paired');
          this.callbacks.onComputerNameChange(
            msg.payload?.computerName ?? null
          );
          this.callbacks.onLastSyncChange(
            new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }
      }
      if (msg.type === 'telemetry.snapshot') {
        this.callbacks.onLatencyChange(Date.now() - this.connectionStart);
        this.callbacks.onLastSyncChange(
          new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
        const telemetry = parseTelemetryPayload(msg.payload);
        this.callbacks.onTelemetryUpdate(telemetry);
      }
    } catch (parseErr) {
      console.error(
        '[WebSocketManager] Failed to parse WebSocket message',
        parseErr,
        String(e.data).slice(0, 200)
      );
      this.callbacks.onError(parseErr as Error);
    }
  }

  private handleError(err: Event): void {
    console.error('[WebSocketManager] WebSocket error', err);
    this.callbacks.onError(new Error('WebSocket error'));
  }

  private handleClose(): void {
    if (!this.config.isMounted()) return;
    this.ws = null;
    if (!this.manualDisconnect) {
      this.callbacks.onStatusChange('disconnected');
      const delay = Math.min(1000 * Math.pow(2, this.retry), 30000);
      this.retry++;
      this.reconnectTimeout = setTimeout(
        () => {
          this.reconnectTimeout = null;
          if (!this.manualDisconnect && this.config.isMounted()) {
            this.config.onReconnect();
          }
        },
        delay + Math.random() * 1000
      );
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  get readyState(): number | null {
    return this.ws?.readyState ?? null;
  }
}
