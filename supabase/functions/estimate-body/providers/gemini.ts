import { outputJsonSchema, SYSTEM_PROMPT, validateOutput } from '../schema.ts';
import type { EstimateProvider, ProviderInput, ProviderResult } from './types.ts';

/**
 * Gemini über die Gemini Enterprise Agent Platform (vormals Vertex AI), Google Cloud.
 * Standort und Modell kommen aus der Konfiguration: GCP_LOCATION (Standard "eu", EU-Multi-Region) und GEMINI_MODEL.
 * Fallback laut Recherche der Begleitinstanz: gemini-3.5-flash in europe-west3 (Einzelregion, Legacy).
 *
 * Datenschutz (Zero Data Retention, docs/SETUP.md): kein Grounding, kein Context-Caching, kein Request-Response-Logging.
 * Das Foto wird übertragen, nicht gespeichert. In-Memory-Caching wird auf Projektebene abgeschaltet (Schritt für Dominik).
 */
export class GeminiProvider implements EstimateProvider {
  readonly name = 'gemini';
  private readonly project = Deno.env.get('GCP_PROJECT_ID') ?? '';
  private readonly location = Deno.env.get('GCP_LOCATION') ?? 'eu';
  private readonly model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash';
  private readonly hostOverride = Deno.env.get('VERTEX_API_HOST') ?? '';

  async estimate(input: ProviderInput): Promise<ProviderResult> {
    const token = await getAccessToken();
    const host = this.hostOverride || defaultHost(this.location);
    const url = `${host}/v1/projects/${this.project}/locations/${this.location}/publishers/google/models/${this.model}:generateContent`;

    const parts: unknown[] = [];
    if (input.previousPhoto) {
      parts.push({ text: 'Previous photo (reference for capture conditions only):' });
      parts.push({ inlineData: { mimeType: input.mimeType, data: toBase64(input.previousPhoto) } });
    }
    parts.push({ text: 'Current photo:' });
    parts.push({ inlineData: { mimeType: input.mimeType, data: toBase64(input.photo) } });

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: geminiSchema(),
        maxOutputTokens: 256,
      },
      // Kein `tools` (kein Grounding), kein `cachedContent`.
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    const output = validateOutput(parsed);
    if (!output) throw new Error('Gemini: Antwort entspricht nicht dem Schema');
    return { output, model: this.model, raw: parsed };
  }
}

function defaultHost(location: string): string {
  // Data-Residency-Endpunkte der Multi-Regionen (docs/REVIEW.md R15); so routet auch Googles SDK google-genai.
  if (location === 'eu') return 'https://aiplatform.eu.rep.googleapis.com';
  if (location === 'us') return 'https://aiplatform.us.rep.googleapis.com';
  if (location === 'global') return 'https://aiplatform.googleapis.com';
  return `https://${location}-aiplatform.googleapis.com`;
}

/** Gemini kennt im responseSchema kein additionalProperties und keine Typ-Arrays; deshalb eine angepasste Kopie. */
function geminiSchema() {
  const s = JSON.parse(JSON.stringify(outputJsonSchema)) as Record<string, unknown>;
  delete s.additionalProperties;
  const props = s.properties as Record<string, Record<string, unknown>>;
  props.consistency = { type: 'number', nullable: true, minimum: 0, maximum: 1 };
  return s;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// --- Zugriffstoken aus dem Dienstkonto (JWT, RS256, OAuth2-Token-Endpunkt). Kein zusätzliches Paket nötig. ---

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const raw = Deno.env.get('GCP_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('GCP_SERVICE_ACCOUNT_JSON fehlt');
  const sa = JSON.parse(raw) as { client_email: string; private_key: string; token_uri?: string };
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));
  const jwt = `${header}.${claims}.${b64url(new Uint8Array(sig))}`;
  const res = await fetch(sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Token ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

function b64url(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
