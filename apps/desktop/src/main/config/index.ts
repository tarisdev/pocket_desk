// __dirname is available in CommonJS
export const baseDir =
  typeof __dirname !== 'undefined' ? __dirname : process.cwd();

export const PORT = Number(process.env.POCKET_DESK_PORT ?? 47831);
export const COMPUTER_NAME =
  process.env.COMPUTERNAME ?? process.env.HOSTNAME ?? 'PocketDesk-PC';
export const IS_DEV = process.env.POCKET_DESK_DEV === '1';
export const VITE_URL = process.env.POCKET_DESK_VITE_URL;

export const DEFAULT_SETTINGS = {
  port: PORT,
  telemetryInterval: 1000,
  startOnBoot: false,
  lanOnly: true,
} as const;

export type Settings = typeof DEFAULT_SETTINGS;
