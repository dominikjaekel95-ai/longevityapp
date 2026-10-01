import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { defaultProgram, getProgram, programs } from '@/content/programs';
import { useT } from '@/hooks/useT';
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
 * Programm und Startdatum, im Onboarding und in den Einstellungen gleich. Programmspezifische Felder
 * (aus der Programm-Metadatei in content/) werden generisch gerendert und in program_settings gespeichert.
 */
export function ProgramPicker({ initialProgramId, initialStart, submitLabel, onSubmit }: Props) {
  const { t, pick } = useT();
  const [programId, setProgramId] = useState<string>(initialProgramId ?? defaultProgram().id);
  const [start, setStart] = useState(initialStart ?? todayIso());
  const [error, setError] = useState<string | null>(null);
  const [extra, setExtra] = useState<ProgramSettings>({});
  const [extraErrors, setExtraErrors] = useState<Record<string, string>>({});
  const meta = getProgram(programId);

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
    if (!isValidStartDate(start)) {
      setError(t('onboarding.start.ungueltig'));
      return;
    }
    const errs: Record<string, string> = {};
    for (const f of meta?.settings ?? []) {
      const v = extra[f.key];
      if (f.required && (v === null || v === undefined || v === '')) errs[f.key] = t('onboarding.start.ungueltig');
      if (f.type === 'date' && typeof v === 'string' && v && !parseIsoDate(v)) errs[f.key] = t('onboarding.start.ungueltig');
    }
    setExtraErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if ((meta?.settings.length ?? 0) > 0) await setProgramSettings(programId, extra);
    onSubmit(programId, start);
  };

  return (
    <View style={{ gap: spacing.l }}>
      <Choice options={options} value={programId} onChange={setProgramId} />
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
      {meta && meta.settings.length > 0 ? (
        <View style={{ gap: spacing.s }}>
          {meta.settings.map((f) => (
            <Field
              key={f.key}
              label={pick(f.label)}
              help={f.help ? pick(f.help) : undefined}
              optional={f.required ? undefined : t('common.optional')}
              value={extra[f.key] === null || extra[f.key] === undefined ? '' : String(extra[f.key])}
              onChangeText={(v) => setExtra((e) => ({ ...e, [f.key]: f.type === 'number' ? (v === '' ? null : Number(v.replace(',', '.'))) : v }))}
              keyboardType={f.type === 'number' ? 'decimal-pad' : f.type === 'date' ? 'numbers-and-punctuation' : 'default'}
              error={extraErrors[f.key]}
            />
          ))}
        </View>
      ) : null}
      <Button label={submitLabel} onPress={submit} />
    </View>
  );
}
