import type { EstimateProvider, ProviderInput, ProviderResult } from './types.ts';

/** Deterministische Schätzung für Entwicklung und Tests (ESTIMATE_PROVIDER=mock). Kein Netz, keine Kosten. */
export class MockProvider implements EstimateProvider {
  readonly name = 'mock';
  async estimate(input: ProviderInput): Promise<ProviderResult> {
    const seed = input.photo.length % 17;
    const low = 18 + seed;
    const output = {
      body_fat_low: low,
      body_fat_high: low + 6,
      confidence: 0.55,
      consistency: input.previousPhoto ? 0.82 : null,
      notes: input.previousPhoto ? [] : ['kein_vorfoto' as const],
    };
    return { output, model: 'mock', raw: output };
  }
}
