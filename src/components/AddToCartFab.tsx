import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, ZoomIn } from 'react-native-reanimated';

import type { Product } from '@/api/types';
import { useCart } from '@/features/cart/CartProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface AddToCartFabProps {
  product: Product;
  size?: number;
}

export function AddToCartFab({ product, size = 36 }: AddToCartFabProps) {
  const { add, quantityOf } = useCart();
  const { t } = useLocale();
  const qty = quantityOf(product.id);
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const soldOut = product.stock > 0 && qty >= product.stock;

  const handlePress = () => {
    if (add(product, 1)) {
      haptic.success();
      pop.value = withSequence(withSpring(1.25, { stiffness: 600, damping: 12 }), withSpring(1));
    } else {
      haptic.warning();
    }
  };

  return (
    <PressableScale
      testID={`add-${product.id}`}
      accessibilityLabel={t.product.addToCart}
      onPress={handlePress}
      scaleTo={0.88}
      hitSlop={8}
      disabled={soldOut}
    >
      <Animated.View
        style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }, qty > 0 && styles.fabActive, popStyle]}
      >
        <Icon name={qty > 0 ? 'checkmark' : 'plus'} size={size * 0.42} color={colors.onAccent} weight="bold" />
      </Animated.View>
      {qty > 0 ? (
        <Animated.View entering={ZoomIn.springify()} style={styles.badge}>
          <View style={styles.badgeInner}>
            <AppText variant="overline" color={colors.text} style={styles.badgeText}>
              {qty}
            </AppText>
          </View>
        </Animated.View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fab: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabActive: { backgroundColor: '#B6F07A' },
  badge: { position: 'absolute', top: -6, right: -6 },
  badgeInner: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { letterSpacing: 0 },
});
