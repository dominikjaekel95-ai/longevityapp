import { claims } from '../claims';
import { getConsent } from '../consent';
import { getProgramWeek, getProgramWeeks, programStatus } from '../program';
import { defaultProgram, getProgram, programs } from '../programs';

describe('claims', () => {
  it('jeder Eintrag hat de und en, ohne Emojis und Ausrufezeichen', () => {
    for (const [key, value] of Object.entries(claims)) {
      expect(value.de.length).toBeGreaterThan(0);
      expect(value.en.length).toBeGreaterThan(0);
      expect(`${key}: ${value.de}`.includes('!')).toBe(false);
    }
  });
});

describe('programme', () => {
  it('genau ein verfügbares Standardprogramm, Grundprogramm zuerst', () => {
    expect(programs.filter((p) => p.default && p.available)).toHaveLength(1);
    expect(defaultProgram().id).toBe('grundprogramm');
    expect(programs[0]?.id).toBe('grundprogramm');
  });
  it('Platzhalter liefern Woche 0 bis 12 mit je einer Check-in-Aufgabe', () => {
    const weeks = getProgramWeeks('grundprogramm', 'de');
    expect(weeks).toHaveLength(13);
    expect(weeks[0]?.week).toBe(0);
    expect(weeks[12]?.tasks[0]?.kind).toBe('messen');
    expect(programStatus('grundprogramm')).toBe('platzhalter');
    expect(getProgramWeek('grundprogramm', 5, 'en')?.title).toBe('Week 5');
  });
  it('unbekannte Programme fallen auf zwölf Wochen zurück', () => {
    expect(getProgram('gibt-es-nicht')).toBeNull();
    expect(getProgramWeeks('gibt-es-nicht', 'de')).toHaveLength(13);
  });
  it('Aufgaben-IDs sind je Programm eindeutig', () => {
    for (const p of programs) {
      const ids = getProgramWeeks(p.id, 'de').flatMap((w) => w.tasks.map((t) => t.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('einwilligung', () => {
  it('Platzhalter ist als solcher markiert und vollständig', () => {
    const c = getConsent('de');
    expect(c.status).not.toBe('freigegeben');
    expect(c.points.length).toBeGreaterThanOrEqual(4);
    expect(c.checkbox.length).toBeGreaterThan(10);
    expect(getConsent('en').title.length).toBeGreaterThan(0);
  });
});
