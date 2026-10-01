/** Übungen aus content/uebungen/<locale>/uebungen.md (Begleitinstanz). Gilt für alle Programme. */
import type { Locale } from '@/i18n';

import generated from './generated/content.json';
import type { ContentStatus } from './program';

export type Exercise = { id: string; nr: number; name: string; zuhause: string; studio: string; trainiert: string };
export type Exercises = {
  status: ContentStatus;
  ablauf: string;
  ablaufQuellen: string[];
  uebungen: Exercise[];
  sicherheit: string[];
};

type Generated = { uebungen: Partial<Record<Locale, Exercises>> | null };
const data = generated as unknown as Generated;

export function getExercises(locale: Locale): Exercises | null {
  const all = data.uebungen;
  if (!all) return null;
  return all[locale] ?? all.de ?? null;
}
