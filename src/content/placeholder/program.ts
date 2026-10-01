/**
 * Platzhalter für die Wochenkarten, bis die Programmtexte der Begleitinstanz in content/programm/ liegen
 * (docs/ZUSAMMENARBEIT.md). Enthält bewusst keinen eigenen Programmtext, nur die Struktur und die eine
 * Aufgabe, die technisch feststeht: der wöchentliche Check-in.
 */
import type { ProgramWeekRaw } from '../program';

export function placeholderWeeks(weeks: number): ProgramWeekRaw[] {
  const out: ProgramWeekRaw[] = [];
  for (let w = 0; w <= weeks; w++) {
    out.push({
      week: w,
      title: { de: `Woche ${w}`, en: `Week ${w}` },
      summary: { de: '', en: '' },
      body: { de: [], en: [] },
      tasks: [
        {
          id: `w${w}-checkin`,
          kind: 'messen',
          text: { de: 'Check-in der Woche.', en: 'This week’s check-in.' },
        },
      ],
    });
  }
  return out;
}
