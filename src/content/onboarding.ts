/**
 * Hinweise aus content/: „Bevor du startest“ (Onboarding) und „Wann du ärztlichen Rat holst“ (Einstellungen).
 * Quelle: Begleitinstanz. Ohne Datei: kein Hinweis.
 */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';
import type { ContentStatus } from './program';

export type Note = { title: string; items: string[]; closing: string | null; status: ContentStatus };

type Generated = {
  onboarding: { bevorDuStartest: Partial<Record<Locale, Note>> | null };
  hinweise: { aerztlicherRat: Partial<Record<Locale, Note>> | null };
};
const data = generated as unknown as Generated;

function pick(map: Partial<Record<Locale, Note>> | null | undefined, locale: Locale): Note | null {
  if (!map) return null;
  const n = map[locale] ?? map.de ?? null;
  return n && n.items.length > 0 ? n : null;
}

export function getOnboardingNote(locale: Locale): Note | null {
  return pick(data.onboarding?.bevorDuStartest, locale);
}

export function getMedicalAdvice(locale: Locale): Note | null {
  return pick(data.hinweise?.aerztlicherRat, locale);
}
