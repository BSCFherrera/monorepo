import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscSecondaryButton } from './BscButton';
import { BscErrorText } from './BscErrorText';
import { BscOtpInput } from './BscOtpInput';
import { BscSelect } from './BscSelect';

export interface BscOtpVerificationOption {
  label: string;
  value: string | number;
  detail?: string;
  disabled?: boolean;
}

export interface BscOtpVerificationFieldProps {
  value?: string;
  otp?: string;
  onChange?: (value: string) => void;
  onChangeCode?: (value: string) => void;
  onChangeText?: (value: string) => void;
  onOtpChange?: (value: string) => void;
  onCompleted?: (value: string) => void;
  onComplete?: (value: string) => void;
  onOtpComplete?: (value: string) => void;
  onVerify?: (value: string) => void;
  onSend?: () => void;
  onResend?: () => void;
  length?: number;
  autoFocus?: boolean;
  clearOn?: number;
  options?: readonly BscOtpVerificationOption[];
  selectedValue?: string | number | null;
  onSelect?: (value: string | number) => void;
  selectTitle?: string;
  selectPlaceholder?: string;
  codeSent?: boolean;
  timer?: { finished: boolean; label: string };
  verified?: boolean;
  label?: string;
  otpLabel?: string;
  sentText?: string;
  error?: boolean;
  hasError?: boolean;
  errorText?: string;
  errorMessage?: string;
  otpError?: boolean | string;
  disabled?: boolean;
  enabled?: boolean;
  verifying?: boolean;
  isSending?: boolean;
  resendDisabled?: boolean;
  sendLabel?: string;
  sendButtonText?: string;
  verifyLabel?: string;
  resendLabel?: string;
  resendButtonText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

function optionKey(value: string | number): string {
  return String(value);
}

export function BscOtpVerificationField({
  value,
  otp,
  onChange,
  onChangeCode,
  onChangeText,
  onOtpChange,
  onCompleted,
  onComplete,
  onOtpComplete,
  onVerify,
  onSend,
  onResend,
  length = 6,
  autoFocus,
  clearOn,
  options = [],
  selectedValue,
  onSelect,
  selectTitle = 'Destination',
  selectPlaceholder = 'Select destination',
  codeSent = false,
  timer = { finished: true, label: '' },
  verified = false,
  label = 'Verification code',
  otpLabel,
  sentText,
  error,
  hasError,
  errorText,
  errorMessage,
  otpError,
  disabled,
  enabled = true,
  verifying,
  isSending,
  resendDisabled,
  sendLabel = 'Send code',
  sendButtonText,
  verifyLabel: _verifyLabel,
  resendLabel = 'Resend code',
  resendButtonText,
  containerStyle,
  testID,
}: BscOtpVerificationFieldProps): React.JSX.Element {
  const currentValue = otp ?? value ?? '';
  const blocked = Boolean(disabled || !enabled || verifying || isSending || verified);
  const hasErrorState = Boolean(error || hasError || otpError);
  const errorContent = errorText ?? errorMessage ?? (typeof otpError === 'string' ? otpError : undefined);
  const change = onChange ?? onOtpChange ?? onChangeCode ?? onChangeText ?? (() => {});
  const complete = (code: string): void => {
    onCompleted?.(code);
    onComplete?.(code);
    onOtpComplete?.(code);
    onVerify?.(code);
  };
  const selectOptions = options.map(option => ({
    key: optionKey(option.value),
    label: option.label,
    detail: option.detail,
    value: option.value,
  }));
  const selectedKey = selectedValue === undefined || selectedValue === null ? null : optionKey(selectedValue);
  const selectDisabled = blocked || options.length <= 1 || (codeSent && !timer.finished);

  return (
    <View style={[styles.fieldGroup, containerStyle]} testID={testID}>
      {codeSent && sentText !== undefined ? <Text style={styles.sentText}>{sentText}</Text> : null}

      <View style={styles.selectRow}>
        <View style={styles.selectField}>
          <BscSelect
            title={selectTitle}
            placeholder={selectPlaceholder}
            options={selectOptions}
            selectedKey={selectedKey}
            onSelect={option => onSelect?.(option.value)}
            enabled={!selectDisabled}
          />
        </View>
        {codeSent && !verified ? <Text style={styles.timerText}>{timer.label}</Text> : null}
      </View>

      {codeSent ? (
        <>
          <Text style={styles.otpLabel}>{otpLabel ?? label}</Text>
          <BscOtpInput
            length={length}
            value={currentValue}
            onChangeText={change}
            onCompleted={complete}
            hasError={hasErrorState}
            enabled={!blocked}
            autoFocus={autoFocus}
            clearOn={clearOn}
          />
          <BscErrorText text={hasErrorState ? errorContent : undefined} />
          {!verified && timer.finished && onResend !== undefined ? (
            <BscSecondaryButton
              label={resendButtonText ?? resendLabel}
              onPress={onResend}
              disabled={blocked || resendDisabled}
              loading={isSending}
              style={styles.fullWidthButton}
            />
          ) : null}
        </>
      ) : (
        <BscSecondaryButton
          label={sendButtonText ?? sendLabel}
          onPress={onSend}
          disabled={blocked || options.length === 0 || onSend === undefined}
          loading={isSending}
          style={styles.fullWidthButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: BscSpacing.sm,
  },
  sentText: {
    ...BscTextStyles['Caption/12 Bold'],
    color: BscColors.secondary,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
  },
  selectField: {
    flex: 1,
  },
  timerText: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  otpLabel: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textPrimary,
  },
  fullWidthButton: {
    width: '100%',
  },
});
