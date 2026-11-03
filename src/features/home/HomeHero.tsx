import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
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

const CONTENT_PADDING = 22;

interface HomeHeroProps {
  featured?: Product;
  onExplore: () => void;
}

export function HomeHero({ featured, onExplore }: HomeHeroProps) {
  const { t } = useLocale();
  const { gutter, heroHeight, radius, contentWidth, deviceClass } = useAdaptiveLayout();
  const reduceMotion = useReducedMotion();
  const float = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(float);
  }, [float, reduceMotion]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * float.value }, { rotate: `${-8 + float.value * 3}deg` }],
  }));

  const innerWidth = contentWidth - CONTENT_PADDING * 2;
  const imageSize = Math.round(
    deviceClass === 'tablet' ? Math.min(innerWidth * 0.3, 220) : Math.min(innerWidth * 0.36, 140),
  );
  const showImage = Boolean(featured) && deviceClass !== 'compact';

  return (
    <Animated.View entering={FadeInDown.duration(520)} style={{ paddingHorizontal: gutter }}>
      <View style={[styles.card, { minHeight: heroHeight, borderRadius: radius.hero }]}>
        <LinearGradient
          colors={['#1E2A12', '#121510', colors.surface]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.glow, { width: heroHeight * 1.1, height: heroHeight * 1.1, borderRadius: heroHeight }]} />
        <View style={styles.content}>
          <View style={styles.tag}>
            <View style={styles.dot} />
            <AppText variant="overline" color={colors.accent}>
              {t.home.heroTag}
            </AppText>
          </View>
          <AppText variant="hero" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.55} style={styles.title}>
            {t.home.heroTitle}
          </AppText>
          <View style={styles.row}>
            <AppText variant="callout" color={colors.textSecondary} style={styles.copy}>
              {t.home.heroSubtitle}
            </AppText>
            {showImage && featured ? (
              <Animated.View style={[styles.floating, floatingStyle]} pointerEvents="none">
                <ProductImage uri={featured.image} size={imageSize} radius={radius.card} padding={12} priority="high" />
              </Animated.View>
            ) : null}
          </View>
          <Button testID="hero-cta" label={t.home.heroCta} icon="arrow.right" size="md" onPress={onExplore} style={styles.cta} />
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
  content: { padding: CONTENT_PADDING, gap: 12 },
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
  title: { marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  copy: { flex: 1, alignSelf: 'center' },
  cta: { alignSelf: 'flex-start', marginTop: 4 },
  floating: {
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
});
