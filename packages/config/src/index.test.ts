import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  WidgetDefinitionSchema,
  WidgetInstanceSchema,
  DashboardConfigSchema,
  DashboardGridSchema,
  LegacyMobileConfigSchema,
  registerWidget,
  getWidget,
  getAllWidgets,
  hasWidget,
  validateWidgetInstance,
  validateDashboardConfig,
  serializeDashboardConfig,
  deserializeDashboardConfig,
  createDefaultDashboardConfig,
  migrateLegacyMobileConfig,
  migrateDashboardConfig,
  ensureWidgetDefaults,
  validateWidgetType,
  getWidgetDefaultSize,
  getWidgetDefaultSettings,
  saveDashboardConfig,
  getDashboardConfig,
  getAllDashboardConfigs,
  updateDashboardConfig,
  deleteDashboardConfig,
  ensureDefaultDashboardConfig,
  DASHBOARD_CONFIG_VERSION,
  type WidgetDefinition,
  type WidgetInstance,
  type DashboardConfig,
  type LegacyMobileConfig,
} from './index';

describe('Widget Definition Schema', () => {
  it('validates a correct widget definition', () => {
    const widget: WidgetDefinition = {
      id: 'test-widget',
      name: 'Test Widget',
      description: 'A test widget',
      category: 'test',
      defaultConfig: { foo: 'bar' },
      defaultSize: { width: 2, height: 1 },
    };
    const result = WidgetDefinitionSchema.safeParse(widget);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const widget = {
      name: 'Test Widget',
      description: 'A test widget',
      category: 'test',
      defaultConfig: {},
      defaultSize: { width: 1, height: 1 },
    };
    const result = WidgetDefinitionSchema.safeParse(widget);
    expect(result.success).toBe(false);
  });

  it('rejects invalid defaultSize', () => {
    const widget: WidgetDefinition = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      category: 'test',
      defaultConfig: {},
      defaultSize: { width: 0, height: 1 },
    };
    const result = WidgetDefinitionSchema.safeParse(widget);
    expect(result.success).toBe(false);
  });
});

describe('Widget Instance Schema', () => {
  it('validates a correct widget instance', () => {
    const instance: WidgetInstance = {
      id: 'cpu-1',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      settings: {},
      visible: true,
    };
    const result = WidgetInstanceSchema.safeParse(instance);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visible).toBe(true);
      expect(result.data.settings).toEqual({});
    }
  });

  it('applies defaults for optional fields', () => {
    const instance = {
      id: 'cpu-1',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
    const result = WidgetInstanceSchema.safeParse(instance);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visible).toBe(true);
      expect(result.data.settings).toEqual({});
    }
  });

  it('rejects negative coordinates', () => {
    const instance: WidgetInstance = {
      id: 'cpu-1',
      type: 'cpu',
      x: -1,
      y: 0,
      width: 1,
      height: 1,
      settings: {},
      visible: true,
    };
    const result = WidgetInstanceSchema.safeParse(instance);
    expect(result.success).toBe(false);
  });

  it('rejects zero width/height', () => {
    const instance: WidgetInstance = {
      id: 'cpu-1',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 0,
      height: 1,
      settings: {},
      visible: true,
    };
    const result = WidgetInstanceSchema.safeParse(instance);
    expect(result.success).toBe(false);
  });
});

describe('Dashboard Grid Schema', () => {
  it('validates correct grid', () => {
    const grid = { columns: 4, rows: 4, gap: 8 };
    const result = DashboardGridSchema.safeParse(grid);
    expect(result.success).toBe(true);
  });

  it('applies defaults', () => {
    const result = DashboardGridSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.columns).toBe(4);
      expect(result.data.rows).toBe(4);
      expect(result.data.gap).toBe(8);
    }
  });

  it('rejects invalid columns', () => {
    const grid = { columns: 0, rows: 4, gap: 8 };
    const result = DashboardGridSchema.safeParse(grid);
    expect(result.success).toBe(false);
  });
});

