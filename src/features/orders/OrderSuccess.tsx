import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import type { PlacedOrder } from './OrdersProvider';

const BADGE = 112;

function Ripple({ delay }: { delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1));
  }, [delay, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 1.1 }],
  }));
  return <Animated.View style={[styles.ripple, style]} />;
}

export function OrderSuccess({ order }: { order: PlacedOrder }) {
  const { t, price } = useLocale();
  const { gutter, radius } = useAdaptiveLayout();

  const goHome = () => {
    router.dismissAll();
    router.navigate('/');
  };

  return (
    <ScrollView
      testID="order-success"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
    >
      <View style={styles.badgeArea}>
        <Ripple delay={0} />
        <Ripple delay={1100} />
        <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.badge}>
          <Animated.View entering={ZoomIn.delay(220).springify()}>
            <Icon name="checkmark" size={52} color={colors.onAccent} weight="heavy" />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(250).duration(420)} style={styles.texts}>
        <AppText variant="display" align="center">
          {t.success.title}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t.success.text}
        </AppText>
        {order.number ? (
          <View style={styles.numberPill}>
            <AppText variant="bodyStrong" color={colors.accent}>
              {t.success.orderNumber(order.number)}
            </AppText>
          </View>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(380).duration(420)} style={[styles.summary, { borderRadius: radius.card }]}>
        <AppText variant="body" color={colors.textSecondary}>
          {t.cart.items(order.count)}
        </AppText>
        <AppText variant="price">{price(order.total)}</AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(480).duration(420)} style={styles.action}>
        <Button testID="success-home" label={t.success.backHome} icon="house.fill" onPress={goHome} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40, gap: 24 },
  badgeArea: { alignItems: 'center', justifyContent: 'center', height: BADGE * 2.2 },
  ripple: {
    position: 'absolute',
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: colors.accent,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  texts: { gap: 10, alignItems: 'center' },
  numberPill: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.surfaceRaised,
    borderCurve: 'continuous',
  },
  action: { marginTop: 8 },
});
