import { router } from 'expo-router';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';

import { Button } from '@/components/Button';
import { Choice } from '@/components/Choice';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { weekdayKey } from '@/i18n';
import { scheduleWeeklyReminder } from '@/lib/notifications';
import { useApp } from '@/state/AppProvider';
import { spacing } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { ONBOARDING_STEPS } from './index';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

export default function OnboardingReminder() {
  const { t, tc } = useT();
  const colors = useColors();
  const { update } = useApp();
  const [enabled, setEnabled] = useState(false);
  const [weekday, setWeekday] = useState<number>(1);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Screen
      kicker={t('onboarding.schritt', { n: 5, total: ONBOARDING_STEPS })}
      title={t('onboarding.erinnerung.titel')}
      footer={
        <Button
          label={t('onboarding.los')}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            let on = enabled;
            if (enabled) {
              const ok = await scheduleWeeklyReminder(weekday);
              if (!ok) {
                setDenied(true);
                on = false;
              }
            }
            await update('reminderEnabled', on ? '1' : '0');
            await update('reminderWeekday', String(weekday));
            await update('onboardingDone', '1');
            setBusy(false);
            router.replace('/(tabs)/checkin');
          }}
        />
      }>
      <Txt color="ink2">{tc('reminderExplain')}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.m }}>
        <Txt>{t('onboarding.erinnerung.frage')}</Txt>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: colors.accent }} />
      </View>
      {enabled ? (
        <View style={{ gap: spacing.s }}>
          <Txt variant="kicker" color="ink3">
            {t('onboarding.erinnerung.wochentag')}
          </Txt>
          <Choice
            options={WEEKDAYS.map((d) => ({ value: d, label: t(weekdayKey(d)) }))}
            value={weekday}
            onChange={setWeekday}
          />
        </View>
      ) : null}
      {denied ? (
        <Txt variant="small" color="danger">
          {t('onboarding.erinnerung.keineBerechtigung')}
        </Txt>
      ) : null}
    </Screen>
  );
}
