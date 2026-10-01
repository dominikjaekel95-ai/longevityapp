import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { Row } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { formatDate, formatNumber } from '@/i18n';
import { getCheckin, getPreviousPhotoCheckin, softDeleteCheckin, type Checkin } from '@/lib/db/checkins';
import { deleteLocalPhoto } from '@/lib/photo';
import { signedPhotoUrl } from '@/lib/sync/photos';
import { syncNow } from '@/lib/sync/sync';
import { spacing } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

function usePhotoUri(c: Checkin | null): string | null {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!c) return setUri(null);
      if (c.photo_local_uri) return setUri(c.photo_local_uri);
      if (c.photo_remote_path) {
        const signed = await signedPhotoUrl(c.photo_remote_path);
        if (active) setUri(signed);
      }
    })();
    return () => {
      active = false;
    };
  }, [c]);
  return uri;
}

export default function VerlaufDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useT();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [previous, setPrevious] = useState<Checkin | null>(null);
  const uri = usePhotoUri(checkin);
  const prevUri = usePhotoUri(previous);

  useEffect(() => {
    if (!id) return;
    getCheckin(id).then(async (c) => {
      setCheckin(c);
      if (c) setPrevious(await getPreviousPhotoCheckin(c.date, c.id));
    });
  }, [id]);

  const fmt = (v: number | null, unit: string) => (v === null ? '' : `${formatNumber(v, 1, locale)} ${unit}`);
  const half = Math.floor((Math.min(width, 640) - spacing.m * 3) / 2);

  const remove = () => {
    if (!checkin) return;
    Alert.alert(t('verlauf.loeschenFrage'), '', [
      { text: t('common.abbrechen'), style: 'cancel' },
      {
        text: t('common.loeschen'),
        style: 'destructive',
        onPress: async () => {
          deleteLocalPhoto(checkin.photo_local_uri);
          await softDeleteCheckin(checkin.id);
          syncNow().catch(() => undefined);
          router.back();
        },
      },
    ]);
  };

  if (!checkin) {
    return (
      <Screen>
        <Txt color="ink3">{t('common.laden')}</Txt>
      </Screen>
    );
  }

  return (
    <Screen kicker={formatDate(checkin.date, locale)} title={t('verlauf.detail', { n: checkin.week_index })}>
      {checkin.photo_status !== 'none' ? (
        <View style={styles.photos}>
          <View style={{ gap: spacing.xs }}>
            <Txt variant="small" color="ink3">
              {t('common.wocheN', { n: checkin.week_index })}
            </Txt>
            {uri ? (
              <Image source={{ uri }} style={{ width: previous ? half : Math.min(width - spacing.m * 2, 480), aspectRatio: 3 / 3.2, backgroundColor: colors.paper2 }} contentFit="cover" />
            ) : (
              <Txt variant="small" color="ink3">
                {t('verlauf.fotoLaden')}
              </Txt>
            )}
          </View>
          {previous ? (
            <View style={{ gap: spacing.xs }}>
              <Txt variant="small" color="ink3">
                {t('verlauf.vorfoto', { n: previous.week_index })}
              </Txt>
              {prevUri ? (
                <Image source={{ uri: prevUri }} style={{ width: half, aspectRatio: 3 / 3.2, backgroundColor: colors.paper2 }} contentFit="cover" />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : (
        <Txt color="ink3">{t('verlauf.keinFoto')}</Txt>
      )}
      <View>
        <Row label={t('checkin.werte.gewicht')} value={fmt(checkin.weight_kg, 'kg')} />
        <Row label={t('checkin.werte.griffkraft')} value={fmt(checkin.grip_kg, 'kg')} sub={checkin.grip_hand ? t(`checkin.werte.${checkin.grip_hand}` as const) : null} />
        <Row label={t('checkin.werte.taille')} value={fmt(checkin.waist_cm, 'cm')} />
        <Row label={t('checkin.werte.notiz')} value={checkin.note ?? ''} last />
      </View>
      <Button label={t('common.loeschen')} variant="text" onPress={remove} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photos: { flexDirection: 'row', gap: spacing.m, flexWrap: 'wrap' },
});
