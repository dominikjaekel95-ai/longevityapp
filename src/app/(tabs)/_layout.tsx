import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { TabIcon } from '@/components/TabIcon';
import { useT } from '@/hooks/useT';
import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

/** Vier Tabs mit Text und Strich-Icon. Keine Aktion als Tab, kein hervorgehobener Mittel-Button. */
export default function TabsLayout() {
  const { t } = useT();
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, borderTopWidth: 1, elevation: 0 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarShowLabel: true,
        sceneStyle: { backgroundColor: colors.paper },
      }}>
      <Tabs.Screen
        name="verlauf"
        options={{ title: t('tabs.verlauf'), tabBarIcon: ({ color }) => <TabIcon name="verlauf" color={String(color)} /> }}
      />
      <Tabs.Screen
        name="checkin"
        options={{ title: t('tabs.checkin'), tabBarIcon: ({ color }) => <TabIcon name="checkin" color={String(color)} /> }}
      />
      <Tabs.Screen
        name="programm"
        options={{ title: t('tabs.programm'), tabBarIcon: ({ color }) => <TabIcon name="programm" color={String(color)} /> }}
      />
      <Tabs.Screen
        name="einstellungen"
        options={{
          title: t('tabs.einstellungen'),
          tabBarIcon: ({ color }) => <TabIcon name="einstellungen" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
