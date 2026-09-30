import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { BscColors, BscRadius, BscSpacing, BscTextStyles } from '@bsc/ui-native';
import { ButtonOutlinedFlat } from '../commonButtons';
import { ErrorText } from '../forms';
import { Select, type SelectOption } from '../selection';

export interface OtpInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onChangeCode?: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  autoFocus?: boolean;
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
}
function codeLength(length = 6) { return Math.max(1, Math.min(12, Math.floor(length) || 6)); }

export function OtpInput({ value = '', onChange, onChangeCode, onComplete, length, disabled = false, error, success, autoFocus, accessibilityLabel = 'Verification code', containerStyle }: OtpInputProps) {
  const count = codeLength(length);
  const [focused, setFocused] = useState(false);
  const code = value.replace(/\D/g, '').slice(0, count);
  const handleChange = onChange ?? onChangeCode ?? (() => {});
  return <View style={[styles.row, containerStyle]}>
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.cells}>
      {Array.from({ length: count }, (_, index) => <View key={index} style={[styles.cell, focused && index === Math.min(code.length, count - 1) && styles.focused, error && styles.error, disabled && styles.disabled, success && styles.success]}>
        <Text style={[styles.digit, disabled && !success && { color: BscColors.textTertiary }]}>{code[index] ?? ''}</Text>
      </View>)}
    </View>
    <TextInput accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }} value={code} editable={!disabled}
      keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" autoFocus={autoFocus}
      caretHidden selectionColor="transparent" style={styles.input} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      onChangeText={text => {
        if (disabled) return;
        const next = text.replace(/\D/g, '').slice(0, count);
        if (next === code) return;
        handleChange(next);
        if (next.length === count) onComplete?.(next);
      }} />
  </View>;
}

export interface OtpVerificationFieldProps extends OtpInputProps {
  otp?: string;
  options?: readonly SelectOption[];
  selectedValue?: string | number;
  onSelect?: (value: string | number) => void;
  codeSent?: boolean;
  timer?: { finished: boolean; label: string };
  verified?: boolean;
  label?: string;
  otpLabel?: string;
  onOtpChange?: (value: string) => void;
  onVerify?: (value: string) => void;
  onOtpComplete?: (value: string) => void;
  onSend?: () => void;
  onResend?: () => void;
  verifying?: boolean;
  isSending?: boolean;
  resendDisabled?: boolean;
  sendLabel?: string;
  sendButtonText?: string;
  /** Retained for compatibility; completion now invokes onVerify directly. */
  verifyLabel?: string;
  resendLabel?: string;
  resendButtonText?: string;
  sentText?: string;
  errorText?: string;
  otpError?: boolean | string;
}
// `verifyLabel` is intentionally consumed for backward compatibility; verification now happens on OTP completion.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OtpVerificationField({ otp, value, onChange, onChangeCode, onOtpChange, options = [], selectedValue, onSelect, codeSent = false, timer = { finished: true, label: '' }, verified = false, label = 'Verification code', otpLabel, onVerify, onOtpComplete, onSend, onResend, verifying, isSending, resendDisabled, sendLabel = 'Send code', sendButtonText, verifyLabel: _verifyLabel, resendLabel = 'Resend code', resendButtonText, sentText, error, otpError, errorText, onComplete, containerStyle, ...props }: OtpVerificationFieldProps) {
  const effectiveValue = otp ?? value ?? '';
  const effectiveError = Boolean(error || otpError);
  const effectiveErrorText = errorText ?? (typeof otpError === 'string' ? otpError : undefined);
  const handleChange = onChange ?? onOtpChange ?? onChangeCode;
  const handleComplete = (code: string) => {
    onComplete?.(code);
    onOtpComplete?.(code);
    onVerify?.(code);
  };
  const locked = props.disabled || verifying || isSending || verified;
  return <View style={[{ gap: 8 }, containerStyle]}>
    {codeSent && sentText && <Text style={styles.sent}>{sentText}</Text>}
    <View style={styles.selectRow}>
      <View style={{ flex: 1 }}><Select accessibilityLabel="Destination" options={options} value={selectedValue} onChange={value => onSelect?.(value)} disabled={locked || options.length <= 1 || (codeSent && !timer.finished)} /></View>
      {codeSent && !verified && <Text style={styles.timer}>{timer.label}</Text>}
    </View>
    {codeSent ? <>
      <Text style={styles.label}>{otpLabel ?? label}</Text>
      <OtpInput {...props} value={effectiveValue} onChange={handleChange} error={effectiveError} success={verified} disabled={locked} onComplete={handleComplete} />
      {effectiveError && effectiveErrorText && <ErrorText>{effectiveErrorText}</ErrorText>}
      {!verified && timer.finished && onResend && <ButtonOutlinedFlat width="100%" onPress={onResend} disabled={locked || resendDisabled}>{resendButtonText ?? resendLabel}</ButtonOutlinedFlat>}
    </> : <ButtonOutlinedFlat width="100%" onPress={onSend ?? (() => {})} disabled={locked || options.length === 0 || !onSend}>{sendButtonText ?? sendLabel}</ButtonOutlinedFlat>}
  </View>;
}
const styles = StyleSheet.create({
  row: { position: 'relative' },
  cells: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { width: 44, height: 48, borderWidth: 1, borderColor: BscColors.border, borderRadius: BscRadius.sm, backgroundColor: BscColors.surface, alignItems: 'center', justifyContent: 'center' },
  digit: { ...BscTextStyles['Body L/18 Bold'], color: BscColors.textPrimary },
  focused: { borderColor: BscColors.primary, borderWidth: 2 },
  error: { borderColor: BscColors.error },
  success: { borderColor: BscColors.success, backgroundColor: BscColors.surface },
  disabled: { backgroundColor: BscColors.background },
  input: { ...StyleSheet.absoluteFill, color: 'transparent', backgroundColor: 'transparent', fontSize: 18, padding: 0 },
  sent: { ...BscTextStyles['Caption/12 Bold'], color: BscColors.secondary },
  selectRow: { flexDirection: 'row', alignItems: 'center', gap: BscSpacing.xs },
  timer: { ...BscTextStyles['Caption/12 Regular'], color: BscColors.textSecondary },
  label: { ...BscTextStyles['Caption/12 Regular'], color: BscColors.textPrimary },
});
