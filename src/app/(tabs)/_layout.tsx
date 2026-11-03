import { NativeTabs } from 'expo-router/native-tabs';

import { useCart } from '@/features/cart/CartProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { colors } from '@/theme/colors';

const badgeLabel = (count: number) => (count > 99 ? '99+' : String(count));

export default function TabsLayout() {
  const { t } = useLocale();
  const { count } = useCart();

  return (
    <NativeTabs
      tintColor={colors.accent}
      iconColor={{ default: colors.textSecondary, selected: colors.accent }}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.accent } }}
      blurEffect="systemChromeMaterialDark"
      disableTransparentOnScrollEdge
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="(home)" testID="tab-home" accessibilityLabel={t.tabs.home}>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t.tabs.home}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalog" testID="tab-catalog" accessibilityLabel={t.tabs.catalog}>
        <NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} md="grid_view" />
        <NativeTabs.Trigger.Label>{t.tabs.catalog}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart" testID="tab-cart" accessibilityLabel={t.tabs.cart}>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        <NativeTabs.Trigger.Label>{t.tabs.cart}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={count === 0}>{count > 0 ? badgeLabel(count) : undefined}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" testID="tab-profile" accessibilityLabel={t.tabs.profile}>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
        <NativeTabs.Trigger.Label>{t.tabs.profile}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
