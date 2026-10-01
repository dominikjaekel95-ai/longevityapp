import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Checkbox } from '@/components/Checkbox';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { getProgramWeek } from '@/content/program';

import { useT } from '@/hooks/useT';
import { listProgress, setTaskDone } from '@/lib/db/program';
import { syncNow } from '@/lib/sync/sync';
import { useApp } from '@/state/AppProvider';
import { spacing } from '@/theme/tokens';

export default function ProgrammWoche() {
  const { woche } = useLocalSearchParams<{ woche: string }>();
  const { t, locale } = useT();
  const { settings } = useApp();
  const programId = settings.programId ?? null;
  const weekNo = Number(woche ?? 0);
  const week = programId ? getProgramWeek(programId, weekNo, locale) : undefined;
  const [done, setDone] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!programId) return;
    const rows = await listProgress(programId);
    setDone(new Set(rows.filter((r) => r.done === 1).map((r) => r.task_id)));
  }, [programId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  if (!programId || !week) {
    return (
      <Screen title={t('programm.titel')}>
        <Txt color="ink2">{t('programm.keins')}</Txt>
      </Screen>
    );
  }

  return (
    <Screen kicker={t('common.wocheN', { n: week.week })} title={week.title}>
      {week.summary ? <Txt color="ink2">{week.summary}</Txt> : null}
      <View>
        {week.tasks.map((task) => (
          <Checkbox
            key={task.id}
            checked={done.has(task.id)}
            label={`${t(`programm.kind.${task.kind}` as const)}: ${task.text}`}
            onChange={async (next) => {
              await setTaskDone(programId, week.week, task.id, next);
              await reload();
              syncNow().catch(() => undefined);
            }}
          />
        ))}
      </View>
      {week.body.length > 0 ? (
        <View style={{ gap: spacing.s }}>
          {week.body.map((p, i) => (
            <Txt key={i} color="ink2">
              {p}
            </Txt>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
