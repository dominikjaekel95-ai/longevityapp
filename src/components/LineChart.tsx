import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { axisRange, type Point } from '@/lib/trends';
import { fonts, spacing } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

export type Band = { x: number; low: number; high: number };

type Props = {
  title: string;
  points: Point[];
  band?: Band[];
  unit: string;
  decimals?: number;
  formatNumber: (v: number, digits: number) => string;
  xLabel: string;
  /** Zeile unter dem Diagramm, z. B. der Wochentrend. */
  caption?: string | null;
  height?: number;
};

const PAD = { left: 44, right: 20, top: 16, bottom: 28 };

/**
 * Verlaufslinie: Punkte sichtbar, Achsen beschriftet, Wert am letzten Punkt, Spanne als senkrechter Balken.
 * Keine Verlaufsfläche, keine Glättung, keine Legende. Unter drei Punkten zeigt der Aufrufer Zahl und Veränderung als Text.
 */
export function LineChart({ title, points, band, unit, decimals = 1, formatNumber, xLabel, caption, height = 200 }: Props) {
  const colors = useColors();
  const [width, setWidth] = useState(0);

  const ys = [...points.map((p) => p.y), ...(band ?? []).flatMap((b) => [b.low, b.high])];
  const xs = [...points.map((p) => p.x), ...(band ?? []).map((b) => b.x)];
  const yr = axisRange(ys, 0.15, decimals === 0 ? 4 : 1);
  const xMin = Math.min(...xs, 0);
  const xMax = Math.max(...xs, xMin + 1);
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const sx = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => PAD.top + (1 - (y - yr.min) / (yr.max - yr.min)) * plotH;

  const yTicks = [yr.min, (yr.min + yr.max) / 2, yr.max];
  const xStep = xMax - xMin > 14 ? 2 : 1;
  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= xMax; x += xStep) xTicks.push(x);

  const last = points[points.length - 1];
  const labelLeft = last ? sx(last.x) > PAD.left + plotW * 0.7 : false;

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Txt variant="h2">{title}</Txt>
      {width > 0 ? (
        <Svg width={width} height={height} accessibilityLabel={title}>
          <G>
            {yTicks.map((t, i) => (
              <G key={`y${i}`}>
                <Line x1={PAD.left} x2={width - PAD.right} y1={sy(t)} y2={sy(t)} stroke={colors.line} strokeWidth={1} />
                <SvgText x={PAD.left - 6} y={sy(t) + 4} fontSize={12} fontFamily={fonts.regular} fill={colors.ink3} textAnchor="end">
                  {formatNumber(t, decimals)}
                </SvgText>
              </G>
            ))}
            {xTicks.map((x) => (
              <SvgText key={`x${x}`} x={sx(x)} y={height - 8} fontSize={12} fontFamily={fonts.regular} fill={colors.ink3} textAnchor="middle">
                {String(x)}
              </SvgText>
            ))}
            <Line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + plotH} stroke={colors.ink3} strokeWidth={1} />
            <Line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={colors.ink3} strokeWidth={1} />
          </G>
          {(band ?? []).map((b, i) => (
            <G key={`b${i}`}>
              <Line x1={sx(b.x)} x2={sx(b.x)} y1={sy(b.high)} y2={sy(b.low)} stroke={colors.amber} strokeWidth={2} />
              <Line x1={sx(b.x) - 4} x2={sx(b.x) + 4} y1={sy(b.high)} y2={sy(b.high)} stroke={colors.amber} strokeWidth={2} />
              <Line x1={sx(b.x) - 4} x2={sx(b.x) + 4} y1={sy(b.low)} y2={sy(b.low)} stroke={colors.amber} strokeWidth={2} />
            </G>
          ))}
          {points.length > 1 ? (
            <Polyline
              points={points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
              fill="none"
              stroke={colors.accent}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ) : null}
          {points.map((p, i) => (
            <Circle key={`p${i}`} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={colors.paper} stroke={colors.accent} strokeWidth={2} />
          ))}
          {last ? (
            <SvgText
              x={labelLeft ? sx(last.x) - 8 : sx(last.x) + 8}
              y={sy(last.y) - 8}
              fontSize={13}
              fontFamily={fonts.medium}
              fill={colors.ink}
              textAnchor={labelLeft ? 'end' : 'start'}>
              {`${formatNumber(last.y, decimals)} ${unit}`}
            </SvgText>
          ) : null}
        </Svg>
      ) : null}
      <View style={styles.footer}>
        <Txt variant="small" color="ink3" align="right">
          {xLabel}
        </Txt>
        {caption ? (
          <Txt variant="small" color="ink2">
            {caption}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.s },
  // Achsenbeschriftung rechts unter der Achse, Trendzeile darunter in voller Breite: nebeneinander wurde die Trendzeile am Rand abgeschnitten.
  footer: { gap: spacing.xs },
});
