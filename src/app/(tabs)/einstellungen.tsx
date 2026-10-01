import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, Switch, View } from 'react-native';

import { Button } from '@/components/Button';
import { Choice } from '@/components/Choice';
import { Notice } from '@/components/Notice';
import { Row, Section } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { CONSENT_HEALTH, getConsent } from '@/content/consent';
import { getProgram } from '@/content/programs';
import { useT } from '@/hooks/useT';
import { formatDate, weekdayKey } from '@/i18n';
import { track } from '@/lib/analytics';
import { countUnsynced } from '@/lib/db/checkins';
import { getActiveConsent } from '@/lib/db/consents';
import { env, hasBackend } from '@/lib/env';
import { exportAll } from '@/lib/export';
import { cancelReminder, scheduleWeeklyReminder } from '@/lib/notifications';
import { syncNow } from '@/lib/sync/sync';
import { useApp } from '@/state/AppProvider';
import { spacing } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

export default function EinstellungenTab() {
  const { t, tc, locale, pick } = useT();
  const colors = useColors();
  const { settings, session, update, changeLocale, refresh } = useApp();
  const [pending, setPending] = useState(0);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showWeekdays, setShowWeekdays] = useState(false);
  const consent = getConsent(locale);
  const program = getProgram(settings.programId);

  useEffect(() => {
    countUnsynced().then(setPending);
    getActiveConsent(CONSENT_HEALTH).then((c) => setConsentDate(c?.granted_at ?? null));
  }, [settings.lastSyncAt]);

  const open = (url: string, ziel: string) => {
    track({ name: 'link', props: { ziel } });
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <Screen title={t('einstellungen.titel')}>
      <Section title={t('einstellungen.konto')}>
        <Row
          label={session ? t('einstellungen.konto.angemeldet', { email: session.user.email ?? '' }) : t('einstellungen.konto.nicht')}
          value=""
        />
        {hasBackend ? (
          <Row
            label={session ? t('einstellungen.konto.abmelden') : t('einstellungen.konto.anlegen')}
            onPress={() => router.push('/einstellungen/konto')}
            last
          />
        ) : null}
      </Section>

      {session ? (
        <Section title={t('einstellungen.sync')}>
          <Row
            label={settings.lastSyncAt ? t('einstellungen.sync.letzte', { zeit: formatDate(settings.lastSyncAt, locale) }) : t('einstellungen.sync.nie')}
            value={pending > 0 ? t('einstellungen.sync.ausstehend', { n: pending }) : ''}
          />
          <Row label={t('einstellungen.sync.jetzt')} last right={syncing ? <Txt color="ink3">…</Txt> : undefined}
            onPress={async () => {
              setSyncing(true);
              await syncNow();
              await refresh();
              setPending(await countUnsynced());
              setSyncing(false);
            }}
          />
        </Section>
      ) : null}

      <Section title={t('einstellungen.erinnerung')}>
        <Row
          label={t('einstellungen.erinnerung')}
          sub={settings.reminderEnabled ? t(weekdayKey(settings.reminderWeekday)) : t('common.aus')}
          right={
            <Switch
              value={settings.reminderEnabled}
              trackColor={{ true: colors.accent }}
              onValueChange={async (on) => {
                if (on) {
                  const ok = await scheduleWeeklyReminder(settings.reminderWeekday);
                  await update('reminderEnabled', ok ? '1' : '0');
                  setShowWeekdays(ok);
                } else {
                  await cancelReminder();
                  await update('reminderEnabled', '0');
                  setShowWeekdays(false);
                }
              }}
            />
          }
        />
        {settings.reminderEnabled ? (
          <Row label={t('onboarding.erinnerung.wochentag')} onPress={() => setShowWeekdays((s) => !s)} last={!showWeekdays} />
        ) : null}
        {settings.reminderEnabled && showWeekdays ? (
          <Choice
            options={WEEKDAYS.map((d) => ({ value: d, label: t(weekdayKey(d)) }))}
            value={settings.reminderWeekday}
            onChange={async (d) => {
              await scheduleWeeklyReminder(d);
              await update('reminderWeekday', String(d));
              setShowWeekdays(false);
            }}
          />
        ) : null}
      </Section>

      <Section title={t('einstellungen.foto')}>
        <Row label={t('einstellungen.kopfAbschneiden')} sub={tc('headMaskExplain')} value={t('common.an')} last />
      </Section>

      <Section title={t('einstellungen.programm')}>
        <Row
          label={t('einstellungen.programmWechseln')}
          sub={program ? `${pick(program.title)}${settings.programStart ? ` · ${t('einstellungen.startdatum')} ${formatDate(settings.programStart, locale)}` : ''}` : null}
          onPress={() => router.push('/einstellungen/programm')}
          last
        />
      </Section>

      <Section title={t('einstellungen.sprache')}>
        <Choice
          options={[
            { value: 'de', label: t('einstellungen.sprache.de') },
            { value: 'en', label: t('einstellungen.sprache.en') },
          ]}
          value={locale}
          onChange={(l) => changeLocale(l)}
        />
      </Section>

      <Section title={t('einstellungen.daten')}>
        <View style={{ gap: spacing.s, paddingVertical: spacing.s }}>
          <Txt variant="small" color="ink3">
            {tc('exportExplain')}
          </Txt>
          <Button
            label={exporting ? t('einstellungen.exportLaeuft') : t('einstellungen.export')}
            variant="secondary"
            loading={exporting}
            onPress={async () => {
              setExporting(true);
              try {
                await exportAll();
                track({ name: 'export', props: {} });
              } finally {
                setExporting(false);
              }
            }}
          />
          <Txt variant="small" color="ink3">
            {tc('deleteExplain')}
          </Txt>
          <Button label={t('einstellungen.loeschen')} variant="danger" onPress={() => router.push('/einstellungen/loeschen')} />
        </View>
      </Section>

      <Section title={t('einstellungen.rechtliches')}>
        <Row label={t('einstellungen.einwilligungen')} onPress={() => router.push('/einstellungen/datenschutz')} />
        <Row label={t('einstellungen.datenschutz')} onPress={() => open(env.urlDatenschutz, 'datenschutz')} />
        <Row label={t('einstellungen.impressum')} onPress={() => open(env.urlImpressum, 'impressum')} />
        <Row
          label={consentDate ? t('einstellungen.einwilligung', { datum: formatDate(consentDate, locale), version: consent.version }) : ''}
          value=""
          last
        />
      </Section>

      <Section title={t('einstellungen.hinweis')}>
        <Row label={t('einstellungen.aerztlicherRat')} onPress={() => router.push('/einstellungen/aerztlicher-rat')} last />
      </Section>
      <Notice kicker={t('einstellungen.hinweis')}>{tc('doctorHint')}</Notice>
      <Txt variant="small" color="ink3">
        {t('einstellungen.version', { v: env.appVersion })}
      </Txt>
    </Screen>
  );
}
