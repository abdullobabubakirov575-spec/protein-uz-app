import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SITE_URL } from '@/api/client';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/account/AuthProvider';
import { LanguageSwitch } from '@/features/account/LanguageSwitch';
import { SettingsRow } from '@/features/account/SettingsRow';
import { OrderHistoryItem } from '@/features/orders/OrderHistoryItem';
import { useOrders } from '@/features/orders/OrdersProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

const SUPPORT_PHONE = '+998 94 404 01 01';
const SUPPORT_EMAIL = 'info@protein.uz';
const MAX_WIDTH = 720;

function Section({ title, children, delay }: PropsWithChildren<{ title: string; delay: number }>) {
  const { radius } = useAdaptiveLayout();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(380)} style={styles.section}>
      <AppText variant="overline" color={colors.textTertiary} style={styles.sectionTitle}>
        {title}
      </AppText>
      <View style={[styles.card, { borderRadius: radius.card }]}>{children}</View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { t } = useLocale();
  const layout = useAdaptiveLayout();
  const { user, signOut } = useAuth();
  const { orders } = useOrders();

  const confirmSignOut = () =>
    Alert.alert(t.profile.signOutConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.profile.signOut, style: 'destructive', onPress: signOut },
    ]);

  const initial = (user?.username ?? '?').slice(0, 1).toUpperCase();

  return (
    <ScrollView
      testID="profile-scroll"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingHorizontal: layout.gutter }]}
    >
      <View style={styles.column}>
        <Animated.View entering={FadeInDown.duration(380)} style={[styles.card, styles.account, { borderRadius: layout.radius.card }]}>
          <View style={[styles.avatar, !user && styles.avatarGuest]}>
            {user ? (
              <AppText variant="display" color={colors.onAccent}>
                {initial}
              </AppText>
            ) : (
              <Icon name="person.fill" size={26} color={colors.textSecondary} />
            )}
          </View>
          <View style={styles.flex}>
            <AppText variant="title" numberOfLines={1}>
              {user ? user.username : t.profile.guest}
            </AppText>
            {!user ? (
              <AppText variant="callout" color={colors.textSecondary}>
                {t.profile.guestText}
              </AppText>
            ) : null}
          </View>
          {user ? (
            <Button testID="sign-out" label={t.profile.signOut} size="sm" variant="danger" onPress={confirmSignOut} />
          ) : (
            <Button testID="sign-in" label={t.profile.signIn} size="sm" onPress={() => router.push('/auth')} />
          )}
        </Animated.View>

        <Section title={t.profile.language} delay={60}>
          <View style={styles.cardPadding}>
            <LanguageSwitch />
          </View>
        </Section>

        <Section title={t.profile.orders} delay={120}>
          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Icon name="shippingbox" size={20} color={colors.textTertiary} />
              <AppText variant="callout" color={colors.textTertiary}>
                {t.profile.ordersEmpty}
              </AppText>
            </View>
          ) : (
            orders.map((order, index) => <OrderHistoryItem key={order.localId} order={order} divider={index > 0} />)
          )}
        </Section>

        <Section title={t.profile.contacts} delay={180}>
          <SettingsRow
            icon="phone.fill"
            title={t.profile.call}
            value={SUPPORT_PHONE}
            onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`)}
          />
          <SettingsRow
            icon="envelope.fill"
            title={t.profile.email}
            value={SUPPORT_EMAIL}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            divider
          />
          <SettingsRow icon="safari.fill" title={t.profile.website} value="protein.uz" onPress={() => Linking.openURL(SITE_URL)} divider />
        </Section>

        <View style={styles.footer}>
          <View style={styles.deviceRow}>
            <Icon name={layout.deviceClass === 'tablet' ? 'ipad' : 'iphone'} size={14} color={colors.textTertiary} />
            <AppText testID="device-label" variant="caption" color={colors.textTertiary}>
              {t.profile.optimizedFor(layout.modelName)}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textTertiary}>
            Protein.uz · {t.profile.version(Constants.expoConfig?.version ?? '1.0.0')}
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 48, alignItems: 'center' },
  column: { width: '100%', maxWidth: MAX_WIDTH, gap: 24 },
  section: { gap: 8 },
  sectionTitle: { marginLeft: 6 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 16,
    borderCurve: 'continuous',
  },
  cardPadding: { paddingVertical: 14 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  avatarGuest: { backgroundColor: colors.surfaceHighlight },
  flex: { flex: 1, gap: 2 },
  emptyOrders: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 18 },
  footer: { alignItems: 'center', gap: 6, marginTop: 8 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
