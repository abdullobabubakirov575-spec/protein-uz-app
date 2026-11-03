import type { SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

interface EmptyStateProps {
  icon: SFSymbol;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction, tone = 'neutral' }: EmptyStateProps) {
  const accent = tone === 'error' ? colors.danger : colors.accent;
  return (
    <Animated.View entering={FadeInUp.duration(380)} style={styles.container}>
      <View style={[styles.halo, { backgroundColor: tone === 'error' ? colors.dangerSoft : colors.accentSoft }]}>
        <Icon name={icon} size={38} color={accent} weight="medium" />
      </View>
      <AppText variant="title" align="center">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="md" variant={tone === 'error' ? 'secondary' : 'primary'} style={styles.action} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, gap: 10 },
  halo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  subtitle: { maxWidth: 320 },
  action: { marginTop: 12, minWidth: 200 },
});
