import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WIDGETS: 'widgets',
  THEME: 'theme',
} as const;

type ColorScheme = 'light' | 'dark' | 'system';

export async function loadWidgets(): Promise<string[] | null> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.WIDGETS);
    if (v) return JSON.parse(v);
  } catch {
    /* noop */
  }
  return null;
}

export async function saveWidgets(widgets: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgets));
  } catch {
    /* noop */
  }
}

export async function loadTheme(): Promise<ColorScheme | null> {
  try {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* noop */
  }
  return null;
}

export async function saveTheme(theme: ColorScheme): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    /* noop */
  }
}
