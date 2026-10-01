import { router } from 'expo-router';
import React from 'react';

import { Button } from '@/components/Button';
import { EmailCodeLogin } from '@/components/EmailCodeLogin';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { hasBackend } from '@/lib/env';

import { ONBOARDING_STEPS } from './index';

export default function OnboardingAccount() {
  const { t } = useT();
  const next = () => router.push('/onboarding/erinnerung');
  return (
    <Screen
      kicker={t('onboarding.schritt', { n: 4, total: ONBOARDING_STEPS })}
      title={t('onboarding.konto.titel')}
      footer={hasBackend ? <Button label={t('onboarding.konto.spaeter')} variant="secondary" onPress={next} /> : <Button label={t('common.weiter')} onPress={next} />}>
      {hasBackend ? (
        <>
          <EmailCodeLogin onDone={next} />
          <Txt variant="small" color="ink3">
            {t('onboarding.konto.spaeterHinweis')}
          </Txt>
        </>
      ) : (
        <Txt color="ink2">{t('onboarding.konto.nichtKonfiguriert')}</Txt>
      )}
    </Screen>
  );
}
