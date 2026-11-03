import { Stack } from 'expo-router';
import { useMemo, useState, type ReactElement } from 'react';
import { ActionSheetIOS, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { CategoryKey, Product, ProductSort } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { HeaderIconButton } from '@/components/HeaderIconButton';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { useCatalog } from './CatalogProvider';
import { filterProducts } from './query';

type ChipMode = 'category' | 'brand';

interface ProductBrowserProps {
  query?: string;
  fixedCategory?: CategoryKey;
  fixedBrand?: string;
  chips: ChipMode;
  header?: ReactElement;
}

const SORTS: ProductSort[] = ['rating', 'price_asc', 'price_desc'];

export function ProductBrowser({ query = '', fixedCategory, fixedBrand, chips, header }: ProductBrowserProps) {
  const { t } = useLocale();
  const layout = useAdaptiveLayout();
  const { products, categories, status, refreshing, refresh } = useCatalog();
  const [chip, setChip] = useState<string | null>(null);
  const [sort, setSort] = useState<ProductSort>('rating');

  const scoped = useMemo(
    () => filterProducts(products, { category: fixedCategory, brand: fixedBrand }),
    [products, fixedCategory, fixedBrand],
  );

  const chipOptions = useMemo(() => {
    if (chips === 'category') {
      const present = new Set(scoped.map((product) => product.category));
      return categories
        .filter((category) => present.has(category.key))
        .map((category) => ({ value: category.key as string, label: t.categories[category.key] ?? category.key }));
    }
    const counts = new Map<string, number>();
    for (const product of scoped) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => ({ value: brand, label: brand }));
  }, [chips, scoped, categories, t]);

  const visible = useMemo(
    () =>
      filterProducts(scoped, {
        query,
        sort,
        category: chips === 'category' ? (chip as CategoryKey | null) : null,
        brand: chips === 'brand' ? chip : null,
      }),
    [scoped, query, sort, chips, chip],
  );

  const sortLabels: Record<ProductSort, string> = {
    rating: t.catalog.sortRating,
    price_asc: t.catalog.sortPriceAsc,
    price_desc: t.catalog.sortPriceDesc,
  };

  const openSort = () => {
    const labels = SORTS.map((value) => (value === sort ? `✓ ${sortLabels[value]}` : sortLabels[value]));
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: t.catalog.sortTitle,
        options: [...labels, t.common.cancel],
        cancelButtonIndex: labels.length,
        userInterfaceStyle: 'dark',
        tintColor: colors.accent,
      },
      (index) => {
        if (index < SORTS.length) setSort(SORTS[index]);
      },
    );
  };

  const resetFilters = () => {
    setChip(null);
    setSort('rating');
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      {header}
      {chipOptions.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chips, { paddingHorizontal: layout.gutter }]}
        >
          <Chip testID="chip-all" label={t.catalog.all} selected={chip === null} onPress={() => setChip(null)} />
          {chipOptions.map((option) => (
            <Chip
              key={option.value}
              testID={`chip-${option.value}`}
              label={option.label}
              selected={chip === option.value}
              onPress={() => setChip(chip === option.value ? null : option.value)}
            />
          ))}
        </ScrollView>
      ) : null}
      {status === 'ready' ? (
        <Animated.View entering={FadeIn} style={[styles.meta, { paddingHorizontal: layout.gutter }]}>
          <AppText variant="callout" color={colors.textSecondary}>
            {t.catalog.results(visible.length)}
          </AppText>
          <AppText variant="callout" color={colors.textTertiary}>
            {sortLabels[sort]}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );

  const renderEmpty = () => {
    if (status === 'loading') return <ProductGridSkeleton />;
    if (status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon="wifi.exclamationmark"
          title={t.common.errorTitle}
          subtitle={t.common.networkError}
          actionLabel={t.common.retry}
          onAction={refresh}
        />
      );
    }
    return (
      <EmptyState
        icon="magnifyingglass"
        title={t.catalog.emptyTitle}
        subtitle={t.catalog.emptySubtitle}
        actionLabel={chip || sort !== 'rating' ? t.catalog.resetFilters : undefined}
        onAction={resetFilters}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderIconButton testID="sort-button" icon="arrow.up.arrow.down" label={t.catalog.sortTitle} onPress={openSort} />
          ),
        }}
      />
      <FlatList
        key={`grid-${layout.columns}`}
        data={status === 'ready' ? visible : []}
        keyExtractor={(item: Product) => item.id}
        numColumns={layout.columns}
        renderItem={({ item }) => <ProductCard product={item} width={layout.gridCardWidth} />}
        columnWrapperStyle={{ gap: layout.gap, paddingHorizontal: layout.gutter }}
        ItemSeparatorComponent={() => <View style={{ height: layout.gap + 10 }} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerBlock: { gap: 14, marginBottom: 14 },
  chips: { gap: 8, paddingVertical: 2 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  content: { paddingBottom: 32 },
});
