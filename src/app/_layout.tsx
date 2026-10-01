import {
  HankenGrotesk_300Light,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useT } from '@/hooks/useT';
import { AppProvider, useApp } from '@/state/AppProvider';
import { fonts, palette } from '@/theme/tokens';
import { useScheme } from '@/theme/useColors';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Root() {
  const scheme = useScheme();
  const colors = palette[scheme];
  const { ready } = useApp();
  const { t } = useT();
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk_300Light,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
  });
  const fontsDone = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready && fontsDone) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, fontsDone]);

  if (!ready || !fontsDone) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.paper,
      card: colors.paper,
      text: colors.ink,
      border: colors.line,
      notification: colors.amber,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.medium, fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="verlauf/[id]" options={{ headerShown: true, title: t('verlauf.titel') }} />
        <Stack.Screen name="programm/[woche]" options={{ headerShown: true, title: t('programm.titel') }} />
        <Stack.Screen name="einstellungen/konto" options={{ headerShown: true, title: t('einstellungen.konto') }} />
        <Stack.Screen name="einstellungen/programm" options={{ headerShown: true, title: t('einstellungen.programm') }} />
        <Stack.Screen name="einstellungen/loeschen" options={{ headerShown: true, title: t('einstellungen.loeschen.titel') }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Root />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
