import * as Device from 'expo-device';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

export type DeviceClass = 'compact' | 'regular' | 'large' | 'tablet';
export type TopCutout = 'none' | 'notch' | 'dynamicIsland';

export interface AdaptiveLayout {
  deviceClass: DeviceClass;
  cutout: TopCutout;
  modelName: string;
  width: number;
  height: number;
  insets: EdgeInsets;
  gutter: number;
  gap: number;
  columns: number;
  contentWidth: number;
  gridCardWidth: number;
  railCardWidth: number;
  fontScale: number;
  radius: { card: number; tile: number; control: number; hero: number };
  heroHeight: number;
  categoryTile: number;
}

const MAX_CONTENT_WIDTH = 1100;

const SPEC: Record<DeviceClass, { gutter: number; gap: number; fontScale: number; rail: number; tile: number }> = {
  compact: { gutter: 16, gap: 10, fontScale: 0.93, rail: 148, tile: 104 },
  regular: { gutter: 20, gap: 12, fontScale: 1, rail: 164, tile: 118 },
  large: { gutter: 22, gap: 14, fontScale: 1.05, rail: 178, tile: 126 },
  tablet: { gutter: 32, gap: 16, fontScale: 1.12, rail: 200, tile: 150 },
};

function classify(width: number, height: number, isPad: boolean): DeviceClass {
  if (isPad || Math.min(width, height) >= 600) return 'tablet';
  if (width < 380) return 'compact';
  if (width >= 420) return 'large';
  return 'regular';
}

function detectCutout(topInset: number): TopCutout {
  if (topInset >= 54) return 'dynamicIsland';
  if (topInset >= 40) return 'notch';
  return 'none';
}

function displayCornerRadius(cutout: TopCutout, deviceClass: DeviceClass): number {
  if (deviceClass === 'tablet') return 18;
  if (cutout === 'dynamicIsland') return 55;
  if (cutout === 'notch') return 44;
  return 0;
}

export function computeLayout(width: number, height: number, insets: EdgeInsets): AdaptiveLayout {
  const isPad = Platform.OS === 'ios' && Platform.isPad;
  const deviceClass = classify(width, height, isPad);
  const cutout = detectCutout(insets.top);
  const spec = SPEC[deviceClass];
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - spec.gutter * 2;
  const columns = deviceClass === 'tablet' ? (contentWidth >= 900 ? 4 : 3) : 2;
  const gridCardWidth = Math.floor((contentWidth - spec.gap * (columns - 1)) / columns);
  const screenRadius = displayCornerRadius(cutout, deviceClass);
  const card = Math.round(Math.min(26, Math.max(16, screenRadius * 0.4)));
  const heroBase = Math.min(height * 0.4, deviceClass === 'tablet' ? 400 : 350);

  return {
    deviceClass,
    cutout,
    modelName: Device.modelName ?? (isPad ? 'iPad' : 'iPhone'),
    width,
    height,
    insets,
    gutter: spec.gutter,
    gap: spec.gap,
    columns,
    contentWidth,
    gridCardWidth,
    railCardWidth: spec.rail,
    fontScale: spec.fontScale,
    radius: {
      card,
      tile: card - 6,
      control: Math.max(12, card - 8),
      hero: Math.max(card + 4, screenRadius - 24),
    },
    heroHeight: Math.round(deviceClass === 'compact' ? heroBase * 0.9 : heroBase),
    categoryTile: spec.tile,
  };
}

const AdaptiveLayoutContext = createContext<AdaptiveLayout | null>(null);

export function AdaptiveLayoutProvider({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = useMemo(() => computeLayout(width, height, insets), [width, height, insets]);
  return <AdaptiveLayoutContext.Provider value={layout}>{children}</AdaptiveLayoutContext.Provider>;
}

export function useAdaptiveLayout(): AdaptiveLayout {
  const context = useContext(AdaptiveLayoutContext);
  if (!context) throw new Error('useAdaptiveLayout must be used inside AdaptiveLayoutProvider');
  return context;
}
