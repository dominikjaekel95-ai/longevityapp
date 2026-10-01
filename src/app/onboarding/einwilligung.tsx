import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { getConsent } from '@/content/consent';
import { useT } from '@/hooks/useT';
import { recordConsent } from '@/lib/db/consents';
import { spacing } from '@/theme/tokens';

import { ONBOARDING_STEPS } from './index';

export default function OnboardingConsent() {
  const { t, locale } = useT();
  const consent = getConsent(locale);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Screen
      kicker={t('onboarding.schritt', { n: 2, total: ONBOARDING_STEPS })}
      title={consent.title}
      footer={
        <Button
          label={t('common.weiter')}
          disabled={!checked}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            await recordConsent('age18', consent.version);
            await recordConsent('art9', consent.version);
            setBusy(false);
            router.push('/onboarding/programm');
          }}
        />
      }>
      {consent.status !== 'freigegeben' ? (
        <Txt variant="kicker" color="amberDark">
          {t('common.entwurf')}
        </Txt>
      ) : null}
      <Txt color="ink2">{consent.intro}</Txt>
      <View style={{ gap: spacing.s }}>
        {consent.points.map((p, i) => (
          <Txt key={i} color="ink2">
            {`– ${p}`}
          </Txt>
        ))}
      </View>
      {consent.status !== 'freigegeben' ? (
        <Txt variant="small" color="ink3">
          {consent.draftNotice}
        </Txt>
      ) : null}
      <Checkbox checked={checked} onChange={setChecked} label={consent.checkbox} />
      {!checked ? (
        <Txt variant="small" color="ink3">
          {t('onboarding.einwilligungPflicht')}
        </Txt>
      ) : null}
    </Screen>
  );
}
