import React, { useState } from 'react';
import { View } from 'react-native';

import { useT } from '@/hooks/useT';
import { sendEmailCode, verifyEmailCode } from '@/lib/sync/supabase';
import { spacing } from '@/theme/tokens';

import { Button } from './Button';
import { Field } from './Field';
import { Txt } from './Txt';

/** Anmeldung mit sechsstelligem E-Mail-Code. Kein Passwort, kein Magic-Link (docs/DECISIONS.md). */
export function EmailCodeLogin({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <View style={{ gap: spacing.m }}>
      <Txt color="ink2">{t('onboarding.konto.text')}</Txt>
      <Field
        label={t('onboarding.konto.email')}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={stage === 'email'}
        error={stage === 'email' ? error : null}
      />
      {stage === 'email' ? (
        <Button
          label={t('onboarding.konto.codeSenden')}
          loading={busy}
          disabled={!emailOk}
          onPress={async () => {
            setBusy(true);
            const { error: e } = await sendEmailCode(email);
            setBusy(false);
            if (e) setError(t('common.fehler'));
            else setStage('code');
          }}
        />
      ) : (
        <>
          <Txt variant="small" color="ink3">
            {t('onboarding.konto.codeGesendet', { email: email.trim() })}
          </Txt>
          <Field
            label={t('onboarding.konto.code')}
            value={code}
            onChangeText={(v) => {
              setCode(v.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            error={error}
          />
          <Button
            label={t('onboarding.konto.pruefen')}
            loading={busy}
            disabled={code.length !== 6}
            onPress={async () => {
              setBusy(true);
              const { error: e } = await verifyEmailCode(email, code);
              setBusy(false);
              if (e) setError(t('onboarding.konto.ungueltig'));
              else onDone();
            }}
          />
          <Button label={t('common.zurueck')} variant="text" onPress={() => setStage('email')} />
        </>
      )}
    </View>
  );
}
