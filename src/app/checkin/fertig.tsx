import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Row } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { formatNumber } from '@/i18n';
import { getCheckin, getEstimateForCheckin, type Checkin, type Estimate } from '@/lib/db/checkins';
import { hasBackend } from '@/lib/env';
import { useApp } from '@/state/AppProvider';
import { resetDraft } from '@/state/checkinDraft';
import { spacing } from '@/theme/tokens';

export default function CheckinFertig() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tc, locale } = useT();
  const { settings, session } = useApp();
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [showEstimate, setShowEstimate] = useState(false);

  useEffect(() => {
    resetDraft();
    if (!id) return;
    getCheckin(id).then(setCheckin);
  }, [id]);

  // Schätzung nur abfragen, wenn sie sichtbar sein soll und ein Foto existiert; bis zu 60 Sekunden warten.
  useEffect(() => {
    if (!settings.estimateVisible || !id || !checkin || checkin.photo_status === 'none') return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      const e = await getEstimateForCheckin(id);
      if (e || tries >= 20) {
        setEstimate(e);
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [id, checkin, settings.estimateVisible]);

  const fmt = (v: number | null, unit: string, d = 1) => (v === null ? '' : `${formatNumber(v, d, locale)} ${unit}`);

  return (
    <Screen
      kicker={t('checkin.schritt', { n: 3 })}
      title={t('checkin.fertig.titel')}
      footer={
        <>
          <Button label={t('checkin.fertig.zumVerlauf')} onPress={() => router.replace('/(tabs)/verlauf')} />
          <Button label={t('checkin.fertig.zumProgramm')} variant="text" onPress={() => router.replace('/(tabs)/programm')} />
        </>
      }>
      {checkin ? (
        <>
          <Txt color="ink2">{t('checkin.fertig.text', { n: checkin.week_index })}</Txt>
          <View>
            <Row label={t('checkin.werte.gewicht')} value={fmt(checkin.weight_kg, 'kg')} />
            <Row label={t('checkin.werte.griffkraft')} value={fmt(checkin.grip_kg, 'kg')} sub={checkin.grip_hand ? t(`checkin.werte.${checkin.grip_hand}` as const) : null} />
            <Row label={t('checkin.werte.taille')} value={fmt(checkin.waist_cm, 'cm')} />
            <Row label={t('verlauf.foto')} value={checkin.photo_status === 'none' ? t('verlauf.keinFoto') : t('common.ja')} last />
          </View>
          {checkin.duration_s !== null ? (
            <Txt variant="small" color="ink3">
              {t('checkin.fertig.dauer', { s: checkin.duration_s })}
            </Txt>
          ) : null}
          {settings.estimateVisible && checkin.photo_status !== 'none' ? (
            <View style={{ gap: spacing.s }}>
              <Button
                label={showEstimate ? t('checkin.fertig.schaetzungAusblenden') : t('checkin.fertig.schaetzungAnzeigen')}
                variant="text"
                onPress={() => setShowEstimate((s) => !s)}
              />
              {showEstimate ? (
                <View style={{ gap: spacing.xs }}>
                  <Txt variant="h2">{tc('estimateTitle')}</Txt>
                  {!hasBackend || !session ? (
                    <Txt color="ink2">{tc('estimateUnavailable')}</Txt>
                  ) : !estimate ? (
                    <Txt color="ink2">{tc('estimatePending')}</Txt>
                  ) : estimate.accepted === 0 ? (
                    <>
                      <Txt color="ink2">{t('checkin.fertig.schaetzungAbgelehnt')}</Txt>
                      <Txt color="ink2">{tc('photoRejected')}</Txt>
                    </>
                  ) : (
                    <>
                      <Txt variant="statSmall" tabular>
                        {tc('estimateRange', { low: estimate.body_fat_low ?? 0, high: estimate.body_fat_high ?? 0 })}
                      </Txt>
                      {estimate.consistency === null ? <Txt color="ink2">{tc('estimateFirst')}</Txt> : null}
                    </>
                  )}
                  <Txt variant="small" color="ink3">
                    {tc('estimateExplain')}
                  </Txt>
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      ) : (
        <Txt color="ink3">{t('common.laden')}</Txt>
      )}
    </Screen>
  );
}
