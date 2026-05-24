import { createI18n } from "vue-i18n";
import ptBR from "./locales/pt-BR";
import enUS from "./locales/en-US";

export const SUPPORTED_LOCALES = ["pt-BR", "en-US"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const FALLBACK_LOCALE: AppLocale = "pt-BR";
const STORAGE_KEY = "app_locale";

function normalizeLocale(locale?: string | null): AppLocale {
  if (!locale) return FALLBACK_LOCALE;
  if (locale.startsWith("pt")) return "pt-BR";
  if (locale.startsWith("en")) return "en-US";
  return FALLBACK_LOCALE;
}

function getInitialLocale(): AppLocale {
  if (typeof window === "undefined") return FALLBACK_LOCALE;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const normalizedStored = normalizeLocale(stored);

  if (SUPPORTED_LOCALES.includes(normalizedStored)) {
    return normalizedStored;
  }

  return normalizeLocale(window.navigator.language);
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    "pt-BR": ptBR,
    "en-US": enUS,
  },
});

export function setAppLocale(locale: AppLocale) {
  i18n.global.locale.value = locale;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
}
