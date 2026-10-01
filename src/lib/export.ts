import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';

import { listAcceptedEstimates, listCheckins, type Checkin } from '@/lib/db/checkins';

/** CSV mit Semikolon und Dezimalkomma, damit deutsche Tabellenprogramme sie direkt öffnen. */
export function buildCsv(checkins: Checkin[], estimates: Awaited<ReturnType<typeof listAcceptedEstimates>>): string {
  const byCheckin = new Map(estimates.map((e) => [e.checkin_id, e]));
  const num = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));
  const esc = (v: string | null) => (v ? `"${v.replace(/"/g, '""')}"` : '');
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

export function photoFileName(c: Checkin): string {
  return `fotos/woche-${String(c.week_index).padStart(2, '0')}-${c.date}.jpg`;
}

/** Erstellt die ZIP-Datei auf dem Gerät und öffnet den Teilen-Dialog. */
export async function exportAll(): Promise<{ ok: boolean; count: number }> {
  const checkins = await listCheckins();
  const estimates = await listAcceptedEstimates();
  const zip = new JSZip();
  zip.file('checkins.csv', buildCsv(checkins, estimates));
  zip.file(
    'LIESMICH.txt',
    'Export aus Longvy. checkins.csv: ein Check-in pro Zeile, Semikolon-getrennt. fotos/: ein Foto pro Check-in, ohne Kopf.\n',
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
