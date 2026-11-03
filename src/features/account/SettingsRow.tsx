import type { SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { colors } from '@/theme/colors';

interface SettingsRowProps {
  icon: SFSymbol;
  title: string;
  value?: string;
  onPress: () => void;
  divider?: boolean;
  testID?: string;
}

export function SettingsRow({ icon, title, value, onPress, divider, testID }: SettingsRowProps) {
  return (
    <PressableScale testID={testID} onPress={onPress} scaleTo={0.98} feedback="selection">
      <View style={[styles.row, divider && styles.divider]}>
        <View style={styles.iconWrap}>
          <Icon name={icon} size={16} color={colors.accent} />
        </View>
        <AppText variant="body" style={styles.title}>
          {title}
        </AppText>
        {value ? (
          <AppText variant="callout" color={colors.textSecondary} numberOfLines={1}>
            {value}
          </AppText>
        ) : null}
        <Icon name="chevron.right" size={12} color={colors.textTertiary} weight="bold" />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  title: { flex: 1, fontWeight: '500' },
});
