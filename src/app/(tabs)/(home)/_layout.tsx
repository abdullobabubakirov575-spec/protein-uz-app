import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

export default function HomeStackLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
