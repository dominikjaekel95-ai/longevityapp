import { getNetworkStateAsync } from 'expo-network';

import {
  applyRemoteCheckin,
  listUnsyncedCheckins,
  markCheckinsSynced,
  saveEstimate,
  type Checkin,
} from '@/lib/db/checkins';
import { CONSENT_HEALTH } from '@/content/consent';
import { hasConsent, listUnsyncedConsents, markConsentsSynced } from '@/lib/db/consents';
import {
  applyRemoteProgress,
  listUnsyncedProgramSettings,
  listUnsyncedProgress,
  markProgramSettingsSynced,
  markProgressSynced,
  type ProgressRow,
} from '@/lib/db/program';
import { getAllSettings, setSetting, SettingKeys } from '@/lib/db/settings';
import { nowIso } from '@/lib/dates';

import { getSession, supabase } from './supabase';
import { uploadPendingPhotos } from './photos';

export type SyncResult = { ok: boolean; pushed: number; pulled: number; reason?: string };

let running: Promise<SyncResult> | null = null;

/** Abgleich mit Supabase: erst lokale Änderungen hochschieben, dann fremde Änderungen holen. Läuft nie doppelt. */
export function syncNow(): Promise<SyncResult> {
  if (!running) {
    running = doSync().finally(() => {
      running = null;
    });
  }
  return running;
}

export async function isOnline(): Promise<boolean> {
  try {
    const s = await getNetworkStateAsync();
    return Boolean(s.isConnected && s.isInternetReachable !== false);
  } catch {
    return true;
  }
}

