import { randomUUID } from 'expo-crypto';

import { nowIso } from '@/lib/dates';

import { getDb } from './client';

export type GripHand = 'links' | 'rechts';
export type PhotoStatus = 'none' | 'local' | 'uploaded';

export type Checkin = {
  id: string;
  date: string;
  week_index: number;
  weight_kg: number | null;
  grip_kg: number | null;
  grip_hand: GripHand | null;
  waist_cm: number | null;
  note: string | null;
  photo_local_uri: string | null;
  photo_remote_path: string | null;
  photo_status: PhotoStatus;
  photo_width: number | null;
  photo_height: number | null;
  duration_s: number | null;
  extra_json: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string | null;
};

export type CheckinInput = {
  id?: string;
  date: string;
  week_index: number;
  weight_kg?: number | null;
  grip_kg?: number | null;
  grip_hand?: GripHand | null;
  waist_cm?: number | null;
  note?: string | null;
  photo_local_uri?: string | null;
  photo_width?: number | null;
  photo_height?: number | null;
  duration_s?: number | null;
};

export type Estimate = {
  id: string;
  checkin_id: string;
  provider: string;
  body_fat_low: number | null;
  body_fat_high: number | null;
  body_fat_mid: number | null;
  lean_mass_low_kg: number | null;
  lean_mass_high_kg: number | null;
  confidence: number | null;
  consistency: number | null;
  accepted: number;
  notes_json: string | null;
  created_at: string;
  synced_at: string | null;
};

export async function listCheckins(): Promise<Checkin[]> {
  const db = await getDb();
  return db.getAllAsync<Checkin>('SELECT * FROM checkins WHERE deleted_at IS NULL ORDER BY date ASC, created_at ASC');
}

export async function getCheckin(id: string): Promise<Checkin | null> {
  const db = await getDb();
  return db.getFirstAsync<Checkin>('SELECT * FROM checkins WHERE id = ?', id);
}

export async function getCheckinForWeek(weekIndex: number): Promise<Checkin | null> {
  const db = await getDb();
  return db.getFirstAsync<Checkin>(
    'SELECT * FROM checkins WHERE week_index = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1',
    weekIndex,
  );
}

export async function getLatestCheckin(): Promise<Checkin | null> {
  const db = await getDb();
  return db.getFirstAsync<Checkin>(
    'SELECT * FROM checkins WHERE deleted_at IS NULL ORDER BY date DESC, created_at DESC LIMIT 1',
  );
}

/** Letzter Check-in mit Foto vor dem gegebenen Datum, als Vorfoto für den Konsistenzvergleich. */
export async function getPreviousPhotoCheckin(beforeDate: string, excludeId?: string): Promise<Checkin | null> {
  const db = await getDb();
  return db.getFirstAsync<Checkin>(
    `SELECT * FROM checkins WHERE deleted_at IS NULL AND photo_status != 'none' AND date <= ? AND id != ?
     ORDER BY date DESC, created_at DESC LIMIT 1`,
    beforeDate,
    excludeId ?? '',
  );
}

export async function upsertCheckin(input: CheckinInput): Promise<Checkin> {
  const db = await getDb();
  const now = nowIso();
  const id = input.id ?? randomUUID();
  const existing = input.id ? await getCheckin(input.id) : null;
  const photoUri = input.photo_local_uri ?? existing?.photo_local_uri ?? null;
  const photoStatus: PhotoStatus = input.photo_local_uri ? 'local' : (existing?.photo_status ?? 'none');
  await db.runAsync(
    `INSERT INTO checkins (id, date, week_index, weight_kg, grip_kg, grip_hand, waist_cm, note, photo_local_uri,
       photo_remote_path, photo_status, photo_width, photo_height, duration_s, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       date = excluded.date, week_index = excluded.week_index, weight_kg = excluded.weight_kg,
       grip_kg = excluded.grip_kg, grip_hand = excluded.grip_hand, waist_cm = excluded.waist_cm, note = excluded.note,
       photo_local_uri = excluded.photo_local_uri, photo_status = excluded.photo_status,
       photo_width = excluded.photo_width, photo_height = excluded.photo_height,
       duration_s = COALESCE(excluded.duration_s, checkins.duration_s), updated_at = excluded.updated_at`,
    id,
    input.date,
    input.week_index,
    input.weight_kg ?? null,
    input.grip_kg ?? null,
    input.grip_hand ?? null,
    input.waist_cm ?? null,
    input.note ?? null,
    photoUri,
    existing?.photo_remote_path ?? null,
    photoStatus,
    input.photo_width ?? existing?.photo_width ?? null,
    input.photo_height ?? existing?.photo_height ?? null,
    input.duration_s ?? null,
    existing?.created_at ?? now,
    now,
  );
  const saved = await getCheckin(id);
  if (!saved) throw new Error('Check-in konnte nicht gespeichert werden');
  return saved;
}

