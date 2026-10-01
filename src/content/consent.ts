/**
 * Einwilligungstext (Art. 9 DSGVO). Quelle: content/rechtliches/einwilligung (Begleitinstanz, Freigabe durch
 * Dominik über `status` im Frontmatter), eingelesen von scripts/build-content.mjs. Fehlt die Datei: Platzhalter.
 * Jede Textänderung ändert `version`; die App protokolliert, welche Fassung bestätigt wurde.
 */
import type { Locale } from '@/i18n';

import type { ContentStatus } from './program';
import generated from './generated/content.json';
import { placeholderConsent } from './placeholder/consent';

type Pair = { de: string; en: string };

export type ConsentRaw = {
  status: ContentStatus;
  version: string;
  title: Pair;
  intro: Pair;
  points: { de: string[]; en: string[] };
  checkbox: Pair;
  ageCheckbox: Pair;
  draftNotice: Pair;
};

export type ConsentText = {
  status: ContentStatus;
  version: string;
  title: string;
  intro: string;
  points: string[];
  checkbox: string;
  ageCheckbox: string;
  draftNotice: string;
};

type Generated = { einwilligung: ConsentRaw | null };
const data = generated as unknown as Generated;

export function getConsent(locale: Locale): ConsentText {
  const raw = data.einwilligung ?? placeholderConsent;
  const p = (pair: Pair) => pair[locale] || pair.de;
  return {
    status: raw.status,
    version: raw.version,
    title: p(raw.title),
    intro: p(raw.intro),
    points: raw.points[locale]?.length ? raw.points[locale] : raw.points.de,
    checkbox: p(raw.checkbox),
    ageCheckbox: p(raw.ageCheckbox),
    draftNotice: p(raw.draftNotice),
  };
}
