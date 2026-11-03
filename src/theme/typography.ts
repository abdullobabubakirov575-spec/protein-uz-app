import type { TextStyle } from 'react-native';

export const fonts = {
  display: 'Oswald_700Bold',
  displaySemi: 'Oswald_600SemiBold',
  displayMedium: 'Oswald_500Medium',
} as const;

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'headline'
  | 'price'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'caption'
  | 'overline';

export const textVariants: Record<TextVariant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: 0.3, textTransform: 'uppercase' },
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: 0.3, textTransform: 'uppercase' },
  title: { fontFamily: fonts.displaySemi, fontSize: 21, lineHeight: 26, letterSpacing: 0.4, textTransform: 'uppercase' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  price: { fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 22, letterSpacing: 0.2 },
  body: { fontSize: 15, lineHeight: 21, letterSpacing: -0.1 },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600', letterSpacing: -0.1 },
  callout: { fontSize: 13, lineHeight: 18, letterSpacing: -0.05 },
  caption: { fontSize: 12, lineHeight: 16 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
};
