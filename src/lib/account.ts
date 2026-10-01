import { track } from '@/lib/analytics';
import { wipeLocalData } from '@/lib/db/client';
import { cancelReminder } from '@/lib/notifications';
import { deleteAllLocalPhotos } from '@/lib/photo';
import { getSession, signOut, supabase } from '@/lib/sync/supabase';

/**
 * Konto und alle Daten löschen: zuerst serverseitig (Edge Function löscht Fotos, Zeilen und Auth-Konto),
 * dann lokal (Fotos, Datenbank, Erinnerung). Gibt false zurück, wenn der Server nicht erreichbar war;
 * lokale Daten werden dann nicht gelöscht, damit nichts halb gelöscht zurückbleibt.
 */
export async function deleteEverything(): Promise<{ ok: boolean; reason?: string }> {
  track({ name: 'konto_geloescht', props: {} });
  const session = await getSession();
  if (supabase && session) {
    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
    if (error) return { ok: false, reason: error.message };
    await signOut().catch(() => undefined);
  }
  await cancelReminder().catch(() => undefined);
  deleteAllLocalPhotos();
  await wipeLocalData();
  return { ok: true };
}
