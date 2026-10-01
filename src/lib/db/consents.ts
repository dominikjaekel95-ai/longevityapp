import { randomUUID } from 'expo-crypto';

import { nowIso } from '@/lib/dates';

import { getDb } from './client';

export type ConsentKind = 'art9' | 'age18';

export type ConsentRow = {
  id: string;
  kind: ConsentKind;
  text_version: string;
  granted_at: string;
  revoked_at: string | null;
  synced_at: string | null;
};

export async function recordConsent(kind: ConsentKind, textVersion: string): Promise<ConsentRow> {
  const db = await getDb();
  const row: ConsentRow = {
    id: randomUUID(),
    kind,
    text_version: textVersion,
    granted_at: nowIso(),
    revoked_at: null,
    synced_at: null,
  };
  await db.runAsync(
    'INSERT INTO consents (id, kind, text_version, granted_at) VALUES (?, ?, ?, ?)',
    row.id,
    row.kind,
    row.text_version,
    row.granted_at,
  );
  return row;
}

export async function getActiveConsent(kind: ConsentKind): Promise<ConsentRow | null> {
  const db = await getDb();
  return db.getFirstAsync<ConsentRow>(
    'SELECT * FROM consents WHERE kind = ? AND revoked_at IS NULL ORDER BY granted_at DESC LIMIT 1',
    kind,
  );
}

export async function listUnsyncedConsents(): Promise<ConsentRow[]> {
  const db = await getDb();
  return db.getAllAsync<ConsentRow>('SELECT * FROM consents WHERE synced_at IS NULL');
}

export async function markConsentsSynced(ids: string[], at: string): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE consents SET synced_at = ? WHERE id IN (${placeholders})`, at, ...ids);
}
