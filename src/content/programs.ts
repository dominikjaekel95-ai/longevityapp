/**
 * Programmverzeichnis. Longvy ist eine allgemeine Longevity-App; Programme sind Module.
 * Standard ist das Grundprogramm. „Nach dem Absetzen der Abnehmspritze“ ist ein optionales Programm, wählbar im Onboarding oder später.
 *
 * Texte und Metadaten kommen aus content/programme/<id>/ (Begleitinstanz, Format in content/README.md), eingelesen
 * von scripts/build-content.mjs. Die Einträge hier sind die Rückfallwerte, solange content/ fehlt. Programmspezifische
 * Angaben (z. B. ein Datum, das nur ein Programm braucht) stehen in `settings` und landen in program_settings,
 * nicht im Kern-Datenmodell.
 */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';

export type ProgramSettingField = {
  key: string;
  type: 'date' | 'text' | 'number';
  label: { de: string; en: string };
  help?: { de: string; en: string };
  required?: boolean;
};

export type ProgramMeta = {
  id: string;
  title: { de: string; en: string };
  summary: { de: string; en: string };
  weeks: number;
  available: boolean;
  default: boolean;
  settings: ProgramSettingField[];
};

const fallback: ProgramMeta[] = [
  {
    id: 'grundprogramm',
    title: { de: 'Grundprogramm', en: 'Base programme' },
    summary: {
      de: 'Wöchentlicher Check-in, zwei Krafteinheiten, drei Proteinmahlzeiten. Für alle gesunden Erwachsenen.',
      en: 'Weekly check-in, two strength sessions, three protein meals. For all healthy adults.',
    },
    weeks: 12,
    available: true,
    default: true,
    settings: [],
  },
  {
    id: 'nach-dem-absetzen-abnehmspritze',
    title: { de: 'Nach dem Absetzen der Abnehmspritze', en: 'After stopping the weight-loss injection' },
    summary: {
      de: 'Zwölf Wochen Programm für die Zeit nach dem Absetzen. Gleicher Kern, eigene Wochenkarten.',
      en: 'Twelve-week programme for the time after stopping. Same core, own week cards.',
    },
    weeks: 12,
    available: true,
    default: false,
    settings: [],
  },
  {
    id: 'kraftprogramm-ab-50',
    title: { de: 'Kraftprogramm ab 50', en: 'Strength programme from 50' },
    summary: { de: 'Kraft und Gewicht halten. In Vorbereitung.', en: 'Maintain strength and weight. In preparation.' },
    weeks: 12,
    available: false,
    default: false,
    settings: [],
  },
];

type Generated = { programme: Record<string, { meta?: Partial<ProgramMeta> | null }> };
const data = generated as unknown as Generated;

/** Registry: content/ überschreibt die Rückfallwerte; neue Programme aus content/ kommen hinzu. */
export const programs: ProgramMeta[] = (() => {
  const byId = new Map(fallback.map((p) => [p.id, { ...p }]));
  for (const [id, entry] of Object.entries(data.programme ?? {})) {
    const meta = entry?.meta ?? null;
    const base = byId.get(id) ?? {
      id,
      title: { de: id, en: id },
      summary: { de: '', en: '' },
      weeks: 12,
      available: true,
      default: false,
      settings: [],
    };
    byId.set(id, { ...base, ...(meta ?? {}), id });
  }
  const list = [...byId.values()];
  if (!list.some((p) => p.default && p.available)) {
    const first = list.find((p) => p.available);
    if (first) first.default = true;
  }
  return list.sort((a, b) => Number(b.default) - Number(a.default));
})();

export function getProgram(id: string | null | undefined): ProgramMeta | null {
  if (!id) return null;
  return programs.find((p) => p.id === id) ?? null;
}

export function defaultProgram(): ProgramMeta {
  return programs.find((p) => p.default && p.available) ?? (programs[0] as ProgramMeta);
}

export function programTitle(p: ProgramMeta, locale: Locale): string {
  return p.title[locale] || p.title.de;
}
