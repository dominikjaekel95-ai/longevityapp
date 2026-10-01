import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { spacing, touchTarget } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

type Props = { checked: boolean; onChange: (next: boolean) => void; label: string };

/** Quadratisches Kästchen mit Häkchen, Berührungsziel mindestens 48 dp hoch. */
export function Checkbox({ checked, onChange, label }: Props) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={styles.row}>
      <View style={[styles.box, { borderColor: colors.ink, backgroundColor: checked ? colors.ink : 'transparent' }]}>
        {checked ? (
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M3 8.5 L6.5 12 L13 4.5" stroke={colors.paper} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : null}
      </View>
      <Txt style={styles.label}>{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.m, minHeight: touchTarget, paddingVertical: spacing.s },
  box: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  label: { flex: 1 },
});
