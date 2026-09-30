import { StyleSheet } from 'react-native';
import { tokens } from '../../tokens';

export const styles = StyleSheet.create({
  infoCard: {
    marginVertical: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.cardBg,
    borderRadius: tokens.radii.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
  },
  infoCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: tokens.radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  infoCardTextContainer: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
  },
  infoCardSubtitle: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radii.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  actionCardStandard: {
    marginVertical: tokens.spacing.sm,
  },
  actionCardRegistration: {},
  actionCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: tokens.radii.pill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  actionCardTextContainer: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
  },
  actionCardSubtitle: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: tokens.radii.pill,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    elevation: 999,
    gap: tokens.spacing.sm,
  },
  loadingLabel: {
    fontSize: tokens.fontSizes.sm,
    color: '#FFFFFF',
    fontWeight: tokens.fontWeights.medium,
  },
});
