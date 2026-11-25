type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

interface I18nInstance {
  t: (key: TranslationKey, params?: TranslationParams) => string;
  changeLanguage: (lng: string) => Promise<void>;
  getLanguage: () => string;
  getLocale: () => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  onLanguageChange: (callback: (lng: string) => void) => () => void;
}

const STORAGE_KEY = 'pocket-desk.language';
const DEFAULT_LNG = 'en';

let resources: Record<string, Record<string, string>> = {};
let currentLng = DEFAULT_LNG;
let locale = 'en-US';
let listeners: Array<(lng: string) => void> = [];

async function loadTranslations(lng: string): Promise<Record<string, string>> {
  if (resources[lng]) return resources[lng];
  try {
    const response = await fetch(`./i18n/locales/${lng}.json`);
    if (!response.ok) throw new Error(`Failed to load ${lng}`);
    const data = await response.json();
    resources[lng] = flattenTranslations(data);
    return resources[lng];
  } catch (e) {
    console.error(`[i18n] Failed to load ${lng}:`, e);
    if (lng !== DEFAULT_LNG) return loadTranslations(DEFAULT_LNG);
    return {};
  }
}

function flattenTranslations(
  obj: Record<string, any>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  return result;
}

function getNestedTranslation(key: TranslationKey, lng: string): string {
  const dict = resources[lng] || resources[DEFAULT_LNG] || {};
  return dict[key] || key;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

async function init(lng?: string): Promise<void> {
  let language = lng;
  if (!language) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      language = stored;
    } else {
      const browserLang = navigator.language.split('-')[0];
      language = browserLang === 'vi' ? 'vi' : 'en';
    }
  }
  await changeLanguage(language);
}

async function changeLanguage(lng: string): Promise<void> {
  if (lng !== 'en' && lng !== 'vi') lng = DEFAULT_LNG;
  await loadTranslations(lng);
  currentLng = lng;
  locale = lng === 'vi' ? 'vi-VN' : 'en-US';
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
  listeners.forEach((cb) => cb(lng));
}

function t(key: TranslationKey, params?: TranslationParams): string {
  const translation = getNestedTranslation(key, currentLng);
  return interpolate(translation, params);
}

function getLanguage(): string {
  return currentLng;
}

function getLocale(): string {
  return locale;
}

function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

function formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: locale === 'en-US',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

function formatDateTime(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: locale === 'en-US',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

function onLanguageChange(callback: (lng: string) => void): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

const i18n: I18nInstance = {
  t,
  changeLanguage,
  getLanguage,
  getLocale,
  formatDate,
  formatTime,
  formatNumber,
  onLanguageChange,
};

export {
  i18n,
  init,
  t,
  changeLanguage,
  getLanguage,
  getLocale,
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  onLanguageChange,
};
export type { I18nInstance, TranslationKey, TranslationParams };
