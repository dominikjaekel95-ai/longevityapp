import { router } from 'expo-router';
import React, { useState } from 'react';

import { Button } from '@/components/Button';
import { ConsentList } from '@/components/ConsentList';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { getConsent } from '@/content/consent';
import { useT } from '@/hooks/useT';
import { setConsent } from '@/lib/consents';

import { ONBOARDING_STEPS } from './index';

export default function OnboardingConsent() {
  const { t, locale } = useT();
  const consent = getConsent(locale);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const requiredOk = consent.items.filter((i) => i.required && i.active).every((i) => checked[i.id]);

  return (
    <Screen
      kicker={t('onboarding.schritt', { n: 2, total: ONBOARDING_STEPS })}
      title={consent.title}
      footer={
        <Button
          label={t('common.weiter')}
          disabled={!requiredOk}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            for (const item of consent.items) {
              if (checked[item.id]) await setConsent(item.id, consent.version, true);
            }
            setBusy(false);
            router.push('/onboarding/programm');
          }}
        />
      }>
      <ConsentList consent={consent} checked={checked} onChange={(id, v) => setChecked((c) => ({ ...c, [id]: v }))} />
      {!requiredOk ? (
        <Txt variant="small" color="ink3">
          {t('onboarding.einwilligungPflicht')}
        </Txt>
      ) : null}
    </Screen>
  );
}
