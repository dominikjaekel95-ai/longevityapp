import { Stack } from 'expo-router';
import React from 'react';

import { useT } from '@/hooks/useT';
import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function CheckinLayout() {
  const { t } = useT();
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.medium, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.paper },
      }}>
      <Stack.Screen name="foto" options={{ title: `${t('checkin.titel')}: ${t('checkin.foto.titel')}` }} />
      <Stack.Screen name="werte" options={{ title: `${t('checkin.titel')}: ${t('checkin.werte.titel')}` }} />
      <Stack.Screen name="fertig" options={{ title: t('checkin.fertig.titel'), headerBackVisible: false }} />
    </Stack>
  );
}
