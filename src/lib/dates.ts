/** Datums- und Wochenlogik. Alle Daten als ISO-Strings (YYYY-MM-DD) in lokaler Zeit. */

const MS_PER_DAY = 86_400_000;

export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime()) || d.getDate() !== Number(m[3])) return null;
  return d;
}

export function isValidStartDate(iso: string, now: Date = new Date()): boolean {
  const d = parseIsoDate(iso);
  if (!d) return false;
  return d.getTime() <= now.getTime();
}

/** Ganze Tage zwischen zwei ISO-Daten (b - a), lokal, ohne Sommerzeit-Sprünge. */
export function daysBetween(aIso: string, bIso: string): number {
  const a = parseIsoDate(aIso);
  const b = parseIsoDate(bIso);
  if (!a || !b) return 0;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

/** Wochenindex relativ zum Startdatum: Startwoche = 0. Vor dem Start negativ. */
export function weekIndex(startIso: string, dateIso: string): number {
  return Math.floor(daysBetween(startIso, dateIso) / 7);
}

export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

export function nowIso(): string {
  return new Date().toISOString();
}
