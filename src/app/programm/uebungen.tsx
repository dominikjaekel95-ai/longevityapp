import React from 'react';
import { Linking, View } from 'react-native';

import { Button } from '@/components/Button';
import { Row, Section } from '@/components/Row';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { firstSource } from '@/content/quellen';
import { getExercises } from '@/content/uebungen';
import { useT } from '@/hooks/useT';
import { statusKey } from '@/i18n';
import { spacing } from '@/theme/tokens';

export default function UebungenScreen() {
  const { t, locale } = useT();
  const ex = getExercises(locale);
  if (!ex) {
    return (
      <Screen title={t('uebungen.titel')}>
        <Txt color="ink2">{t('programm.status.platzhalter')}</Txt>
      </Screen>
    );
  }
  const src = firstSource(ex.ablaufQuellen);
  return (
    <Screen title={t('uebungen.titel')}>
      {ex.status !== 'freigegeben' ? (
        <Txt variant="small" color="amberDark">
          {t('programm.stand', { status: t(statusKey(ex.status)) })}
        </Txt>
      ) : null}
      <View style={{ gap: spacing.xs }}>
        <Txt variant="h2">{t('uebungen.ablauf')}</Txt>
        <Txt color="ink2">{ex.ablauf}</Txt>
        {src ? <Button label={t('programm.quelle')} variant="text" onPress={() => Linking.openURL(src.url).catch(() => undefined)} /> : null}
      </View>
      {ex.uebungen.map((u) => (
        <Section key={u.id} title={`${u.nr}. ${u.name}`}>
          <Row label={t('uebungen.zuhause')} sub={u.zuhause} />
          <Row label={t('uebungen.studio')} sub={u.studio} />
          <Row label={t('uebungen.trainiert')} sub={u.trainiert} last />
        </Section>
      ))}
      <View style={{ gap: spacing.xs }}>
        <Txt variant="kicker" color="ink3">
          {t('uebungen.sicherheit')}
        </Txt>
        {ex.sicherheit.map((s, i) => (
          <Txt key={i} color="ink2">
            {`– ${s}`}
          </Txt>
        ))}
      </View>
    </Screen>
  );
}
