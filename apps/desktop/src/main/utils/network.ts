import os from 'node:os';

export function firstIpv4(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const addrs = ifaces[name];
    if (!addrs) continue;
    for (const addr of addrs) {
      if (
        addr &&
        addr.family === 'IPv4' &&
        !addr.internal &&
        !addr.address.startsWith('169.254.')
      ) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}
