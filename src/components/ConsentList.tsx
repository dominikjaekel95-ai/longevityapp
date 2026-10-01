import React, { useState } from 'react';
import { View } from 'react-native';

import { CONSENT_ANALYTICS, consentItemText, type ConsentText } from '@/content/consent';
import { useT } from '@/hooks/useT';
import { statusKey } from '@/i18n';
import { env } from '@/lib/env';
import { spacing } from '@/theme/tokens';

import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Txt } from './Txt';

type Props = {
  consent: ConsentText;
  checked: Record<string, boolean>;
  onChange: (id: string, value: boolean) => void;
  /** Im Onboarding bleibt die Nutzungsstatistik verborgen (content/README.md); in den Einstellungen erscheint sie. */
  showAnalytics?: boolean;
};

/** Bildschirmtext, ein Kästchen pro Einwilligung, Details ausklappbar. Entwurf-Kennzeichnung, solange nicht freigegeben. */
export function ConsentList({ consent, checked, onChange, showAnalytics = false }: Props) {
  const { t } = useT();
  const [details, setDetails] = useState(false);
  const items = consent.items.filter((i) => {
    if (i.id === CONSENT_ANALYTICS) return showAnalytics && Boolean(env.posthogKey);
    return i.active;
  });
  return (
    <View style={{ gap: spacing.m }}>
      {consent.status !== 'freigegeben' ? (
        <Txt variant="kicker" color="amberDark">
          {t('status.entwurf')}
        </Txt>
      ) : null}
      {consent.screen.map((p, i) => (
        <Txt key={i} color="ink2">
          {p}
        </Txt>
      ))}
      <View>
        {items.map((item) => (
          <View key={item.id} style={{ gap: 2 }}>
            <Checkbox checked={Boolean(checked[item.id])} onChange={(v) => onChange(item.id, v)} label={consentItemText(item)} />
            <Txt variant="small" color="ink3" style={{ marginLeft: 40 }}>
              {item.required ? t('einwilligung.pflicht') : t('einwilligung.freiwillig')}
            </Txt>
          </View>
        ))}
      </View>
      {consent.details.length > 0 ? (
        <View style={{ gap: spacing.s }}>
          <Button label={details ? t('einwilligung.detailsZu') : t('einwilligung.details')} variant="text" onPress={() => setDetails((d) => !d)} />
          {details
            ? consent.details.map((p, i) => (
                <Txt key={i} variant="small" color="ink2">
                  {p}
                </Txt>
              ))
            : null}
        </View>
      ) : null}
      <Txt variant="small" color="ink3">
        {t('einwilligung.fassung', { version: consent.version, status: t(statusKey(consent.status)) })}
        {consent.scope ? ` · ${t('einwilligung.geltung', { scope: consent.scope })}` : ''}
      </Txt>
    </View>
  );
}
