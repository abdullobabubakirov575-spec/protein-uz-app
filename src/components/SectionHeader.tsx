import { StyleSheet, View } from 'react-native';

import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { gutter } = useAdaptiveLayout();
  return (
    <View style={[styles.row, { paddingHorizontal: gutter }]}>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} feedback="selection" style={styles.action} hitSlop={10}>
          <AppText variant="callout" color={colors.accent} style={styles.actionText}>
            {actionLabel}
          </AppText>
          <Icon name="chevron.right" size={11} color={colors.accent} weight="bold" />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontWeight: '600' },
});
