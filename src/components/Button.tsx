import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, touchTarget } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

/** Pille wie auf der Website. Primär dunkel, sekundär mit Rahmen, Text ohne Rahmen. Mindesthöhe 48 dp. */
export function Button({ label, onPress, variant = 'primary', disabled, loading, accessibilityHint }: Props) {
  const colors = useColors();
  const isDisabled = disabled || loading;
  const bg =
    variant === 'primary' ? colors.buttonBg : variant === 'danger' ? colors.danger : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger' ? colors.buttonFg : variant === 'secondary' ? colors.ink : colors.accent;
  const border = variant === 'secondary' ? colors.ink3 : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor: border, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'text' ? styles.text : null,
      ]}>
      <View style={styles.inner}>
        {loading ? <ActivityIndicator color={fg} /> : null}
        <Txt variant="bodyMedium" style={{ color: fg }}>
          {label}
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  text: { paddingHorizontal: 0, alignItems: 'flex-start' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
});
