import { File } from 'expo-file-system';

import { listPendingPhotoUploads, markPhotoUploaded } from '@/lib/db/checkins';

import { supabase } from './supabase';

export const PHOTO_BUCKET = 'checkins';
export const SIGNED_URL_SECONDS = 600; // 10 Minuten (CLAUDE.md, Abschnitt 3)

export function remotePhotoPath(userId: string, checkinId: string): string {
  return `${userId}/${checkinId}.jpg`;
}

/** Lädt alle lokalen, noch nicht hochgeladenen Fotos in den privaten Bucket. */
export async function uploadPendingPhotos(userId: string): Promise<string[]> {
  if (!supabase) return [];
  const pending = await listPendingPhotoUploads();
  const uploaded: string[] = [];
  for (const c of pending) {
    if (!c.photo_local_uri) continue;
    try {
      const file = new File(c.photo_local_uri);
      if (!file.exists) continue;
      const bytes = await file.arrayBuffer();
      const path = remotePhotoPath(userId, c.id);
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
      if (error) {
        console.warn('[sync] Foto-Upload fehlgeschlagen', c.id, error.message);
        continue;
      }
      await markPhotoUploaded(c.id, path);
      uploaded.push(c.id);
    } catch (e) {
      console.warn('[sync] Foto-Upload Fehler', c.id, e);
    }
  }
  return uploaded;
}

/** Signierte URL für ein Remote-Foto (nur nötig, wenn die lokale Datei fehlt, z. B. nach Gerätewechsel). */
export async function signedPhotoUrl(path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) return null;
  return data.signedUrl;
}

export async function removeRemotePhoto(path: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}
