import { router } from 'expo-router';
import React from 'react';

import { ProgramPicker } from '@/components/ProgramPicker';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { useApp } from '@/state/AppProvider';

import { ONBOARDING_STEPS } from './index';

export default function OnboardingProgram() {
  const { t, tc } = useT();
  const { settings, update } = useApp();
  return (
    <Screen kicker={t('onboarding.schritt', { n: 3, total: ONBOARDING_STEPS })} title={t('onboarding.programm.titel')}>
      <Txt color="ink2">{t('onboarding.programm.text')}</Txt>
      <Txt color="ink2">{tc('programIntro')}</Txt>
      <ProgramPicker
        initialProgramId={settings.programId}
        initialStart={settings.programStart}
        submitLabel={t('common.weiter')}
        onSubmit={async (programId, start) => {
          await update('programId', programId);
          await update('programStart', start);
          router.push('/onboarding/konto');
        }}
      />
    </Screen>
  );
}
