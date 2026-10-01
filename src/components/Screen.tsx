import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

type Props = {
  title?: string;
  kicker?: string;
  children: React.ReactNode;
  /** Fester Bereich unter dem Inhalt, z. B. der Weiter-Button. */
  footer?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom')[];
};

/** Grundfläche jedes Bildschirms: linksbündig, 16 dp Rand, Titel in Textgröße plus eine Stufe. */
export function Screen({ title, kicker, children, footer, scroll = true, contentStyle, edges = ['top'] }: Props) {
  const colors = useColors();
  const header = (title || kicker) && (
    <View style={styles.header}>
      {kicker ? (
        <Txt variant="kicker" color="ink3">
          {kicker}
        </Txt>
      ) : null}
      {title ? (
        <Txt variant="title" accessibilityRole="header">
          {title}
        </Txt>
      ) : null}
    </View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled">
            {header}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content, contentStyle]}>
            {header}
            {children}
          </View>
        )}
        {footer ? <View style={[styles.footer, { borderTopColor: colors.line, backgroundColor: colors.paper }]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.m, paddingBottom: spacing.xl, gap: spacing.m, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { gap: spacing.xs, marginBottom: spacing.s },
  footer: { padding: spacing.m, borderTopWidth: StyleSheet.hairlineWidth, gap: spacing.s },
});
