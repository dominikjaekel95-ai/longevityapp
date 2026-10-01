import * as SQLite from 'expo-sqlite';

import { migrations, SCHEMA_VERSION } from './schema';

const DB_NAME = 'longvy.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Öffnet die Datenbank einmal und führt ausstehende Migrationen aus. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

export async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < SCHEMA_VERSION) {
    const next = version + 1;
    const sql = migrations[next];
    if (!sql) throw new Error(`Migration ${next} fehlt`);
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}

/** Löscht alle lokalen Daten (Konto löschen). Die Datei bleibt, die Tabellen werden geleert. */
export async function wipeLocalData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync(
      'DELETE FROM estimates; DELETE FROM program_progress; DELETE FROM program_settings; DELETE FROM checkins; DELETE FROM consents; DELETE FROM settings;',
    );
  });
}
