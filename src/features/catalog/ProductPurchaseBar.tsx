import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Product } from '@/api/types';
import { Button } from '@/components/Button';
import { GlassSurface } from '@/components/GlassSurface';
import { QuantityStepper } from '@/components/QuantityStepper';
import { useCart } from '@/features/cart/CartProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { haptic } from '@/lib/haptics';
import { useAdaptiveLayout } from '@/theme/adaptive';

const ADDED_FEEDBACK_MS = 1600;

export const PURCHASE_BAR_HEIGHT = 80;

export function ProductPurchaseBar({ product }: { product: Product }) {
  const { t, price } = useLocale();
  const { add, quantityOf } = useCart();
  const { gutter, insets, radius, deviceClass } = useAdaptiveLayout();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = quantityOf(product.id);
  const remaining = product.stock > 0 ? product.stock - inCart : Number.POSITIVE_INFINITY;
  const soldOut = remaining <= 0;

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [justAdded]);

  useEffect(() => {
    if (Number.isFinite(remaining) && qty > remaining) setQty(Math.max(1, remaining));
  }, [remaining, qty]);

  const handleAdd = () => {
    if (add(product, qty)) {
      haptic.success();
      setJustAdded(true);
      setQty(1);
    } else {
      haptic.warning();
    }
  };

  return (
    <View style={[styles.wrapper, { paddingHorizontal: gutter / 2, paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <GlassSurface style={[styles.bar, { borderRadius: radius.card + 8 }]}>
        {soldOut ? (
          <Button
            testID="go-to-cart"
            label={t.product.goToCart}
            icon="bag.fill"
            variant="secondary"
            onPress={() => router.navigate('/cart')}
            style={styles.flex}
          />
        ) : (
          <>
            <QuantityStepper
              testID="product-qty"
              value={qty}
              onChange={setQty}
              max={Number.isFinite(remaining) ? remaining : undefined}
            />
            <Button
              testID="add-to-cart"
              label={justAdded ? t.product.added : deviceClass === 'compact' ? t.product.addToCart : `${t.product.addToCart} · ${price(product.price * qty)}`}
              icon={justAdded ? 'checkmark' : 'bag.badge.plus'}
              onPress={handleAdd}
              style={styles.flex}
            />
          </>
        )}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  flex: { flex: 1 },
});
