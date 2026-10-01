import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, spacing, touchTarget } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

type Props = TextInputProps & {
  label: string;
  unit?: string;
  help?: string;
  error?: string | null;
  optional?: string;
};

/** Textfeld mit sichtbarem Label, Einheit als Suffix, Hilfetext und Fehlertext am Feld. Linie statt Kasten. */
export function Field({ label, unit, help, error, optional, style, ...input }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Txt variant="small" color="ink2">
          {label}
        </Txt>
        {optional ? (
          <Txt variant="small" color="ink3">
            {optional}
          </Txt>
        ) : null}
      </View>
      <View style={[styles.inputRow, { borderBottomColor: error ? colors.danger : colors.ink3 }]}>
        <TextInput
          {...input}
          accessibilityLabel={label}
          placeholderTextColor={colors.ink3}
          style={[styles.input, { color: colors.ink, fontFamily: fonts.regular }, style]}
        />
        {unit ? (
          <Txt variant="body" color="ink3">
            {unit}
          </Txt>
        ) : null}
      </View>
      {error ? (
        <Txt variant="small" color="danger">
          {error}
        </Txt>
      ) : help ? (
        <Txt variant="small" color="ink3">
          {help}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: spacing.s },
  input: { flex: 1, minHeight: touchTarget, fontSize: 20, paddingVertical: spacing.s, fontVariant: ['tabular-nums'] },
});
