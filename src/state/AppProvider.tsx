import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { detectLocale, isAvailableLocale, setLocale, type Locale } from '@/i18n';
import { getDb } from '@/lib/db/client';
import { boolSetting, getAllSettings, setSetting, SettingKeys } from '@/lib/db/settings';
import { env } from '@/lib/env';
import { configureNotifications } from '@/lib/notifications';
import { getSession, supabase } from '@/lib/sync/supabase';
import { syncNow } from '@/lib/sync/sync';

export type Settings = {
  onboardingDone: boolean;
  programId: string | null;
  programStart: string | null;
  reminderEnabled: boolean;
  reminderWeekday: number;
  estimateVisible: boolean;
  locale: Locale;
  lastSyncAt: string | null;
};

type AppContextValue = {
  ready: boolean;
  settings: Settings;
  session: Session | null;
  locale: Locale;
  refresh: () => Promise<void>;
  update: (key: keyof typeof SettingKeys, value: string | null) => Promise<void>;
  changeLocale: (locale: Locale) => Promise<void>;
};

const defaults: Settings = {
  onboardingDone: false,
  programId: null,
  programStart: null,
  reminderEnabled: false,
  reminderWeekday: 1,
  estimateVisible: env.estimateMode === 'sichtbar',
  locale: 'de',
  lastSyncAt: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [session, setSession] = useState<Session | null>(null);
  const [locale, setLocaleState] = useState<Locale>('de');

  const refresh = useCallback(async () => {
    const raw = await getAllSettings();
    const stored = raw[SettingKeys.locale];
    const loc: Locale = isAvailableLocale(stored) ? stored : detectLocale();
    setLocale(loc);
    setLocaleState(loc);
    setSettings({
      onboardingDone: boolSetting(raw[SettingKeys.onboardingDone], false),
      programId: raw[SettingKeys.programId] ?? null,
      programStart: raw[SettingKeys.programStart] ?? null,
      reminderEnabled: boolSetting(raw[SettingKeys.reminderEnabled], false),
      reminderWeekday: Number(raw[SettingKeys.reminderWeekday] ?? 1),
      estimateVisible: boolSetting(raw[SettingKeys.estimateVisible], env.estimateMode === 'sichtbar'),
      locale: loc,
      lastSyncAt: raw[SettingKeys.lastSyncAt] ?? null,
    });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await getDb();
        configureNotifications();
        await refresh();
        const s = await getSession();
        if (active) setSession(s);
        if (s) syncNow().then(() => refresh()).catch(() => undefined);
      } finally {
        if (active) setReady(true);
      }
    })();
    const sub = supabase?.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) syncNow().then(() => refresh()).catch(() => undefined);
    });
    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [refresh]);

  const update = useCallback(
    async (key: keyof typeof SettingKeys, value: string | null) => {
      await setSetting(SettingKeys[key], value);
      await refresh();
    },
    [refresh],
  );

  const changeLocale = useCallback(
    async (next: Locale) => {
      await setSetting(SettingKeys.locale, next);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<AppContextValue>(
    () => ({ ready, settings, session, locale, refresh, update, changeLocale }),
    [ready, settings, session, locale, refresh, update, changeLocale],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp außerhalb von AppProvider');
  return ctx;
}
