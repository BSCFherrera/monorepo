import { StyleSheet } from 'react-native';

import { BscColors, BscRadius, BscSpacing, BscTextStyles } from '@bsc/ui-native';

export const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: BscSpacing.xxs,
    gap: BscSpacing.xxs,
  },
  errorText: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.error,
    flex: 1,
  },
  inputContainer: {
    marginBottom: BscSpacing.md,
  },
  inputLabel: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textPrimary,
    marginBottom: BscSpacing.xxs,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    paddingHorizontal: BscSpacing.md,
    gap: BscSpacing.xs,
  },
  inputFieldFocused: {
    borderColor: BscColors.primary,
    borderWidth: 2,
  },
  inputFieldError: {
    borderColor: BscColors.error,
  },
  inputFieldDisabled: {
    backgroundColor: BscColors.background,
  },
  inputInput: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  copyLabel: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.primary,
  },
  helperText: {
    fontSize: 10,
    color: BscColors.textSecondary,
    marginTop: BscSpacing.xxs,
  },
  textFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    paddingHorizontal: BscSpacing.md,
    gap: BscSpacing.xs,
  },
  textFieldInput: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
    paddingVertical: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: BscColors.border,
    borderRadius: BscRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    borderColor: BscColors.primary,
    backgroundColor: BscColors.primary,
  },
  checkboxLabel: {
    marginLeft: BscSpacing.xs,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  checkboxLabelContainer: {
    marginLeft: BscSpacing.xs,
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  toggleLabel: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
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
    backgroundColor: BscColors.primary,
  },
  toggleTrackOff: {
    backgroundColor: BscColors.border,
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
    marginTop: BscSpacing.xs,
  },
  meterRow: {
    flexDirection: 'row',
    gap: BscSpacing.xxs,
  },
  meterSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  meterLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: BscSpacing.xxs,
    textTransform: 'uppercase',
  },
});
