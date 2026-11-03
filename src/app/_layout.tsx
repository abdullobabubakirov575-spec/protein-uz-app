import { Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold, useFonts } from '@expo-google-fonts/oswald';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type PropsWithChildren } from 'react';

import { AuthProvider } from '@/features/account/AuthProvider';
import { CartProvider } from '@/features/cart/CartProvider';
import { CatalogProvider } from '@/features/catalog/CatalogProvider';
import { OrdersProvider } from '@/features/orders/OrdersProvider';
import { LocaleProvider, useLocale } from '@/i18n/LocaleProvider';
import { largeTitleOptions, modalOptions } from '@/navigation/stackOptions';
import { AdaptiveLayoutProvider } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 350, fade: true });

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

function AppStack() {
  const { t, ready } = useLocale();
  const [fontsLoaded, fontError] = useFonts({ Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold });
  const loaded = ready && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product/[id]"
        options={{ ...largeTitleOptions, headerLargeTitleEnabled: false, headerBlurEffect: undefined, title: '' }}
      />
      <Stack.Screen name="collection" options={largeTitleOptions} />
      <Stack.Screen name="checkout" options={{ ...modalOptions, title: t.checkout.title }} />
      <Stack.Screen name="auth" options={{ ...modalOptions, title: '' }} />
    </Stack>
  );
}

function Providers({ children }: PropsWithChildren) {
  return (
    <AdaptiveLayoutProvider>
      <LocaleProvider>
        <CatalogProvider>
          <AuthProvider>
            <CartProvider>
              <OrdersProvider>{children}</OrdersProvider>
            </CartProvider>
          </AuthProvider>
        </CatalogProvider>
      </LocaleProvider>
    </AdaptiveLayoutProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <Providers>
        <StatusBar style="light" />
        <AppStack />
      </Providers>
    </ThemeProvider>
  );
}
