// Electron wrapper for Electron 33+ stub package compatibility
// Re-exports from electron package for type checking
// Note: At runtime in Electron 33+, require('electron') returns binary path
// This is a known issue with Electron 33+ stub package

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

// Re-export types
export type { App, BrowserWindowConstructorOptions, IpcMain, Shell };
export type BrowserWindow = InstanceType<typeof electronBrowserWindow>;
