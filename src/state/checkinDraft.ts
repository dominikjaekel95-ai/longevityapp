import { deleteLocalPhoto, type ProcessedPhoto } from '@/lib/photo';

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
  // Ein Foto, das noch im Vorschau-Cache liegt (nicht übernommen), wird gelöscht; übernommene Fotos liegen im Dokumentenordner.
  if (draft.photo && draft.photo.uri.includes('checkin-vorschau')) deleteLocalPhoto(draft.photo.uri);
  draft.photo = null;
  draft.startedAt = null;
  draft.photoRetakes = 0;
}
