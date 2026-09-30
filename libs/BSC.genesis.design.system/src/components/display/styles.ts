import { StyleSheet } from 'react-native';
import { BscColors, BscRadius, BscSpacing, BscTextStyles, withAlpha } from '@bsc/ui-native';

export const styles = StyleSheet.create({
  infoCard: {
    marginVertical: BscSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BscColors.surfaceMuted,
    borderRadius: BscRadius.md,
    paddingVertical: BscSpacing.md,
    paddingHorizontal: BscSpacing.md,
  },
  infoCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BscRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: BscSpacing.md,
  },
  infoCardTextContainer: {
    flex: 1,
  },
  infoCardTitle: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  infoCardSubtitle: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BscRadius.md,
    paddingVertical: BscSpacing.md,
    paddingHorizontal: BscSpacing.xl,
  },
  actionCardStandard: {
    marginVertical: BscSpacing.xs,
  },
  actionCardRegistration: {},
  actionCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: BscSpacing.md,
  },
  actionCardTextContainer: {
    flex: 1,
  },
  actionCardTitle: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  actionCardSubtitle: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xxs,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: BscRadius.pill,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: withAlpha(BscColors.primaryDeep, 0.5),
    zIndex: 999,
    elevation: 999,
    gap: BscSpacing.xs,
  },
  loadingLabel: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textOnDark,
  },
});
