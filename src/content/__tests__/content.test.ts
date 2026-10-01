import { claims } from '../claims';
import { CONSENT_HEALTH, CONSENT_PHOTO, getConsent } from '../consent';
import { getMedicalAdvice, getOnboardingNote } from '../onboarding';
import { getProgramWeek, getProgramWeeks, programStatus } from '../program';
import { defaultProgram, getProgram, programs } from '../programs';
import { getSource } from '../quellen';
import { getExercises } from '../uebungen';

describe('claims', () => {
  it('jeder Eintrag hat de und en, ohne Emojis und Ausrufezeichen', () => {
    for (const [key, value] of Object.entries(claims)) {
      expect(value.de.length).toBeGreaterThan(0);
      expect(value.en.length).toBeGreaterThan(0);
      expect(`${key}: ${value.de}`.includes('!')).toBe(false);
    }
  });
});

describe('programme aus content/', () => {
  it('genau ein verfügbares Standardprogramm, Grundprogramm zuerst', () => {
    expect(programs.filter((p) => p.default && p.available)).toHaveLength(1);
    expect(defaultProgram().id).toBe('grundprogramm');
    expect(programs[0]?.id).toBe('grundprogramm');
  });
  it('Wochen 0 bis 12 mit Checkliste und eindeutigen IDs', () => {
    for (const p of programs) {
      const weeks = getProgramWeeks(p.id, 'de');
      expect(weeks.map((w) => w.week)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const ids = weeks.flatMap((w) => w.tasks.map((t) => t.id));
      expect(ids.length).toBeGreaterThan(12);
      expect(new Set(ids).size).toBe(ids.length);
      for (const w of weeks) expect(w.title.length).toBeGreaterThan(0);
    }
  });
  it('Texte sind noch nicht freigegeben und werden so gekennzeichnet', () => {
    expect(['entwurf', 'geprueft']).toContain(programStatus('grundprogramm'));
    expect(getProgram('grundprogramm')?.status).not.toBe('freigegeben');
  });
  it('Woche 0 hat kein Training, spätere Wochen schon', () => {
    expect(getProgramWeek('grundprogramm', 0, 'de')?.training).toBeNull();
    expect(getProgramWeek('grundprogramm', 4, 'de')?.training?.saetze).toBeGreaterThan(0);
  });
  it('programmspezifische Angaben bleiben beim Programm', () => {
    const nds = programs.find((p) => p.id !== 'grundprogramm' && p.settings.length > 0);
    expect(nds?.settings[0]?.type).toBe('date');
    expect(getProgram('grundprogramm')?.settings).toHaveLength(0);
  });
  it('Quellen aus Checklisten existieren in quellen.json', () => {
    for (const p of programs) {
      for (const w of getProgramWeeks(p.id, 'de')) {
        for (const t of w.tasks) for (const id of t.quellen) expect(getSource(id)?.url).toMatch(/^https?:\/\//);
      }
    }
  });
  it('unbekannte Programme fallen auf Platzhalter zurück', () => {
    expect(getProgram('gibt-es-nicht')).toBeNull();
    expect(getProgramWeeks('gibt-es-nicht', 'de')).toHaveLength(13);
    expect(programStatus('gibt-es-nicht')).toBe('platzhalter');
  });
});

describe('einwilligung, hinweise, übungen', () => {
  it('Einwilligung hat eine Pflicht- und die Foto-Einwilligung, Entwurf gekennzeichnet', () => {
    const c = getConsent('de');
    expect(c.status).not.toBe('freigegeben');
    expect(c.items.find((i) => i.id === CONSENT_HEALTH)?.required).toBe(true);
    expect(c.items.find((i) => i.id === CONSENT_PHOTO)?.required).toBe(false);
    expect(c.screen.length).toBeGreaterThan(0);
    expect(c.version.length).toBeGreaterThan(0);
  });
  it('Onboarding-Hinweis und ärztlicher Rat vorhanden', () => {
    expect(getOnboardingNote('de')?.items.length).toBeGreaterThan(0);
    expect(getMedicalAdvice('de')?.items.length).toBeGreaterThan(0);
  });
  it('sechs Übungen mit Zuhause- und Studio-Variante', () => {
    const ex = getExercises('de');
    expect(ex?.uebungen).toHaveLength(6);
    expect(ex?.uebungen.every((u) => u.zuhause && u.studio)).toBe(true);
  });
});
