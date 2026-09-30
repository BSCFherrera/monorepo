import { StyleSheet, View, type ViewProps } from 'react-native';
import { BscColors, BscRadius, BscSpacing } from '@bsc/ui-native';

export type CardProps = ViewProps;

export function Card({ children, style, ...props }: CardProps) {
  return <View {...props} style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BscColors.surface,
    borderColor: BscColors.border,
    borderWidth: 1,
    borderRadius: BscRadius.xs,
    padding: BscSpacing.md,
    gap: BscSpacing.md,
  },
});
