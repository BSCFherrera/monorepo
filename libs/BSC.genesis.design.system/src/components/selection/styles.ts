import { StyleSheet } from 'react-native';
import { BscColors, BscRadius, BscSpacing, BscTextStyles } from '@bsc/ui-native';

export const styles = StyleSheet.create({
  selectWrapper: {},
  selectLabel: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textPrimary,
    marginBottom: BscSpacing.xxs,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: BscRadius.md,
    borderColor: BscColors.border,
    paddingHorizontal: BscSpacing.md,
    backgroundColor: BscColors.surface,
  },
  selectTriggerError: {
    borderColor: BscColors.error,
  },
  selectTriggerDisabled: {
    backgroundColor: BscColors.background,
  },
  selectText: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
    marginRight: BscSpacing.xs,
  },
  selectPlaceholder: {
    color: BscColors.textSecondary,
  },
  selectChevron: {
    fontSize: 20,
    color: BscColors.textPrimary,
  },
  selectModalOverlay: {
    flex: 1,
  },
  selectDropdown: {
    position: 'absolute',
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  selectOption: {
    paddingVertical: BscSpacing.md,
    paddingHorizontal: BscSpacing.md,
  },
  selectOptionSelected: {
    backgroundColor: BscColors.background,
  },
  selectOptionText: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  selectOptionTextSelected: {},

  pillContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.surface,
    padding: 4,
    gap: BscSpacing.xs,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: BscRadius.pill,
    gap: BscSpacing.xs,
  },
  pillSelected: {
    backgroundColor: BscColors.primary,
  },
  pillUnselected: {
    backgroundColor: 'transparent',
  },
  pillLabel: {
    ...BscTextStyles['Body S/14 SemiBold'],
  },
  pillLabelSelected: {
    color: BscColors.textOnDark,
  },
  pillLabelUnselected: {
    color: BscColors.textPrimary,
  },
});
