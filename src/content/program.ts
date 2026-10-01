/**
 * Programm-Loader. Quelle der Texte ist content/programme/<id>/ (Begleitinstanz, Format content/README.md),
 * eingelesen von scripts/build-content.mjs nach src/content/generated/content.json. Fehlen die Dateien,
 * liefert der Loader Platzhalter. Die App schreibt keine eigenen Programmtexte.
 */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';
import { placeholderWeeks } from './placeholder/program';
import { getProgram } from './programs';

export type ContentStatus = 'platzhalter' | 'entwurf' | 'geprueft' | 'freigegeben';

export type ProgramTask = { id: string; text: string; quellen: string[] };
export type ProgramTraining = { saetze: number; wiederholungen: number; hinweis: string; quellen: string[] } | null;
export type ProgramWeek = {
  week: number;
  title: string;
  status: ContentStatus;
  intro: string;
  introQuellen: string[];
  training: ProgramTraining;
  tasks: ProgramTask[];
  hinweis: string | null;
};

type GeneratedProgram = { status: ContentStatus; weeks: Partial<Record<Locale, ProgramWeek[]>> };
type Generated = { programme: Record<string, GeneratedProgram> };

const data = generated as unknown as Generated;

export function programStatus(programId: string): ContentStatus {
  return data.programme[programId]?.status ?? 'platzhalter';
}

export function getProgramWeeks(programId: string, locale: Locale): ProgramWeek[] {
  const g = data.programme[programId];
  const weeks = g?.weeks[locale]?.length ? g.weeks[locale] : g?.weeks.de;
  if (weeks && weeks.length > 0) return weeks.slice().sort((a, b) => a.week - b.week);
  const meta = getProgram(programId);
  return placeholderWeeks(meta?.weeks ?? 12, locale);
}

export function getProgramWeek(programId: string, week: number, locale: Locale): ProgramWeek | undefined {
  return getProgramWeeks(programId, locale).find((w) => w.week === week);
}
