import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';

import { getSetting, setSetting, SettingKeys } from '@/lib/db/settings';
import { env } from '@/lib/env';

/**
 * Ereignisse an PostHog Cloud EU, nur mit der Einwilligung nutzungsstatistik (Standard: aus; src/lib/consents.ts). Kein SDK, kein Autocapture,
 * kein Session Replay. Ereignisse enthalten keine Messwerte und keine Foto-Informationen, nur Zähl- und Zeitangaben
 * für die Kennzahlen aus CLAUDE.md Abschnitt 6. Kennung ist eine zufällige Installations-ID ohne Bezug zur Person.
 */
export type AnalyticsEvent =
  | { name: 'checkin_abgeschlossen'; props: { woche: number; dauer_bucket: string; mit_foto: boolean } }
  | { name: 'foto_verworfen'; props: { grund: string } }
  | { name: 'export'; props: Record<string, never> }
  | { name: 'konto_geloescht'; props: Record<string, never> }
  | { name: 'link'; props: { ziel: string } };

let optedIn = false;
let installId: string | null = null;

export async function loadAnalyticsState(): Promise<void> {
  optedIn = (await getSetting(SettingKeys.analyticsOptIn)) === '1';
  installId = await getSetting(SettingKeys.installId);
}

export async function setAnalyticsOptIn(value: boolean): Promise<void> {
  optedIn = value;
  await setSetting(SettingKeys.analyticsOptIn, value ? '1' : '0');
  if (value && !installId) {
    installId = randomUUID();
    await setSetting(SettingKeys.installId, installId);
  }
  if (!value) {
    installId = null;
    await setSetting(SettingKeys.installId, null);
  }
}

export function isAnalyticsEnabled(): boolean {
  return Boolean(env.posthogKey) && optedIn && Boolean(installId);
}

export function durationBucket(seconds: number): string {
  if (seconds < 60) return '<60s';
  if (seconds < 120) return '60-120s';
  if (seconds < 300) return '120-300s';
  return '>300s';
}

export function track(event: AnalyticsEvent): void {
  if (!isAnalyticsEnabled()) return;
  const body = JSON.stringify({
    api_key: env.posthogKey,
    event: event.name,
    distinct_id: installId,
    properties: {
      ...event.props,
      $lib: 'longvy-app',
      app_version: env.appVersion,
      plattform: Platform.OS,
      // Kein $ip, keine Geräte-IDs; PostHog soll die IP nicht speichern: in den Projekteinstellungen „Discard client IP“ aktivieren.
    },
    timestamp: new Date().toISOString(),
  });
  fetch(`${env.posthogHost}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch(() => {
    // Analytics darf nie die App stören
  });
}
