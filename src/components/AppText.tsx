import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { textVariants, type TextVariant } from '@/theme/typography';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function AppText({ variant = 'body', color = colors.text, align, style, ...rest }: AppTextProps) {
  const { fontScale } = useAdaptiveLayout();
  const base = textVariants[variant];
  const scaled: TextStyle = {
    fontSize: base.fontSize ? Math.round(base.fontSize * fontScale * 10) / 10 : undefined,
    lineHeight: base.lineHeight ? Math.round(base.lineHeight * fontScale) : undefined,
  };
  return (
    <Text
      maxFontSizeMultiplier={1.35}
      style={StyleSheet.flatten([base, scaled, { color, textAlign: align }, style])}
      {...rest}
    />
  );
}
