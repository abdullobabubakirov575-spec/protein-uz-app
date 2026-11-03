import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Product } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ProductImage } from '@/components/ProductImage';
import { useLocale } from '@/i18n/LocaleProvider';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

interface HomeHeroProps {
  featured?: Product;
  onExplore: () => void;
}

export function HomeHero({ featured, onExplore }: HomeHeroProps) {
  const { t } = useLocale();
  const { gutter, heroHeight, radius, contentWidth, deviceClass } = useAdaptiveLayout();
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * float.value }, { rotate: `${-9 + float.value * 3}deg` }],
  }));

  const imageSize = Math.round(Math.min(contentWidth * 0.42, deviceClass === 'tablet' ? 240 : 170));
  const showImage = Boolean(featured) && deviceClass !== 'compact';

  return (
    <Animated.View entering={FadeInDown.duration(520).springify()} style={{ paddingHorizontal: gutter }}>
      <View style={[styles.card, { minHeight: heroHeight, borderRadius: radius.hero }]}>
        <LinearGradient
          colors={['#1E2A12', '#121510', colors.surface]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.glow, { width: heroHeight * 1.1, height: heroHeight * 1.1, borderRadius: heroHeight }]} />
        {showImage && featured ? (
          <Animated.View style={[styles.floating, floatingStyle]} pointerEvents="none">
            <ProductImage uri={featured.image} size={imageSize} radius={radius.card} padding={12} priority="high" />
          </Animated.View>
        ) : null}
        <View style={styles.content}>
          <View style={styles.tag}>
            <View style={styles.dot} />
            <AppText variant="overline" color={colors.accent}>
              {t.home.heroTag}
            </AppText>
          </View>
          <AppText variant="hero" style={[styles.title, showImage && { maxWidth: contentWidth - imageSize * 0.62 }]}>
            {t.home.heroTitle}
          </AppText>
          <AppText variant="callout" color={colors.textSecondary} style={[styles.subtitle, showImage && { maxWidth: contentWidth * 0.58 }]}>
            {t.home.heroSubtitle}
          </AppText>
          <Button
            testID="hero-cta"
            label={t.home.heroCta}
            icon="arrow.right"
            size="md"
            onPress={onExplore}
            style={styles.cta}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150,224,74,0.22)',
    justifyContent: 'flex-end',
  },
  glow: {
    position: 'absolute',
    top: -80,
    right: -90,
    backgroundColor: colors.accentGlow,
    opacity: 0.35,
  },
  floating: {
    position: 'absolute',
    right: 18,
    top: 26,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  content: { padding: 22, gap: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(150,224,74,0.12)',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  title: { marginTop: 4 },
  subtitle: { maxWidth: 420 },
  cta: { alignSelf: 'flex-start', marginTop: 8 },
});
