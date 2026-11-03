import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { ProductImage } from '@/components/ProductImage';
import { QuantityStepper } from '@/components/QuantityStepper';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { useCart, type ResolvedCartLine } from './CartProvider';

export function CartLineRow({ line, index }: { line: ResolvedCartLine; index: number }) {
  const { price } = useLocale();
  const { setQuantity } = useCart();
  const { radius, deviceClass } = useAdaptiveLayout();
  const imageSize = deviceClass === 'compact' ? 76 : 88;
  const { product } = line;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(320)}
      exiting={FadeOutLeft.duration(220)}
      layout={LinearTransition.springify().damping(18)}
      style={[styles.row, { borderRadius: radius.card }]}
    >
      <PressableScale onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} scaleTo={0.95}>
        <ProductImage uri={product.image} size={imageSize} radius={radius.tile} padding={6} recyclingKey={product.id} />
      </PressableScale>
      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <AppText variant="overline" color={colors.textTertiary} numberOfLines={1}>
            {product.brand}
          </AppText>
          <AppText variant="callout" numberOfLines={2} style={styles.name}>
            {product.name}
          </AppText>
        </View>
        <View style={styles.footer}>
          <QuantityStepper
            testID={`qty-${product.id}`}
            size="sm"
            min={0}
            value={line.qty}
            max={product.stock > 0 ? product.stock : undefined}
            onChange={(qty) => setQuantity(product.id, qty)}
          />
          <AppText variant="price" style={styles.lineTotal}>
            {price(product.price * line.qty)}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderCurve: 'continuous',
  },
  body: { flex: 1, justifyContent: 'space-between', gap: 10 },
  titleBlock: { gap: 2 },
  name: { fontWeight: '500' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  lineTotal: { fontSize: 16, flexShrink: 1, textAlign: 'right' },
});
