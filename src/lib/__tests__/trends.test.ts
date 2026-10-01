import { axisRange, changeSinceFirst, flatThresholds, linearTrend, smoothed } from '../trends';

describe('linearTrend', () => {
  it('braucht mindestens drei Punkte', () => {
    expect(linearTrend([{ x: 0, y: 80 }, { x: 1, y: 79 }], 0.15).direction).toBe('insufficient');
  });
  it('unterscheidet fallend, steigend und gleichbleibend', () => {
    const down = [0, 1, 2, 3].map((x) => ({ x, y: 80 - x * 0.5 }));
    const up = [0, 1, 2, 3].map((x) => ({ x, y: 30 + x }));
    const flat = [0, 1, 2, 3].map((x) => ({ x, y: 80 + (x % 2 === 0 ? 0.05 : -0.05) }));
    expect(linearTrend(down, flatThresholds.weightKg).direction).toBe('down');
    expect(linearTrend(up, flatThresholds.gripKg).direction).toBe('up');
    expect(linearTrend(flat, flatThresholds.weightKg).direction).toBe('flat');
  });
  it('liefert die Steigung pro Woche', () => {
    const points = [0, 1, 2, 3, 4].map((x) => ({ x, y: 10 + 2 * x }));
    expect(linearTrend(points, 0.1).slopePerWeek).toBeCloseTo(2);
  });
});

describe('Hilfsfunktionen', () => {
  it('axisRange hat Luft und eine Mindestspanne', () => {
    const r = axisRange([80], 0.1, 1);
    expect(r.max - r.min).toBeGreaterThanOrEqual(1);
    const r2 = axisRange([70, 80], 0.1, 1);
    expect(r2.min).toBeLessThan(70);
    expect(r2.max).toBeGreaterThan(80);
  });
  it('changeSinceFirst vergleicht letzten mit erstem Wert', () => {
    expect(changeSinceFirst([{ x: 0, y: 80 }, { x: 3, y: 78.5 }])).toBeCloseTo(-1.5);
    expect(changeSinceFirst([{ x: 0, y: 80 }])).toBeNull();
  });
  it('smoothed glättet mit Faktor 0,1', () => {
    const s = smoothed([{ x: 0, y: 80 }, { x: 1, y: 90 }]);
    expect(s[1]?.y).toBeCloseTo(81);
  });
});
