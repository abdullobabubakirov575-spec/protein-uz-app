import { NativeTabs } from 'expo-router/native-tabs';

import { useCart } from '@/features/cart/CartProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { colors } from '@/theme/colors';

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
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t.tabs.home}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="catalog">
        <NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} md="grid_view" />
        <NativeTabs.Trigger.Label>{t.tabs.catalog}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        <NativeTabs.Trigger.Label>{t.tabs.cart}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={count === 0}>{count > 99 ? '99+' : String(count)}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
        <NativeTabs.Trigger.Label>{t.tabs.profile}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
