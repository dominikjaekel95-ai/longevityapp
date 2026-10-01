import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Row, Section } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { getProgramWeeks, programStatus } from '@/content/program';
import { getProgram } from '@/content/programs';
import { useT } from '@/hooks/useT';
import { useCurrentWeek } from '@/hooks/useWeek';
import { listProgress, setTaskDone, type ProgressRow } from '@/lib/db/program';
import { syncNow } from '@/lib/sync/sync';
import { useApp } from '@/state/AppProvider';
import { spacing } from '@/theme/tokens';

export default function ProgrammTab() {
  const { t, tc, locale, pick } = useT();
  const { settings } = useApp();
  const { week } = useCurrentWeek();
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const programId = settings.programId ?? null;
  const meta = getProgram(programId);
  const weeks = useMemo(() => (programId ? getProgramWeeks(programId, locale) : []), [programId, locale]);

  const reload = useCallback(async () => {
    if (!programId) return;
    setProgress(await listProgress(programId));
  }, [programId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  if (!programId || !meta) {
    return (
      <Screen title={t('programm.titel')}>
        <Txt color="ink2">{t('programm.keins')}</Txt>
        <Button label={t('programm.waehlen')} onPress={() => router.push('/einstellungen/programm')} />
      </Screen>
    );
  }

  const done = new Set(progress.filter((p) => p.done === 1).map((p) => p.task_id));
  const currentWeek = Math.min(week ?? 0, meta.weeks);
  const current = weeks.find((w) => w.week === currentWeek);
  const status = programStatus(programId);

  return (
    <Screen kicker={pick(meta.title)} title={t('programm.titel')}>
      {status === 'platzhalter' ? (
        <Txt variant="small" color="amberDark">
          {t('programm.status.platzhalter')}
        </Txt>
      ) : status === 'entwurf' ? (
        <Txt variant="small" color="amberDark">
          {tc('programDraft')}
        </Txt>
      ) : null}
      {week !== null && week > meta.weeks ? <Txt color="ink2">{t('programm.nachEnde')}</Txt> : null}
      {current ? (
        <View style={{ gap: spacing.s }}>
          <Txt variant="kicker" color="ink3">
            {t('programm.aktuell')}
          </Txt>
          <Txt variant="h2">{`${t('common.wocheN', { n: current.week })}: ${current.title}`}</Txt>
          {current.summary ? <Txt color="ink2">{current.summary}</Txt> : null}
          {current.tasks.map((task) => (
            <Checkbox
              key={task.id}
              checked={done.has(task.id)}
              label={`${t(`programm.kind.${task.kind}` as const)}: ${task.text}`}
              onChange={async (next) => {
                await setTaskDone(programId, current.week, task.id, next);
                await reload();
                syncNow().catch(() => undefined);
              }}
            />
          ))}
          <Button
            label={t('programm.detail', { n: current.week })}
            variant="text"
            onPress={() => router.push({ pathname: '/programm/[woche]', params: { woche: String(current.week) } })}
          />
        </View>
      ) : null}
      <Section title={t('programm.alleWochen')}>
        {weeks.map((w, i) => {
          const total = w.tasks.length;
          const n = w.tasks.filter((x) => done.has(x.id)).length;
          return (
            <Row
              key={w.week}
              label={`${t('common.wocheN', { n: w.week })}: ${w.title}`}
              value={t('programm.aufgaben', { done: n, total })}
              last={i === weeks.length - 1}
              onPress={() => router.push({ pathname: '/programm/[woche]', params: { woche: String(w.week) } })}
            />
          );
        })}
      </Section>
    </Screen>
  );
}
