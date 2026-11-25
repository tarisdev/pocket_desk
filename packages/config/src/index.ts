import { z } from 'zod';

export const DASHBOARD_CONFIG_VERSION = 1;

export const WidgetDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: z.string().min(1),
  defaultConfig: z.record(z.string(), z.unknown()).default({}),
  defaultSize: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
});

export type WidgetDefinition = z.infer<typeof WidgetDefinitionSchema>;

export const WidgetInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  settings: z.record(z.string(), z.unknown()).default({}),
  visible: z.boolean().default(true),
});

export type WidgetInstance = z.infer<typeof WidgetInstanceSchema>;

export const DashboardGridSchema = z.object({
  columns: z.number().int().positive().default(4),
  rows: z.number().int().positive().default(4),
  gap: z.number().min(0).default(8),
});

export type DashboardGrid = z.infer<typeof DashboardGridSchema>;

export const DashboardConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  grid: DashboardGridSchema.default({ columns: 4, rows: 4, gap: 8 }),
  widgets: z.array(WidgetInstanceSchema),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  version: z.number().int().positive().default(DASHBOARD_CONFIG_VERSION),
});

export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;

export const LegacyMobileConfigSchema = z.object({
  widgets: z.array(z.string()),
  visible: z.record(z.string(), z.boolean()).optional(),
});

export type LegacyMobileConfig = z.infer<typeof LegacyMobileConfigSchema>;

const registry = new Map<string, WidgetDefinition>();

export function registerWidget(w: WidgetDefinition): void {
  const parsed = WidgetDefinitionSchema.safeParse(w);
  if (!parsed.success) {
    throw new Error(`Invalid widget definition: ${parsed.error.message}`);
  }
  if (registry.has(parsed.data.id)) {
    throw new Error(`Widget with id "${parsed.data.id}" already registered`);
  }
  registry.set(parsed.data.id, parsed.data);
}

export function getWidget(id: string): WidgetDefinition | undefined {
  return registry.get(id);
}

export function getAllWidgets(): WidgetDefinition[] {
  return [...registry.values()];
}

export function hasWidget(id: string): boolean {
  return registry.has(id);
}

export function validateWidgetInstance(
  instance: unknown
):
  | { success: true; data: WidgetInstance }
  | { success: false; error: z.ZodError } {
  return WidgetInstanceSchema.safeParse(instance);
}

export function validateDashboardConfig(
  config: unknown
):
  | { success: true; data: DashboardConfig }
  | { success: false; error: z.ZodError } {
  return DashboardConfigSchema.safeParse(config);
}

export function serializeDashboardConfig(config: DashboardConfig): string {
  return JSON.stringify(config);
}

export function deserializeDashboardConfig(
  json: string
): { success: true; data: DashboardConfig } | { success: false; error: Error } {
  try {
    const parsed = JSON.parse(json);
    const result = DashboardConfigSchema.safeParse(parsed);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error('Unknown parse error'),
    };
  }
}

export function createDefaultDashboardConfig(): DashboardConfig {
  const now = Date.now();
  return {
    id: 'main-dashboard',
    name: 'Main',
    grid: { columns: 4, rows: 4, gap: 8 },
    widgets: [
      {
        id: 'clock-1',
        type: 'clock',
        x: 0,
        y: 0,
        width: 2,
        height: 1,
        settings: {},
        visible: true,
      },
      {
        id: 'cpu-1',
        type: 'cpu',
        x: 0,
        y: 1,
        width: 1,
        height: 1,
        settings: {},
        visible: true,
      },
      {
        id: 'ram-1',
        type: 'ram',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
        settings: {},
        visible: true,
      },
      {
        id: 'network-1',
        type: 'network',
        x: 2,
        y: 1,
        width: 2,
        height: 1,
        settings: {},
        visible: true,
      },
      {
        id: 'disk-1',
        type: 'disk',
        x: 0,
        y: 2,
        width: 1,
        height: 1,
        settings: {},
        visible: true,
      },
      {
        id: 'battery-1',
        type: 'battery',
        x: 1,
        y: 2,
        width: 1,
        height: 1,
        settings: {},
        visible: true,
      },
    ],
    createdAt: now,
    updatedAt: now,
    version: DASHBOARD_CONFIG_VERSION,
  };
}

export function migrateLegacyMobileConfig(
  legacy: LegacyMobileConfig
): DashboardConfig {
  const now = Date.now();
  const widgets: WidgetInstance[] = [];
  let y = 0;
  let x = 0;
  const maxColumns = 4;

  for (let i = 0; i < legacy.widgets.length; i++) {
    const widgetType = legacy.widgets[i];
    const definition = getWidget(widgetType);
    const defaultSize = definition?.defaultSize ?? { width: 1, height: 1 };
    const visible = legacy.visible?.[widgetType] ?? true;

    const widgetId = `${widgetType}-${i + 1}`;

    widgets.push({
      id: widgetId,
      type: widgetType,
      x,
      y,
      width: defaultSize.width,
      height: defaultSize.height,
      settings: {},
      visible,
    });

    x += defaultSize.width;
    if (x >= maxColumns) {
      x = 0;
      y += 1;
    }
  }

  return {
    id: 'main-dashboard',
    name: 'Main',
    grid: { columns: 4, rows: Math.max(4, y + 1), gap: 8 },
    widgets,
    createdAt: now,
    updatedAt: now,
    version: DASHBOARD_CONFIG_VERSION,
  };
}

