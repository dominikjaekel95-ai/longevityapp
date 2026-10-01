import { router } from 'expo-router';
import React from 'react';

import { ProgramPicker } from '@/components/ProgramPicker';
import { Screen } from '@/components/Screen';
import { useT } from '@/hooks/useT';
import { syncNow } from '@/lib/sync/sync';
import { useApp } from '@/state/AppProvider';

export default function ProgrammEinstellung() {
  const { t } = useT();
  const { settings, update } = useApp();
  return (
    <Screen title={t('einstellungen.programmWechseln')}>
      <ProgramPicker
        initialProgramId={settings.programId}
        initialStart={settings.programStart}
        submitLabel={t('common.speichern')}
        onSubmit={async (programId, start) => {
          await update('programId', programId);
          await update('programStart', start);
          syncNow().catch(() => undefined);
          router.back();
        }}
      />
    </Screen>
  );
}
