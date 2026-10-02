import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscTextButton } from './BscButton';
import { BscErrorText } from './BscErrorText';
import { BscOtpInput } from './BscOtpInput';

export interface BscOtpCodeFieldTimer {
  finished: boolean;
  label: string;
}

export interface BscOtpCodeFieldProps {
  otp?: string;
  value?: string;
  changeOtp?: (value: string) => void;
  onChange?: (value: string) => void;
  onChangeText?: (value: string) => void;
  validate?: (value: string) => void | Promise<void>;
  onCompleted?: (value: string) => void | Promise<void>;
  resend?: () => void | Promise<void>;
  onResend?: () => void | Promise<void>;
  length?: number;
  codeSent?: boolean;
  hasRequest?: boolean;
  isSending?: boolean;
  hasError?: boolean;
  isVerified?: boolean;
  timer?: BscOtpCodeFieldTimer;
  label?: string;
  countdownPrefix?: string;
  resendLabel?: string;
  errorText?: string;
  errorMessage?: string;
  disabled?: boolean;
  enabled?: boolean;
  autoFocus?: boolean;
  clearOn?: number;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BscOtpCodeField({
  otp,
  value,
  changeOtp,
  onChange,
  onChangeText,
  validate,
  onCompleted,
  resend,
  onResend,
  length = 6,
  codeSent,
  hasRequest,
  isSending = false,
  hasError = false,
  isVerified = false,
  timer,
  label = 'Código de verificación',
  countdownPrefix = 'Podrás reenviar el código en',
  resendLabel = 'Reenviar código',
  errorText,
  errorMessage,
  disabled = false,
  enabled = true,
  autoFocus = false,
  clearOn,
  containerStyle,
  testID,
}: BscOtpCodeFieldProps): React.JSX.Element {
  const currentValue = otp ?? value ?? '';
  const requested = codeSent ?? hasRequest ?? true;
  const blocked = disabled || !enabled || isSending || isVerified || !requested;
  const canResend = requested && !isVerified && (timer?.finished ?? true);
  const resendAction = resend ?? onResend;

  const change = (nextValue: string): void => {
    changeOtp?.(nextValue);
    onChange?.(nextValue);
    onChangeText?.(nextValue);
  };

  const complete = (code: string): void => {
    onCompleted?.(code);
    validate?.(code);
  };

  const handleResend = (): void => {
    resendAction?.();
  };

  return (
    <View style={[styles.fieldGroup, containerStyle]} testID={testID}>
      <Text style={styles.label}>{label}</Text>

      <BscOtpInput
        length={length}
        value={currentValue}
        onChangeText={change}
        onCompleted={complete}
        hasError={hasError}
        verified={isVerified}
        separatorAfter={3}
        enabled={!blocked}
        autoFocus={autoFocus}
        clearOn={clearOn}
      />

      <BscErrorText text={hasError ? errorText ?? errorMessage : undefined} />

      {requested && !isVerified && timer?.finished === false ? (
        <View style={styles.countdownRow}>
          <Text style={styles.countdownText}>{countdownPrefix}</Text>
          <Text style={styles.countdownPill}>{timer.label}</Text>
        </View>
      ) : null}

      {!isVerified ? (
        <BscTextButton
          label={resendLabel}
          onPress={handleResend}
          disabled={!canResend || isSending || resendAction === undefined}
          testID={testID === undefined ? undefined : `${testID}-resend`}
          style={styles.resendButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: BscSpacing.sm,
  },
  label: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textPrimary,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  countdownText: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  countdownPill: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.primary,
    backgroundColor: BscColors.primarySoft,
    borderRadius: BscRadius.pill,
    paddingHorizontal: BscSpacing.xs,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  resendButton: {
    alignSelf: 'center',
  },
});
