import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { CONSENT_AGE, getConsent } from '@/content/consent';
import { getOnboardingNote } from '@/content/onboarding';
import { useT } from '@/hooks/useT';
import { recordConsent } from '@/lib/db/consents';
import { spacing } from '@/theme/tokens';

export const ONBOARDING_STEPS = 5;

export default function OnboardingStart() {
  const { t, tc, locale } = useT();
  const [age, setAge] = useState(false);
  const note = getOnboardingNote(locale);
  const consent = getConsent(locale);

  return (
    <Screen
      kicker={t('onboarding.schritt', { n: 1, total: ONBOARDING_STEPS })}
      title={t('onboarding.titel')}
      footer={
        <Button
          label={t('common.weiter')}
          disabled={!age}
          onPress={async () => {
            await recordConsent(CONSENT_AGE, consent.version);
            router.push('/onboarding/einwilligung');
          }}
        />
      }>
      <View style={{ gap: spacing.s }}>
        <Txt variant="h2">{t('onboarding.wasDieAppTut')}</Txt>
        <Txt color="ink2">{tc('appIs')}</Txt>
        <Txt color="ink2">{t('onboarding.kernschleife')}</Txt>
      </View>
      <View style={{ gap: spacing.s }}>
        <Txt variant="h2">{t('onboarding.wasDieAppNichtTut')}</Txt>
        <Txt color="ink2">{tc('appIsNot')}</Txt>
      </View>
      {note ? (
        <View style={{ gap: spacing.s }}>
          <Txt variant="h2">{note.title}</Txt>
          {note.items.map((item, i) => (
            <Txt key={i} color="ink2">
              {`– ${item}`}
            </Txt>
          ))}
          {note.closing ? (
            <Txt variant="small" color="ink3">
              {note.closing}
            </Txt>
          ) : null}
        </View>
      ) : null}
      <Notice kicker={t('einstellungen.hinweis')}>{tc('doctorHint')}</Notice>
      <Checkbox checked={age} onChange={setAge} label={t('onboarding.alter')} />
      {!age ? (
        <Txt variant="small" color="ink3">
          {t('onboarding.alterPflicht')}
        </Txt>
      ) : null}
    </Screen>
  );
}
