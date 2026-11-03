import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { absoluteUrl } from '@/api/client';
import { colors } from '@/theme/colors';

interface ProductImageProps {
  uri: string;
  size: number;
  radius: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  recyclingKey?: string;
  priority?: 'low' | 'normal' | 'high';
}

export function ProductImage({ uri, size, radius, padding = 10, style, recyclingKey, priority }: ProductImageProps) {
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: radius, padding }, style]}>
      <Image
        source={{ uri: absoluteUrl(uri) }}
        style={styles.image}
        contentFit="contain"
        transition={220}
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
        priority={priority}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.photo,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  image: { flex: 1 },
});
