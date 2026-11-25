// The Electron 33+ stub package returns the binary path at runtime, so the
// concrete values are re-exported here behind a single import surface.
import type {
  App,
  BrowserWindowConstructorOptions,
  IpcMain,
  Shell,
} from 'electron';
import {
  app as electronApp,
  BrowserWindow as electronBrowserWindow,
  ipcMain as electronIpcMain,
  shell as electronShell,
} from 'electron';

export const app = electronApp;
export const BrowserWindow = electronBrowserWindow;
export const ipcMain = electronIpcMain;
export const shell = electronShell;

export type { App, BrowserWindowConstructorOptions, IpcMain, Shell };
export type BrowserWindow = InstanceType<typeof electronBrowserWindow>;
