import { StyleSheet } from 'react-native';
import { tokens } from '../../tokens';

export const styles = StyleSheet.create({
  selectWrapper: {},
  selectLabel: {
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: tokens.dimensions.inputHeight,
    borderWidth: 1,
    borderRadius: tokens.radii.md,
    borderColor: tokens.colors.border,
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
  },
  selectTriggerError: {
    borderColor: tokens.colors.error,
  },
  selectTriggerDisabled: {
    backgroundColor: tokens.colors.backgroundDark,
  },
  selectText: {
    flex: 1,
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
    marginRight: tokens.spacing.sm,
  },
  selectPlaceholder: {
    color: tokens.colors.textSecondary,
  },
  selectChevron: {
    fontSize: 20,
    color: tokens.colors.text,
  },
  selectModalOverlay: {
    flex: 1,
  },
  selectDropdown: {
    position: 'absolute',
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  selectOption: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
  },
  selectOptionSelected: {
    backgroundColor: tokens.colors.selectedOption,
  },
  selectOptionText: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
  },
  selectOptionTextSelected: {},

  pillContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surface,
    padding: 4,
    gap: tokens.spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: tokens.dimensions.inputHeight - 8,
    borderRadius: tokens.radii.pill,
    gap: tokens.spacing.sm,
  },
  pillSelected: {
    backgroundColor: tokens.colors.primary,
  },
  pillUnselected: {
    backgroundColor: 'transparent',
  },
  pillLabel: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.semibold,
  },
  pillLabelSelected: {
    color: '#FFFFFF',
  },
  pillLabelUnselected: {
    color: tokens.colors.text,
  },
});
