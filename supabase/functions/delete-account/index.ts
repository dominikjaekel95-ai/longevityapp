import { clients, requireUser } from '../_shared/auth.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

/**
 * POST /functions/v1/delete-account
 * Löscht sofort und vollständig: alle Fotos im Bucket, alle Zeilen (per Fremdschlüssel-Kaskade) und das Auth-Konto.
 * Nur für den angemeldeten Nutzer selbst. Die App löscht danach ihre lokalen Daten.
 */
const BUCKET = 'checkins';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const { user: userClient, admin } = clients(req);
  const user = await requireUser(userClient);
  if (!user) return json({ error: 'unauthorized' }, 401);

  // Fotos: seitenweise auflisten und löschen
  let offset = 0;
  const pageSize = 100;
  for (;;) {
    const { data: files, error } = await admin.storage.from(BUCKET).list(user.id, { limit: pageSize, offset });
    if (error) {
      console.error('[delete-account] list', error.message);
      break;
    }
    if (!files || files.length === 0) break;
    const paths = files.map((f) => `${user.id}/${f.name}`);
    const { error: rmError } = await admin.storage.from(BUCKET).remove(paths);
    if (rmError) console.error('[delete-account] remove', rmError.message);
    if (files.length < pageSize) break;
    offset += pageSize;
  }

  // Konto löschen: Kaskade entfernt profiles, consents, checkins, estimates, program_progress.
  const { error: delError } = await admin.auth.admin.deleteUser(user.id);
  if (delError) return json({ error: 'delete failed' }, 500);

  return json({ ok: true });
});
