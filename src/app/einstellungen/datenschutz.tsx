import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { ConsentList } from '@/components/ConsentList';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { CONSENT_HEALTH, getConsent } from '@/content/consent';
import { useT } from '@/hooks/useT';
import { formatDate } from '@/i18n';
import { setConsent } from '@/lib/consents';
import { listConsents, type ConsentRow } from '@/lib/db/consents';
import { spacing } from '@/theme/tokens';

/** Einwilligungen einsehen, freiwillige erteilen oder widerrufen. Die Pflicht-Einwilligung endet nur mit dem Konto. */
export default function DatenschutzScreen() {
  const { t, locale } = useT();
  const consent = getConsent(locale);
  const [rows, setRows] = useState<ConsentRow[]>([]);

  const reload = useCallback(async () => setRows(await listConsents()), []);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const active = (id: string) => rows.find((r) => r.consent_id === id && !r.revoked_at) ?? null;
  const checked = Object.fromEntries(consent.items.map((i) => [i.id, Boolean(active(i.id))]));

  return (
    <Screen title={t('einstellungen.einwilligungen')}>
      <ConsentList
        consent={consent}
        checked={checked}
        showAnalytics
        onChange={async (id, value) => {
          if (id === CONSENT_HEALTH && !value) {
            router.push('/einstellungen/loeschen');
            return;
          }
          await setConsent(id, consent.version, value);
          await reload();
        }}
      />
      <View style={{ gap: spacing.xs }}>
        {consent.items.map((item) => {
          const a = active(item.id);
          return (
            <Txt key={item.id} variant="small" color="ink3">
              {`${item.id}: ${a ? t('datenschutz.erteilt', { datum: formatDate(a.granted_at, locale) }) : t('datenschutz.nichtErteilt')}`}
            </Txt>
          );
        })}
      </View>
      <Txt variant="small" color="ink3">
        {t('datenschutz.fotoWiderruf')}
      </Txt>
      <Txt variant="small" color="ink3">
        {t('datenschutz.widerrufHinweis')}
      </Txt>
      <Button label={t('einstellungen.loeschen')} variant="text" onPress={() => router.push('/einstellungen/loeschen')} />
    </Screen>
  );
}
