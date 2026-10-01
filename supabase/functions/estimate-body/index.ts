import { clients, requireUser } from '../_shared/auth.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { ClaudeProvider } from './providers/claude.ts';
import { GeminiProvider } from './providers/gemini.ts';
import { MockProvider } from './providers/mock.ts';
import type { EstimateProvider } from './providers/types.ts';

/**
 * POST /functions/v1/estimate-body
 * Body: { checkin_id, photo_path, previous_photo_path | null, weight_kg | null, locale }
 * Antwort: EstimateResult (src/lib/estimate/types.ts in der App).
 *
 * Ablauf: Nutzer prüfen, Check-in muss dem Nutzer gehören, Fotos aus dem privaten Bucket lesen (Service-Role, nur
 * innerhalb dieses Aufrufs), Provider aufrufen, Ergebnis in estimates speichern, zurückgeben.
 * Konsistenz-Score unter ESTIMATE_CONSISTENCY_THRESHOLD: Foto wird nicht gewertet (accepted=false), die App zeigt die
 * Pose-Anleitung erneut. KI-Aufrufe nur hier, nie in der App.
 */
const BUCKET = 'checkins';
const THRESHOLD = Number(Deno.env.get('ESTIMATE_CONSISTENCY_THRESHOLD') ?? '0.6');

function provider(): EstimateProvider {
  switch (Deno.env.get('ESTIMATE_PROVIDER') ?? 'gemini') {
    case 'claude':
      return new ClaudeProvider();
    case 'mock':
      return new MockProvider();
    default:
      return new GeminiProvider();
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const { user: userClient, admin } = clients(req);
  const user = await requireUser(userClient);
  if (!user) return json({ error: 'unauthorized' }, 401);

  let body: { checkin_id?: string; photo_path?: string; previous_photo_path?: string | null; weight_kg?: number | null };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const { checkin_id, photo_path, previous_photo_path = null, weight_kg = null } = body;
  if (!checkin_id || !photo_path) return json({ error: 'checkin_id und photo_path nötig' }, 400);

  // Pfade müssen im eigenen Ordner liegen; der Check-in muss dem Nutzer gehören (zusätzlich zur RLS).
  const own = (p: string | null) => p === null || p.startsWith(`${user.id}/`);
  if (!own(photo_path) || !own(previous_photo_path)) return json({ error: 'forbidden' }, 403);
  const { data: checkin } = await userClient.from('checkins').select('id').eq('id', checkin_id).maybeSingle();
  if (!checkin) return json({ error: 'checkin nicht gefunden' }, 404);

  // Einwilligung foto-auswertung muss aktiv sein (docs/REVIEW.md R2); die App prüft das auch, hier zählt es.
  const { data: consent } = await userClient
    .from('consents')
    .select('id')
    .eq('consent_id', 'foto-auswertung')
    .is('revoked_at', null)
    .limit(1)
    .maybeSingle();
  if (!consent) return json({ error: 'keine Einwilligung foto-auswertung' }, 403);

  const photo = await download(admin, photo_path);
  if (!photo) return json({ error: 'foto nicht lesbar' }, 404);
  const previous = previous_photo_path ? await download(admin, previous_photo_path) : null;

  const p = provider();
  let result;
  try {
    result = await p.estimate({ photo, previousPhoto: previous, mimeType: 'image/jpeg' });
  } catch (e) {
    console.error('[estimate-body]', p.name, String(e));
    return json({ error: 'provider' }, 502);
  }

  const { output, model, raw } = result;
  const accepted = output.consistency === null ? true : output.consistency >= THRESHOLD;
  const mid = (output.body_fat_low + output.body_fat_high) / 2;
  const leanMass =
    weight_kg && weight_kg > 0
      ? {
          low: round1(weight_kg * (1 - output.body_fat_high / 100)),
          high: round1(weight_kg * (1 - output.body_fat_low / 100)),
        }
      : null;

  const { error: insertError } = await admin.from('estimates').insert({
    user_id: user.id,
    checkin_id,
    provider: p.name,
    model,
    body_fat_low: output.body_fat_low,
    body_fat_high: output.body_fat_high,
    body_fat_mid: mid,
    lean_mass_low_kg: leanMass?.low ?? null,
    lean_mass_high_kg: leanMass?.high ?? null,
    confidence: output.confidence,
    consistency: output.consistency,
    accepted,
    notes: output.notes,
    raw,
  });
  if (insertError) console.error('[estimate-body] insert', insertError.message);

  return json({
    provider: p.name,
    accepted,
    bodyFatPct: { low: output.body_fat_low, high: output.body_fat_high, mid },
    leanMassKg: leanMass,
    confidence: output.confidence,
    consistency: output.consistency,
    notes: output.notes,
  });
});

async function download(admin: ReturnType<typeof clients>['admin'], path: string): Promise<Uint8Array | null> {
  const { data, error } = await admin.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return new Uint8Array(await data.arrayBuffer());
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
