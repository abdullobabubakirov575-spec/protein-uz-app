import { Stack } from 'expo-router';

import { useLocale } from '@/i18n/LocaleProvider';
import { largeTitleOptions } from '@/navigation/stackOptions';

export default function ProfileStackLayout() {
  const { t } = useLocale();
  return (
    <Stack screenOptions={largeTitleOptions}>
      <Stack.Screen name="index" options={{ title: t.profile.title }} />
    </Stack>
  );
}
