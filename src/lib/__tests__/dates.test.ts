import { daysBetween, isValidStartDate, parseIsoDate, weekIndex } from '../dates';

describe('dates', () => {
  it('parst nur gültige ISO-Daten', () => {
    expect(parseIsoDate('2026-10-01')).not.toBeNull();
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('01.10.2026')).toBeNull();
  });
  it('zählt Tage und Wochen ab dem Start', () => {
    expect(daysBetween('2026-10-01', '2026-10-08')).toBe(7);
    expect(weekIndex('2026-10-01', '2026-10-01')).toBe(0);
    expect(weekIndex('2026-10-01', '2026-10-07')).toBe(0);
    expect(weekIndex('2026-10-01', '2026-10-08')).toBe(1);
    expect(weekIndex('2026-10-01', '2026-12-24')).toBe(12);
  });
  it('lehnt Startdaten in der Zukunft ab', () => {
    const now = new Date(2026, 9, 1);
    expect(isValidStartDate('2026-10-01', now)).toBe(true);
    expect(isValidStartDate('2026-10-02', now)).toBe(false);
  });
});
