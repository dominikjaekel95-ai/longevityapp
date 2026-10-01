import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, touchTarget } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

type Props = {
  label: string;
  value?: string | null;
  sub?: string | null;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
  accessibilityHint?: string;
};

/** Listenzeile mit Trennlinie. Label links, Wert rechts mit Tabellenziffern. Keine Karte, kein Schatten. */
export function Row({ label, value, sub, onPress, right, last, accessibilityHint }: Props) {
  const colors = useColors();
  const content = (
    <View style={[styles.row, { borderBottomColor: colors.line, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={styles.left}>
        <Txt>{label}</Txt>
        {sub ? (
          <Txt variant="small" color="ink3">
            {sub}
          </Txt>
        ) : null}
      </View>
      {right ?? (
        <Txt tabular color="ink2" align="right" style={styles.value}>
          {value ?? ''}
        </Txt>
      )}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="kicker" color="ink3">
        {title}
      </Txt>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget + 8,
    paddingVertical: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  left: { flex: 1, gap: 2 },
  value: { flexShrink: 1 },
  section: { gap: spacing.s },
});
