import { getLocales } from 'expo-localization';

import { claims, type ClaimKey } from '@/content/claims';

import { de, type I18nKey } from './de';
import { en } from './en';

export type Locale = 'de' | 'en';
export type { I18nKey };

const dictionaries: Record<Locale, Record<I18nKey, string>> = { de, en };

let current: Locale = 'de';

/** Sprache aus dem System ableiten: Englisch nur, wenn das Gerät auf Englisch steht; sonst Deutsch. */
export function detectLocale(): Locale {
  try {
    const tag = getLocales()[0]?.languageCode ?? 'de';
    return tag === 'en' ? 'en' : 'de';
  } catch {
    return 'de';
  }
}

export function setLocale(locale: Locale) {
  current = locale;
}

export function getLocale(): Locale {
  return current;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, k: string) => (params[k] === undefined ? `{${k}}` : String(params[k])));
}

/** Oberflächentext. */
export function t(key: I18nKey, params?: Record<string, string | number>, locale: Locale = current): string {
  const text = dictionaries[locale][key] ?? dictionaries.de[key] ?? key;
  return interpolate(text, params);
}

/** Text mit Körper- oder Gesundheitsbezug aus claims.ts. */
export function tc(key: ClaimKey, params?: Record<string, string | number>, locale: Locale = current): string {
  return interpolate(claims[key][locale], params);
}

/** Zahl mit Dezimalkomma (de) oder -punkt (en). */
export function formatNumber(value: number, digits = 1, locale: Locale = current): string {
  const fixed = value.toFixed(digits);
  return locale === 'de' ? fixed.replace('.', ',') : fixed;
}

/** Datum als Text, z. B. 03.10.2026 oder 2026-10-03. */
export function formatDate(iso: string, locale: Locale = current): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return locale === 'de' ? `${d}.${m}.${y}` : `${y}-${m}-${d}`;
}

/** Schlüssel für den Wochentag (0 = Sonntag). */
export function weekdayKey(day: number): I18nKey {
  return `wochentag.${((day % 7) + 7) % 7}` as I18nKey;
}
