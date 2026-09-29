import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Select, SelectOption} from '@components/Common/Select';
import {OtpInput} from '@components/Common/OtpInput';
import {ButtonOutlinedFlat} from '@components/Common/ButtonOutlinedFlat';
import {ErrorText} from '@components/Common/ErrorText';

import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

const OTP_LENGTH = 6;

interface OtpVerificationFieldProps {
  options: SelectOption[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;

  codeSent: boolean;
  isSending: boolean;
  verified: boolean;

  timer: {
    finished: boolean;
    label: string;
  };

  otp: string;
  otpError: boolean;

  onOtpChange: (code: string) => void;
  onOtpComplete: (code: string) => void | Promise<void>;

  onSend: () => void | Promise<void>;
  onResend: () => void | Promise<void>;

  sentText: string;
  otpLabel: string;
  otpErrorText: string;

  sendButtonText: string;
  resendButtonText: string;

  autoFocus?: boolean;
}

export const OtpVerificationField = ({
  options,
  selectedValue,
  onSelect,

  codeSent,
  isSending,
  verified,

  timer,

  otp,
  otpError,

  onOtpChange,
  onOtpComplete,

  onSend,
  onResend,

  sentText,
  otpLabel,
  otpErrorText,

  sendButtonText,
  resendButtonText,

  autoFocus = false,
}: OtpVerificationFieldProps) => {
  const selectDisabled =
    options.length <= 1 || isSending || verified || (codeSent && !timer.finished);

  return (
    <View style={styles.fieldGroup}>
      {codeSent && <Text style={styles.sentText}>{sentText}</Text>}

      <View style={styles.selectRow}>
        <Select
          data={options}
          value={selectedValue}
          onSelect={onSelect}
          disabled={selectDisabled}
          containerStyle={styles.selectField}
        />

        {codeSent && !verified && <Text style={styles.timerText}>{timer.label}</Text>}
      </View>

      {codeSent ? (
        <>
          <Text style={styles.otpLabel}>{otpLabel}</Text>

          <OtpInput
            length={OTP_LENGTH}
            value={otp}
            onChangeCode={onOtpChange}
            onComplete={onOtpComplete}
            error={otpError}
            success={verified}
            disabled={verified}
            autoFocus={autoFocus}
          />

          {otpError && <ErrorText text={otpErrorText} />}

          {!verified && timer.finished && (
            <ButtonOutlinedFlat width="100%" onPress={onResend} disabled={isSending}>
              {resendButtonText}
            </ButtonOutlinedFlat>
          )}
        </>
      ) : (
        <ButtonOutlinedFlat
          width="100%"
          onPress={onSend}
          disabled={isSending || options.length === 0}>
          {sendButtonText}
        </ButtonOutlinedFlat>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    gap: SPACING.sm,
  },

  sentText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.secondary,
  },

  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  selectField: {
    flex: 1,
  },

  timerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  otpLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
});
