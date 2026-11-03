import { Stack, useLocalSearchParams } from 'expo-router';

import type { CategoryKey } from '@/api/types';
import { ProductBrowser } from '@/features/catalog/ProductBrowser';
import { useLocale } from '@/i18n/LocaleProvider';

export default function CollectionScreen() {
  const { t } = useLocale();
  const { category, brand } = useLocalSearchParams<{ category?: CategoryKey; brand?: string }>();
  const title = category ? (t.categories[category] ?? category) : (brand ?? t.catalog.title);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ProductBrowser
        fixedCategory={category}
        fixedBrand={brand}
        chips={category ? 'brand' : 'category'}
      />
    </>
  );
}
