import React from 'react';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { SHOULDER_LINE_RATIO } from '@/lib/photo';
import { fonts } from '@/theme/tokens';

type Props = { width: number; height: number; label: string };

/**
 * Pose-Anleitung über der Kamera: Umriss im Verhältnis 3:4, Schulterlinie bei 20 Prozent der Höhe.
 * Alles oberhalb der Linie wird vor dem Speichern abgeschnitten; der Kopf ist deshalb nur angedeutet.
 */
export function Silhouette({ width, height, label }: Props) {
  const stroke = 'rgba(255,255,255,0.85)';
  const faint = 'rgba(255,255,255,0.35)';
  const shoulderY = 400 * SHOULDER_LINE_RATIO;
  return (
    <Svg width={width} height={height} viewBox="0 0 300 400" preserveAspectRatio="none">
      <Circle cx={150} cy={44} r={28} stroke={faint} strokeWidth={2} fill="none" strokeDasharray="4 4" />
      <Path
        d="M 110 86 C 90 89, 72 101, 66 126 L 48 231 L 68 235 L 84 151 L 88 216 L 94 231 L 98 300 L 102 386 L 136 386 L 142 300 L 150 246 L 158 300 L 164 386 L 198 386 L 202 300 L 206 231 L 212 216 L 216 151 L 232 235 L 252 231 L 234 126 C 228 101, 210 89, 190 86 Z"
        stroke={stroke}
        strokeWidth={2.5}
        fill="none"
        strokeLinejoin="round"
      />
      <Line x1={0} x2={300} y1={shoulderY} y2={shoulderY} stroke={stroke} strokeWidth={2} strokeDasharray="8 6" />
      <SvgText x={8} y={shoulderY - 8} fontSize={13} fontFamily={fonts.medium} fill={stroke}>
        {label}
      </SvgText>
    </Svg>
  );
}
