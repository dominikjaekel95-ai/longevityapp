import { useEffect, useState } from 'react';

import { getLatestCheckin, listCheckins } from '@/lib/db/checkins';
import { todayIso, weekIndex } from '@/lib/dates';
import { useApp } from '@/state/AppProvider';

/**
 * Aktuelle Woche: relativ zum Programmstart. Ohne Programmstart zählt der erste Check-in als Woche 0.
 * Liefert null, solange noch nichts feststeht.
 */
export function useCurrentWeek(): { week: number | null; startDate: string | null } {
  const { settings } = useApp();
  const [fallbackStart, setFallbackStart] = useState<string | null>(null);

  useEffect(() => {
    if (settings.programStart) return;
    let active = true;
    (async () => {
      const all = await listCheckins();
      const first = all[0];
      if (active) setFallbackStart(first ? first.date : null);
    })();
    return () => {
      active = false;
    };
  }, [settings.programStart]);

  const start = settings.programStart ?? fallbackStart;
  if (!start) return { week: null, startDate: null };
  return { week: Math.max(0, weekIndex(start, todayIso())), startDate: start };
}

export function useLatestCheckin(refreshKey = 0) {
  const [latest, setLatest] = useState<Awaited<ReturnType<typeof getLatestCheckin>>>(null);
  useEffect(() => {
    let active = true;
    getLatestCheckin().then((c) => {
      if (active) setLatest(c);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);
  return latest;
}
