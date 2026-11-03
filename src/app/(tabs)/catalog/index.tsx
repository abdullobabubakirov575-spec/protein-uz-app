import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { SearchBarCommands } from 'react-native-screens';

import { ProductBrowser } from '@/features/catalog/ProductBrowser';
import { useLocale } from '@/i18n/LocaleProvider';
import { colors } from '@/theme/colors';

const FOCUS_DELAY_MS = 350;

export default function CatalogScreen() {
  const { t } = useLocale();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [query, setQuery] = useState('');
  const searchBar = useRef<SearchBarCommands>(null);

  useEffect(() => {
    if (focus !== '1') return;
    const timer = setTimeout(() => {
      searchBar.current?.focus();
      router.setParams({ focus: undefined });
    }, FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [focus]);

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            ref: searchBar,
            placeholder: t.catalog.searchPlaceholder,
            hideWhenScrolling: false,
            autoCapitalize: 'none',
            tintColor: colors.accent,
            textColor: colors.text,
            onChangeText: (event) => setQuery(event.nativeEvent.text),
            onCancelButtonPress: () => setQuery(''),
          },
        }}
      />
      <ProductBrowser chips="category" query={query} />
    </>
  );
}