describe('Dashboard Config Schema', () => {
  it('validates a correct dashboard config', () => {
    const config = createDefaultDashboardConfig();
    const result = DashboardConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('applies default version', () => {
    const config = createDefaultDashboardConfig();
    delete (config as any).version;
    const result = DashboardConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe(DASHBOARD_CONFIG_VERSION);
    }
  });

  it('rejects missing required fields', () => {
    const config = {
      name: 'Test',
      grid: { columns: 4, rows: 4, gap: 8 },
      widgets: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const result = DashboardConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('rejects invalid widget in array', () => {
    const config = createDefaultDashboardConfig();
    config.widgets.push({
      id: 'invalid',
      type: 'cpu',
      x: -1,
      y: 0,
      width: 1,
      height: 1,
      settings: {},
      visible: true,
    });
    const result = DashboardConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe('Legacy Mobile Config Schema', () => {
  it('validates legacy config with widgets array', () => {
    const legacy: LegacyMobileConfig = {
      widgets: ['clock', 'cpu', 'ram'],
      visible: { clock: true, cpu: true, ram: false },
    };
    const result = LegacyMobileConfigSchema.safeParse(legacy);
    expect(result.success).toBe(true);
  });

  it('validates legacy config without visible', () => {
    const legacy: LegacyMobileConfig = {
      widgets: ['clock', 'cpu'],
    };
    const result = LegacyMobileConfigSchema.safeParse(legacy);
    expect(result.success).toBe(true);
  });

  it('rejects non-array widgets', () => {
    const legacy = { widgets: 'clock' };
    const result = LegacyMobileConfigSchema.safeParse(legacy);
    expect(result.success).toBe(false);
  });
});

describe('Widget Registry', () => {
  beforeEach(() => {
    // Reset registry by re-importing would be complex, so we test with existing widgets
  });

  it('has built-in widgets registered', () => {
    expect(hasWidget('clock')).toBe(true);
    expect(hasWidget('cpu')).toBe(true);
    expect(hasWidget('ram')).toBe(true);
    expect(hasWidget('disk')).toBe(true);
    expect(hasWidget('network')).toBe(true);
    expect(hasWidget('battery')).toBe(true);
  });

  it('returns widget definitions', () => {
    const clock = getWidget('clock');
    expect(clock).toBeDefined();
    expect(clock?.id).toBe('clock');
    expect(clock?.defaultSize).toEqual({ width: 2, height: 1 });
  });

  it('returns all widgets', () => {
    const all = getAllWidgets();
    expect(all.length).toBeGreaterThanOrEqual(6);
  });

  it('registerWidget throws on duplicate', () => {
    expect(() =>
      registerWidget({
        id: 'clock',
        name: 'Clock Duplicate',
        description: 'Duplicate',
        category: 'system',
        defaultConfig: {},
        defaultSize: { width: 1, height: 1 },
      })
    ).toThrow('already registered');
  });

  it('registerWidget validates definition', () => {
    expect(() =>
      registerWidget({
        id: '',
        name: 'Invalid',
        description: 'Invalid',
        category: 'system',
        defaultConfig: {},
        defaultSize: { width: 1, height: 1 },
      })
    ).toThrow('Invalid widget definition');
  });
});

describe('Validation Functions', () => {
  it('validateWidgetInstance returns success for valid instance', () => {
    const instance: WidgetInstance = {
      id: 'cpu-1',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      settings: {},
      visible: true,
    };
    const result = validateWidgetInstance(instance);
    expect(result.success).toBe(true);
  });

  it('validateWidgetInstance returns error for invalid instance', () => {
    const instance = {
      id: 'cpu-1',
      type: 'cpu',
      x: -1,
      y: 0,
      width: 1,
      height: 1,
    };
    const result = validateWidgetInstance(instance);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError);
    } else {
      throw new Error('Expected validation to fail');
    }
  });

  it('validateDashboardConfig returns success for valid config', () => {
    const config = createDefaultDashboardConfig();
    const result = validateDashboardConfig(config);
    expect(result.success).toBe(true);
  });

  it('validateDashboardConfig returns error for invalid config', () => {
    const config = { name: 'Test', widgets: [] };
    const result = validateDashboardConfig(config);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError);
    } else {
      throw new Error('Expected validation to fail');
    }
  });
});

describe('Serialization/Deserialization', () => {
  it('serializes and deserializes dashboard config correctly', () => {
    const original = createDefaultDashboardConfig();
    const json = serializeDashboardConfig(original);
    const result = deserializeDashboardConfig(json);
    if (result.success) {
      expect(result.data.id).toBe(original.id);
      expect(result.data.name).toBe(original.name);
      expect(result.data.widgets.length).toBe(original.widgets.length);
      expect(result.data.version).toBe(original.version);
    } else {
      throw new Error('Expected deserialization to succeed');
    }
  });

  it('deserializeDashboardConfig fails on invalid JSON', () => {
    const result = deserializeDashboardConfig('not valid json');
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
    } else {
      throw new Error('Expected deserialization to fail');
    }
  });

  it('deserializeDashboardConfig fails on invalid schema', () => {
    const json = JSON.stringify({
      id: 'test',
      name: 'Test',
      widgets: 'not array',
    });
    const result = deserializeDashboardConfig(json);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError);
    } else {
      throw new Error('Expected deserialization to fail');
    }
  });
});

describe('Default Dashboard Config', () => {
  it('creates default config with all standard widgets', () => {
    const config = createDefaultDashboardConfig();
    expect(config.id).toBe('main-dashboard');
    expect(config.name).toBe('Main');
    expect(config.widgets.length).toBe(6);
    expect(config.version).toBe(DASHBOARD_CONFIG_VERSION);
    expect(config.grid.columns).toBe(4);
    expect(config.grid.rows).toBe(4);
    expect(config.grid.gap).toBe(8);
  });

  it('default config has correct widget types', () => {
    const config = createDefaultDashboardConfig();
    const types = config.widgets.map((w) => w.type).sort();
    expect(types).toEqual([
      'battery',
      'clock',
      'cpu',
      'disk',
      'network',
      'ram',
    ]);
  });

  it('default config widgets have valid positions', () => {
    const config = createDefaultDashboardConfig();
    for (const widget of config.widgets) {
      expect(widget.x).toBeGreaterThanOrEqual(0);
      expect(widget.y).toBeGreaterThanOrEqual(0);
      expect(widget.width).toBeGreaterThan(0);
      expect(widget.height).toBeGreaterThan(0);
      expect(widget.visible).toBe(true);
      expect(widget.settings).toEqual({});
    }
  });
});

describe('Legacy Mobile Config Migration', () => {
  it('migrates simple widget array to dashboard config', () => {
    const legacy: LegacyMobileConfig = {
      widgets: ['clock', 'cpu', 'ram', 'network'],
      visible: { clock: true, cpu: true, ram: true, network: true },
    };
    const migrated = migrateLegacyMobileConfig(legacy);
    expect(migrated.id).toBe('main-dashboard');
    expect(migrated.widgets.length).toBe(4);
    expect(migrated.version).toBe(DASHBOARD_CONFIG_VERSION);
  });

  it('migrates with correct positions based on default sizes', () => {
    const legacy: LegacyMobileConfig = {
      widgets: ['clock', 'cpu', 'ram'],
    };
    const migrated = migrateLegacyMobileConfig(legacy);
    // clock: width 2 at (0,0)
    // cpu: width 1 at (2,0)
    // ram: width 1 at (3,0) -> wraps to (0,1) for NEXT widget
    const clock = migrated.widgets.find((w) => w.type === 'clock');
    const cpu = migrated.widgets.find((w) => w.type === 'cpu');
    const ram = migrated.widgets.find((w) => w.type === 'ram');
    expect(clock?.x).toBe(0);
    expect(clock?.y).toBe(0);
    expect(cpu?.x).toBe(2);
    expect(cpu?.y).toBe(0);
    expect(ram?.x).toBe(3);
    expect(ram?.y).toBe(0);
  });

  it('preserves visibility from legacy config', () => {
    const legacy: LegacyMobileConfig = {
      widgets: ['clock', 'cpu', 'battery'],
      visible: { clock: true, cpu: false, battery: true },
    };
    const migrated = migrateLegacyMobileConfig(legacy);
    const cpu = migrated.widgets.find((w) => w.type === 'cpu');
    const clock = migrated.widgets.find((w) => w.type === 'clock');
    expect(cpu?.visible).toBe(false);
    expect(clock?.visible).toBe(true);
  });

  it('defaults visibility to true when not specified', () => {
    const legacy: LegacyMobileConfig = {
      widgets: ['clock', 'cpu'],
    };
    const migrated = migrateLegacyMobileConfig(legacy);
    expect(migrated.widgets.every((w) => w.visible === true)).toBe(true);
  });

  it('handles empty widget array', () => {
    const legacy: LegacyMobileConfig = { widgets: [] };
    const migrated = migrateLegacyMobileConfig(legacy);
    expect(migrated.widgets.length).toBe(0);
    expect(migrated.grid.rows).toBe(4);
  });

  it('calculates grid rows based on widget layout', () => {
    const legacy: LegacyMobileConfig = {
      widgets: [
        'clock',
        'cpu',
        'ram',
        'network',
        'disk',
        'battery',
        'clock',
        'cpu',
      ],
    };
    const migrated = migrateLegacyMobileConfig(legacy);
    expect(migrated.grid.rows).toBeGreaterThanOrEqual(4);
  });
});

describe('Dashboard Config Migration', () => {
  it('returns same config when version matches', () => {
    const config = createDefaultDashboardConfig();
    const migrated = migrateDashboardConfig(config);
    expect(migrated).toBe(config);
  });

  it('migrates config with missing visible field', () => {
    const baseConfig = createDefaultDashboardConfig();
    const config: DashboardConfig = {
      ...baseConfig,
      version: 0,
      widgets: baseConfig.widgets.map((w) => ({
        ...w,
        visible: undefined as any,
      })),
    };
    const migrated = migrateDashboardConfig(config);
    expect(migrated.version).toBe(DASHBOARD_CONFIG_VERSION);
    expect(migrated.widgets.every((w) => w.visible === true)).toBe(true);
  });

  it('migrates config with missing settings field', () => {
    const baseConfig = createDefaultDashboardConfig();
    const config: DashboardConfig = {
      ...baseConfig,
      version: 0,
      widgets: baseConfig.widgets.map((w) => ({
        ...w,
        settings: undefined as any,
      })),
    };
    const migrated = migrateDashboardConfig(config);
    expect(migrated.widgets.every((w) => w.settings !== undefined)).toBe(true);
  });

  it('migrates config with missing grid', () => {
    const config: DashboardConfig = {
      ...createDefaultDashboardConfig(),
      version: 0,
      grid: undefined as any,
    };
    const migrated = migrateDashboardConfig(config);
    expect(migrated.grid.columns).toBe(4);
    expect(migrated.grid.rows).toBe(4);
    expect(migrated.grid.gap).toBe(8);
  });

  it('updates updatedAt timestamp on migration', () => {
    const config: DashboardConfig = {
      ...createDefaultDashboardConfig(),
      version: 0,
      updatedAt: 1000,
    };
    const migrated = migrateDashboardConfig(config);
    expect(migrated.updatedAt).toBeGreaterThan(1000);
  });
});

describe('Widget Defaults', () => {
  it('ensureWidgetDefaults fills missing size from registry', () => {
    const instance: WidgetInstance = {
      id: 'cpu-test',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 0 as any,
      height: 0 as any,
      settings: {},
      visible: true,
    };
    const result = ensureWidgetDefaults(instance);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
  });

  it('ensureWidgetDefaults fills missing settings', () => {
    const instance: WidgetInstance = {
      id: 'cpu-test',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      settings: undefined as any,
      visible: true,
    };
    const result = ensureWidgetDefaults(instance);
    expect(result.settings).toEqual({});
  });

  it('ensureWidgetDefaults fills missing visible', () => {
    const instance: WidgetInstance = {
      id: 'cpu-test',
      type: 'cpu',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      settings: {},
      visible: undefined as any,
    };
    const result = ensureWidgetDefaults(instance);
    expect(result.visible).toBe(true);
  });

  it('ensureWidgetDefaults returns unchanged for unknown widget type', () => {
    const instance: WidgetInstance = {
      id: 'unknown-1',
      type: 'unknown-widget',
      x: 0,
      y: 0,
      width: 5,
      height: 5,
      settings: {},
      visible: true,
    };
    const result = ensureWidgetDefaults(instance);
    expect(result.width).toBe(5);
    expect(result.height).toBe(5);
  });
});

describe('Widget Type Validation', () => {
  it('validateWidgetType returns true for registered widgets', () => {
    expect(validateWidgetType('clock')).toBe(true);
    expect(validateWidgetType('cpu')).toBe(true);
    expect(validateWidgetType('network')).toBe(true);
  });

  it('validateWidgetType returns false for unregistered widgets', () => {
    expect(validateWidgetType('nonexistent')).toBe(false);
    expect(validateWidgetType('')).toBe(false);
  });
});

describe('Widget Default Size/Settings', () => {
  it('getWidgetDefaultSize returns size for registered widgets', () => {
    expect(getWidgetDefaultSize('clock')).toEqual({ width: 2, height: 1 });
    expect(getWidgetDefaultSize('cpu')).toEqual({ width: 1, height: 1 });
    expect(getWidgetDefaultSize('network')).toEqual({ width: 2, height: 1 });
  });

  it('getWidgetDefaultSize returns undefined for unknown widgets', () => {
    expect(getWidgetDefaultSize('nonexistent')).toBeUndefined();
  });

  it('getWidgetDefaultSettings returns default config', () => {
    expect(getWidgetDefaultSettings('clock')).toEqual({});
    expect(getWidgetDefaultSettings('cpu')).toEqual({});
  });

  it('getWidgetDefaultSettings returns undefined for unknown widgets', () => {
    expect(getWidgetDefaultSettings('nonexistent')).toBeUndefined();
  });
});

describe('Dashboard Config Persistence', () => {
  beforeEach(() => {
    // Clear the in-memory store
    // Since we can't directly clear the Map, we'll use unique IDs
  });

  it('saveDashboardConfig persists valid config', () => {
    const config = createDefaultDashboardConfig();
    config.id = 'test-dashboard-1';
    saveDashboardConfig(config);
    const retrieved = getDashboardConfig('test-dashboard-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('test-dashboard-1');
  });

  it('saveDashboardConfig throws on invalid config', () => {
    const config = { id: 'invalid', name: 'Test', widgets: 'not array' } as any;
    expect(() => saveDashboardConfig(config)).toThrow(
      'Invalid dashboard config'
    );
  });

  it('getDashboardConfig returns undefined for missing config', () => {
    const retrieved = getDashboardConfig('nonexistent-dashboard');
    expect(retrieved).toBeUndefined();
  });

  it('getAllDashboardConfigs returns all saved configs', () => {
    const config1 = createDefaultDashboardConfig();
    config1.id = 'test-dashboard-2';
    const config2 = createDefaultDashboardConfig();
    config2.id = 'test-dashboard-3';
    saveDashboardConfig(config1);
    saveDashboardConfig(config2);
    const all = getAllDashboardConfigs();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it('updateDashboardConfig updates existing config', () => {
    const config = createDefaultDashboardConfig();
    config.id = 'test-dashboard-4';
    saveDashboardConfig(config);
    // Small delay to ensure different timestamp
    const startTime = Date.now();
    while (Date.now() === startTime) {
      /* wait */
    }
    const updated = updateDashboardConfig('test-dashboard-4', {
      name: 'Updated Name',
    });
    expect(updated).toBeDefined();
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.updatedAt).toBeGreaterThan(config.updatedAt);
  });

  it('updateDashboardConfig returns undefined for missing config', () => {
    const result = updateDashboardConfig('nonexistent', { name: 'Test' });
    expect(result).toBeUndefined();
  });

  it('updateDashboardConfig throws on invalid update', () => {
    const config = createDefaultDashboardConfig();
    config.id = 'test-dashboard-5';
    saveDashboardConfig(config);
    expect(() =>
      updateDashboardConfig('test-dashboard-5', { widgets: 'invalid' } as any)
    ).toThrow();
  });

  it('deleteDashboardConfig removes config', () => {
    const config = createDefaultDashboardConfig();
    config.id = 'test-dashboard-6';
    saveDashboardConfig(config);
    expect(getDashboardConfig('test-dashboard-6')).toBeDefined();
    const deleted = deleteDashboardConfig('test-dashboard-6');
    expect(deleted).toBe(true);
    expect(getDashboardConfig('test-dashboard-6')).toBeUndefined();
  });

  it('deleteDashboardConfig returns false for missing config', () => {
    const deleted = deleteDashboardConfig('nonexistent');
    expect(deleted).toBe(false);
  });

  it('ensureDefaultDashboardConfig creates default if missing', () => {
    deleteDashboardConfig('main-dashboard');
    const config = ensureDefaultDashboardConfig();
    expect(config.id).toBe('main-dashboard');
    expect(config.name).toBe('Main');
  });

  it('ensureDefaultDashboardConfig returns existing if present', () => {
    const config = ensureDefaultDashboardConfig();
    const config2 = ensureDefaultDashboardConfig();
    expect(config).toBe(config2);
  });
});

describe('Version Compatibility', () => {
  it('current version constant matches schema default', () => {
    expect(DASHBOARD_CONFIG_VERSION).toBe(1);
    const config = createDefaultDashboardConfig();
    expect(config.version).toBe(DASHBOARD_CONFIG_VERSION);
  });

  it('migrated config has current version', () => {
    const legacy: LegacyMobileConfig = { widgets: ['clock'] };
    const migrated = migrateLegacyMobileConfig(legacy);
    expect(migrated.version).toBe(DASHBOARD_CONFIG_VERSION);
  });

  it('schema validates version as positive integer', () => {
    const config = createDefaultDashboardConfig();
    config.version = 0;
    const result = validateDashboardConfig(config);
    expect(result.success).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('handles widget with all settings fields', () => {
    const instance: WidgetInstance = {
      id: 'clock-custom',
      type: 'clock',
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      settings: { format: '24h', showSeconds: true, timezone: 'UTC' },
      visible: true,
    };
    const result = validateWidgetInstance(instance);
    expect(result.success).toBe(true);
  });

  it('handles dashboard with many widgets', () => {
    const config = createDefaultDashboardConfig();
    for (let i = 0; i < 20; i++) {
      config.widgets.push({
        id: `extra-${i}`,
        type: 'cpu',
        x: i % 4,
        y: Math.floor(i / 4) + 4,
        width: 1,
        height: 1,
        settings: {},
        visible: true,
      });
    }
    const result = validateDashboardConfig(config);
    expect(result.success).toBe(true);
  });

  it('serialization preserves all fields', () => {
    const original = createDefaultDashboardConfig();
    original.widgets[0].settings = { custom: 'value' };
    const json = serializeDashboardConfig(original);
    const result = deserializeDashboardConfig(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.widgets[0].settings).toEqual({ custom: 'value' });
    }
  });
});
