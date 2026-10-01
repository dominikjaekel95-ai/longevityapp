import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type TabIconName = 'verlauf' | 'checkin' | 'programm' | 'einstellungen';

/** Vier Strich-Icons für die Tab-Leiste, immer mit Textbeschriftung kombiniert. */
export function TabIcon({ name, color, size = 24 }: { name: TabIconName; color: string; size?: number }) {
  const common = { stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'verlauf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 20h18M3 20V4" {...common} />
          <Path d="M5 15l5-6 4 3 6-7" {...common} />
        </Svg>
      );
    case 'checkin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M8 12.5l2.8 2.8L16.5 9.5" {...common} />
        </Svg>
      );
    case 'programm':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={3} y={4} width={4} height={4} {...common} />
          <Rect x={3} y={10} width={4} height={4} {...common} />
          <Rect x={3} y={16} width={4} height={4} {...common} />
          <Line x1={10} y1={6} x2={21} y2={6} {...common} />
          <Line x1={10} y1={12} x2={21} y2={12} {...common} />
          <Line x1={10} y1={18} x2={21} y2={18} {...common} />
        </Svg>
      );
    case 'einstellungen':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1={3} y1={7} x2={21} y2={7} {...common} />
          <Line x1={3} y1={17} x2={21} y2={17} {...common} />
          <Circle cx={9} cy={7} r={2.5} {...common} />
          <Circle cx={15} cy={17} r={2.5} {...common} />
        </Svg>
      );
  }
}
