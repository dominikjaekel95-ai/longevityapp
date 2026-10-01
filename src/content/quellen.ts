/** Quellen zu den IDs in Checklisten, Einleitungen und Übungen (content/quellen.json der Begleitinstanz). */
import generated from './generated/content.json';

export type Source = { kurz: string; url: string };

type Generated = { quellen: Record<string, Source> };
const data = generated as unknown as Generated;

export function getSource(id: string): Source | null {
  return data.quellen?.[id] ?? null;
}

export function firstSource(ids: string[]): Source | null {
  for (const id of ids) {
    const s = getSource(id);
    if (s) return s;
  }
  return null;
}