export function migrateDashboardConfig(
  config: DashboardConfig
): DashboardConfig {
  if (config.version === DASHBOARD_CONFIG_VERSION) {
    return config;
  }

  let migrated = { ...config };

  if (config.version < 1) {
    migrated = {
      ...migrated,
      widgets: migrated.widgets.map((w) => ({
        ...w,
        visible: w.visible ?? true,
        settings: w.settings ?? {},
      })),
      grid: {
        columns: migrated.grid?.columns ?? 4,
        rows: migrated.grid?.rows ?? 4,
        gap: migrated.grid?.gap ?? 8,
      },
      version: DASHBOARD_CONFIG_VERSION,
      updatedAt: Date.now(),
    };
  }

  return migrated;
}

export function ensureWidgetDefaults(instance: WidgetInstance): WidgetInstance {
  const definition = getWidget(instance.type);
  if (!definition) {
    return instance;
  }
  return {
    ...instance,
    width:
      instance.width && instance.width > 0
        ? instance.width
        : definition.defaultSize.width,
    height:
      instance.height && instance.height > 0
        ? instance.height
        : definition.defaultSize.height,
    settings: instance.settings ?? {},
    visible: instance.visible ?? true,
  };
}

export function validateWidgetType(type: string): boolean {
  return hasWidget(type);
}

export function getWidgetDefaultSize(
  type: string
): { width: number; height: number } | undefined {
  const widget = getWidget(type);
  if (!widget) return undefined;
  return widget.defaultSize;
}

export function getWidgetDefaultSettings(
  type: string
): Record<string, unknown> | undefined {
  const widget = getWidget(type);
  if (!widget) return undefined;
  return widget.defaultConfig;
}

const dashboardConfigs = new Map<string, DashboardConfig>();

export function saveDashboardConfig(config: DashboardConfig): void {
  const validated = validateDashboardConfig(config);
  if (!validated.success) {
    throw new Error(`Invalid dashboard config: ${validated.error.message}`);
  }
  dashboardConfigs.set(config.id, { ...validated.data });
}

export function getDashboardConfig(id: string): DashboardConfig | undefined {
  return dashboardConfigs.get(id);
}

export function getAllDashboardConfigs(): DashboardConfig[] {
  return [...dashboardConfigs.values()];
}

export function updateDashboardConfig(
  id: string,
  updates: Partial<DashboardConfig>
): DashboardConfig | undefined {
  const existing = dashboardConfigs.get(id);
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: Date.now() };
  const validated = validateDashboardConfig(merged);
  if (!validated.success) {
    throw new Error(
      `Invalid dashboard config update: ${validated.error.message}`
    );
  }
  dashboardConfigs.set(id, validated.data);
  return validated.data;
}

export function deleteDashboardConfig(id: string): boolean {
  return dashboardConfigs.delete(id);
}

export function ensureDefaultDashboardConfig(): DashboardConfig {
  const existing = dashboardConfigs.get('main-dashboard');
  if (existing) return existing;
  const def = createDefaultDashboardConfig();
  dashboardConfigs.set('main-dashboard', def);
  return def;
}

registerWidget({
  id: 'clock',
  name: 'Clock',
  description: 'Digital clock',
  category: 'system',
  defaultConfig: {},
  defaultSize: { width: 2, height: 1 },
});

registerWidget({
  id: 'cpu',
  name: 'CPU',
  description: 'CPU usage',
  category: 'system',
  defaultConfig: {},
  defaultSize: { width: 1, height: 1 },
});

registerWidget({
  id: 'ram',
  name: 'RAM',
  description: 'RAM usage',
  category: 'system',
  defaultConfig: {},
  defaultSize: { width: 1, height: 1 },
});

registerWidget({
  id: 'disk',
  name: 'Disk',
  description: 'Disk usage',
  category: 'system',
  defaultConfig: {},
  defaultSize: { width: 1, height: 1 },
});

registerWidget({
  id: 'network',
  name: 'Network',
  description: 'Network speeds',
  category: 'system',
  defaultConfig: {},
  defaultSize: { width: 2, height: 1 },
});

registerWidget({
  id: 'battery',
  name: 'Battery',
  description: 'Battery status',
  category: 'system',
  defaultConfig: {},
  defaultSize: { width: 1, height: 1 },
});
