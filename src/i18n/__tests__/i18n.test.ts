/* eslint-disable import/first */
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'de' }] }));

import { de } from '../de';
import { en } from '../en';
import { formatDate, formatNumber, t, tc, weekdayKey } from '../index';

describe('i18n', () => {
  it('englisch hat jeden deutschen Schlüssel und keine leeren Texte', () => {
    for (const key of Object.keys(de) as (keyof typeof de)[]) {
      expect(typeof en[key]).toBe('string');
      expect(en[key].length).toBeGreaterThan(0);
      expect(de[key].length).toBeGreaterThan(0);
    }
  });
  it('ersetzt Platzhalter', () => {
    expect(t('common.wocheN', { n: 3 }, 'de')).toBe('Woche 3');
    expect(t('common.wocheN', { n: 3 }, 'en')).toBe('Week 3');
    expect(tc('estimateRange', { low: 20, high: 26 }, 'de')).toContain('20 bis 26');
  });
  it('formatiert Zahlen und Daten je Sprache', () => {
    expect(formatNumber(82.46, 1, 'de')).toBe('82,5');
    expect(formatNumber(82.46, 1, 'en')).toBe('82.5');
    expect(formatDate('2026-10-01', 'de')).toBe('01.10.2026');
    expect(formatDate('2026-10-01T10:00:00.000Z', 'en')).toBe('2026-10-01');
  });
  it('keine Emojis und keine Ausrufezeichen in Oberflächentexten', () => {
    const all = [...Object.values(de), ...Object.values(en)].join('\n');
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(all)).toBe(false);
    expect(all.includes('!')).toBe(false);
  });
  it('weekdayKey bleibt im Bereich 0 bis 6', () => {
    expect(weekdayKey(7)).toBe('wochentag.0');
    expect(weekdayKey(-1)).toBe('wochentag.6');
  });
});
