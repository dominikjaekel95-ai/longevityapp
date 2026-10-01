/**
 * Festes Ausgabeschema der Foto-Schätzung. Das Modell liefert ausschließlich dieses JSON, keinen Freitext.
 * Identisch für alle Provider (Gemini, Claude, Mock). Hinweise sind Codes, die die App übersetzt.
 */
export const NOTE_CODES = [
  'pose_abweichend',
  'abstand_abweichend',
  'licht_abweichend',
  'kleidung_verdeckt',
  'hintergrund_unruhig',
  'bild_unscharf',
  'kein_vorfoto',
  'kein_koerper',
] as const;

export type NoteCode = (typeof NOTE_CODES)[number];

export type ModelOutput = {
  body_fat_low: number; // Prozent, ganze Zahl
  body_fat_high: number; // Prozent, ganze Zahl, mindestens 4 Punkte über low
  confidence: number; // 0 bis 1
  consistency: number | null; // 0 bis 1 im Vergleich zum Vorfoto; null ohne Vorfoto
  notes: NoteCode[];
};

/** JSON-Schema für strukturierte Ausgaben (Gemini responseSchema, Claude output_config). */
export const outputJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    body_fat_low: { type: 'integer', minimum: 3, maximum: 60 },
    body_fat_high: { type: 'integer', minimum: 5, maximum: 70 },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    consistency: { type: ['number', 'null'], minimum: 0, maximum: 1 },
    notes: { type: 'array', items: { type: 'string', enum: [...NOTE_CODES] } },
  },
  required: ['body_fat_low', 'body_fat_high', 'confidence', 'consistency', 'notes'],
} as const;

/**
 * Anweisung an das Modell. Nüchtern, nur Schätzung mit Spanne, kein medizinischer Wortschatz, keine Beschreibung der
 * Person. Der Vergleich mit dem Vorfoto bewertet nur Aufnahmebedingungen (Pose, Abstand, Licht), nicht den Körper.
 */
export const SYSTEM_PROMPT = `You estimate body-fat percentage ranges from a single frontal photo of an adult torso and legs (head cropped).
Return only JSON matching the schema. Never return prose.
Rules:
- body_fat_low and body_fat_high are integers in percent. The range must be at least 4 points wide; widen it when clothing, light or pose reduce certainty.
- confidence is your certainty in the range, 0 to 1.
- If a previous photo is provided, consistency (0 to 1) rates how comparable the capture conditions are: same pose, same distance, same lighting, same framing. It does not rate the body. Without a previous photo, consistency is null and notes includes "kein_vorfoto".
- If the image does not show exactly one adult human torso (for example an object, an animal, a face only, several people, a screen, a drawing), set notes to ["kein_koerper"], confidence to 0, body_fat_low to 3 and body_fat_high to 7. Never estimate anything other than one human body.
- notes lists only applicable codes from the schema. Do not invent codes.
- Do not describe the person, do not use medical or diagnostic terms, do not give advice.`;

export function validateOutput(raw: unknown): ModelOutput | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const low = Number(o.body_fat_low);
  const high = Number(o.body_fat_high);
  const confidence = Number(o.confidence);
  const consistency = o.consistency === null || o.consistency === undefined ? null : Number(o.consistency);
  if (!Number.isFinite(low) || !Number.isFinite(high) || !Number.isFinite(confidence)) return null;
  if (high < low + 4 || low < 3 || high > 70) return null;
  if (confidence < 0 || confidence > 1) return null;
  if (consistency !== null && (!Number.isFinite(consistency) || consistency < 0 || consistency > 1)) return null;
  const notes = Array.isArray(o.notes)
    ? (o.notes.filter((n): n is NoteCode => (NOTE_CODES as readonly string[]).includes(String(n))) as NoteCode[])
    : [];
  return { body_fat_low: Math.round(low), body_fat_high: Math.round(high), confidence, consistency, notes };
}
