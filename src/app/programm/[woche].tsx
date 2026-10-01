import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { WeekCard } from '@/components/WeekCard';
import { getProgramWeek } from '@/content/program';
import { getProgram } from '@/content/programs';
import { useT } from '@/hooks/useT';
import { listProgress, setTaskDone } from '@/lib/db/program';
import { syncNow } from '@/lib/sync/sync';
import { useApp } from '@/state/AppProvider';

export default function ProgrammWoche() {
  const { woche } = useLocalSearchParams<{ woche: string }>();
  const { t, locale } = useT();
  const { settings } = useApp();
  const programId = settings.programId ?? null;
  const meta = getProgram(programId);
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
      <WeekCard
        week={week}
        done={done}
        programHinweise={meta?.hinweise ?? []}
        onToggle={async (taskId, next) => {
          await setTaskDone(programId, week.week, taskId, next);
          await reload();
          syncNow().catch(() => undefined);
        }}
      />
    </Screen>
  );
}
