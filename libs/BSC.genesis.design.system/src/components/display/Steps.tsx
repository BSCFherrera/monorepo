import { View } from 'react-native';
import { BscColors } from '@bsc/ui-native';
import { styles } from './styles';
import type { StepsProps } from './types';

export function Steps({ labels, current, totalSteps }: StepsProps) {
  const count = totalSteps ?? labels?.length ?? current + 1;
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={labels?.[current] ?? 'Progress'} accessibilityValue={{ min: 0, max: count, now: Math.max(0, Math.min(count, current + 1)) }} style={styles.stepsContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepBar,
            { backgroundColor: i <= current ? BscColors.primary : BscColors.border },
          ]}
        />
      ))}
    </View>
  );
}
