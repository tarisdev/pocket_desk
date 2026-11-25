import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import vi from './locales/vi.json';

const STORAGE_KEY = 'app.language';

// Initialize i18n synchronously with a default language first
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Then load the saved language asynchronously
(async () => {
  try {
    let lng = await AsyncStorage.getItem(STORAGE_KEY);
    if (!lng) {
      const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
      lng = deviceLang === 'vi' ? 'vi' : 'en';
    }
    await i18n.changeLanguage(lng);
  } catch (e) {
    console.warn('[i18n] Failed to load saved language:', e);
  }
})();

export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem(STORAGE_KEY, lng);
  await i18n.changeLanguage(lng);
};

export default i18n;
