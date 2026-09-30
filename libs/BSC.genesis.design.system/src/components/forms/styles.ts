import { StyleSheet } from 'react-native';

import { tokens } from '../../tokens';

export const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
    gap: tokens.spacing.xs,
  },
  errorText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.error,
    flex: 1,
  },
  inputContainer: {
    marginBottom: tokens.spacing.md,
  },
  inputLabel: {
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: tokens.dimensions.inputHeight,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  inputFieldFocused: {
    borderColor: tokens.colors.primary,
    borderWidth: 2,
  },
  inputFieldError: {
    borderColor: tokens.colors.error,
  },
  inputFieldDisabled: {
    backgroundColor: tokens.colors.backgroundDark,
  },
  inputInput: {
    flex: 1,
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
    fontWeight: tokens.fontWeights.regular,
  },
  copyLabel: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.primary,
    fontWeight: tokens.fontWeights.medium,
  },
  helperText: {
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing.xs,
  },
  textFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: tokens.dimensions.inputHeight,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  textFieldInput: {
    flex: 1,
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
    paddingVertical: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: tokens.dimensions.iconSize.md,
    height: tokens.dimensions.iconSize.md,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.primary,
  },
  checkboxLabel: {
    marginLeft: tokens.spacing.sm,
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
  },
  checkboxLabelContainer: {
    marginLeft: tokens.spacing.sm,
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  toggleLabel: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
    flex: 1,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: tokens.colors.primary,
  },
  toggleTrackOff: {
    backgroundColor: tokens.colors.border,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
  },
  meterContainer: {
    marginTop: tokens.spacing.sm,
  },
  meterRow: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
  },
  meterSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  meterLabel: {
    fontSize: tokens.fontSizes.xs,
    fontWeight: tokens.fontWeights.bold,
    marginTop: tokens.spacing.xs,
    textTransform: 'uppercase',
  },
});
