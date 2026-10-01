import { randomUUID } from 'expo-crypto';

import { nowIso } from '@/lib/dates';

import { getDb } from './client';

/**
 * Einwilligungen nachweisbar (Art. 7 Abs. 1 DSGVO): pro ID Fassung, Zeitpunkt der Erteilung und des Widerrufs,
 * lokal und per Sync in Supabase. Nie überschreiben: ein Widerruf setzt revoked_at, eine neue Erteilung ist eine neue Zeile.
 */
export type ConsentRow = {
  id: string;
  consent_id: string;
  text_version: string;
  granted_at: string;
  revoked_at: string | null;
  synced_at: string | null;
};

export async function recordConsent(consentId: string, textVersion: string): Promise<ConsentRow> {
  const db = await getDb();
  const active = await getActiveConsent(consentId);
  if (active && active.text_version === textVersion) return active;
  const row: ConsentRow = {
    id: randomUUID(),
    consent_id: consentId,
    text_version: textVersion,
    granted_at: nowIso(),
    revoked_at: null,
    synced_at: null,
  };
  await db.runAsync(
    'INSERT INTO consents (id, consent_id, text_version, granted_at) VALUES (?, ?, ?, ?)',
    row.id,
    row.consent_id,
    row.text_version,
    row.granted_at,
  );
  return row;
}

export async function revokeConsent(consentId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE consents SET revoked_at = ?, synced_at = NULL WHERE consent_id = ? AND revoked_at IS NULL',
    nowIso(),
    consentId,
  );
}

export async function getActiveConsent(consentId: string): Promise<ConsentRow | null> {
  const db = await getDb();
  return db.getFirstAsync<ConsentRow>(
    'SELECT * FROM consents WHERE consent_id = ? AND revoked_at IS NULL ORDER BY granted_at DESC LIMIT 1',
    consentId,
  );
}

export async function hasConsent(consentId: string): Promise<boolean> {
  return (await getActiveConsent(consentId)) !== null;
}

export async function listConsents(): Promise<ConsentRow[]> {
  const db = await getDb();
  return db.getAllAsync<ConsentRow>('SELECT * FROM consents ORDER BY granted_at ASC');
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
