/**
 * Einwilligungen (Art. 9 DSGVO). Quelle: content/rechtliches/<locale>/einwilligung-art9.md (Begleitinstanz,
 * Freigabe durch Dominik über `status`), eingelesen von scripts/build-content.mjs. Fehlt die Datei: Platzhalter.
 * Jede Einwilligung hat eine ID; die App speichert pro ID Fassung, Zeitpunkt der Erteilung und des Widerrufs.
 */
import type { Locale } from '@/i18n';

import { env } from '@/lib/env';

import generated from './generated/content.json';
import { placeholderConsent } from './placeholder/consent';
import type { ContentStatus } from './program';

export const CONSENT_HEALTH = 'gesundheitsdaten';
export const CONSENT_PHOTO = 'foto-auswertung';
export const CONSENT_ANALYTICS = 'nutzungsstatistik';
export const CONSENT_AGE = 'age18';

/** text gilt für den Schätz-Modus hintergrund, textVisible für sichtbar (docs/REVIEW.md R1/R2). */
export type ConsentItem = { id: string; required: boolean; active: boolean; text: string; textVisible: string | null };

export type ConsentText = {
  status: ContentStatus;
  version: string;
  scope: string;
  title: string;
  screen: string[];
  details: string[];
  items: ConsentItem[];
};

type Generated = { einwilligung: Partial<Record<Locale, ConsentText>> | null };
const data = generated as unknown as Generated;

export function getConsent(locale: Locale): ConsentText {
  const all = data.einwilligung;
  if (!all) return placeholderConsent;
  return all[locale] ?? all.de ?? placeholderConsent;
}

export function consentItem(locale: Locale, id: string): ConsentItem | undefined {
  return getConsent(locale).items.find((i) => i.id === id);
}

/** Text einer Einwilligung passend zum Schätz-Modus des Builds. */
export function consentItemText(item: ConsentItem): string {
  return env.estimateMode === 'sichtbar' && item.textVisible ? item.textVisible : item.text;
}
