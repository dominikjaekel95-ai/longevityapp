import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env, hasBackend } from '@/lib/env';

/**
 * Supabase-Client. `null`, wenn kein Backend konfiguriert ist (Modus „nur Gerät“).
 * Auth: E-Mail mit sechsstelligem Code (kein Passwort, kein Magic-Link; Begründung in docs/DECISIONS.md).
 */
export const supabase: SupabaseClient | null = hasBackend
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (supabase && Platform.OS !== 'web') {
  // Token-Erneuerung nur, solange die App im Vordergrund ist (Empfehlung von Supabase für React Native).
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function sendEmailCode(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'kein Backend' };
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  return { error: error?.message ?? null };
}

export async function verifyEmailCode(email: string, token: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'kein Backend' };
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
