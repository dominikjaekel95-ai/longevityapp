import { router } from 'expo-router';
import React from 'react';
import { Linking, View } from 'react-native';

import type { ProgramWeek } from '@/content/program';
import { firstSource } from '@/content/quellen';
import { useT } from '@/hooks/useT';
import { spacing } from '@/theme/tokens';

import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Notice } from './Notice';
import { Txt } from './Txt';

type Props = {
  week: ProgramWeek;
  done: Set<string>;
  onToggle: (taskId: string, next: boolean) => void;
  programHinweise?: string[];
  compact?: boolean;
};

/** Wochenkarte: Einleitung, Training, Checkliste mit Quelle, Hinweis. Keine Karte im Design-Sinn, nur Abschnitte. */
export function WeekCard({ week, done, onToggle, programHinweise = [], compact = false }: Props) {
  const { t } = useT();
  const openSource = (ids: string[]) => {
    const s = firstSource(ids);
    if (s) Linking.openURL(s.url).catch(() => undefined);
  };
  return (
    <View style={{ gap: spacing.m }}>
      {week.intro ? (
        <View style={{ gap: spacing.xs }}>
          <Txt color="ink2">{week.intro}</Txt>
          {week.introQuellen.length > 0 ? <Button label={t('programm.quelle')} variant="text" onPress={() => openSource(week.introQuellen)} /> : null}
        </View>
      ) : null}
      <View style={{ gap: spacing.xs }}>
        <Txt variant="kicker" color="ink3">
          {t('programm.training')}
        </Txt>
        {week.training ? (
          <>
            <Txt>{t('programm.trainingSatz', { saetze: week.training.saetze, wdh: week.training.wiederholungen })}</Txt>
            {week.training.hinweis ? <Txt color="ink2">{week.training.hinweis}</Txt> : null}
          </>
        ) : (
          <Txt color="ink2">{t('programm.keinTraining')}</Txt>
        )}
        <Button label={t('programm.uebungen')} variant="text" onPress={() => router.push('/programm/uebungen')} />
      </View>
      <View>
        {week.tasks.map((task) => (
          <View key={task.id}>
            <Checkbox checked={done.has(task.id)} label={task.text} onChange={(next) => onToggle(task.id, next)} />
            {task.quellen.length > 0 ? (
              <View style={{ marginLeft: 40 }}>
                <Button label={t('programm.quelle')} variant="text" onPress={() => openSource(task.quellen)} />
              </View>
            ) : null}
          </View>
        ))}
      </View>
      {week.hinweis ? <Notice kicker={t('einstellungen.hinweis')}>{week.hinweis}</Notice> : null}
      {!compact && programHinweise.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          <Txt variant="kicker" color="ink3">
            {t('programm.hinweise')}
          </Txt>
          {programHinweise.map((h, i) => (
            <Txt key={i} variant="small" color="ink2">
              {h}
            </Txt>
          ))}
        </View>
      ) : null}
    </View>
  );
}
