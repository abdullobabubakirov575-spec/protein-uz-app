import type { SFSymbol } from 'expo-symbols';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface HeaderIconButtonProps {
  icon: SFSymbol;
  label: string;
  onPress: () => void;
  testID?: string;
}

export function HeaderIconButton({ icon, label, onPress, testID }: HeaderIconButtonProps) {
  return (
    <PressableScale
      testID={testID}
      accessibilityLabel={label}
      onPress={onPress}
      feedback="selection"
      hitSlop={10}
      style={styles.button}
    >
      <Icon name={icon} size={18} color={colors.accent} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
});
