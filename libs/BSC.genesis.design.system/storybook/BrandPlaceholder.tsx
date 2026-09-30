import { Text, View } from 'react-native';

/** Neutral fixture, not a reproduction of the source brand artwork. */
export function BrandPlaceholder({ compact = false }: { compact?: boolean }) {
  return <View accessibilityLabel="Brand placeholder" style={{ width: compact ? 28 : 120, height: compact ? 28 : 60, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EBF0' }}>
    <Text style={{ color: '#666666', fontSize: compact ? 10 : 12 }}>Demo</Text>
  </View>;
}
