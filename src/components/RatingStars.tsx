import type { SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon } from './Icon';

function starSymbol(rating: number, index: number): SFSymbol {
  if (rating >= index + 1) return 'star.fill';
  if (rating >= index + 0.5) return 'star.leadinghalf.filled';
  return 'star';
}

export function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`${rating} / 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Icon key={index} name={starSymbol(rating, index)} size={size} color={colors.star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
