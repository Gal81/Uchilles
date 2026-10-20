import { en } from './en.ts';

const locales = {
  en,
} satisfies Record<string, Locale>;

export type Locale = typeof en;
export type LocaleCode = keyof typeof locales;

const DEFAULT_LOCALE: LocaleCode = 'en';
let currentLocale: LocaleCode = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return locales[currentLocale];
}

export function setLocale(code: LocaleCode) {
  if (code === currentLocale) return;

  currentLocale = code;
  listeners.forEach((listener) => listener());
}

export function subscribeToLocale(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
