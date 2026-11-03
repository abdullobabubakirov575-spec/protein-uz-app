import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { absoluteUrl } from '@/api/client';
import type { Category } from '@/api/types';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

interface CategoryTileProps {
  category: Category;
  onPress: () => void;
}

export function CategoryTile({ category, onPress }: CategoryTileProps) {
  const { t } = useLocale();
  const { categoryTile, radius } = useAdaptiveLayout();
  const label = t.categories[category.key] ?? category.key;

  return (
    <PressableScale testID={`category-${category.key}`} accessibilityLabel={label} onPress={onPress} feedback="selection">
      <View style={[styles.tile, { width: categoryTile, height: categoryTile * 1.22, borderRadius: radius.tile }]}>
        <Image
          source={{ uri: absoluteUrl(category.image) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={['rgba(12,12,12,0)', 'rgba(12,12,12,0.25)', 'rgba(12,12,12,0.92)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <AppText variant="title" style={styles.label} numberOfLines={2}>
          {label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceRaised,
    borderCurve: 'continuous',
  },
  label: { padding: 10, fontSize: 16, lineHeight: 19 },
});
