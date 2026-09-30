import { StyleSheet, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';

export interface BscStepsProps {
  labels?: readonly string[] | undefined;
  current: number;
  totalSteps?: number;
  testID?: string;
}

export function BscSteps({ labels, current, totalSteps, testID }: BscStepsProps): React.JSX.Element {
  const total = totalSteps ?? labels?.length ?? 0;
  return (
    <View accessibilityRole="progressbar" style={styles.container} testID={testID}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={[styles.step, index <= current ? styles.active : styles.inactive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xxs,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: BscRadius.pill,
  },
  active: {
    backgroundColor: BscColors.primary,
  },
  inactive: {
    backgroundColor: BscColors.border,
  },
});
