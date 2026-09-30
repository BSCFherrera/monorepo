import { StyleSheet, View, type ViewProps } from 'react-native';
import { tokens } from '../../tokens';

export type CardProps = ViewProps;

export function Card({ children, style, ...props }: CardProps) {
  return <View {...props} style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderWidth: 1,
    borderRadius: tokens.radius,
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
});
