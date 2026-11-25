import crypto from 'node:crypto';
import type {
  QrPairingPayloadSchema,
  QrPairingPayload,
} from '@pocket-desk/protocol';
import QRCode from 'qrcode';
import { firstIpv4 } from '@main/utils/network';
import { PORT, COMPUTER_NAME } from '@main/config/index';

export interface PairingData {
  token: string;
  used: boolean;
}

export class PairingManager {
  private data: PairingData = {
    token: crypto.randomBytes(16).toString('hex'),
    used: false,
  };

  getToken(): string {
    return this.data.token;
  }

  isUsed(): boolean {
    return this.data.used;
  }

  validateToken(token: string): boolean {
    return !this.data.used && token === this.data.token;
  }

  markUsed(deviceName?: string): {
    sessionToken: string;
    computerName: string;
  } {
    this.data.used = true;
    const sessionToken = crypto.randomBytes(24).toString('hex');
    this.generateNewToken();
    return { sessionToken, computerName: COMPUTER_NAME };
  }

  regenerate(): string {
    this.data.token = crypto.randomBytes(16).toString('hex');
    this.data.used = false;
    return this.data.token;
  }

  private generateNewToken(): void {
    this.data.token = crypto.randomBytes(16).toString('hex');
    this.data.used = false;
  }

  async generateQR(): Promise<string> {
    const ip = firstIpv4();
    const payload: QrPairingPayload = {
      type: 'pocket-desk-pairing',
      version: 1,
      host: ip,
      port: PORT,
      token: this.data.token,
      protocol: 'ws',
    };
    return QRCode.toString(JSON.stringify(payload), { type: 'svg' });
  }

  getWSUrl(ip?: string): string {
    const host = ip || firstIpv4();
    return `ws://${host}:${PORT}/ws`;
  }
}
