import { getDb } from './client';
import { SettingKeys, type SettingKey } from './schema';

export async function getSetting(key: SettingKey): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string | null }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: SettingKey, value: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export async function getAllSettings(): Promise<Partial<Record<SettingKey, string | null>>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: SettingKey; value: string | null }>('SELECT key, value FROM settings');
  const out: Partial<Record<SettingKey, string | null>> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function boolSetting(value: string | null | undefined, fallback: boolean): boolean {
  if (value === null || value === undefined) return fallback;
  return value === '1' || value === 'true';
}

export { SettingKeys };
