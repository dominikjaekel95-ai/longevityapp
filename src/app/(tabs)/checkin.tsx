import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Row } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { useCurrentWeek } from '@/hooks/useWeek';
import { getCheckinForWeek, listCheckins, type Checkin } from '@/lib/db/checkins';
import { formatDate } from '@/i18n';
import { resetDraft, startDraft } from '@/state/checkinDraft';
import { spacing } from '@/theme/tokens';

export default function CheckinTab() {
  const { t, tc } = useT();
  const { week } = useCurrentWeek();
  const [thisWeek, setThisWeek] = useState<Checkin | null>(null);
  const [count, setCount] = useState(0);
  const [latest, setLatest] = useState<Checkin | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const all = await listCheckins();
        const current = week === null ? null : await getCheckinForWeek(week);
        if (!active) return;
        setCount(all.length);
        setLatest(all[all.length - 1] ?? null);
        setThisWeek(current);
      })();
      return () => {
        active = false;
      };
    }, [week]),
  );

  const start = (withPhoto: boolean) => {
    resetDraft();
    startDraft();
    router.push(withPhoto ? '/checkin/foto' : '/checkin/werte');
  };

  const w = week ?? 0;
  return (
    <Screen kicker={t('checkin.dieseWoche')} title={t('common.wocheN', { n: w })}>
      <Txt variant="h2">{thisWeek ? t('checkin.erledigt', { n: w }) : t('checkin.offen', { n: w })}</Txt>
      <Txt color="ink2">{t('onboarding.kernschleife')}</Txt>
      <View style={{ gap: spacing.s }}>
        <Button label={thisWeek ? t('checkin.nochmal') : t('checkin.starten')} onPress={() => start(true)} />
        <Button label={t('checkin.foto.ohne')} variant="text" onPress={() => start(false)} />
      </View>
      <View>
        <Row label={t('checkin.anzahl', { n: count })} value="" />
        <Row
          label={latest ? t('checkin.letzter', { datum: formatDate(latest.date) }) : t('checkin.keiner')}
          value={latest?.weight_kg ? `${String(latest.weight_kg).replace('.', ',')} kg` : ''}
          last
          onPress={latest ? () => router.push({ pathname: '/verlauf/[id]', params: { id: latest.id } }) : undefined}
        />
      </View>
      <Txt variant="small" color="ink3">
        {tc('trendOnly')}
      </Txt>
    </Screen>
  );
}
