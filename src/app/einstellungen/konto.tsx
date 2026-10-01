import { router } from 'expo-router';
import React from 'react';

import { Button } from '@/components/Button';
import { EmailCodeLogin } from '@/components/EmailCodeLogin';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useT } from '@/hooks/useT';
import { signOut } from '@/lib/sync/supabase';
import { useApp } from '@/state/AppProvider';

export default function KontoScreen() {
  const { t } = useT();
  const { session } = useApp();
  if (session) {
    return (
      <Screen title={t('einstellungen.konto')}>
        <Txt color="ink2">{t('einstellungen.konto.angemeldet', { email: session.user.email ?? '' })}</Txt>
        <Txt variant="small" color="ink3">
          {t('einstellungen.konto.abmeldenHinweis')}
        </Txt>
        <Button
          label={t('einstellungen.konto.abmelden')}
          variant="secondary"
          onPress={async () => {
            await signOut();
            router.back();
          }}
        />
      </Screen>
    );
  }
  return (
    <Screen title={t('einstellungen.konto.anlegen')}>
      <EmailCodeLogin onDone={() => router.back()} />
    </Screen>
  );
}
