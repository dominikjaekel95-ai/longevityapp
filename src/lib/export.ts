import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';

import { listAcceptedEstimates, listAllEstimates, listCheckins, type Checkin, type Estimate } from '@/lib/db/checkins';
import { listConsents, type ConsentRow } from '@/lib/db/consents';

const num = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));
const esc = (v: string | null) => (v ? `"${v.replace(/"/g, '""')}"` : '');

/** CSV mit Semikolon und Dezimalkomma, damit deutsche Tabellenprogramme sie direkt öffnen. */
export function buildCsv(checkins: Checkin[], estimates: Awaited<ReturnType<typeof listAcceptedEstimates>>): string {
  const byCheckin = new Map(estimates.map((e) => [e.checkin_id, e]));
  const header = [
    'datum',
    'woche',
    'gewicht_kg',
    'griffkraft_kg',
    'hand',
    'taille_cm',
    'notiz',
    'foto',
    'koerperfett_schaetzung_von',
    'koerperfett_schaetzung_bis',
    'dauer_s',
  ];
  const rows = checkins.map((c) => {
    const e = byCheckin.get(c.id);
    return [
      c.date,
      String(c.week_index),
      num(c.weight_kg),
      num(c.grip_kg),
      c.grip_hand ?? '',
      num(c.waist_cm),
      esc(c.note),
      c.photo_status === 'none' ? '' : photoFileName(c),
      num(e?.body_fat_low ?? null),
      num(e?.body_fat_high ?? null),
      num(c.duration_s),
    ].join(';');
  });
  return [header.join(';'), ...rows].join('\n') + '\n';
}

/** Alle Schätzungen, auch nicht gewertete und nicht angezeigte (Auskunftsrecht, docs/REVIEW.md R8). */
export function buildEstimatesCsv(estimates: Estimate[], checkins: Checkin[]): string {
  const dateOf = new Map(checkins.map((c) => [c.id, c.date]));
  const header = [
    'datum',
    'checkin_id',
    'anbieter',
    'koerperfett_von',
    'koerperfett_bis',
    'fettfreie_masse_von_kg',
    'fettfreie_masse_bis_kg',
    'konfidenz',
    'konsistenz',
    'gewertet',
    'hinweise',
    'erstellt',
  ];
  const rows = estimates.map((e) =>
    [
      dateOf.get(e.checkin_id) ?? '',
      e.checkin_id,
      e.provider,
      num(e.body_fat_low),
      num(e.body_fat_high),
      num(e.lean_mass_low_kg),
      num(e.lean_mass_high_kg),
      num(e.confidence),
      num(e.consistency),
      e.accepted === 1 ? 'ja' : 'nein',
      esc(e.notes_json),
      e.created_at,
    ].join(';'),
  );
  return [header.join(';'), ...rows].join('\n') + '\n';
}

/** Erteilte und widerrufene Einwilligungen mit Fassung (Nachweis, Art. 7 DSGVO). */
export function buildConsentsCsv(consents: ConsentRow[]): string {
  const header = ['einwilligung', 'fassung', 'erteilt', 'widerrufen'];
  const rows = consents.map((c) => [c.consent_id, c.text_version, c.granted_at, c.revoked_at ?? ''].join(';'));
  return [header.join(';'), ...rows].join('\n') + '\n';
}

export function photoFileName(c: Checkin): string {
  return `fotos/woche-${String(c.week_index).padStart(2, '0')}-${c.date}.jpg`;
}

/** Erstellt die ZIP-Datei auf dem Gerät und öffnet den Teilen-Dialog. */
export async function exportAll(): Promise<{ ok: boolean; count: number }> {
  const checkins = await listCheckins();
  const estimates = await listAcceptedEstimates();
  const zip = new JSZip();
  zip.file('checkins.csv', buildCsv(checkins, estimates));
  zip.file('schaetzungen.csv', buildEstimatesCsv(await listAllEstimates(), checkins));
  zip.file('einwilligungen.csv', buildConsentsCsv(await listConsents()));
  zip.file(
    'LIESMICH.txt',
    'Export aus Longvy. checkins.csv: ein Check-in pro Zeile, Semikolon-getrennt. schaetzungen.csv: alle Foto-Schätzungen. einwilligungen.csv: erteilte und widerrufene Einwilligungen. fotos/: ein Foto pro Check-in, ohne Kopf.\n',
  );
  for (const c of checkins) {
    if (!c.photo_local_uri) continue;
    try {
      const f = new File(c.photo_local_uri);
      if (!f.exists) continue;
      zip.file(photoFileName(c), await f.bytes());
    } catch {
      // Foto fehlt lokal, wird übersprungen
    }
  }
  const bytes = await zip.generateAsync({ type: 'uint8array' });
  const out = new File(Paths.cache, `longvy-export-${new Date().toISOString().slice(0, 10)}.zip`);
  if (out.exists) out.delete();
  out.create();
  out.write(bytes);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(out.uri, { mimeType: 'application/zip', dialogTitle: 'Longvy Export' });
  }
  return { ok: true, count: checkins.length };
}
