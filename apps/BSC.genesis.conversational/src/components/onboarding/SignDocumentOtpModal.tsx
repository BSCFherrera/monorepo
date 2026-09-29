import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {ModalCentered} from '@components/Common/ModalCentered';
import {ButtonOutlinedFlat} from '@components/Common/ButtonOutlinedFlat';
import {ButtonPill} from '@components/Common/ButtonPill';
import {ErrorText} from '@components/Common/ErrorText';
import {OtpInput} from '@components/Common/OtpInput';
import {MaximumIntentsModal} from '@components/onboarding/MaximumIntentsModal';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {RootStackParamList} from '@/types/index';
import {DocumentSignatureOtpApiError} from '@services/index';
import {OTPService} from '@services/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 10;

// Enmascara el teléfono dejando visibles solo los últimos 4 dígitos
const maskPhone = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  const lastFour = digits.slice(-4);
  return `***${lastFour}`;
};

// Cuenta regresiva en segundos. Se reinicia cada vez que "sendTrigger" cambia
const useCountdown = (sendTrigger: number, initialSeconds: number = RESEND_SECONDS) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (sendTrigger === 0) {
      return;
    }
    setSeconds(initialSeconds);
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [sendTrigger, initialSeconds]);

  return {seconds, finished: seconds === 0};
};

interface SignDocumentOtpModalProps {
  visible: boolean;
  phone: string;
  cedula: string;
  onClose: () => void;
}

export const SignDocumentOtpModal: React.FC<SignDocumentOtpModalProps> = ({
  visible,
  phone,
  cedula,
  onClose,
}) => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('SignDocumentOtpModal');

  const [sendTrigger, setSendTrigger] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isMaxAttemptsModalOpen, setIsMaxAttemptsModalOpen] = useState(false);

  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);
  const timer = useCountdown(sendTrigger);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setOtp('');
    setOtpError(false);
    setOtpVerified(false);
    handleSendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSendCodeError = () => {
    Alert.alert(
      t('signDocumentOtpModal.sendCodeErrorTitle'),
      t('signDocumentOtpModal.sendCodeErrorMessage'),
    );
  };

  const handleSendCode = async () => {
    setIsSending(true);
    try {
      await OTPService.requestOTP({
        identifier: phone,
        channel: 'sms',
        document: cedula,
      });
      setSendTrigger(count => count + 1);
    } catch {
      handleSendCodeError();
    } finally {
      setIsSending(false);
    }
  };

  const handleResendCode = async () => {
    setIsSending(true);
    try {
      await OTPService.requestResendOTP({
        identifier: phone,
        channel: 'sms',
        document: cedula,
      });
      setOtp('');
      setOtpError(false);
      setSendTrigger(count => count + 1);
    } catch (error) {
      if (error instanceof DocumentSignatureOtpApiError && error.code === 'MAX_ATTEMPTS_EXCEEDED') {
        setIsMaxAttemptsModalOpen(true);
      } else {
        handleSendCodeError();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpComplete = async (code: string) => {
    try {
      const isValid = await OTPService.validateOTP({
        identifier: phone,
        channel: 'sms',
        document: cedula,
        otp: code,
      });
      setOtpError(!isValid);
      setOtpVerified(isValid);
    } catch {
      setOtpError(true);
    }
  };

  const handleGoToLogin = () => {
    setIsMaxAttemptsModalOpen(false);
    onClose();
    navigation.navigate('Login');
  };

  // Reporta al backend el paso de registro 'password_creation' antes de avanzar a la creación
  // de usuario. Es un proceso aislado de la firma del documento: su fallo se maneja de forma
  // independiente y no debe mezclarse con el error de validación del OTP.
  const registerPasswordCreationStep = (): Promise<boolean> => {
    return updateRegistrationStep(REGISTRATION_STEPS.PASSWORD_CREATION);
  };

  const handleSign = async () => {
    if (!otpVerified) {
      return;
    }

    const stepRegistered = await registerPasswordCreationStep();
    if (!stepRegistered) {
      return;
    }

    onClose();
    navigation.navigate('CreateUserOnboarding', {cedula});
  };

  return (
    <>
      <ModalCentered visible={visible} onClose={onClose} contentStyle={styles.modalContent}>
        <Text style={styles.title}>{t('signDocumentOtpModal.title', {phone: maskedPhone})}</Text>

        <OtpInput
          length={OTP_LENGTH}
          value={otp}
          onChangeCode={code => {
            setOtp(code);
            setOtpError(false);
          }}
          onComplete={handleOtpComplete}
          error={otpError}
          success={otpVerified}
          disabled={otpVerified}
          autoFocus
          containerStyle={styles.otpContainer}
        />

        {otpError && (
          <ErrorText
            text={t('signDocumentOtpModal.otpError')}
            containerStyle={styles.centeredMessage}
          />
        )}
        {otpVerified && (
          <Text style={styles.successText}>{t('signDocumentOtpModal.otpSuccess')}</Text>
        )}

        {!otpVerified && (
          <>
            {!timer.finished ? (
              <Text style={styles.countdownText}>
                {t('signDocumentOtpModal.resendCountdown', {seconds: timer.seconds})}
              </Text>
            ) : (
              <ButtonOutlinedFlat
                width="100%"
                onPress={handleResendCode}
                disabled={isSending}
                containerStyle={styles.resendButton}>
                {t('signDocumentOtpModal.resendButton')}
              </ButtonOutlinedFlat>
            )}
          </>
        )}

        <ButtonPill
          onPress={handleSign}
          disabled={!otpVerified}
          width="100%"
          backgroundColor={COLORS.success}
          textColor={COLORS.backgroundLight}
          containerStyle={styles.signButton}>
          {t('signDocumentOtpModal.signButton')}
        </ButtonPill>

        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelText}>{t('signDocumentOtpModal.cancelButton')}</Text>
        </TouchableOpacity>
      </ModalCentered>

      <MaximumIntentsModal
        visible={isMaxAttemptsModalOpen}
        onClose={() => {}}
        onGoToHome={handleGoToLogin}
      />

      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
    </>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  otpContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  centeredMessage: {
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  countdownText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  resendButton: {
    marginBottom: SPACING.md,
  },
  signButton: {
    marginTop: SPACING.xs,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
});
