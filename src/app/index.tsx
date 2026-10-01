import { Redirect } from 'expo-router';
import React from 'react';

import { useApp } from '@/state/AppProvider';

export default function Index() {
  const { settings } = useApp();
  return <Redirect href={settings.onboardingDone ? '/(tabs)/checkin' : '/onboarding'} />;
}
