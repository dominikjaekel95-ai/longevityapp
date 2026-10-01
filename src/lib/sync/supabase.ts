import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AppState, Platform } from 'react-native';

import { env, hasBackend } from '@/lib/env';

/**
 * Supabase-Client. `null`, wenn kein Backend konfiguriert ist (Modus „nur Gerät“).
 * Auth: E-Mail mit sechsstelligem Code (kein Passwort, kein Magic-Link; Begründung in docs/DECISIONS.md) und
 * Google-Anmeldung über den Browser (PKCE, Rücksprung per App-Link; Einrichtung in docs/SETUP.md).
 */
WebBrowser.maybeCompleteAuthSession();
export const supabase: SupabaseClient | null = hasBackend
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
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

/** Rücksprung-Adresse für OAuth: in Expo Go exp://…/--/auth, im Build longvy://auth. Beide müssen in Supabase erlaubt sein. */
export function authRedirectUrl(): string {
  return Linking.createURL('auth');
}

/**
 * Google-Anmeldung: Supabase liefert die Google-URL, der System-Browser öffnet sie, Google springt zu Supabase und
 * Supabase zurück in die App mit einem Code, den die App gegen eine Sitzung tauscht. Kein Google-SDK, kein Passwort.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'kein Backend' };
  const redirectTo = authRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
  });
  if (error || !data.url) return { error: error?.message ?? 'keine URL' };
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { error: result.type };
  const url = new URL(result.url);
  const code = url.searchParams.get('code');
  if (!code) {
    const err = url.searchParams.get('error_description') ?? url.searchParams.get('error');
    return { error: err ?? 'kein Code' };
  }
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  return { error: exchangeError?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
