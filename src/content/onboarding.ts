/**
 * Onboarding-Hinweis „Für wen nicht“. Quelle: content/onboarding/ (Begleitinstanz). Ohne Datei: kein Hinweis.
 */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';

type NoteRaw = { title: { de: string; en: string }; items: { de: string[]; en: string[] } };
type Generated = { onboarding: { fuerWenNicht: NoteRaw | null } };
const data = generated as unknown as Generated;

export function getOnboardingNote(locale: Locale): { title: string; items: string[] } | null {
  const raw = data.onboarding?.fuerWenNicht;
  if (!raw) return null;
  const items = raw.items[locale]?.length ? raw.items[locale] : raw.items.de;
  if (!items || items.length === 0) return null;
  return { title: raw.title[locale] || raw.title.de, items };
}
