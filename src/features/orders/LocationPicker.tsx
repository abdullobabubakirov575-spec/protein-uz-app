import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { GlassSurface } from '@/components/GlassSurface';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { useLocale } from '@/i18n/LocaleProvider';
import { haptic } from '@/lib/haptics';
import { useAdaptiveLayout } from '@/theme/adaptive';
import { colors } from '@/theme/colors';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export const DEFAULT_POINT: GeoPoint = { latitude: 41.311081, longitude: 69.279716 };

const CITY_DELTA = 0.06;
const STREET_DELTA = 0.008;

interface LocationPickerProps {
  onChange: (point: GeoPoint) => void;
}

function describe(place: Location.LocationGeocodedAddress | undefined): string {
  if (!place) return '';
  const street = [place.street, place.streetNumber].filter(Boolean).join(' ');
  return [street || place.name, place.district, place.city].filter(Boolean).join(', ');
}

export function LocationPicker({ onChange }: LocationPickerProps) {
  const { t } = useLocale();
  const { radius, height } = useAdaptiveLayout();
  const map = useRef<MapView>(null);
  const moving = useRef(false);
  const [address, setAddress] = useState('');
  const [denied, setDenied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [userVisible, setUserVisible] = useState(false);
  const lift = useSharedValue(0);

  const pinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -14 * lift.value }] }));
  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.35 * lift.value }],
    opacity: 0.55 - 0.25 * lift.value,
  }));

  const locate = useCallback(async (ask: boolean) => {
    const permission = ask
      ? await Location.requestForegroundPermissionsAsync()
      : await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      if (ask) {
        setDenied(true);
        haptic.warning();
      }
      return;
    }
    setDenied(false);
    setUserVisible(true);
    setLocating(true);
    try {
      const position =
        (await Location.getLastKnownPositionAsync({ maxAge: 60000 })) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      map.current?.animateToRegion(
        { ...position.coords, latitudeDelta: STREET_DELTA, longitudeDelta: STREET_DELTA },
        650,
      );
    } catch {
      setDenied(true);
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    locate(false);
  }, [locate]);

  const handleRegionChange = () => {
    if (moving.current) return;
    moving.current = true;
    lift.value = withSpring(1, { damping: 14, stiffness: 260 });
  };

  const handleRegionChangeComplete = async (region: Region) => {
    moving.current = false;
    lift.value = withSpring(0, { damping: 10, stiffness: 300 });
    haptic.selection();
    const point = { latitude: region.latitude, longitude: region.longitude };
    onChange(point);
    try {
      const [place] = await Location.reverseGeocodeAsync(point);
      setAddress(describe(place));
    } catch {
      setAddress('');
    }
  };

  const mapHeight = Math.round(Math.min(Math.max(height * 0.3, 220), 340));

  return (
    <View style={styles.container}>
      <View style={[styles.mapFrame, { height: mapHeight, borderRadius: radius.card }]}>
        <MapView
          ref={map}
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...DEFAULT_POINT, latitudeDelta: CITY_DELTA, longitudeDelta: CITY_DELTA }}
          userInterfaceStyle="dark"
          showsUserLocation={userVisible}
          showsCompass={false}
          showsPointsOfInterests={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
        />
        <View pointerEvents="none" style={styles.pinLayer}>
          <Animated.View style={[styles.pinShadow, shadowStyle]} />
          <Animated.View style={[styles.pin, pinStyle]}>
            <View style={styles.pinHead}>
              <Icon name="shippingbox.fill" size={16} color={colors.onAccent} />
            </View>
            <View style={styles.pinStem} />
          </Animated.View>
        </View>
        <PressableScale testID="locate-me" onPress={() => locate(true)} style={styles.locateWrap} feedback="light">
          <GlassSurface style={styles.locateButton} interactive>
            {locating ? <ActivityIndicator color={colors.accent} size="small" /> : <Icon name="location.fill" size={15} color={colors.accent} />}
            <AppText variant="callout" style={styles.locateLabel}>
              {t.checkout.useMyLocation}
            </AppText>
          </GlassSurface>
        </PressableScale>
      </View>
      {address ? (
        <Animated.View key={address} entering={FadeIn.duration(220)} style={styles.addressRow}>
          <Icon name="mappin.and.ellipse" size={16} color={colors.accent} />
          <AppText variant="bodyStrong" style={styles.flex} numberOfLines={2}>
            {address}
          </AppText>
        </Animated.View>
      ) : null}
      <AppText variant="caption" color={denied ? colors.warning : colors.textTertiary}>
        {denied ? t.checkout.locationDenied : t.checkout.locationHint}
      </AppText>
    </View>
  );
}

const PIN_HEAD = 38;
const PIN_STEM = 12;

const styles = StyleSheet.create({
  container: { gap: 10 },
  mapFrame: { overflow: 'hidden', borderCurve: 'continuous', backgroundColor: colors.surfaceRaised },
  pinLayer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  pin: { position: 'absolute', top: '50%', marginTop: -(PIN_HEAD + PIN_STEM), alignItems: 'center' },
  pinHead: {
    width: PIN_HEAD,
    height: PIN_HEAD,
    borderRadius: PIN_HEAD / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  pinStem: { width: 3, height: PIN_STEM, borderRadius: 2, backgroundColor: colors.background },
  pinShadow: { width: 14, height: 6, borderRadius: 7, backgroundColor: '#000' },
  locateWrap: { position: 'absolute', right: 10, bottom: 10 },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
  },
  locateLabel: { fontWeight: '600' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
});
