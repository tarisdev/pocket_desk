import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useThemeName, useThemeToggle, useThemeSet } from '@theme';
import type { ColorScheme } from '@design/tokens';

import type { Status } from '@context/state/types';
import {
  loadWidgets,
  saveWidgets,
  loadTheme,
  saveTheme,
} from '@context/storage';
import { WebSocketManager } from '@context/websocket';

export interface AppContextType {
  status: Status;
  computerName: string | null;
  latency: number | null;
  lastSync: string | null;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  up: number | null;
  down: number | null;
  battery: number | null;
  charging: boolean | null;
  connect: (ep?: string, tk?: string) => void;
  disconnect: () => void;
  widgets: string[];
  visible: Record<string, boolean>;
  onToggleWidget: (id: string) => void;
  onStreamDeckPress: (actionId: string) => void;
  onEditPress: () => void;
  onAddWidget: () => void;
  setWidgets: (widgets: string[]) => void;
  theme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (theme: ColorScheme) => void;
  keepAwake: boolean;
  setKeepAwake: (v: boolean) => void;
  refreshRate: number;
  setRefreshRate: (v: number) => void;
  orientation: 'portrait' | 'landscape';
  setOrientation: (v: 'portrait' | 'landscape') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_WIDGETS = ['clock', 'cpu', 'ram', 'network'];
const DEFAULT_VISIBLE: Record<string, boolean> = {
  clock: true,
  cpu: true,
  ram: true,
  disk: true,
  network: true,
  battery: true,
};
const DEFAULT_ENDPOINT = 'ws://192.168.1.10:47831/ws';
const DEVICE_NAME = 'PocketPhone';

export function AppProvider({ children }: { children: ReactNode }) {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const isMountedRef = useRef(true);
  const endpointRef = useRef(DEFAULT_ENDPOINT);
  const tokenRef = useRef('');

  // Connection state
  const [status, setStatus] = useState<Status>('disconnected');
  const [computerName, setComputerName] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Telemetry
  const [cpu, setCpu] = useState<number | null>(null);
  const [ram, setRam] = useState<number | null>(null);
  const [disk, setDisk] = useState<number | null>(null);
  const [up, setUp] = useState<number | null>(null);
  const [down, setDown] = useState<number | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean | null>(null);

  // Settings
  const [keepAwake, setKeepAwake] = useState(true);
  const [refreshRate, setRefreshRate] = useState(1000);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  // Widgets
  const [widgets, setWidgetsState] = useState<string[]>(DEFAULT_WIDGETS);
  const [visible, setVisible] =
    useState<Record<string, boolean>>(DEFAULT_VISIBLE);

  // Theme
  const theme = useThemeName();
  const toggleTheme = useThemeToggle();
  const setTheme = useThemeSet();

  // Initialize WebSocket manager
  useEffect(() => {
    wsManagerRef.current = new WebSocketManager(
      {
        endpoint: endpointRef.current,
        token: tokenRef.current,
        deviceName: DEVICE_NAME,
        isMounted: () => isMountedRef.current,
        onReconnect: () => wsManagerRef.current?.connect(),
      },
      {
        onStatusChange: setStatus,
        onComputerNameChange: setComputerName,
        onLatencyChange: setLatency,
        onLastSyncChange: setLastSync,
        onTelemetryUpdate: (telemetry) => {
          setCpu(telemetry.cpu);
          setRam(telemetry.ram);
          setDisk(telemetry.disk);
          setUp(telemetry.up);
          setDown(telemetry.down);
          setBattery(telemetry.battery);
          setCharging(telemetry.charging);
        },
        onError: (err) => console.error('[AppProvider] WebSocket error', err),
      }
    );
  }, []);

  // Mount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      wsManagerRef.current?.disconnect();
    };
  }, []);

  // Load persisted widgets
  useEffect(() => {
    loadWidgets().then((v) => {
      if (v) setWidgetsState(v);
    });
  }, []);

  // Persist widgets
  useEffect(() => {
    saveWidgets(widgets);
  }, [widgets]);

  // Load persisted theme
  useEffect(() => {
    loadTheme().then((v) => {
      if (v) setTheme(v);
    });
  }, [setTheme]);

  // Persist theme
  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  const connect = useCallback(
    (ep = endpointRef.current, tk = tokenRef.current) => {
      endpointRef.current = ep;
      tokenRef.current = tk;
      wsManagerRef.current?.setEndpoint(ep);
      wsManagerRef.current?.setToken(tk);
      wsManagerRef.current?.connect();
    },
    []
  );

  const disconnect = useCallback(() => {
    wsManagerRef.current?.disconnect();
  }, []);

  const onStreamDeckPress = useCallback((actionId: string) => {
    wsManagerRef.current?.sendAction(actionId);
  }, []);

  const onEditPress = useCallback(() => {
    // Navigation handled by screen
  }, []);

  const onAddWidget = useCallback(() => {
    // Navigation handled by screen
  }, []);

  const setWidgets = useCallback((newWidgets: string[]) => {
    setWidgetsState(newWidgets);
  }, []);

  const onToggleWidget = useCallback((id: string) => {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        status,
        computerName,
        latency,
        lastSync,
        cpu,
        ram,
        disk,
        up,
        down,
        battery,
        charging,
        connect,
        disconnect,
        widgets,
        visible,
        onToggleWidget,
        onStreamDeckPress,
        onEditPress,
        onAddWidget,
        setWidgets,
        theme,
        toggleTheme,
        setTheme,
        keepAwake,
        setKeepAwake,
        refreshRate,
        setRefreshRate,
        orientation,
        setOrientation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
