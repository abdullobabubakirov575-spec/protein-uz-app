import type { NativeStackNavigationOptions } from 'expo-router';

import { hasLiquidGlass } from '@/components/GlassSurface';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export const largeTitleOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerLargeTitleEnabled: true,
  headerTransparent: true,
  headerBlurEffect: hasLiquidGlass ? undefined : 'systemChromeMaterialDark',
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerTintColor: colors.accent,
  headerUserInterfaceStyle: 'dark',
  headerBackButtonDisplayMode: 'minimal',
  headerTitleStyle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },
  headerLargeTitleStyle: { fontFamily: fonts.display, color: colors.text, fontSize: 34 },
  contentStyle: { backgroundColor: colors.background },
};

export const modalOptions: NativeStackNavigationOptions = {
  headerShown: true,
  presentation: 'modal',
  headerTransparent: hasLiquidGlass,
  headerStyle: hasLiquidGlass ? undefined : { backgroundColor: colors.surface },
  headerShadowVisible: false,
  headerTintColor: colors.accent,
  headerUserInterfaceStyle: 'dark',
  headerTitleStyle: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: 18 },
  contentStyle: { backgroundColor: colors.surface },
};
