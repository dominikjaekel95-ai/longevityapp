import { getLocales } from 'expo-localization';

import { claims, type ClaimKey } from '@/content/claims';

import { de, type I18nKey } from './de';
import { en } from './en';

export type Locale = 'de' | 'en';
export type { I18nKey };

const dictionaries: Record<Locale, Record<I18nKey, string>> = { de, en };

let current: Locale = 'de';

/**
 * Wählbare Sprachen. Nur Deutsch, bis die Inhalte in content/ vollständig auf Englisch vorliegen (docs/REVIEW.md R20):
 * Oberfläche und claims.ts gibt es zweisprachig, content/ nur deutsch; gemischt darf die App nicht erscheinen.
 * Sobald content/<...>/en/ vollständig ist: 'en' hier ergänzen, dann greift die Gerätesprache wieder.
 */
export const availableLocales: readonly Locale[] = ['de'];

/** Sprache aus dem System ableiten, beschränkt auf availableLocales. */
export function detectLocale(): Locale {
  try {
    const tag = getLocales()[0]?.languageCode ?? 'de';
    const wanted: Locale = tag === 'en' ? 'en' : 'de';
    return availableLocales.includes(wanted) ? wanted : 'de';
  } catch {
    return 'de';
  }
}

export function isAvailableLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (availableLocales as readonly string[]).includes(value);
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

/** Schlüssel für den Freigabestand eines Textes. */
export function statusKey(status: string): I18nKey {
  return (['entwurf', 'geprueft', 'freigegeben', 'platzhalter'].includes(status) ? `status.${status}` : 'status.entwurf') as I18nKey;
}
