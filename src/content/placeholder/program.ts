/**
 * Platzhalter für die Wochenkarten, bis die Programmtexte der Begleitinstanz in content/programme/ liegen
 * (docs/ZUSAMMENARBEIT.md). Kein eigener Programmtext, nur die Struktur und die eine technisch feststehende
 * Aufgabe: der wöchentliche Check-in.
 */
import type { Locale } from '@/i18n';

import type { ProgramWeek } from '../program';

export function placeholderWeeks(weeks: number, locale: Locale): ProgramWeek[] {
  const out: ProgramWeek[] = [];
  for (let w = 0; w <= weeks; w++) {
    out.push({
      week: w,
      title: locale === 'en' ? `Week ${w}` : `Woche ${w}`,
      status: 'platzhalter',
      intro: '',
      introQuellen: [],
      training: null,
      tasks: [{ id: `w${w}-checkin`, text: locale === 'en' ? 'This week’s check-in.' : 'Check-in der Woche.', quellen: [] }],
      hinweis: null,
    });
  }
  return out;
}
