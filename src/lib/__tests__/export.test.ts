/* eslint-disable import/first */
jest.mock('expo-file-system', () => ({ File: class {}, Paths: { cache: {} } }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async () => false, shareAsync: async () => undefined }));
jest.mock('jszip', () => class {});

import type { Checkin } from '../db/checkins';
import { buildCsv, photoFileName } from '../export';

const base: Checkin = {
  id: 'a',
  date: '2026-10-01',
  week_index: 0,
  weight_kg: 82.4,
  grip_kg: 38,
  grip_hand: 'rechts',
  waist_cm: null,
  note: 'nach dem "Urlaub"',
  photo_local_uri: 'file:///x.jpg',
  photo_remote_path: null,
  photo_status: 'local',
  photo_width: 1080,
  photo_height: 1152,
  duration_s: 95,
  extra_json: null,
  created_at: '2026-10-01T08:00:00.000Z',
  updated_at: '2026-10-01T08:00:00.000Z',
  deleted_at: null,
  synced_at: null,
};

describe('export', () => {
  it('schreibt CSV mit Semikolon, Dezimalkomma und maskierten Anführungszeichen', () => {
    const csv = buildCsv([base], []);
    const [header, row] = csv.trim().split('\n');
    expect(header?.split(';')).toHaveLength(11);
    expect(row).toContain('82,4;38;rechts;;');
    expect(row).toContain('"nach dem ""Urlaub"""');
    expect(row).toContain(photoFileName(base));
  });
  it('benennt Fotos nach Woche und Datum', () => {
    expect(photoFileName(base)).toBe('fotos/woche-00-2026-10-01.jpg');
  });
});
