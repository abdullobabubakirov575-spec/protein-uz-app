import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatDate } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { PlacedOrder } from './OrdersProvider';

const PREVIEW_LIMIT = 4;

export function OrderHistoryItem({ order, divider }: { order: PlacedOrder; divider: boolean }) {
  const { t, locale, price } = useLocale();
  const extra = order.items.length - PREVIEW_LIMIT;

  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.header}>
        <AppText variant="bodyStrong">{order.number ? t.success.orderNumber(order.number) : formatDate(order.createdAt, locale)}</AppText>
        <AppText variant="price" style={styles.total}>
          {price(order.total)}
        </AppText>
      </View>
      <AppText variant="caption" color={colors.textTertiary}>
        {order.number ? `${formatDate(order.createdAt, locale)} · ` : ''}
        {t.profile.orderItems(order.count)}
      </AppText>
      <View style={styles.thumbs}>
        {order.items.slice(0, PREVIEW_LIMIT).map((item) => (
          <ProductImage key={item.productId} uri={item.image} size={44} radius={10} padding={4} />
        ))}
        {extra > 0 ? (
          <View style={styles.more}>
            <AppText variant="callout" color={colors.textSecondary}>
              +{extra}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 14, gap: 6 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  total: { fontSize: 16 },
  thumbs: { flexDirection: 'row', gap: 8, marginTop: 4 },
  more: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
  },
});
