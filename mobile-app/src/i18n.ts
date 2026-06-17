import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ja from "./locales/ja.json";
import vi from "./locales/vi.json";
import zh from "./locales/zh.json";

const STORE_LANGUAGE_KEY = "settings.lang";

const languageDetector = {
  type: "languageDetector" as const,
  async: true,
  init: () => {},
  async detect(callback: (lang: string) => void) {
    try {
      // 1. Check if user has explicitly selected a language in the app
      const savedDataJSON = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
      const lng = savedDataJSON ? savedDataJSON : null;

      if (lng) {
        return callback(lng);
      }

      // 2. Default to English ignoring system language
      return callback("en");

      // 3. Fallback to English
      return callback("en");
    } catch (error) {
      console.log("Error reading language", error);
      return callback("en");
    }
  },
  async cacheUserLanguage(lng: string) {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, lng);
    } catch (error) {
      console.log("Error saving language", error);
    }
  },
};

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  fr: { translation: fr },
  ja: { translation: ja },
  zh: { translation: zh },
  de: { translation: de },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Prevents suspense issues in React Native
    },
  });

export default i18n;
