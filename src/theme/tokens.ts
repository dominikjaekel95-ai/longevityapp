/**
 * Design-Tokens. Quelle: Palette und Typografie der Website nachderspritze.de, Variante d1 (src/styles/global.css
 * im Website-Repo). Regeln dazu in docs/DESIGN.md: eine Schrift, eine Akzentfarbe, keine Verläufe, keine Schatten,
 * Radius 0 für Flächen, Pille für Buttons.
 */
export type Scheme = 'light' | 'dark';

export const palette = {
  light: {
    paper: '#f5f4f1',
    paper2: '#ebe9e4',
    ink: '#221a25',
    ink2: '#4c4350',
    ink3: '#6f6672',
    line: '#dcd7d9',
    accent: '#5c2d5e',
    accentDark: '#46204a',
    accentLight: '#ece0ec',
    amber: '#d9824f',
    amberDark: '#9a4f22',
    amberLight: '#f9e5d8',
    clay: '#4d5f73',
    clayLight: '#e2e7ec',
    buttonBg: '#1a1a1a',
    buttonFg: '#f6f5f2',
    danger: '#a3372b',
  },
  dark: {
    paper: '#1b171c',
    paper2: '#26212a',
    ink: '#f1ecf0',
    ink2: '#d2cad2',
    ink3: '#a89fa9',
    line: '#3a333d',
    accent: '#cfa9d1',
    accentDark: '#e4cbe5',
    accentLight: '#3a2a3c',
    amber: '#e39a6d',
    amberDark: '#f0bc9b',
    amberLight: '#3d2a1f',
    clay: '#a3b4c8',
    clayLight: '#28313c',
    buttonBg: '#f1ecf0',
    buttonFg: '#1b171c',
    danger: '#e38a7e',
  },
} as const;

export type Colors = (typeof palette)[Scheme];

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Mindestgröße für Berührungsziele (Material: 48 dp). */
export const touchTarget = 48;

export const radius = {
  none: 0,
  pill: 999,
} as const;

export const fonts = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  light: 'HankenGrotesk_300Light',
} as const;

/** Größenstufen. Überschriften nur so groß wie nötig; Zahlen (stat) leicht und mit Tabellenziffern. */
export const type = {
  title: { fontSize: 26, lineHeight: 30, fontFamily: fonts.regular, letterSpacing: -0.5 },
  h2: { fontSize: 20, lineHeight: 26, fontFamily: fonts.medium, letterSpacing: -0.2 },
  body: { fontSize: 17, lineHeight: 25, fontFamily: fonts.regular },
  bodyMedium: { fontSize: 17, lineHeight: 25, fontFamily: fonts.medium },
  small: { fontSize: 14, lineHeight: 20, fontFamily: fonts.regular },
  kicker: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium, letterSpacing: 2, textTransform: 'uppercase' as const },
  stat: { fontSize: 40, lineHeight: 44, fontFamily: fonts.light, letterSpacing: -1.2 },
  statSmall: { fontSize: 24, lineHeight: 28, fontFamily: fonts.light, letterSpacing: -0.6 },
} as const;
