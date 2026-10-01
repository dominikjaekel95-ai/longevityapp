import React from 'react';
import { View } from 'react-native';

import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { getMedicalAdvice } from '@/content/onboarding';
import { useT } from '@/hooks/useT';
import { spacing } from '@/theme/tokens';

export default function AerztlicherRatScreen() {
  const { t, tc, locale } = useT();
  const note = getMedicalAdvice(locale);
  return (
    <Screen title={note?.title ?? t('einstellungen.aerztlicherRat')}>
      {note ? (
        <View style={{ gap: spacing.s }}>
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
    </Screen>
  );
}
