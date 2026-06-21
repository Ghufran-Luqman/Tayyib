import { useEffect, type ReactNode } from "react";
import i18n, { dirFor } from "@/lib/i18n";
import { useFoodFitStore } from "@/lib/foodfit/store";

/**
 * Applies the user's chosen language after hydration.
 *
 * We deliberately do NOT change the language during the first render: the server
 * always renders in English, so switching before hydration would cause a React
 * mismatch. Instead we react to the persisted `settings.language` value once the
 * store has rehydrated on the client, then keep <html lang/dir> in sync so RTL
 * languages (Arabic, Urdu) lay out correctly.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useFoodFitStore((s) => s.settings.language);

  useEffect(() => {
    const lang = language ?? "en";
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dirFor(lang);
    }
  }, [language]);

  return <>{children}</>;
}
