import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { damping: 18, stiffness: 420, mass: 0.6 };

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  feedback?: 'none' | 'selection' | 'light';
}

export function PressableScale({
  style,
  scaleTo = 0.96,
  feedback = 'none',
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(event) => {
        scale.value = withSpring(scaleTo, PRESS_SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (feedback !== 'none') haptic[feedback]();
        onPress?.(event);
      }}
      style={[style, animatedStyle, disabled && { opacity: 0.45 }]}
      {...rest}
    />
  );
}
