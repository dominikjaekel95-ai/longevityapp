import { getEstimateForCheckin, getPreviousPhotoCheckin, saveEstimate, type Checkin, type Estimate } from '@/lib/db/checkins';
import { getLocale } from '@/i18n';

import { supabase } from '@/lib/sync/supabase';

import type { EstimateRequest, EstimateResult } from './types';

/**
 * Ruft die Edge Function auf (KI nur serverseitig, CLAUDE.md Abschnitt 3) und speichert das Ergebnis lokal.
 * Gibt null zurück, wenn kein Backend, kein hochgeladenes Foto oder ein Fehler vorliegt. Der Verlauf funktioniert ohne.
 */
export async function requestEstimate(checkin: Checkin): Promise<Estimate | null> {
  if (!supabase || !checkin.photo_remote_path) return null;
  const existing = await getEstimateForCheckin(checkin.id);
  if (existing) return existing;

  const previous = await getPreviousPhotoCheckin(checkin.date, checkin.id);
  const body: EstimateRequest = {
    checkin_id: checkin.id,
    photo_path: checkin.photo_remote_path,
    previous_photo_path: previous?.photo_remote_path ?? null,
    weight_kg: checkin.weight_kg,
    locale: getLocale(),
  };
  const { data, error } = await supabase.functions.invoke<EstimateResult>('estimate-body', { body });
  if (error || !data) {
    console.warn('[estimate] fehlgeschlagen', error?.message);
    return null;
  }
  return saveEstimate({
    checkin_id: checkin.id,
    provider: data.provider,
    body_fat_low: data.bodyFatPct.low,
    body_fat_high: data.bodyFatPct.high,
    body_fat_mid: data.bodyFatPct.mid,
    lean_mass_low_kg: data.leanMassKg?.low ?? null,
    lean_mass_high_kg: data.leanMassKg?.high ?? null,
    confidence: data.confidence,
    consistency: data.consistency,
    accepted: data.accepted ? 1 : 0,
    notes_json: JSON.stringify(data.notes),
  });
}
