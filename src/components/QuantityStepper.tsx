import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'md' | 'sm';
  testID?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max, size = 'md', testID }: QuantityStepperProps) {
  const height = size === 'md' ? 48 : 34;
  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;

  const step = (delta: number) => {
    haptic.selection();
    onChange(value + delta);
  };

  return (
    <View testID={testID} style={[styles.container, { height, borderRadius: height / 2 }]}>
      <PressableScale
        testID={testID ? `${testID}-dec` : undefined}
        accessibilityLabel="−"
        onPress={() => step(-1)}
        disabled={!canDecrease && min > 0}
        style={[styles.button, { width: height, height }]}
        hitSlop={4}
      >
        <Icon name={value <= 1 && min === 0 ? 'trash' : 'minus'} size={size === 'md' ? 16 : 13} />
      </PressableScale>
      <View style={[styles.valueBox, { minWidth: size === 'md' ? 32 : 24 }]}>
        <Animated.View key={value} entering={FadeInDown.duration(160)} exiting={FadeOutUp.duration(120)}>
          <AppText variant={size === 'md' ? 'headline' : 'bodyStrong'} align="center">
            {value}
          </AppText>
        </Animated.View>
      </View>
      <PressableScale
        testID={testID ? `${testID}-inc` : undefined}
        accessibilityLabel="+"
        onPress={() => (canIncrease ? step(1) : haptic.warning())}
        style={[styles.button, { width: height, height }, !canIncrease && styles.dimmed]}
        hitSlop={4}
      >
        <Icon name="plus" size={size === 'md' ? 16 : 13} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  button: { alignItems: 'center', justifyContent: 'center' },
  valueBox: { alignItems: 'center', overflow: 'hidden' },
  dimmed: { opacity: 0.35 },
});
