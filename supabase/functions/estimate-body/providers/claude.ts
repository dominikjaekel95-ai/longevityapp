import Anthropic from 'npm:@anthropic-ai/sdk';
import { AnthropicVertex } from 'npm:@anthropic-ai/vertex-sdk';

import { outputJsonSchema, SYSTEM_PROMPT, validateOutput } from '../schema.ts';
import type { EstimateProvider, ProviderInput, ProviderResult } from './types.ts';

/**
 * Claude als zweiter Provider, vorbereitet (CLAUDE.md Abschnitt 3). Zwei Wege, beide ohne Schlüssel in der App:
 * - CLAUDE_VIA=vertex: Claude auf Google Cloud in einer EU-Region (CLAUDE_VERTEX_REGION, z. B. "europe-west1"),
 *   Authentifizierung über das Dienstkonto (GOOGLE_APPLICATION_CREDENTIALS bzw. ADC der Edge-Function-Umgebung).
 * - CLAUDE_VIA=api: Claude API direkt mit ANTHROPIC_API_KEY; Datenresidenz dann über inference_geo="eu"
 *   (nur dort unterstützt), siehe docs/KI.md.
 * Modell: CLAUDE_MODEL, Standard claude-opus-5-5. Strukturierte Ausgabe über output_config.format.
 */
export class ClaudeProvider implements EstimateProvider {
  readonly name = 'claude';
  private readonly model = Deno.env.get('CLAUDE_MODEL') ?? 'claude-opus-5-5';
  private readonly via = Deno.env.get('CLAUDE_VIA') ?? 'vertex';

  private client() {
    if (this.via === 'api') return new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    return new AnthropicVertex({
      projectId: Deno.env.get('GCP_PROJECT_ID') ?? '',
      region: Deno.env.get('CLAUDE_VERTEX_REGION') ?? 'europe-west1',
    });
  }

  async estimate(input: ProviderInput): Promise<ProviderResult> {
    const client = this.client();
    const content: Anthropic.ContentBlockParam[] = [];
    if (input.previousPhoto) {
      content.push({ type: 'text', text: 'Previous photo (reference for capture conditions only):' });
      content.push({ type: 'image', source: { type: 'base64', media_type: input.mimeType, data: toBase64(input.previousPhoto) } });
    }
    content.push({ type: 'text', text: 'Current photo:' });
    content.push({ type: 'image', source: { type: 'base64', media_type: input.mimeType, data: toBase64(input.photo) } });

    const request: Record<string, unknown> = {
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      output_config: { effort: 'low', format: { type: 'json_schema', schema: outputJsonSchema } },
    };
    if (this.via === 'api') request.inference_geo = 'eu';

    const response = (await client.messages.create(request as unknown as Anthropic.MessageCreateParamsNonStreaming)) as Anthropic.Message;
    if (response.stop_reason === 'refusal') throw new Error('Claude: Anfrage abgelehnt');
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    const output = validateOutput(parsed);
    if (!output) throw new Error('Claude: Antwort entspricht nicht dem Schema');
    return { output, model: this.model, raw: parsed };
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}