async function doSync(): Promise<SyncResult> {
  if (!supabase) return { ok: false, pushed: 0, pulled: 0, reason: 'kein Backend' };
  const session = await getSession();
  if (!session) return { ok: false, pushed: 0, pulled: 0, reason: 'nicht angemeldet' };
  // Ohne die Pflicht-Einwilligung verlässt nichts das Gerät (docs/REVIEW.md R2).
  if (!(await hasConsent(CONSENT_HEALTH))) return { ok: false, pushed: 0, pulled: 0, reason: 'keine Einwilligung' };
  if (!(await isOnline())) return { ok: false, pushed: 0, pulled: 0, reason: 'offline' };

  const userId = session.user.id;
  const at = nowIso();
  let pushed = 0;

  // Profil (Programm, Start, Sprache)
  const settings = await getAllSettings();
  await supabase.from('profiles').upsert({
    user_id: userId,
    program_id: settings[SettingKeys.programId] ?? null,
    program_start: settings[SettingKeys.programStart] ?? null,
    locale: settings[SettingKeys.locale] ?? 'de',
    updated_at: at,
  });

  // Einwilligungen (Erteilung anhängen, Widerruf nachtragen)
  const consents = await listUnsyncedConsents();
  if (consents.length > 0) {
    const { error } = await supabase.from('consents').upsert(
      consents.map((c) => ({
        id: c.id,
        user_id: userId,
        consent_id: c.consent_id,
        text_version: c.text_version,
        granted_at: c.granted_at,
        revoked_at: c.revoked_at,
      })),
    );
    if (!error) {
      await markConsentsSynced(consents.map((c) => c.id), at);
      pushed += consents.length;
    }
  }

  // Check-ins
  const checkins = await listUnsyncedCheckins();
  if (checkins.length > 0) {
    const { error } = await supabase.from('checkins').upsert(checkins.map((c) => toRemoteCheckin(c, userId)));
    if (!error) {
      await markCheckinsSynced(checkins.map((c) => c.id), at);
      pushed += checkins.length;
    } else {
      console.warn('[sync] checkins', error.message);
    }
  }

  // Fotos
  const uploadedIds = await uploadPendingPhotos(userId);
  if (uploadedIds.length > 0) {
    const refreshed = (await listUnsyncedCheckins()).filter((c) => uploadedIds.includes(c.id));
    if (refreshed.length > 0) {
      const { error } = await supabase.from('checkins').upsert(refreshed.map((c) => toRemoteCheckin(c, userId)));
      if (!error) await markCheckinsSynced(refreshed.map((c) => c.id), nowIso());
    }
  }

  // Programmfortschritt
  const progress = await listUnsyncedProgress();
  if (progress.length > 0) {
    const { error } = await supabase.from('program_progress').upsert(
      progress.map((p) => ({
        id: p.id,
        user_id: userId,
        program_id: p.program_id,
        week_index: p.week_index,
        task_id: p.task_id,
        done: p.done === 1,
        done_at: p.done_at,
        updated_at: p.updated_at,
      })),
      { onConflict: 'user_id,program_id,task_id' },
    );
    if (!error) {
      await markProgressSynced(progress.map((p) => p.id), at);
      pushed += progress.length;
    } else {
      console.warn('[sync] progress', error.message);
    }
  }

  // Programmspezifische Einstellungen
  const progSettings = await listUnsyncedProgramSettings();
  if (progSettings.length > 0) {
    const { error } = await supabase.from('program_settings').upsert(
      progSettings.map((p) => ({
        user_id: userId,
        program_id: p.program_id,
        settings: JSON.parse(p.settings_json),
        updated_at: p.updated_at,
      })),
      { onConflict: 'user_id,program_id' },
    );
    if (!error) await markProgramSettingsSynced(progSettings.map((p) => p.program_id), at);
  }

  // Holen: alles, was sich seit dem letzten Abruf geändert hat (Wiederherstellung auf neuem Gerät)
  let pulled = 0;
  const since = settings[SettingKeys.lastPullAt] ?? '1970-01-01T00:00:00.000Z';
  const { data: remoteCheckins } = await supabase.from('checkins').select('*').gt('updated_at', since);
  for (const r of remoteCheckins ?? []) {
    await applyRemoteCheckin(fromRemoteCheckin(r));
    pulled++;
  }
  const { data: remoteProgress } = await supabase.from('program_progress').select('*').gt('updated_at', since);
  if (remoteProgress && remoteProgress.length > 0) {
    await applyRemoteProgress(
      remoteProgress.map(
        (p): Omit<ProgressRow, 'synced_at'> => ({
          id: String(p.id),
          program_id: String(p.program_id),
          week_index: Number(p.week_index),
          task_id: String(p.task_id),
          done: p.done ? 1 : 0,
          done_at: p.done_at ?? null,
          updated_at: String(p.updated_at),
        }),
      ),
    );
    pulled += remoteProgress.length;
  }
  // Schätzungen schreibt nur die Edge Function; nach einem Gerätewechsel holt die App sie hierher (Export, R8).
  const { data: remoteEstimates } = await supabase.from('estimates').select('*').gt('created_at', since);
  for (const e of remoteEstimates ?? []) {
    await saveEstimate({
      id: String(e.id),
      checkin_id: String(e.checkin_id),
      provider: String(e.provider),
      body_fat_low: e.body_fat_low === null ? null : Number(e.body_fat_low),
      body_fat_high: e.body_fat_high === null ? null : Number(e.body_fat_high),
      body_fat_mid: e.body_fat_mid === null ? null : Number(e.body_fat_mid),
      lean_mass_low_kg: e.lean_mass_low_kg === null ? null : Number(e.lean_mass_low_kg),
      lean_mass_high_kg: e.lean_mass_high_kg === null ? null : Number(e.lean_mass_high_kg),
      confidence: e.confidence === null ? null : Number(e.confidence),
      consistency: e.consistency === null ? null : Number(e.consistency),
      accepted: e.accepted ? 1 : 0,
      notes_json: e.notes ? JSON.stringify(e.notes) : null,
    });
    pulled++;
  }

  if (!settings[SettingKeys.programStart]) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (profile?.program_start) {
      await setSetting(SettingKeys.programStart, String(profile.program_start));
      if (profile.program_id) await setSetting(SettingKeys.programId, String(profile.program_id));
    }
  }

  await setSetting(SettingKeys.lastPullAt, at);
  await setSetting(SettingKeys.lastSyncAt, at);
  return { ok: true, pushed, pulled };
}

function toRemoteCheckin(c: Checkin, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    date: c.date,
    week_index: c.week_index,
    weight_kg: c.weight_kg,
    grip_kg: c.grip_kg,
    grip_hand: c.grip_hand,
    waist_cm: c.waist_cm,
    note: c.note,
    photo_path: c.photo_remote_path,
    photo_width: c.photo_width,
    photo_height: c.photo_height,
    duration_s: c.duration_s,
    extra: c.extra_json ? JSON.parse(c.extra_json) : null,
    created_at: c.created_at,
    updated_at: c.updated_at,
    deleted_at: c.deleted_at,
  };
}

function fromRemoteCheckin(r: Record<string, unknown>): Omit<Checkin, 'photo_local_uri' | 'synced_at'> {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  const str = (v: unknown) => (v === null || v === undefined ? null : String(v));
  const path = str(r.photo_path);
  return {
    id: String(r.id),
    date: String(r.date),
    week_index: Number(r.week_index),
    weight_kg: num(r.weight_kg),
    grip_kg: num(r.grip_kg),
    grip_hand: str(r.grip_hand) as Checkin['grip_hand'],
    waist_cm: num(r.waist_cm),
    note: str(r.note),
    photo_remote_path: path,
    photo_status: path ? 'uploaded' : 'none',
    photo_width: num(r.photo_width),
    photo_height: num(r.photo_height),
    duration_s: num(r.duration_s),
    extra_json: r.extra ? JSON.stringify(r.extra) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    deleted_at: str(r.deleted_at),
  };
}
