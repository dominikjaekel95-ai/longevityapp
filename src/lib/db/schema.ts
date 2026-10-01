/**
 * Lokales Schema (SQLite via expo-sqlite). Lokal zuerst: alles wird hier gespeichert und bei Konto nach Supabase
 * gespiegelt (src/lib/sync). Spalten mit synced_at steuern den Abgleich: NULL oder älter als updated_at = ausstehend.
 *
 * Migrationen: Versionsnummer in PRAGMA user_version; neue Schritte unten anhängen, nie bestehende ändern.
 */
export const SCHEMA_VERSION = 1;

export const migrations: Record<number, string> = {
  1: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY NOT NULL,
      consent_id TEXT NOT NULL,
      text_version TEXT NOT NULL,
      granted_at TEXT NOT NULL,
      revoked_at TEXT,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      week_index INTEGER NOT NULL,
      weight_kg REAL,
      grip_kg REAL,
      grip_hand TEXT,
      waist_cm REAL,
      note TEXT,
      photo_local_uri TEXT,
      photo_remote_path TEXT,
      photo_status TEXT NOT NULL DEFAULT 'none',
      photo_width INTEGER,
      photo_height INTEGER,
      duration_s INTEGER,
      extra_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      synced_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);

    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY NOT NULL,
      checkin_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      body_fat_low REAL,
      body_fat_high REAL,
      body_fat_mid REAL,
      lean_mass_low_kg REAL,
      lean_mass_high_kg REAL,
      confidence REAL,
      consistency REAL,
      accepted INTEGER NOT NULL DEFAULT 1,
      notes_json TEXT,
      created_at TEXT NOT NULL,
      synced_at TEXT,
      FOREIGN KEY (checkin_id) REFERENCES checkins(id)
    );
    CREATE INDEX IF NOT EXISTS idx_estimates_checkin ON estimates(checkin_id);

    CREATE TABLE IF NOT EXISTS program_progress (
      id TEXT PRIMARY KEY NOT NULL,
      program_id TEXT NOT NULL,
      week_index INTEGER NOT NULL,
      task_id TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT,
      updated_at TEXT NOT NULL,
      synced_at TEXT,
      UNIQUE (program_id, task_id)
    );

    CREATE TABLE IF NOT EXISTS program_settings (
      program_id TEXT PRIMARY KEY NOT NULL,
      settings_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );
  `,
};

/**
 * Spaltenbedeutung (Kommentare außerhalb des SQL, damit die Claims-Prüfung und SQLite nicht stolpern):
 * consents.consent_id: ID aus content/rechtliches (gesundheitsdaten, foto-auswertung, nutzungsstatistik) oder alter18. checkins.week_index: relativ zum Programmstart, ohne Programm relativ zum
 * ersten Check-in. checkins.grip_hand: 'links' | 'rechts'. checkins.photo_status: 'none' | 'local' | 'uploaded'.
 * checkins.duration_s: Dauer des Check-ins (Nebenzahl aus dem Brief). checkins.extra_json: Platz für spätere
 * Messwerte wie Schlaf oder Schritte, in 0.1 ungenutzt. program_settings.settings_json: programmspezifische Angaben
 * (z. B. ein Datum, das nur ein Programm braucht) als JSON, nie im Kern-Datenmodell.
 */

/** Schlüssel in der settings-Tabelle. */
export const SettingKeys = {
  onboardingDone: 'onboarding_done',
  programId: 'program_id',
  programStart: 'program_start',
  reminderEnabled: 'reminder_enabled',
  reminderWeekday: 'reminder_weekday',
  headMask: 'head_mask',
  estimateVisible: 'estimate_visible',
  locale: 'locale',
  lastSyncAt: 'last_sync_at',
  lastPullAt: 'last_pull_at',
  installId: 'install_id',
  analyticsOptIn: 'analytics_opt_in',
} as const;

export type SettingKey = (typeof SettingKeys)[keyof typeof SettingKeys];
