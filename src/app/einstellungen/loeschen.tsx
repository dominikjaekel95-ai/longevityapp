import { router } from 'expo-router';
import React, { useState } from 'react';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { deleteEverything } from '@/lib/account';
import { useApp } from '@/state/AppProvider';

export default function LoeschenScreen() {
  const { t, tc } = useT();
  const { refresh } = useApp();
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expected = t('einstellungen.loeschen.wort');

  return (
    <Screen title={t('einstellungen.loeschen.titel')}>
      <Txt color="ink2">{tc('deleteExplain')}</Txt>
      <Field label={t('einstellungen.loeschen.bestaetigen')} value={word} onChangeText={setWord} autoCapitalize="characters" error={error} />
      <Button
        label={t('einstellungen.loeschen.jetzt')}
        variant="danger"
        disabled={word.trim() !== expected}
        loading={busy}
        onPress={async () => {
          setBusy(true);
          const result = await deleteEverything();
          setBusy(false);
          if (!result.ok) {
            setError(t('common.fehler'));
            return;
          }
          await refresh();
          router.replace('/onboarding');
        }}
      />
    </Screen>
  );
}
