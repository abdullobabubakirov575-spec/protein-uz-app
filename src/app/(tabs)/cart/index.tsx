import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { CartLineRow } from '@/features/cart/CartLineRow';
import { useCart } from '@/features/cart/CartProvider';
import { CartSummary } from '@/features/cart/CartSummary';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

const MAX_LIST_WIDTH = 720;

export default function CartScreen() {
  const { t } = useLocale();
  const layout = useAdaptiveLayout();
  const { lines, count, total, refresh } = useCart();

  return (
    <ScrollView
      testID="cart-scroll"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingHorizontal: layout.gutter }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.accent} />}
    >
      <View style={styles.column}>
        {lines.length === 0 ? (
          <EmptyState
            icon="bag"
            title={t.cart.emptyTitle}
            subtitle={t.cart.emptySubtitle}
            actionLabel={t.cart.browse}
            onAction={() => router.navigate('/catalog')}
          />
        ) : (
          <>
            <AppText variant="callout" color={colors.textSecondary}>
              {t.cart.items(count)}
            </AppText>
            {lines.map((line, index) => (
              <CartLineRow key={line.productId} line={line} index={index} />
            ))}
            <Animated.View layout={LinearTransition.springify().damping(18)} entering={FadeInUp.duration(360)} style={styles.footer}>
              <CartSummary count={count} total={total} />
              <Button
                testID="checkout-button"
                label={t.cart.checkout}
                icon="arrow.right"
                onPress={() => router.push('/checkout')}
              />
            </Animated.View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 40, alignItems: 'center' },
  column: { width: '100%', maxWidth: MAX_LIST_WIDTH, gap: 12 },
  footer: { gap: 16, marginTop: 8 },
});
