import { WebSocketServer } from 'ws';
import { SessionManager } from '@main/session/index';
import { PairingManager } from '@main/pairing/index';

let validateMessage: typeof import('@pocket-desk/protocol').validateMessage;

const protocolReady = (async () => {
  const protocol = await import('@pocket-desk/protocol');
  validateMessage = protocol.validateMessage;
})();

function ensureProtocolLoaded(): Promise<void> {
  return protocolReady;
}

interface WebSocketHandlers {
  onPairingSuccess?: (
    sessionToken: string,
    deviceName: string | undefined
  ) => void;
  onDeviceMessage?: (sessionToken: string, message: any) => void;
  onDeviceDisconnect?: (sessionToken: string) => void;
}

interface SocketMetadata {
  isAuthenticated: boolean;
  sessionToken: string | null;
  deviceName: string | undefined;
}

const socketMetadata = new WeakMap<any, SocketMetadata>();

function getMeta(socket: any): SocketMetadata {
  let meta = socketMetadata.get(socket);
  if (!meta) {
    meta = {
      isAuthenticated: false,
      sessionToken: null,
      deviceName: undefined,
    };
    socketMetadata.set(socket, meta);
  }
  return meta;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private sessionManager: SessionManager;
  private pairingManager: PairingManager;
  private handlers: WebSocketHandlers;

  constructor(
    server: any,
    sessionManager: SessionManager,
    pairingManager: PairingManager,
    handlers: WebSocketHandlers = {}
  ) {
    this.sessionManager = sessionManager;
    this.pairingManager = pairingManager;
    this.handlers = handlers;

    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupConnectionHandler();
  }

  private setupConnectionHandler(): void {
    this.wss.on('connection', (socket: any, req) => {
      const meta = getMeta(socket);
      const ip =
        req.socket?.remoteAddress ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        '';

      socket.on('message', async (raw: any) => {
        let parsed: any;
        try {
          parsed = JSON.parse(String(raw));
        } catch {
          socket.close(1008, 'invalid json');
          return;
        }

        await ensureProtocolLoaded();
        const msg = validateMessage(parsed);
        if (!msg) {
          socket.send(
            JSON.stringify({
              version: 1,
              type: 'error',
              payload: { message: 'invalid message' },
            })
          );
          return;
        }

        if (msg.type === 'pairing.request') {
          this.handlePairingRequest(socket, msg, ip, meta);
          return;
        }

        if (!meta.isAuthenticated || !meta.sessionToken) {
          socket.send(
            JSON.stringify({
              version: 1,
              type: 'error',
              payload: { message: 'not authenticated' },
            })
          );
          return;
        }

        const session = this.sessionManager.getSession(meta.sessionToken);
        if (session) {
          session.lastActivity = Date.now();
        }

        this.handleAuthenticatedMessage(socket, msg, meta.sessionToken);
      });

      socket.on('close', () => {
        if (meta.sessionToken) {
          this.sessionManager.removeSession(meta.sessionToken);
          this.handlers.onDeviceDisconnect?.(meta.sessionToken);
        }
        socketMetadata.delete(socket);
      });
    });
  }

  private handlePairingRequest(
    socket: any,
    msg: any,
    ip: string,
    meta: SocketMetadata
  ): void {
    const payload = (msg.payload || {}) as {
      pairingToken?: string;
      deviceName?: string;
    };

    if (!this.pairingManager.validateToken(payload.pairingToken || '')) {
      socket.send(
        JSON.stringify({
          version: 1,
          type: 'pairing.result',
          requestId: msg.requestId,
          timestamp: Date.now(),
          payload: { success: false, message: 'invalid or used token' },
        })
      );
      return;
    }

    const { sessionToken, computerName } = this.pairingManager.markUsed(
      payload.deviceName
    );
    const deviceName = payload.deviceName;

    meta.isAuthenticated = true;
    meta.sessionToken = sessionToken;
    meta.deviceName = deviceName;

    this.sessionManager.addSession(sessionToken, {
      socket,
      deviceName,
      connectedAt: Date.now(),
      ip,
      lastActivity: Date.now(),
    });

    socket.send(
      JSON.stringify({
        version: 1,
        type: 'pairing.result',
        requestId: msg.requestId,
        timestamp: Date.now(),
        payload: { success: true, sessionToken, computerName },
      })
    );

    this.handlers.onPairingSuccess?.(sessionToken, deviceName);
  }

  private handleAuthenticatedMessage(
    socket: any,
    msg: any,
    sessionToken: string
  ): void {
    if (msg.type === 'echo') {
      socket.send(
        JSON.stringify({
          version: 1,
          type: 'echo',
          requestId: msg.requestId,
          timestamp: Date.now(),
          payload: msg.payload,
        })
      );
      return;
    }

    this.handlers.onDeviceMessage?.(sessionToken, msg);

    socket.send(
      JSON.stringify({
        version: 1,
        type: 'desktop.message',
        timestamp: Date.now(),
        payload: { text: 'received: ' + msg.type },
      })
    );
  }

  broadcast(message: string): void {
    for (const session of this.sessionManager.getSessions().values()) {
      if (session.socket.readyState === 1) {
        try {
          session.socket.send(message);
        } catch {
          /* noop */
        }
      }
    }
  }

  close(): void {
    this.wss.close();
  }
}
