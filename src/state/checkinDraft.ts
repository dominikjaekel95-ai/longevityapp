import type { ProcessedPhoto } from '@/lib/photo';

/** Zwischenstand des laufenden Check-ins (Foto, Startzeit), lebt nur im Speicher während des Ablaufs. */
type Draft = { photo: ProcessedPhoto | null; startedAt: number | null; photoRetakes: number };

const draft: Draft = { photo: null, startedAt: null, photoRetakes: 0 };

export function startDraft(): void {
  if (!draft.startedAt) draft.startedAt = Date.now();
}

export function getDraft(): Draft {
  return draft;
}

export function setDraftPhoto(photo: ProcessedPhoto | null): void {
  draft.photo = photo;
}

export function countRetake(): void {
  draft.photoRetakes += 1;
}

export function durationSeconds(): number | null {
  if (!draft.startedAt) return null;
  return Math.round((Date.now() - draft.startedAt) / 1000);
}

export function resetDraft(): void {
  draft.photo = null;
  draft.startedAt = null;
  draft.photoRetakes = 0;
}
