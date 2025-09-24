import i18n, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en.json";
import da from "./da.json";

export type SupportedLanguage = "en" | "da";

export const i18nInstance = i18n; // export i18n instance
const DEFAULT_LANGUAGE: SupportedLanguage = "en";

// Async function, never called at top level
export const getInitialLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const saved = await AsyncStorage.getItem("userLang");
    if (saved === "en" || saved === "da") return saved;
  } catch (e) {
    console.warn("Failed to get language from storage", e);
  }
  return DEFAULT_LANGUAGE;
};

// Initialize i18n safely
export const initI18n = async (): Promise<void> => {
  const lng = await getInitialLanguage();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: DEFAULT_LANGUAGE,
    compatibilityJSON: 'v3', // still fine
    resources: {
      en: { translation: en },
      da: { translation: da },
    },
    interpolation: { escapeValue: false },
  });
};
