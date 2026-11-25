export interface Session {
  socket: WebSocket;
  deviceName?: string;
  connectedAt: number;
  ip?: string;
  lastActivity?: number;
}

export class SessionManager {
  private sessions = new Map<string, Session>();
  private onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange;
  }

  getSessions(): Map<string, Session> {
    return this.sessions;
  }

  getSession(token: string): Session | undefined {
    return this.sessions.get(token);
  }

  addSession(token: string, session: Session): void {
    this.sessions.set(token, session);
    this.notifyChange();
  }

  removeSession(token: string): boolean {
    const result = this.sessions.delete(token);
    if (result) this.notifyChange();
    return result;
  }

  updateActivity(token: string): void {
    const session = this.sessions.get(token);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  getDeviceList(): Array<{
    token: string;
    deviceName: string;
    connectedAt: number;
    ipAddress: string;
    lastActivity: number;
  }> {
    return Array.from(this.sessions.entries()).map(([token, s]) => ({
      token,
      deviceName: s.deviceName || 'Unknown device',
      connectedAt: s.connectedAt,
      ipAddress: s.ip || '—',
      lastActivity: s.lastActivity || s.connectedAt,
    }));
  }

  clear(): void {
    this.sessions.clear();
    this.notifyChange();
  }

  private notifyChange(): void {
    this.onChange?.();
  }

  get size(): number {
    return this.sessions.size;
  }
}
