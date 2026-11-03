import type { SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

export function Perks() {
  const { t } = useLocale();
  const { gutter, gap, radius, deviceClass } = useAdaptiveLayout();
  const items: { icon: SFSymbol; title: string; text: string }[] = [
    { icon: 'checkmark.seal.fill', title: t.home.perkOriginalTitle, text: t.home.perkOriginalText },
    { icon: 'box.truck.fill', title: t.home.perkDeliveryTitle, text: t.home.perkDeliveryText },
    { icon: 'phone.fill', title: t.home.perkSupportTitle, text: t.home.perkSupportText },
  ];
  const horizontal = deviceClass === 'tablet';

  return (
    <View style={[styles.list, { paddingHorizontal: gutter, gap }, horizontal && styles.row]}>
      {items.map((item, index) => (
        <Animated.View
          key={item.icon}
          entering={FadeInUp.delay(80 * index).duration(420)}
          style={[styles.card, { borderRadius: radius.card }, horizontal && styles.flex]}
        >
          <View style={styles.iconWrap}>
            <Icon name={item.icon} size={20} color={colors.accent} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{item.title}</AppText>
            <AppText variant="callout" color={colors.textSecondary}>
              {item.text}
            </AppText>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {},
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderCurve: 'continuous',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
});
