import type { SFSymbol } from 'expo-symbols';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md' | 'sm';
  icon?: SFSymbol;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const PALETTE: Record<ButtonVariant, { background: string; foreground: string; border?: string }> = {
  primary: { background: colors.accent, foreground: colors.onAccent },
  secondary: { background: colors.surfaceRaised, foreground: colors.text, border: colors.border },
  ghost: { background: 'transparent', foreground: colors.accent },
  danger: { background: colors.dangerSoft, foreground: colors.danger },
};

const HEIGHT = { lg: 56, md: 46, sm: 36 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  style,
  testID,
}: ButtonProps) {
  const { radius } = useAdaptiveLayout();
  const palette = PALETTE[variant];
  const height = HEIGHT[size];

  return (
    <PressableScale
      testID={testID}
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      feedback="light"
      onPress={onPress}
      style={[
        styles.base,
        {
          height,
          borderRadius: size === 'sm' ? height / 2 : radius.control + 2,
          backgroundColor: palette.background,
          borderColor: palette.border ?? 'transparent',
          paddingHorizontal: size === 'sm' ? 14 : 20,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 17} color={palette.foreground} /> : null}
          <AppText variant={size === 'sm' ? 'callout' : 'bodyStrong'} color={palette.foreground} numberOfLines={1}>
            {label}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
