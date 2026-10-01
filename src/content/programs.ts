/**
 * Programmverzeichnis. Longvy ist eine allgemeine Longevity-App; Programme sind Module.
 * Standard ist das Grundprogramm. Weitere Programme sind optional, wählbar im Onboarding oder später.
 *
 * Metadaten kommen aus content/programme/<id>/programm.md (Begleitinstanz), eingelesen von
 * scripts/build-content.mjs. Die Einträge hier sind Rückfallwerte, solange content/ fehlt. Programmspezifische
 * Angaben (programm_angaben) landen in program_settings, nie im Kern-Datenmodell.
 */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';
import type { ContentStatus } from './program';

export type ProgramSettingField = {
  key: string;
  type: 'date' | 'text' | 'number';
  label: { de: string; en: string };
  required: boolean;
};

export type ProgramMeta = {
  id: string;
  title: { de: string; en: string };
  summary: { de: string; en: string };
  weeks: number;
  available: boolean;
  default: boolean;
  status: ContentStatus;
  settings: ProgramSettingField[];
  vorabKlaeren: string[];
  hinweise: string[];
};

const fallback: ProgramMeta[] = [
  {
    id: 'grundprogramm',
    title: { de: 'Grundprogramm', en: 'Base programme' },
    summary: {
      de: 'Wöchentlicher Check-in, zwei Krafteinheiten, Protein. Für alle gesunden Erwachsenen.',
      en: 'Weekly check-in, two strength sessions, protein. For all healthy adults.',
    },
    weeks: 12,
    available: true,
    default: true,
    status: 'platzhalter',
    settings: [],
    vorabKlaeren: [],
    hinweise: [],
  },
];

type Generated = { programme: Record<string, { meta?: Partial<ProgramMeta> | null }> };
const data = generated as unknown as Generated;

/** Registry: content/ überschreibt die Rückfallwerte; Programme aus content/ kommen hinzu. */
export const programs: ProgramMeta[] = (() => {
  const byId = new Map(fallback.map((p) => [p.id, { ...p }]));
  for (const [id, entry] of Object.entries(data.programme ?? {})) {
    const meta = entry?.meta ?? null;
    const base: ProgramMeta = byId.get(id) ?? {
      id,
      title: { de: id, en: id },
      summary: { de: '', en: '' },
      weeks: 12,
      available: true,
      default: false,
      status: 'entwurf',
      settings: [],
      vorabKlaeren: [],
      hinweise: [],
    };
    byId.set(id, { ...base, ...(meta ?? {}), id });
  }
  const list = [...byId.values()];
  // Rückfallwerte verschwinden, sobald content/ echte Programme liefert, damit kein Platzhalter neben echten steht.
  const real = list.filter((p) => data.programme?.[p.id]);
  const result = real.length > 0 ? real : list;
  if (!result.some((p) => p.default && p.available)) {
    const first = result.find((p) => p.available);
    if (first) first.default = true;
  }
  return result.sort((a, b) => Number(b.default) - Number(a.default));
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
