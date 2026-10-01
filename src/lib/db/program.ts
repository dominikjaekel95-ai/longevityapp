import { randomUUID } from 'expo-crypto';

import { nowIso } from '@/lib/dates';

import { getDb } from './client';

export type ProgressRow = {
  id: string;
  program_id: string;
  week_index: number;
  task_id: string;
  done: number;
  done_at: string | null;
  updated_at: string;
  synced_at: string | null;
};

export async function listProgress(programId: string): Promise<ProgressRow[]> {
  const db = await getDb();
  return db.getAllAsync<ProgressRow>('SELECT * FROM program_progress WHERE program_id = ?', programId);
}

export async function setTaskDone(programId: string, weekIndex: number, taskId: string, done: boolean): Promise<void> {
  const db = await getDb();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO program_progress (id, program_id, week_index, task_id, done, done_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(program_id, task_id) DO UPDATE SET done = excluded.done, done_at = excluded.done_at, updated_at = excluded.updated_at`,
    randomUUID(),
    programId,
    weekIndex,
    taskId,
    done ? 1 : 0,
    done ? now : null,
    now,
  );
}

export async function listUnsyncedProgress(): Promise<ProgressRow[]> {
  const db = await getDb();
  return db.getAllAsync<ProgressRow>(
    'SELECT * FROM program_progress WHERE synced_at IS NULL OR updated_at > synced_at',
  );
}

export async function markProgressSynced(ids: string[], at: string): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE program_progress SET synced_at = ? WHERE id IN (${placeholders})`, at, ...ids);
}

export async function applyRemoteProgress(rows: Omit<ProgressRow, 'synced_at'>[]): Promise<void> {
  const db = await getDb();
  for (const r of rows) {
    await db.runAsync(
      `INSERT INTO program_progress (id, program_id, week_index, task_id, done, done_at, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(program_id, task_id) DO UPDATE SET
         done = CASE WHEN program_progress.updated_at > excluded.updated_at THEN program_progress.done ELSE excluded.done END,
         done_at = CASE WHEN program_progress.updated_at > excluded.updated_at THEN program_progress.done_at ELSE excluded.done_at END,
         updated_at = MAX(program_progress.updated_at, excluded.updated_at),
         synced_at = excluded.synced_at`,
      r.id,
      r.program_id,
      r.week_index,
      r.task_id,
      r.done,
      r.done_at,
      r.updated_at,
      r.updated_at,
    );
  }
}

// --- Programmspezifische Einstellungen (JSON pro Programm) ---

export type ProgramSettings = Record<string, string | number | null>;

export async function getProgramSettings(programId: string): Promise<ProgramSettings> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ settings_json: string }>(
    'SELECT settings_json FROM program_settings WHERE program_id = ?',
    programId,
  );
  if (!row) return {};
  try {
    return JSON.parse(row.settings_json) as ProgramSettings;
  } catch {
    return {};
  }
}

export async function setProgramSettings(programId: string, settings: ProgramSettings): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO program_settings (program_id, settings_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(program_id) DO UPDATE SET settings_json = excluded.settings_json, updated_at = excluded.updated_at`,
    programId,
    JSON.stringify(settings),
    nowIso(),
  );
}

export async function listUnsyncedProgramSettings(): Promise<{ program_id: string; settings_json: string; updated_at: string }[]> {
  const db = await getDb();
  return db.getAllAsync('SELECT program_id, settings_json, updated_at FROM program_settings WHERE synced_at IS NULL OR updated_at > synced_at');
}

export async function markProgramSettingsSynced(programIds: string[], at: string): Promise<void> {
  if (programIds.length === 0) return;
  const db = await getDb();
  const placeholders = programIds.map(() => '?').join(',');
  await db.runAsync(`UPDATE program_settings SET synced_at = ? WHERE program_id IN (${placeholders})`, at, ...programIds);
}
