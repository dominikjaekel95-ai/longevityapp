import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

/** Hinweis als Absatz mit Kicker. Kein farbiger Rand, keine Karte, kein Icon. */
export function Notice({ kicker, children }: { kicker: string; children: string }) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { borderTopColor: colors.line, borderBottomColor: colors.line }]}>
      <Txt variant="kicker" color="ink3">
        {kicker}
      </Txt>
      <Txt color="ink2">{children}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, paddingVertical: spacing.m, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
});
