import type { ModelOutput } from '../schema.ts';

export type ProviderInput = {
  photo: Uint8Array;
  previousPhoto: Uint8Array | null;
  mimeType: 'image/jpeg';
};

export type ProviderResult = { output: ModelOutput; model: string; raw: unknown };

/** estimateBody(photo, meta) -> strukturierte Schätzung. Austauschbar über ESTIMATE_PROVIDER. */
export interface EstimateProvider {
  readonly name: string;
  estimate(input: ProviderInput): Promise<ProviderResult>;
}
