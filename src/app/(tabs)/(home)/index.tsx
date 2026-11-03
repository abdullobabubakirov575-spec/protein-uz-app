import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { BrandTile } from '@/components/BrandTile';
import { CategoryTile } from '@/components/CategoryTile';
import { EmptyState } from '@/components/EmptyState';
import { GlassSurface } from '@/components/GlassSurface';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { useCatalog } from '@/features/catalog/CatalogProvider';
import { HomeHero } from '@/features/home/HomeHero';
import { Perks } from '@/features/home/Perks';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

const POPULAR_LIMIT = 12;

export default function HomeScreen() {
  const { t } = useLocale();
  const layout = useAdaptiveLayout();
  const { products, categories, brands, status, refreshing, refresh } = useCatalog();

  const popular = useMemo(() => products.slice(0, POPULAR_LIMIT), [products]);
  const topBrands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    return brands
      .filter((brand) => counts.has(brand.name))
      .map((brand) => ({ brand, count: counts.get(brand.name) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [products, brands]);

  const openCatalog = (focus?: boolean) => router.navigate({ pathname: '/catalog', params: focus ? { focus: '1' } : {} });

  return (
    <ScrollView
      testID="home-scroll"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
    >
      <View style={[styles.topBar, { paddingHorizontal: layout.gutter }]}>
        <View>
          <AppText variant="overline" color={colors.textTertiary}>
            {t.home.greeting}
          </AppText>
          <AppText variant="display" style={styles.wordmark}>
            PROTEIN<AppText variant="display" color={colors.accent}>.UZ</AppText>
          </AppText>
        </View>
        <PressableScale testID="home-search" accessibilityLabel={t.catalog.searchPlaceholder} onPress={() => openCatalog(true)} feedback="selection">
          <GlassSurface style={styles.roundButton} interactive>
            <Icon name="magnifyingglass" size={18} />
          </GlassSurface>
        </PressableScale>
      </View>

      <HomeHero featured={products[0]} onExplore={() => openCatalog()} />

      <PressableScale onPress={() => openCatalog(true)} scaleTo={0.98} style={{ paddingHorizontal: layout.gutter }}>
        <View style={[styles.searchPill, { borderRadius: layout.radius.control + 4 }]}>
          <Icon name="magnifyingglass" size={16} color={colors.textTertiary} />
          <AppText variant="body" color={colors.textTertiary}>
            {t.home.searchPlaceholder}
          </AppText>
        </View>
      </PressableScale>

      {status === 'error' && products.length === 0 ? (
        <EmptyState
          tone="error"
          icon="wifi.exclamationmark"
          title={t.common.errorTitle}
          subtitle={t.common.networkError}
          actionLabel={t.common.retry}
          onAction={refresh}
        />
      ) : (
        <>
          <View>
            <SectionHeader title={t.home.categories} actionLabel={t.common.seeAll} onAction={() => openCatalog()} />
            {categories.length === 0 ? (
              <View style={[styles.rail, { paddingHorizontal: layout.gutter }]}>
                {[0, 1, 2, 3].map((key) => (
                  <Skeleton key={key} width={layout.categoryTile} height={layout.categoryTile * 1.22} radius={layout.radius.tile} />
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.rail, { paddingHorizontal: layout.gutter }]}>
                {categories.map((category) => (
                  <CategoryTile
                    key={category.key}
                    category={category}
                    onPress={() => router.push({ pathname: '/collection', params: { category: category.key } })}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View>
            <SectionHeader title={t.home.topProducts} actionLabel={t.common.seeAll} onAction={() => openCatalog()} />
            {popular.length === 0 ? (
              <View style={[styles.rail, { paddingHorizontal: layout.gutter }]}>
                {[0, 1, 2].map((key) => (
                  <Skeleton key={key} width={layout.railCardWidth} height={layout.railCardWidth * 1.55} radius={layout.radius.card} />
                ))}
              </View>
            ) : (
              <FlatList
                horizontal
                data={popular}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProductCard product={item} width={layout.railCardWidth} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: layout.gap }}
                decelerationRate="fast"
                snapToInterval={layout.railCardWidth + layout.gap}
                snapToAlignment="start"
              />
            )}
          </View>

          {topBrands.length > 0 ? (
            <Animated.View entering={FadeIn.duration(400)}>
              <SectionHeader title={t.home.brands} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.rail, { paddingHorizontal: layout.gutter }]}>
                {topBrands.map(({ brand, count }) => (
                  <BrandTile
                    key={brand.id}
                    brand={brand}
                    count={count}
                    onPress={() => router.push({ pathname: '/collection', params: { brand: brand.name } })}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          ) : null}

          <Perks />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 28, paddingTop: 8, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -8 },
  wordmark: { fontSize: 30, lineHeight: 36 },
  roundButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    marginTop: -12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rail: { flexDirection: 'row', gap: 12 },
});
