import type { ComponentProps } from 'react';
import { View } from 'react-native';

type LinearGradientProps = ComponentProps<typeof View> & {
  colors?: readonly string[];
  locations?: readonly number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export default function LinearGradientMock({ colors, style, ...props }: LinearGradientProps) {
  return (
    <View
      {...props}
      style={[
        { backgroundColor: colors?.[0] ?? 'transparent' },
        style,
      ]}
    />
  );
}
