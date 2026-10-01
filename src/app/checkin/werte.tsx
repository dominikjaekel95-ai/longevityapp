import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Choice } from '@/components/Choice';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { formatNumber } from '@/i18n';
import { durationBucket, track } from '@/lib/analytics';
import { getCheckin, getCheckinForWeek, getLatestCheckin, upsertCheckin, type Checkin, type GripHand } from '@/lib/db/checkins';
import { todayIso } from '@/lib/dates';
import { requestEstimate } from '@/lib/estimate/client';
import { syncNow } from '@/lib/sync/sync';
import { useCurrentWeek } from '@/hooks/useWeek';
import { useApp } from '@/state/AppProvider';
import { durationSeconds, getDraft, startDraft } from '@/state/checkinDraft';
import { spacing } from '@/theme/tokens';

const LIMITS = { weight: [20, 400], grip: [0, 150], waist: [30, 250] } as const;

function parseNum(v: string): number | null {
  const s = v.trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export default function CheckinWerte() {
  const { t, tc, locale } = useT();
  const { settings, update } = useApp();
  const { week } = useCurrentWeek();
  const [previous, setPrevious] = useState<Checkin | null>(null);
  const [existing, setExisting] = useState<Checkin | null>(null);
  const [weight, setWeight] = useState('');
  const [grip, setGrip] = useState('');
  const [hand, setHand] = useState<GripHand>('rechts');
  const [waist, setWaist] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ weight?: string; grip?: string; waist?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startDraft();
    getLatestCheckin().then(setPrevious);
    if (week !== null) {
      getCheckinForWeek(week).then((c) => {
        setExisting(c);
        if (c) {
          if (c.weight_kg !== null) setWeight(formatNumber(c.weight_kg, 1, locale));
          if (c.grip_kg !== null) setGrip(formatNumber(c.grip_kg, 1, locale));
          if (c.grip_hand) setHand(c.grip_hand);
          if (c.waist_cm !== null) setWaist(formatNumber(c.waist_cm, 1, locale));
          if (c.note) setNote(c.note);
        }
      });
    }
  }, [week, locale]);

  const last = (v: number | null, unit: string) => (v === null ? undefined : `${formatNumber(v, 1, locale)} ${unit}`);
  const rangeError = (v: number | null, [min, max]: readonly [number, number]) =>
    v !== null && (Number.isNaN(v) || v < min || v > max) ? t('checkin.werte.ungueltig', { min, max }) : undefined;

  const save = async () => {
    const w = parseNum(weight);
    const g = parseNum(grip);
    const wa = parseNum(waist);
    const draft = getDraft();
    const next = {
      weight: rangeError(w, LIMITS.weight),
      grip: rangeError(g, LIMITS.grip),
      waist: rangeError(wa, LIMITS.waist),
      form: w === null && g === null && wa === null && !draft.photo && !existing?.photo_local_uri ? t('checkin.werte.mindestens') : undefined,
    };
    setErrors(next);
    if (next.weight || next.grip || next.waist || next.form) return;

    setBusy(true);
    const date = todayIso();
    const weekIndex = week ?? 0;
    if (!settings.programStart) await update('programStart', date);
    const saved = await upsertCheckin({
      id: existing?.id,
      date,
      week_index: weekIndex,
      weight_kg: w,
      grip_kg: g,
      grip_hand: g === null ? null : hand,
      waist_cm: wa,
      note: note.trim() || null,
      photo_local_uri: draft.photo?.uri ?? undefined,
      photo_width: draft.photo?.width,
      photo_height: draft.photo?.height,
      duration_s: durationSeconds(),
    });
    track({
      name: 'checkin_abgeschlossen',
      props: { woche: weekIndex, dauer_bucket: durationBucket(durationSeconds() ?? 0), mit_foto: Boolean(draft.photo) },
    });
    // Im Hintergrund: Sync, Foto-Upload, danach Schätzung (ohne Konto passiert nichts, der Verlauf steht trotzdem).
    syncNow()
      .then(async () => {
        const fresh = await getCheckin(saved.id);
        if (fresh) await requestEstimate(fresh);
      })
      .catch(() => undefined);
    setBusy(false);
    router.replace({ pathname: '/checkin/fertig', params: { id: saved.id } });
  };

  return (
    <Screen
      kicker={t('checkin.schritt', { n: 2 })}
      title={t('checkin.werte.titel')}
      footer={
        <>
          {errors.form ? (
            <Txt variant="small" color="danger">
              {errors.form}
            </Txt>
          ) : null}
          <Button label={t('common.speichern')} onPress={save} loading={busy} />
        </>
      }>
      <Field
        label={t('checkin.werte.gewicht')}
        unit="kg"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        help={previous?.weight_kg !== null && previous ? `${t('checkin.letzter', { datum: '' }).trim()} ${last(previous.weight_kg, 'kg')}` : tc('weightWhy')}
        error={errors.weight}
      />
      <Field
        label={t('checkin.werte.griffkraft')}
        unit="kg"
        value={grip}
        onChangeText={setGrip}
        keyboardType="decimal-pad"
        help={previous?.grip_kg !== null && previous ? `${t('checkin.letzter', { datum: '' }).trim()} ${last(previous.grip_kg, 'kg')}` : tc('gripWhy')}
        error={errors.grip}
      />
      <View style={{ gap: spacing.xs }}>
        <Txt variant="small" color="ink2">
          {t('checkin.werte.hand')}
        </Txt>
        <Choice
          options={[
            { value: 'rechts', label: t('checkin.werte.rechts') },
            { value: 'links', label: t('checkin.werte.links') },
          ]}
          value={hand}
          onChange={setHand}
        />
        <Txt variant="small" color="ink3">
          {tc('gripHow')}
        </Txt>
      </View>
      <Field
        label={t('checkin.werte.taille')}
        unit="cm"
        optional={t('common.optional')}
        value={waist}
        onChangeText={setWaist}
        keyboardType="decimal-pad"
        help={previous?.waist_cm !== null && previous ? `${t('checkin.letzter', { datum: '' }).trim()} ${last(previous.waist_cm, 'cm')}` : tc('waistWhy')}
        error={errors.waist}
      />
      <Field label={t('checkin.werte.notiz')} optional={t('common.optional')} value={note} onChangeText={setNote} help={t('checkin.werte.notizHinweis')} multiline />
    </Screen>
  );
}
