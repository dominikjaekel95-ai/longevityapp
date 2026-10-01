import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, touchTarget } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

export type ChoiceOption<T extends string | number> = { value: T; label: string; sub?: string; disabled?: boolean };

type Props<T extends string | number> = { options: ChoiceOption<T>[]; value: T | null; onChange: (v: T) => void };

/** Einfachauswahl als Liste mit Trennlinien und rundem Indikator. Ersetzt Karten-Raster zur Auswahl. */
export function Choice<T extends string | number>({ options, value, onChange }: Props<T>) {
  const colors = useColors();
  return (
    <View>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: o.disabled }}
            disabled={o.disabled}
            onPress={() => onChange(o.value)}
            style={[
              styles.row,
              { borderBottomColor: colors.line, borderBottomWidth: i === options.length - 1 ? 0 : StyleSheet.hairlineWidth },
              o.disabled ? styles.disabled : null,
            ]}>
            <View style={[styles.dot, { borderColor: colors.ink }]}>
              {selected ? <View style={[styles.dotInner, { backgroundColor: colors.ink }]} /> : null}
            </View>
            <View style={styles.text}>
              <Txt>{o.label}</Txt>
              {o.sub ? (
                <Txt variant="small" color="ink3">
                  {o.sub}
                </Txt>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.m, minHeight: touchTarget, paddingVertical: spacing.s + 2 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  dotInner: { width: 10, height: 10, borderRadius: 5 },
  text: { flex: 1, gap: 2 },
  disabled: { opacity: 0.5 },
});
