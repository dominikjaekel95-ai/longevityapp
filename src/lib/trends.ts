/**
 * Trendberechnung für Verlaufskurven. Reine Funktionen, getestet in src/lib/__tests__/trends.test.ts.
 * Es wird nichts bewertet: „steigend“, „fallend“, „gleichbleibend“ beschreibt die Richtung der Ausgleichsgeraden.
 */
export type Point = { x: number; y: number };

export type TrendDirection = 'up' | 'down' | 'flat' | 'insufficient';

export type Trend = {
  direction: TrendDirection;
  /** Steigung pro Woche in der Einheit des Werts. */
  slopePerWeek: number;
  count: number;
};

/** Lineare Regression über (Woche, Wert). Ab drei Punkten; sonst „insufficient“. */
export function linearTrend(points: Point[], flatThreshold: number): Trend {
  const n = points.length;
  if (n < 3) return { direction: 'insufficient', slopePerWeek: 0, count: n };
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - meanX) * (p.y - meanY);
    den += (p.x - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const direction: TrendDirection = Math.abs(slope) < flatThreshold ? 'flat' : slope > 0 ? 'up' : 'down';
  return { direction, slopePerWeek: slope, count: n };
}

/** Schwellen, unterhalb derer die Steigung als „gleichbleibend“ gilt (pro Woche). */
export const flatThresholds = {
  weightKg: 0.15,
  gripKg: 0.3,
  waistCm: 0.2,
  bodyFatPct: 0.15,
} as const;

/** Exponentiell geglätteter Trend (Hacker's Diet, Faktor 0,1 pro Punkt). Rohwerte bleiben sichtbar, der Trend liegt darüber. */
export function smoothed(points: Point[], alpha = 0.1): Point[] {
  const out: Point[] = [];
  let prev: number | undefined;
  for (const p of points) {
    prev = prev === undefined ? p.y : prev + alpha * (p.y - prev);
    out.push({ x: p.x, y: prev });
  }
  return out;
}

/** Wertebereich für die Achse mit etwas Luft; bei nur einem Wert symmetrisch um den Wert. */
export function axisRange(values: number[], padRatio = 0.1, minSpan = 1): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 };
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < minSpan) {
    const mid = (max + min) / 2;
    min = mid - minSpan / 2;
    max = mid + minSpan / 2;
  }
  const pad = (max - min) * padRatio;
  return { min: min - pad, max: max + pad };
}

/** Veränderung zum ersten Wert, für die Zeile „seit Woche 0“. */
export function changeSinceFirst(points: Point[]): number | null {
  if (points.length < 2) return null;
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;
  return last.y - first.y;
}
