import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { Brand } from '@/api/types';
import { colors } from '@/theme/colors';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

interface BrandTileProps {
  brand: Brand;
  count?: number;
  onPress: () => void;
}

export function BrandTile({ brand, count, onPress }: BrandTileProps) {
  const label = brand.short || brand.name;

  return (
    <PressableScale testID={`brand-${brand.id}`} accessibilityLabel={brand.name} onPress={onPress} feedback="selection">
      <View style={styles.tile}>
        <View style={[styles.logo, { backgroundColor: brand.logoBg || colors.surfaceHighlight }]}>
          {brand.logo ? (
            <Image source={{ uri: brand.logo }} style={styles.logoImage} contentFit="contain" transition={200} />
          ) : (
            <AppText variant="title" color={brand.color || colors.text} numberOfLines={1} adjustsFontSizeToFit style={styles.logoText}>
              {label}
            </AppText>
          )}
        </View>
        <AppText variant="callout" numberOfLines={1} style={styles.name}>
          {brand.name}
        </AppText>
        {count ? (
          <AppText variant="caption" color={colors.textTertiary}>
            {count}
          </AppText>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: { width: 112, alignItems: 'center', gap: 6 },
  logo: {
    width: 112,
    height: 72,
    borderRadius: 18,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  logoImage: { width: '100%', height: 34 },
  logoText: { fontSize: 17 },
  name: { fontWeight: '600', maxWidth: 112 },
});