export async function markPhotoUploaded(id: string, remotePath: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE checkins SET photo_remote_path = ?, photo_status = 'uploaded', updated_at = ? WHERE id = ?`,
    remotePath,
    nowIso(),
    id,
  );
}

export async function softDeleteCheckin(id: string): Promise<void> {
  const db = await getDb();
  const now = nowIso();
  await db.runAsync('UPDATE checkins SET deleted_at = ?, updated_at = ? WHERE id = ?', now, now, id);
}

export async function markCheckinsSynced(ids: string[], at: string): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE checkins SET synced_at = ? WHERE id IN (${placeholders})`, at, ...ids);
}

export async function listUnsyncedCheckins(): Promise<Checkin[]> {
  const db = await getDb();
  return db.getAllAsync<Checkin>('SELECT * FROM checkins WHERE synced_at IS NULL OR updated_at > synced_at');
}

export async function countUnsynced(): Promise<number> {
  const db = await getDb();
  const a = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM checkins WHERE synced_at IS NULL OR updated_at > synced_at',
  );
  const b = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM program_progress WHERE synced_at IS NULL OR updated_at > synced_at',
  );
  return (a?.n ?? 0) + (b?.n ?? 0);
}

export async function listPendingPhotoUploads(): Promise<Checkin[]> {
  const db = await getDb();
  return db.getAllAsync<Checkin>(
    `SELECT * FROM checkins WHERE deleted_at IS NULL AND photo_status = 'local' AND photo_local_uri IS NOT NULL`,
  );
}

/** Lokale Kopie eines Remote-Check-ins (Wiederherstellung auf neuem Gerät). Lokale neuere Änderungen gewinnen. */
export async function applyRemoteCheckin(remote: Omit<Checkin, 'photo_local_uri' | 'synced_at'>): Promise<void> {
  const db = await getDb();
  const local = await getCheckin(remote.id);
  if (local && local.updated_at >= remote.updated_at) return;
  await db.runAsync(
    `INSERT INTO checkins (id, date, week_index, weight_kg, grip_kg, grip_hand, waist_cm, note, photo_local_uri,
       photo_remote_path, photo_status, photo_width, photo_height, duration_s, extra_json, created_at, updated_at, deleted_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       date = excluded.date, week_index = excluded.week_index, weight_kg = excluded.weight_kg, grip_kg = excluded.grip_kg,
       grip_hand = excluded.grip_hand, waist_cm = excluded.waist_cm, note = excluded.note,
       photo_remote_path = excluded.photo_remote_path,
       photo_status = CASE WHEN checkins.photo_local_uri IS NOT NULL THEN checkins.photo_status ELSE excluded.photo_status END,
       photo_width = excluded.photo_width, photo_height = excluded.photo_height, duration_s = excluded.duration_s,
       extra_json = excluded.extra_json, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at, synced_at = excluded.synced_at`,
    remote.id,
    remote.date,
    remote.week_index,
    remote.weight_kg,
    remote.grip_kg,
    remote.grip_hand,
    remote.waist_cm,
    remote.note,
    local?.photo_local_uri ?? null,
    remote.photo_remote_path,
    remote.photo_remote_path ? 'uploaded' : 'none',
    remote.photo_width,
    remote.photo_height,
    remote.duration_s,
    remote.extra_json,
    remote.created_at,
    remote.updated_at,
    remote.deleted_at,
    remote.updated_at,
  );
}

// --- Schätzungen ---

export async function saveEstimate(
  e: Omit<Estimate, 'id' | 'created_at' | 'synced_at'> & { id?: string },
): Promise<Estimate> {
  const db = await getDb();
  const id = e.id ?? randomUUID();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO estimates (id, checkin_id, provider, body_fat_low, body_fat_high, body_fat_mid, lean_mass_low_kg,
       lean_mass_high_kg, confidence, consistency, accepted, notes_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET body_fat_low = excluded.body_fat_low, body_fat_high = excluded.body_fat_high,
       body_fat_mid = excluded.body_fat_mid, lean_mass_low_kg = excluded.lean_mass_low_kg,
       lean_mass_high_kg = excluded.lean_mass_high_kg, confidence = excluded.confidence,
       consistency = excluded.consistency, accepted = excluded.accepted, notes_json = excluded.notes_json`,
    id,
    e.checkin_id,
    e.provider,
    e.body_fat_low,
    e.body_fat_high,
    e.body_fat_mid,
    e.lean_mass_low_kg,
    e.lean_mass_high_kg,
    e.confidence,
    e.consistency,
    e.accepted,
    e.notes_json,
    now,
  );
  const saved = await db.getFirstAsync<Estimate>('SELECT * FROM estimates WHERE id = ?', id);
  if (!saved) throw new Error('Schätzung konnte nicht gespeichert werden');
  return saved;
}

export async function getEstimateForCheckin(checkinId: string): Promise<Estimate | null> {
  const db = await getDb();
  return db.getFirstAsync<Estimate>(
    'SELECT * FROM estimates WHERE checkin_id = ? ORDER BY created_at DESC LIMIT 1',
    checkinId,
  );
}

export async function listAcceptedEstimates(): Promise<(Estimate & { week_index: number; date: string })[]> {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT e.*, c.week_index, c.date FROM estimates e
     JOIN checkins c ON c.id = e.checkin_id
     WHERE e.accepted = 1 AND c.deleted_at IS NULL
     ORDER BY c.date ASC`,
  );
}
