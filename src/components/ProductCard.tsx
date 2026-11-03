import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Product } from '@/api/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { AddToCartFab } from './AddToCartFab';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { ProductImage } from './ProductImage';

const LOW_STOCK = 3;

interface ProductCardProps {
  product: Product;
  width: number;
}

function ProductCardBase({ product, width }: ProductCardProps) {
  const { t, price } = useLocale();
  const { radius } = useAdaptiveLayout();

  return (
    <PressableScale
      testID={`product-${product.id}`}
      accessibilityLabel={`${product.name}, ${price(product.price)}`}
      scaleTo={0.97}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={{ width }}
    >
      <View>
        <ProductImage uri={product.image} size={width} radius={radius.card} recyclingKey={product.id} />
        {product.stock > 0 && product.stock <= LOW_STOCK ? (
          <View style={styles.stockPill}>
            <AppText variant="caption" color={colors.warning} style={styles.stockText}>
              {t.product.lowStock(product.stock)}
            </AppText>
          </View>
        ) : null}
        <View style={styles.fab}>
          <AddToCartFab product={product} size={width >= 180 ? 40 : 36} />
        </View>
      </View>
      <View style={styles.info}>
        <AppText variant="overline" color={colors.textTertiary} numberOfLines={1}>
          {product.brand}
        </AppText>
        <AppText variant="callout" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>
        <AppText variant="price" color={colors.text}>
          {price(product.price)}
        </AppText>
      </View>
    </PressableScale>
  );
}

export const ProductCard = memo(ProductCardBase);

const styles = StyleSheet.create({
  stockPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(12,12,12,0.86)',
  },
  stockText: { fontWeight: '600' },
  fab: { position: 'absolute', right: 8, bottom: 8 },
  info: { paddingTop: 10, paddingHorizontal: 2, gap: 3 },
  name: { minHeight: 36, fontWeight: '500' },
});
