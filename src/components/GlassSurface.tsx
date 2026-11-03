import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export const hasLiquidGlass = isLiquidGlassAvailable();

interface GlassSurfaceProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
  tintColor?: string;
}

export function GlassSurface({ style, interactive, tintColor, children }: GlassSurfaceProps) {
  if (hasLiquidGlass) {
    return (
      <GlassView
        style={style}
        glassEffectStyle="regular"
        colorScheme="dark"
        isInteractive={interactive}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <BlurView intensity={80} tint="systemChromeMaterialDark" style={[styles.fallback, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  fallback: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});
