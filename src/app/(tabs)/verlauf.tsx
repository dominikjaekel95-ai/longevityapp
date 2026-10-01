import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { LineChart, type Band } from '@/components/LineChart';
import { Row, Section } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { formatDate, formatNumber } from '@/i18n';
import { listAcceptedEstimates, listCheckins, type Checkin } from '@/lib/db/checkins';
import { changeSinceFirst, flatThresholds, linearTrend, type Point } from '@/lib/trends';
import { useApp } from '@/state/AppProvider';
import { spacing } from '@/theme/tokens';

type Metric = { key: 'weight_kg' | 'grip_kg' | 'waist_cm'; title: string; unit: string; threshold: number; decimals: number };

export default function VerlaufTab() {
  const { t, tc, locale } = useT();
  const { settings } = useApp();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [band, setBand] = useState<Band[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const all = await listCheckins();
        const est = settings.estimateVisible ? await listAcceptedEstimates() : [];
        if (!active) return;
        setCheckins(all);
        setBand(
          est
            .filter((e) => e.body_fat_low !== null && e.body_fat_high !== null)
            .map((e) => ({ x: e.week_index, low: e.body_fat_low as number, high: e.body_fat_high as number })),
        );
      })();
      return () => {
        active = false;
      };
    }, [settings.estimateVisible]),
  );

  const fmt = (v: number, d: number) => formatNumber(v, d, locale);
  const metrics: Metric[] = [
    { key: 'weight_kg', title: t('verlauf.gewicht'), unit: 'kg', threshold: flatThresholds.weightKg, decimals: 1 },
    { key: 'grip_kg', title: t('verlauf.griffkraft'), unit: 'kg', threshold: flatThresholds.gripKg, decimals: 1 },
    { key: 'waist_cm', title: t('verlauf.taille'), unit: 'cm', threshold: flatThresholds.waistCm, decimals: 1 },
  ];

  const trendText = (points: Point[], threshold: number) => {
    const tr = linearTrend(points, threshold);
    if (tr.direction === 'insufficient') return tc('trendTooFew');
    if (tr.direction === 'up') return tc('trendUp');
    if (tr.direction === 'down') return tc('trendDown');
    return tc('trendFlat');
  };

  if (checkins.length === 0) {
    return (
      <Screen title={t('verlauf.titel')}>
        <Txt color="ink2">{t('verlauf.leer')}</Txt>
        <Button label={t('checkin.starten')} onPress={() => router.navigate('/(tabs)/checkin')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('verlauf.titel')}>
      {metrics.map((m) => {
        const points: Point[] = checkins
          .filter((c) => c[m.key] !== null)
          .map((c) => ({ x: c.week_index, y: c[m.key] as number }));
        if (points.length === 0) return null;
        if (points.length < 3) {
          const last = points[points.length - 1];
          const delta = changeSinceFirst(points);
          return (
            <View key={m.key} style={{ gap: spacing.xs }}>
              <Txt variant="h2">{m.title}</Txt>
              <Txt variant="stat" tabular>
                {last ? `${fmt(last.y, m.decimals)} ${m.unit}` : ''}
              </Txt>
              <Txt variant="small" color="ink3">
                {delta === null
                  ? t('verlauf.einzelwert')
                  : t('verlauf.seitStart', { delta: (delta > 0 ? '+' : '') + fmt(delta, m.decimals), unit: m.unit })}
              </Txt>
            </View>
          );
        }
        return (
          <LineChart
            key={m.key}
            title={m.title}
            points={points}
            unit={m.unit}
            decimals={m.decimals}
            formatNumber={fmt}
            xLabel={t('verlauf.achseWoche')}
            caption={trendText(points, m.threshold)}
          />
        );
      })}
      {settings.estimateVisible && band.length > 0 ? (
        <View style={{ gap: spacing.s }}>
          <LineChart
            title={t('verlauf.koerperfett')}
            points={band.map((b) => ({ x: b.x, y: (b.low + b.high) / 2 }))}
            band={band}
            unit="%"
            decimals={0}
            formatNumber={fmt}
            xLabel={t('verlauf.achseWoche')}
            caption={tc('trendOnly')}
          />
          <Txt variant="small" color="ink3">
            {tc('estimateExplain')}
          </Txt>
        </View>
      ) : null}
      <Section title={t('verlauf.alleCheckins')}>
        {[...checkins].reverse().map((c, i, arr) => (
          <Row
            key={c.id}
            label={t('common.wocheN', { n: c.week_index })}
            sub={formatDate(c.date, locale)}
            value={[
              c.weight_kg !== null ? `${fmt(c.weight_kg, 1)} kg` : null,
              c.grip_kg !== null ? `${fmt(c.grip_kg, 1)} kg` : null,
              c.photo_status !== 'none' ? t('verlauf.foto') : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            last={i === arr.length - 1}
            onPress={() => router.push({ pathname: '/verlauf/[id]', params: { id: c.id } })}
          />
        ))}
      </Section>
    </Screen>
  );
}
