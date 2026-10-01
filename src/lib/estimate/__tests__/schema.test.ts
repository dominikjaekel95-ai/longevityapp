import { validateOutput } from '../../../../supabase/functions/estimate-body/schema';

describe('estimate schema', () => {
  it('akzeptiert gültige Antworten und rundet', () => {
    const out = validateOutput({ body_fat_low: 21.4, body_fat_high: 27.6, confidence: 0.6, consistency: 0.8, notes: ['licht_abweichend', 'unbekannt'] });
    expect(out).toEqual({ body_fat_low: 21, body_fat_high: 28, confidence: 0.6, consistency: 0.8, notes: ['licht_abweichend'] });
  });
  it('verwirft zu enge Spannen und Werte außerhalb des Bereichs', () => {
    expect(validateOutput({ body_fat_low: 20, body_fat_high: 22, confidence: 0.5, consistency: null, notes: [] })).toBeNull();
    expect(validateOutput({ body_fat_low: 20, body_fat_high: 26, confidence: 1.5, consistency: null, notes: [] })).toBeNull();
    expect(validateOutput('kein objekt')).toBeNull();
  });
});
