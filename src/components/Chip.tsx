import { StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

export function Chip({ label, selected, onPress, testID }: ChipProps) {
  return (
    <PressableScale
      testID={testID}
      accessibilityState={{ selected }}
      onPress={onPress}
      feedback="selection"
      style={[styles.chip, selected && styles.selected]}
    >
      <AppText variant="callout" color={selected ? colors.onAccent : colors.text} style={styles.label}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { fontWeight: '600' },
});
