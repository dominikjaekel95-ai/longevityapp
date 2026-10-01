import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { defaultProgram, getProgram, programs } from '@/content/programs';
import { useT } from '@/hooks/useT';
import { statusKey } from '@/i18n';
import { isValidStartDate, parseIsoDate, todayIso } from '@/lib/dates';
import { getProgramSettings, setProgramSettings, type ProgramSettings } from '@/lib/db/program';
import { spacing } from '@/theme/tokens';

import { Button } from './Button';
import { Choice } from './Choice';
import { Field } from './Field';
import { Txt } from './Txt';

type Props = {
  initialProgramId: string | null;
  initialStart: string | null;
  submitLabel: string;
  onSubmit: (programId: string, start: string) => void;
};

/**
 * Programm und Startdatum, im Onboarding und in den Einstellungen gleich. Programmspezifische Angaben
 * (programm_angaben aus content/) werden generisch gerendert und in program_settings gespeichert.
 * Fragt ein Programm ein Datum ab (typ: datum), ist dieses Datum die Woche 0 des Programms; ein eigenes
 * Startdatum entfällt dann (docs/DECISIONS.md D16). Es darf in der Zukunft liegen.
 */
export function ProgramPicker({ initialProgramId, initialStart, submitLabel, onSubmit }: Props) {
  const { t, pick } = useT();
  const [programId, setProgramId] = useState<string>(initialProgramId ?? defaultProgram().id);
  const [start, setStart] = useState(initialStart ?? todayIso());
  const [error, setError] = useState<string | null>(null);
  const [extra, setExtra] = useState<ProgramSettings>({});
  const [extraErrors, setExtraErrors] = useState<Record<string, string>>({});
  const meta = getProgram(programId);
  const dateField = meta?.settings.find((f) => f.type === 'date') ?? null;

  useEffect(() => {
    getProgramSettings(programId).then(setExtra);
  }, [programId]);

  const options = programs.map((p) => ({
    value: p.id,
    label: pick(p.title),
    sub: p.available ? pick(p.summary) : `${pick(p.summary)} (${t('common.inVorbereitung')})`,
    disabled: !p.available,
  }));

  const submit = async () => {
    const errs: Record<string, string> = {};
    for (const f of meta?.settings ?? []) {
      const v = extra[f.key];
      const empty = v === null || v === undefined || v === '';
      if ((f.required || f === dateField) && empty) errs[f.key] = t('onboarding.start.ungueltig');
      if (f.type === 'date' && typeof v === 'string' && v && !parseIsoDate(v)) errs[f.key] = t('onboarding.start.ungueltig');
    }
    setExtraErrors(errs);
    if (Object.keys(errs).length > 0) return;
    let programStart = start;
    if (dateField) {
      programStart = String(extra[dateField.key] ?? '');
    } else if (!isValidStartDate(start)) {
      setError(t('onboarding.start.ungueltig'));
      return;
    }
    if ((meta?.settings.length ?? 0) > 0) await setProgramSettings(programId, extra);
    onSubmit(programId, programStart);
  };

  return (
    <View style={{ gap: spacing.l }}>
      <Choice options={options} value={programId} onChange={setProgramId} />
      {meta && meta.status !== 'freigegeben' ? (
        <Txt variant="small" color="amberDark">
          {t('programm.stand', { status: t(statusKey(meta.status)) })}
        </Txt>
      ) : null}
      {meta && meta.vorabKlaeren.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          <Txt variant="kicker" color="ink3">
            {t('programm.vorabKlaeren')}
          </Txt>
          {meta.vorabKlaeren.map((p, i) => (
            <Txt key={i} color="ink2">
              {`– ${p}`}
            </Txt>
          ))}
        </View>
      ) : null}
      {meta && meta.settings.length > 0 ? (
        <View style={{ gap: spacing.s }}>
          {meta.settings.map((f) => (
            <Field
              key={f.key}
              label={pick(f.label)}
              help={f.type === 'date' ? t('onboarding.start.datum') : undefined}
              optional={f.required || f === dateField ? undefined : t('common.optional')}
              value={extra[f.key] === null || extra[f.key] === undefined ? '' : String(extra[f.key])}
              onChangeText={(v) => {
                setExtra((e) => ({ ...e, [f.key]: f.type === 'number' ? (v === '' ? null : Number(v.replace(',', '.'))) : v }));
                setExtraErrors((e) => ({ ...e, [f.key]: '' }));
              }}
              keyboardType={f.type === 'number' ? 'decimal-pad' : f.type === 'date' ? 'numbers-and-punctuation' : 'default'}
              autoCapitalize="none"
              error={extraErrors[f.key] || null}
            />
          ))}
        </View>
      ) : null}
      {!dateField ? (
        <View style={{ gap: spacing.s }}>
          <Txt variant="h2">{t('onboarding.start.titel')}</Txt>
          <Txt color="ink2">{t('onboarding.start.text')}</Txt>
          <Field
            label={t('onboarding.start.datum')}
            value={start}
            onChangeText={(v) => {
              setStart(v);
              setError(null);
            }}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            error={error}
          />
          <Button label={t('onboarding.start.heute')} variant="text" onPress={() => setStart(todayIso())} />
        </View>
      ) : null}
      <Button label={submitLabel} onPress={submit} />
    </View>
  );
}
