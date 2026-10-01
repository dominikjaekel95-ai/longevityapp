import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { type Colors, type as typeScale } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Variant = keyof typeof typeScale;
type ColorKey = 'ink' | 'ink2' | 'ink3' | 'accent' | 'danger' | 'amber' | 'amberDark' | 'buttonFg';

export type TxtProps = TextProps & {
  variant?: Variant;
  color?: ColorKey;
  /** Tabellenziffern für Zahlen in Listen und Tabellen. */
  tabular?: boolean;
  align?: TextStyle['textAlign'];
};

export function Txt({ variant = 'body', color = 'ink', tabular, align, style, ...rest }: TxtProps) {
  const colors = useColors();
  return (
    <Text
      {...rest}
      style={[
        typeScale[variant],
        { color: colors[color as keyof Colors] },
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
