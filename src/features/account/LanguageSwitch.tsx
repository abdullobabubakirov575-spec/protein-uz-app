import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PressableScale } from '@/components/PressableScale';
import { LOCALES } from '@/i18n/dictionaries';
import { useLocale } from '@/i18n/LocaleProvider';
import { colors } from '@/theme/colors';

const PADDING = 4;

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  const [width, setWidth] = useState(0);
  const index = LOCALES.findIndex((item) => item.code === locale);
  const segment = width > 0 ? (width - PADDING * 2) / LOCALES.length : 0;

  const indicatorStyle = useAnimatedStyle(
    () => ({
      width: segment,
      transform: [{ translateX: withSpring(index * segment, { damping: 18, stiffness: 220 }) }],
    }),
    [index, segment],
  );

  return (
    <View
      testID="language-switch"
      style={styles.track}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
    >
      {segment > 0 ? <Animated.View style={[styles.indicator, indicatorStyle]} /> : null}
      {LOCALES.map((item) => {
        const active = item.code === locale;
        return (
          <PressableScale
            key={item.code}
            testID={`lang-${item.code}`}
            accessibilityState={{ selected: active }}
            onPress={() => setLocale(item.code)}
            feedback="selection"
            style={styles.segment}
          >
            <AppText variant="callout" color={active ? colors.onAccent : colors.textSecondary} style={styles.label}>
              {item.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: PADDING,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  segment: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '600' },
});
