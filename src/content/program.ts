/**
 * Programm-Loader. Quelle der Texte ist content/programm/ (Begleitinstanz), eingelesen von
 * scripts/build-content.mjs nach src/content/generated/content.json. Fehlen die Dateien, liefert der Loader
 * Platzhalter (src/content/placeholder). Die App schreibt keine eigenen Programmtexte.
 */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';
import { placeholderWeeks } from './placeholder/program';
import { getProgram } from './programs';

export type TaskKind = 'messen' | 'protein' | 'kraft' | 'alltag';
export type ContentStatus = 'platzhalter' | 'entwurf' | 'freigegeben';

export type ProgramTaskRaw = { id: string; kind: TaskKind; text: { de: string; en: string } };
export type ProgramWeekRaw = {
  week: number;
  title: { de: string; en: string };
  summary: { de: string; en: string };
  body: { de: string[]; en: string[] };
  tasks: ProgramTaskRaw[];
};

export type ProgramTask = { id: string; kind: TaskKind; text: string };
export type ProgramWeek = { week: number; title: string; summary: string; body: string[]; tasks: ProgramTask[] };

type GeneratedProgram = { status: ContentStatus; weeks: ProgramWeekRaw[] };
type Generated = { programme: Record<string, GeneratedProgram> };

const data = generated as unknown as Generated;

export function programStatus(programId: string): ContentStatus {
  return data.programme[programId]?.status ?? 'platzhalter';
}

function rawWeeks(programId: string): ProgramWeekRaw[] {
  const g = data.programme[programId];
  if (g && g.weeks.length > 0) return g.weeks;
  const meta = getProgram(programId);
  return placeholderWeeks(meta?.weeks ?? 12);
}

function pick(pair: { de: string; en: string }, locale: Locale): string {
  return pair[locale] || pair.de;
}

export function getProgramWeeks(programId: string, locale: Locale): ProgramWeek[] {
  return rawWeeks(programId)
    .slice()
    .sort((a, b) => a.week - b.week)
    .map((w) => ({
      week: w.week,
      title: pick(w.title, locale),
      summary: pick(w.summary, locale),
      body: (w.body[locale]?.length ? w.body[locale] : w.body.de) ?? [],
      tasks: w.tasks.map((t) => ({ id: t.id, kind: t.kind, text: pick(t.text, locale) })),
    }));
}

export function getProgramWeek(programId: string, week: number, locale: Locale): ProgramWeek | undefined {
  return getProgramWeeks(programId, locale).find((w) => w.week === week);
}
