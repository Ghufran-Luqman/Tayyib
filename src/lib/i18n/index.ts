import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { ar } from "./locales/ar";
import { ur } from "./locales/ur";

export type AppLanguage = "en" | "ar" | "ur";

export interface LanguageMeta {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}

// Single source of truth for which languages exist and their direction.
export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl" },
];

export function dirFor(lang: string): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

// Initialise synchronously with bundled resources so the very first client
// render matches the server render (always "en") — this avoids React hydration
// mismatches. The chosen language is applied after mount by I18nProvider.
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      ur: { translation: ur },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
