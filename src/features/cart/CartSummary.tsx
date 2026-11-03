import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

interface CartSummaryProps {
  count: number;
  total: number;
}

export function CartSummary({ count, total }: CartSummaryProps) {
  const { t, price } = useLocale();
  const { radius } = useAdaptiveLayout();

  return (
    <View style={[styles.card, { borderRadius: radius.card }]}>
      <View style={styles.row}>
        <AppText variant="body" color={colors.textSecondary}>
          {t.cart.subtotal} · {t.cart.items(count)}
        </AppText>
        <AppText variant="bodyStrong">{price(total)}</AppText>
      </View>
      <View style={styles.row}>
        <AppText variant="body" color={colors.textSecondary}>
          {t.cart.delivery}
        </AppText>
        <AppText variant="bodyStrong" color={colors.accent}>
          {t.cart.deliveryValue}
        </AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <AppText variant="title">{t.cart.total}</AppText>
        <AppText testID="cart-total" variant="display" style={styles.total}>
          {price(total)}
        </AppText>
      </View>
      <View style={styles.note}>
        <Icon name="info.circle" size={14} color={colors.textTertiary} />
        <AppText variant="caption" color={colors.textTertiary} style={styles.noteText}>
          {t.cart.deliveryNote}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderCurve: 'continuous',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
  total: { fontSize: 24, lineHeight: 30 },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  noteText: { flex: 1 },
});
