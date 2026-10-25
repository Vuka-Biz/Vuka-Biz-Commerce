import { Platform, type TextStyle } from 'react-native';

/**
 * Design tokens for Vuka Biz, lifted from the Tailwind config of the
 * mockups in /design. Every component reads colours, spacing and type from
 * here so the whole app stays visually consistent.
 */
export const Palette = {
  // Brand (deep forest green)
  brand: '#0d1f18',
  brandMuted: '#75887e',
  brandTint: '#4f6359',
  brandSoft: '#d2e7dc',
  onBrand: '#ffffff',

  // Accent (Vuka green)
  accent: '#006c49',
  accentBright: '#6ffbbe',
  accentSoft: '#4edea3',
  accentContainer: '#6cf8bb',
  onAccent: '#ffffff',
  onAccentContainer: '#002113',

  // Amber (margins, warnings)
  amber: '#ffb95f',
  amberSoft: '#ffddb8',
  amberText: '#b87500',
  onAmber: '#2a1700',

  // Surfaces
  surface: '#f9f9ff',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceHigh: '#dee8ff',
  surfaceHighest: '#d8e3fb',

  // Text & lines
  text: '#111c2d',
  textMuted: '#424845',
  outline: '#737874',
  outlineVariant: '#c2c8c3',

  // Status
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  transparent: 'transparent',
} as const;

export type PaletteColor = keyof typeof Palette;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  gutter: 12,
  md: 16,
  lg: 24,
  xl: 36,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const FontFamily = {
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  body: 'PlusJakartaSans_500Medium',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

/** Type scale from the mockups (font-headline-*, font-label-*, font-body-*). */
export const Typography = {
  display: { fontFamily: FontFamily.display, fontSize: 36, lineHeight: 40, letterSpacing: -1 },
  headlineLg: { fontFamily: FontFamily.display, fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  headlineMd: { fontFamily: FontFamily.displaySemi, fontSize: 22, lineHeight: 30, letterSpacing: -0.2 },
  headlineSm: { fontFamily: FontFamily.displaySemi, fontSize: 18, lineHeight: 26 },
  labelLg: { fontFamily: FontFamily.display, fontSize: 15, lineHeight: 20, letterSpacing: 0.3 },
  labelMd: { fontFamily: FontFamily.display, fontSize: 13, lineHeight: 18, letterSpacing: 0.4 },
  labelSm: { fontFamily: FontFamily.display, fontSize: 11, lineHeight: 16, letterSpacing: 0.55 },
  titleMd: { fontFamily: FontFamily.bodyBold, fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: FontFamily.body, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: FontFamily.body, fontSize: 14, lineHeight: 20 },
  bodyStrong: { fontFamily: FontFamily.bodyBold, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof Typography;

export const Shadow = {
  card: '0px 1px 3px rgba(13, 31, 24, 0.08)',
  raised: '0px 4px 14px rgba(13, 31, 24, 0.14)',
  bar: '0px -2px 12px rgba(13, 31, 24, 0.06)',
} as const;

/** Content never stretches wider than a phone on web/tablets. */
export const MaxContentWidth = 560;

export const isWeb = Platform.OS === 'web';
