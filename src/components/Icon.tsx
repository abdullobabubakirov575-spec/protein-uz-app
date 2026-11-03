import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';

import { colors } from '@/theme/colors';

interface IconProps {
  name: SFSymbol;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
}

export function Icon({ name, size = 20, color = colors.text, weight = 'semibold' }: IconProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={{ width: size, height: size }}
    />
  );
}
