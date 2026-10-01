/**
 * Laufzeitkonfiguration aus EXPO_PUBLIC_*-Variablen (werden beim Build eingebettet, siehe .env.example).
 * Fehlt Supabase, läuft die App im Modus „nur Gerät“: keine Anmeldung, kein Sync, keine Foto-Schätzung.
 */
export type EstimateMode = 'sichtbar' | 'hintergrund';

const read = (key: string): string => {
  // Expo ersetzt process.env.EXPO_PUBLIC_* statisch; dynamischer Zugriff funktioniert nicht, deshalb die Liste.
  switch (key) {
    case 'EXPO_PUBLIC_SUPABASE_URL':
      return process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
    case 'EXPO_PUBLIC_SUPABASE_ANON_KEY':
      return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
    case 'EXPO_PUBLIC_ESTIMATE_MODE':
      return process.env.EXPO_PUBLIC_ESTIMATE_MODE ?? '';
    case 'EXPO_PUBLIC_POSTHOG_KEY':
      return process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
    case 'EXPO_PUBLIC_POSTHOG_HOST':
      return process.env.EXPO_PUBLIC_POSTHOG_HOST ?? '';
    case 'EXPO_PUBLIC_URL_DATENSCHUTZ':
      return process.env.EXPO_PUBLIC_URL_DATENSCHUTZ ?? '';
    case 'EXPO_PUBLIC_URL_IMPRESSUM':
      return process.env.EXPO_PUBLIC_URL_IMPRESSUM ?? '';
    case 'EXPO_PUBLIC_URL_WISSEN':
      return process.env.EXPO_PUBLIC_URL_WISSEN ?? '';
    default:
      return '';
  }
};

export const env = {
  supabaseUrl: read('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: read('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  estimateMode: (read('EXPO_PUBLIC_ESTIMATE_MODE') === 'sichtbar' ? 'sichtbar' : 'hintergrund') as EstimateMode,
  posthogKey: read('EXPO_PUBLIC_POSTHOG_KEY'),
  posthogHost: read('EXPO_PUBLIC_POSTHOG_HOST') || 'https://eu.i.posthog.com',
  urlDatenschutz: read('EXPO_PUBLIC_URL_DATENSCHUTZ') || 'https://nachderspritze.de/datenschutz/',
  urlImpressum: read('EXPO_PUBLIC_URL_IMPRESSUM') || 'https://nachderspritze.de/impressum/',
  urlWissen: read('EXPO_PUBLIC_URL_WISSEN') || 'https://nachderspritze.de/wissen/',
  appVersion: '0.1.0',
};

export const hasBackend = env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
