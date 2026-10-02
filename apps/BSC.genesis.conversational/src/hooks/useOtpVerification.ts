import { useState } from 'react';
import { useCountdown } from './useCountdown';
import { OTPService } from '@services/index';
import { OtpApiError } from '@/types/otpError';
import { OtpChannel } from '../types';

interface UseOtpVerificationParams {
  identifier: string;
  document: string;
  channel: OtpChannel | '';
  resendSeconds?: number;
  onVerified?: (identifier: string) => void;
  onMaxAttempts?: () => void;
  onError?: () => void;
}

export interface UseOtpVerification {
  otp: string;
  codeSent: boolean;
  isSending: boolean;
  hasError: boolean;
  isVerified: boolean;
  timer: {
    label: string;
    finished: boolean;
  };
  hasRequest: boolean;
  send: () => Promise<void>;
  resend: () => Promise<void>;
  validate: (code: string) => Promise<void>;
  changeOtp: (code: string) => void;
  reset: () => void;
  setHasRequest: React.Dispatch<React.SetStateAction<boolean>>;
}

const RESEND_SECONDS = 60;

export const useOtpVerification = (params: UseOtpVerificationParams) => {
  const {
    identifier,
    document,
    channel,
    resendSeconds = RESEND_SECONDS,
    onVerified,
    onMaxAttempts,
    onError,
  } = params;
  const [otp, setOtp] = useState('');
  const [sendCount, setSendCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);

  const timer = useCountdown(sendCount, resendSeconds);

  const codeSent = sendCount > 0;

  const buildPayload = () => ({
    identifier,
    channel,
    document,
  });

  const send = async () => {
    if (!identifier) return;

    setIsSending(true);
    setIsVerified(false);

    try {
      await OTPService.requestOTP(buildPayload());
      setHasRequest(true);
      setSendCount(count => count + 1);
    } catch {
      onError?.();
      setHasRequest(false);
    } finally {
      setIsSending(false);
    }
  };

  const resend = async () => {
    if (!identifier) return;

    setIsSending(true);

    try {
      await OTPService.requestResendOTP(buildPayload());

      setHasRequest(true);
      setIsVerified(false);
      setOtp('');
      setHasError(false);
      setSendCount(count => count + 1);
    } catch (error) {
      if (error instanceof OtpApiError && error.code === 'MAX_ATTEMPTS_EXCEEDED') {
        onMaxAttempts?.();
        return;
      }

      onError?.();
    } finally {
      setIsSending(false);
    }
  };

  const validate = async (code: string) => {
    try {
      const isValid = await OTPService.validateOTP({
        ...buildPayload(),
        otp: code,
      });

      setHasError(!isValid);
      setIsVerified(isValid);

      if (isValid) {
        onVerified?.(identifier);
      }
    } catch {
      setHasError(true);
    }
  };

  const changeOtp = (code: string) => {
    setOtp(code);
    setHasError(false);
  };

  const reset = () => {
    setOtp('');
    setHasRequest(false);
    setSendCount(0);
    setHasError(false);
    setIsVerified(false);
  };

  return {
    otp,
    codeSent,
    isSending,
    hasError,
    isVerified,
    timer,
    hasRequest,

    send,
    resend,
    validate,
    changeOtp,
    reset,
    setHasRequest,
  };
};
