import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
}

export function Skeleton({ width, height, radius = 12 }: SkeletonProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.block, { width, height, borderRadius: radius }, style]} />;
}

export function ProductGridSkeleton({ rows = 3 }: { rows?: number }) {
  const { gridCardWidth, columns, gap, gutter, radius } = useAdaptiveLayout();
  return (
    <View style={[styles.grid, { paddingHorizontal: gutter, gap }]}>
      {Array.from({ length: rows * columns }, (_, index) => (
        <View key={index} style={{ width: gridCardWidth, gap: 8, marginBottom: 12 }}>
          <Skeleton width={gridCardWidth} height={gridCardWidth} radius={radius.card} />
          <Skeleton width="45%" height={10} radius={5} />
          <Skeleton width="90%" height={14} radius={6} />
          <Skeleton width="55%" height={18} radius={6} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surfaceHighlight },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
