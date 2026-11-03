import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { RatingStars } from '@/components/RatingStars';
import { SectionHeader } from '@/components/SectionHeader';
import { useCart } from '@/features/cart/CartProvider';
import { useCatalog } from '@/features/catalog/CatalogProvider';
import { PURCHASE_BAR_HEIGHT, ProductPurchaseBar } from '@/features/catalog/ProductPurchaseBar';
import { similarProducts } from '@/features/catalog/query';
import { useProductDetails } from '@/features/catalog/useProductDetails';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

const HEADER_SPACE = 52;
const LOW_STOCK = 3;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, price } = useLocale();
  const layout = useAdaptiveLayout();
  const { products } = useCatalog();
  const { quantityOf } = useCart();
  const { product, description, status, reload } = useProductDetails(id);

  const similar = useMemo(() => (product ? similarProducts(products, product) : []), [products, product]);

  if (!product) {
    return (
      <View style={styles.centered}>
        {status === 'loading' ? (
          <ActivityIndicator color={colors.accent} size="large" />
        ) : (
          <EmptyState
            tone="error"
            icon="shippingbox"
            title={t.product.notFound}
            subtitle={t.common.networkError}
            actionLabel={t.common.retry}
            onAction={reload}
          />
        )}
      </View>
    );
  }

  const imageSize = Math.round(Math.min(layout.contentWidth * 0.84, 460));
  const inCart = quantityOf(product.id);
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK;
  const details = [
    { label: t.product.brand, value: product.brand },
    { label: t.product.country, value: product.country },
    { label: t.product.category, value: t.categories[product.category] ?? '' },
    { label: t.product.sku, value: product.sku },
  ].filter((row) => row.label && row.value);

  return (
    <View style={styles.screen}>
      <ScrollView
        testID="product-scroll"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: PURCHASE_BAR_HEIGHT + layout.insets.bottom + 32 }}
      >
        <View style={[styles.hero, { paddingTop: layout.insets.top + HEADER_SPACE }]}>
          <LinearGradient
            colors={['#1C2711', '#11150D', colors.background]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View entering={ZoomIn.duration(420).springify().damping(16)} style={styles.heroImage}>
            <ProductImage uri={product.image} size={imageSize} radius={layout.radius.hero} padding={22} priority="high" />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(120).duration(420)} style={[styles.info, { paddingHorizontal: layout.gutter }]}>
          <PressableScale
            onPress={() => router.push({ pathname: '/collection', params: { brand: product.brand } })}
            style={styles.brandRow}
            feedback="selection"
          >
            <AppText variant="overline" color={colors.accent}>
              {product.brand}
            </AppText>
            <Icon name="chevron.right" size={10} color={colors.accent} weight="bold" />
          </PressableScale>

          <AppText variant="display" style={styles.name}>
            {product.name}
          </AppText>

          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating} />
            <AppText variant="callout" color={colors.textSecondary}>
              {product.rating.toFixed(1)}
            </AppText>
          </View>

          <View style={styles.priceRow}>
            <AppText variant="display" color={colors.text} style={styles.price}>
              {price(product.price)}
            </AppText>
            <View style={[styles.stockPill, lowStock && styles.stockPillLow]}>
              <View style={[styles.stockDot, { backgroundColor: lowStock ? colors.warning : colors.accent }]} />
              <AppText variant="caption" color={lowStock ? colors.warning : colors.accent} style={styles.stockText}>
                {lowStock ? t.product.lowStock(product.stock) : t.product.inStock(product.stock)}
              </AppText>
            </View>
          </View>

          {inCart > 0 ? (
            <Animated.View entering={FadeIn}>
              <PressableScale testID="in-cart-banner" onPress={() => router.navigate('/cart')} style={styles.inCart} feedback="selection">
                <Icon name="bag.fill" size={16} color={colors.accent} />
                <AppText variant="bodyStrong" style={styles.flex}>
                  {t.product.inCart(inCart)}
                </AppText>
                <AppText variant="callout" color={colors.accent} style={styles.bold}>
                  {t.product.goToCart}
                </AppText>
                <Icon name="chevron.right" size={11} color={colors.accent} weight="bold" />
              </PressableScale>
            </Animated.View>
          ) : null}

          <View style={[styles.card, { borderRadius: layout.radius.card }]}>
            {details.map((row, index) => (
              <View key={row.label} style={[styles.detailRow, index > 0 && styles.detailDivider]}>
                <AppText variant="callout" color={colors.textSecondary}>
                  {row.label}
                </AppText>
                <AppText variant="callout" style={styles.detailValue} numberOfLines={1}>
                  {row.value}
                </AppText>
              </View>
            ))}
          </View>

          {description ? (
            <Animated.View key={description} entering={FadeIn.duration(300)} style={styles.description}>
              <AppText variant="title">{t.product.description}</AppText>
              <AppText variant="body" color={colors.textSecondary} style={styles.descriptionText}>
                {description}
              </AppText>
            </Animated.View>
          ) : status === 'loading' ? (
            <ActivityIndicator color={colors.textTertiary} style={styles.descriptionLoader} />
          ) : null}
        </Animated.View>

        {similar.length > 0 ? (
          <View style={styles.similar}>
            <SectionHeader title={t.product.similar} />
            <FlatList
              horizontal
              data={similar}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ProductCard product={item} width={layout.railCardWidth} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: layout.gap }}
            />
          </View>
        ) : null}
      </ScrollView>

      <ProductPurchaseBar product={product} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingBottom: 28 },
  heroImage: {
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  info: { gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  name: { fontSize: 26, lineHeight: 31 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  price: { fontSize: 30, lineHeight: 36 },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  stockPillLow: { backgroundColor: 'rgba(255,181,71,0.14)' },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontWeight: '600' },
  inCart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150,224,74,0.3)',
  },
  flex: { flex: 1 },
  bold: { fontWeight: '600' },
  card: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 16,
    borderCurve: 'continuous',
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, gap: 16 },
  detailDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  detailValue: { fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  description: { gap: 10, marginTop: 12 },
  descriptionText: { lineHeight: 23 },
  descriptionLoader: { marginTop: 20 },
  similar: { marginTop: 32 },
});
