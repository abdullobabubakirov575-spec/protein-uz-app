import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type TextInputInstance } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ApiError } from '@/api/client';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FormField } from '@/components/FormField';
import { HeaderIconButton } from '@/components/HeaderIconButton';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/account/AuthProvider';
import { useCart } from '@/features/cart/CartProvider';
import { DEFAULT_POINT, LocationPicker, type GeoPoint } from '@/features/orders/LocationPicker';
import { OrderSuccess } from '@/features/orders/OrderSuccess';
import { useOrders, type PlacedOrder } from '@/features/orders/OrdersProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatPhoneDigits, normalizePhoneDigits, PHONE_DIGITS, PHONE_PREFIX } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

interface FieldErrors {
  name?: string;
  phone?: string;
  submit?: string;
}

const MAX_FORM_WIDTH = 640;

export default function CheckoutScreen() {
  const { t, price } = useLocale();
  const layout = useAdaptiveLayout();
  const { user } = useAuth();
  const { lines, count, total } = useCart();
  const { contact, placeOrder } = useOrders();

  const [name, setName] = useState(contact?.name ?? user?.username ?? '');
  const [phoneDigits, setPhoneDigits] = useState(contact?.phoneDigits ?? '');
  const [comment, setComment] = useState('');
  const [point, setPoint] = useState<GeoPoint>(DEFAULT_POINT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const phoneInput = useRef<TextInputInstance>(null);
  const commentInput = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (!contact) return;
    setName((current) => current || contact.name);
    setPhoneDigits((current) => current || contact.phoneDigits);
  }, [contact]);

  const header = (
    <Stack.Screen
      options={{
        headerLeft: () => <HeaderIconButton testID="checkout-close" icon="xmark" label={t.common.close} onPress={() => router.back()} />,
      }}
    />
  );

  if (placed) {
    return (
      <>
        <Stack.Screen options={{ headerLeft: () => null, title: '', gestureEnabled: false }} />
        <OrderSuccess order={placed} />
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <View style={styles.centered}>
        {header}
        <EmptyState icon="bag" title={t.checkout.cartEmpty} actionLabel={t.common.close} onAction={() => router.back()} />
      </View>
    );
  }

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = t.checkout.nameRequired;
    if (phoneDigits.length !== PHONE_DIGITS) next.phone = t.checkout.phoneInvalid;
    setErrors(next);
    return !next.name && !next.phone;
  };

  const submit = async () => {
    if (!validate()) {
      haptic.error();
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder({
        name,
        phoneDigits,
        comment,
        latitude: point.latitude,
        longitude: point.longitude,
      });
      haptic.success();
      setPlaced(order);
    } catch (error) {
      haptic.error();
      const message =
        error instanceof ApiError && !error.isNetwork && !error.message.startsWith('http_')
          ? error.message
          : error instanceof ApiError && error.isNetwork
            ? t.common.networkError
            : t.common.genericError;
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {header}
      <ScrollView
        testID="checkout-scroll"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.gutter }]}
      >
        <View style={styles.column}>
          <Animated.View entering={FadeInDown.duration(380)} style={styles.section}>
            <AppText variant="title">{t.checkout.contact}</AppText>
            <FormField
              testID="checkout-name"
              label={t.checkout.name}
              placeholder={t.checkout.namePlaceholder}
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => phoneInput.current?.focus()}
            />
            <FormField
              ref={phoneInput}
              testID="checkout-phone"
              label={t.checkout.phone}
              placeholder="90 123 45 67"
              value={formatPhoneDigits(phoneDigits)}
              onChangeText={(value) => {
                setPhoneDigits(normalizePhoneDigits(value));
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={errors.phone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              maxLength={12}
              prefix={
                <View style={styles.prefix}>
                  <AppText variant="headline">🇺🇿</AppText>
                  <AppText variant="headline">{PHONE_PREFIX}</AppText>
                </View>
              }
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(380)} style={styles.section}>
            <AppText variant="title">{t.checkout.location}</AppText>
            <LocationPicker onChange={setPoint} />
            <FormField
              ref={commentInput}
              testID="checkout-comment"
              label={t.checkout.comment}
              placeholder={t.checkout.commentPlaceholder}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(380)} style={styles.section}>
            <AppText variant="title">{t.checkout.summary}</AppText>
            <View style={[styles.summary, { borderRadius: layout.radius.card }]}>
              {lines.map((line) => (
                <View key={line.productId} style={styles.summaryRow}>
                  <AppText variant="callout" style={styles.flex} numberOfLines={1}>
                    {line.product.name}
                  </AppText>
                  <AppText variant="callout" color={colors.textSecondary}>
                    × {line.qty}
                  </AppText>
                  <AppText variant="callout" style={styles.summaryPrice}>
                    {price(line.qty * line.product.price)}
                  </AppText>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <AppText variant="body" color={colors.textSecondary} style={styles.flex}>
                  {t.cart.delivery}
                </AppText>
                <AppText variant="bodyStrong" color={colors.accent}>
                  {t.cart.deliveryValue}
                </AppText>
              </View>
              <View style={styles.summaryRow}>
                <AppText variant="title" style={styles.flex}>
                  {t.cart.total} · {t.cart.items(count)}
                </AppText>
                <AppText variant="price" style={styles.total}>
                  {price(total)}
                </AppText>
              </View>
            </View>
            <View style={styles.note}>
              <Icon name="phone.fill" size={14} color={colors.accent} />
              <AppText variant="callout" color={colors.textSecondary} style={styles.flex}>
                {t.checkout.confirmNote}
              </AppText>
            </View>
          </Animated.View>

          {errors.submit ? (
            <Animated.View entering={FadeIn} style={styles.errorBox}>
              <Icon name="exclamationmark.triangle.fill" size={16} color={colors.danger} />
              <AppText variant="callout" color={colors.danger} style={styles.flex}>
                {errors.submit}
              </AppText>
            </Animated.View>
          ) : null}

          <Button
            testID="checkout-submit"
            label={t.checkout.submit}
            icon="checkmark.circle.fill"
            loading={submitting}
            onPress={submit}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', backgroundColor: colors.surface },
  content: { paddingTop: 12, paddingBottom: 48, alignItems: 'center' },
  column: { width: '100%', maxWidth: MAX_FORM_WIDTH, gap: 28 },
  section: { gap: 14 },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
  summary: {
    padding: 16,
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderCurve: 'continuous',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryPrice: { fontWeight: '600', minWidth: 96, textAlign: 'right' },
  total: { fontSize: 20 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong, marginVertical: 2 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.dangerSoft,
  },
  flex: { flex: 1 },
});
