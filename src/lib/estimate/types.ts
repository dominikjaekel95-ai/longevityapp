/**
 * Schnittstelle der Foto-Schätzung. Identisch in App und Edge Function (supabase/functions/estimate-body).
 * Spanne statt Punktwert, Konsistenz-Score zum Vorfoto, Hinweise zu Pose und Licht als Codes (kein Freitext vom Modell).
 */
export type EstimateNoteCode =
  | 'pose_abweichend'
  | 'abstand_abweichend'
  | 'licht_abweichend'
  | 'kleidung_verdeckt'
  | 'hintergrund_unruhig'
  | 'bild_unscharf'
  | 'kein_vorfoto';

export type EstimateResult = {
  provider: string;
  accepted: boolean;
  bodyFatPct: { low: number; high: number; mid: number };
  leanMassKg: { low: number; high: number } | null;
  confidence: number; // 0 bis 1
  consistency: number | null; // 0 bis 1, null ohne Vorfoto
  notes: EstimateNoteCode[];
};

export type EstimateRequest = {
  checkin_id: string;
  photo_path: string;
  previous_photo_path: string | null;
  weight_kg: number | null;
  locale: 'de' | 'en';
};
