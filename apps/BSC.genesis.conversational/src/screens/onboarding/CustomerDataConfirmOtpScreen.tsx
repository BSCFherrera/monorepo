import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {RootStackParamList} from '@/types/index';
import {DocumentService, OTPService} from '@services/index';
import {OtpApiError} from '@/types/otpError';
import {AccessOrigin, useOnboardingStore} from '@store/onboarding.store';
import {useAuthStore} from '@store/auth.store';
import {useCountdown} from '@hooks/useCountdown';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {formatName, maskEmail, maskPhone} from '@utils/helpers';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {MaximumIntentsModal} from '@components/onboarding/MaximumIntentsModal';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {ButtonOutlinedFlat} from '@components/Common/ButtonOutlinedFlat';
import {ButtonPill} from '@components/Common/ButtonPill';
import {ErrorText} from '@components/Common/ErrorText';
import {Loader} from '@components/Common/Loader';
import {OtpInput} from '@components/Common/OtpInput';
import {Select, SelectOption} from '@components/Common/Select';
import { Steps } from '@components/Common/Steps';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/**
 *  The screen where the user confirms their email and phone number by entering the OTP codes sent to them.
 *  It handles sending, resending, and verifying the OTP codes for both email and phone.
 * @returns A React component for the Customer Data Confirmation OTP screen.
 */
export const CustomerDataConfirmOtpScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const accessOrigin = useOnboardingStore(state => state.accessOrigin);
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const setVerifiedPhone = useOnboardingStore(state => state.setVerifiedPhone);
  const setVerifiedEmail = useOnboardingStore(state => state.setVerifiedEmail);
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('CustomerDataConfirmOtpScreen');
  const authUser = useAuthStore(state => state.user);
  const keyboardOffset = useKeyboardOffset();
  const authenticate = useAuthStore(state => state.login);

  // En el flujo de login, los datos de contacto vienen del usuario autenticado; en registro, del cliente verificado
  const clientInfo = accessOrigin === AccessOrigin.LOGIN ? authUser : verifiedClient;
  const documentNumber = verifiedClient?.numeroIdentificacion ?? '';

  const [emailSendCount, setEmailSendCount] = useState(0);
  const [phoneSendCount, setPhoneSendCount] = useState(0);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPhoneSending, setIsPhoneSending] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isMaxAttemptsModalOpen, setIsMaxAttemptsModalOpen] = useState(false);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  const emailCodeSent = emailSendCount > 0;
  const phoneCodeSent = phoneSendCount > 0;

  const emailTimer = useCountdown(emailSendCount, RESEND_SECONDS);
  const phoneTimer = useCountdown(phoneSendCount, RESEND_SECONDS);

  const canContinue = emailVerified && phoneVerified;
  const phoneNumber = useMemo(
    () => clientInfo?.telefonos.filter(tel => tel.tipoTelefono === 'Celular') ?? [],
    [clientInfo],
  );
  const emailList = useMemo(() => clientInfo?.emails ?? [], [clientInfo]);

  const selectedPhone = phoneNumber[selectedPhoneIndex];
  const selectedEmail = emailList[selectedEmailIndex];

  // Este es el valor real que se envía al servicio de OTP, sin enmascarar
  const phone = selectedPhone
    ? `${selectedPhone.codigoArea}${selectedPhone.numeroTelefono}`
    : '000-000-0000';
  const email = selectedEmail?.email ?? '';

  // Opciones del Select: la etiqueta se enmascara, pero el value (índice) resuelve al dato real sin modificar
  const emailOptions: SelectOption[] = useMemo(
    () => emailList.map((item, index) => ({label: maskEmail(item.email), value: index})),
    [emailList],
  );

  const phoneOptions: SelectOption[] = useMemo(
    () =>
      phoneNumber.map((item, index) => ({
        label: maskPhone(`${item.codigoArea}${item.numeroTelefono}`),
        value: index,
      })),
    [phoneNumber],
  );

  // Si no hay cliente verificado en el estado global, se regresa a la pantalla anterior
  useEffect(() => {
    if (!clientInfo && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [clientInfo, navigation]);

  if (!clientInfo) {
    return null;
  }

  const client = clientInfo;

  const handleSendCodeError = () => {
    Alert.alert(
      t('customerDataConfirmOtp.sendCodeErrorTitle'),
      t('customerDataConfirmOtp.sendCodeErrorMessage'),
    );
  };

  const getEmailOtpPayloadRequest = () => ({
      identifier: email,
      channel: 'email',
      document: documentNumber,
  });
  const getResendOtpPayloadRequest = (channel: string) => ({
      identifier: channel === 'email' ? email : phone,
      channel: channel,
      document: documentNumber,
  });

  const getSmsOtpPayloadRequest = () => ({
      identifier: phone,
      channel: 'sms',
      document: documentNumber,
  });

  const handleSendEmailOTP = async () => {
    setIsEmailSending(true);
    try {
      const payload = getEmailOtpPayloadRequest();
      await OTPService.requestOTP(payload);
      setEmailSendCount(count => count + 1);
    } catch {
      handleSendCodeError();
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleResendEmailCode = async () => {
    setIsEmailSending(true);
    try {
      const payload = getResendOtpPayloadRequest('email');
      await OTPService.requestResendOTP(payload);
      setEmailOtp('');
      setEmailOtpError(false);
      setEmailSendCount(count => count + 1);
    } catch (error) {
      if (error instanceof OtpApiError && error.code === 'MAX_ATTEMPTS_EXCEEDED') {
        setIsMaxAttemptsModalOpen(true);
      } else {
        handleSendCodeError();
      }
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleSendPhoneCode = async () => {
    setIsPhoneSending(true);
    try {
      const payload = getSmsOtpPayloadRequest();
      await OTPService.requestOTP(payload);
      setPhoneSendCount(count => count + 1);
    } catch {
      handleSendCodeError();
    } finally {
      setIsPhoneSending(false);
    }
  };

  const handleResendPhoneCode = async () => {
    setIsPhoneSending(true);
    try {
      const payload = getResendOtpPayloadRequest('sms');
      await OTPService.requestResendOTP(payload);
      setPhoneOtp('');
      setPhoneOtpError(false);
      setPhoneSendCount(count => count + 1);
    } catch (error) {
      if (error instanceof OtpApiError && error.code === 'MAX_ATTEMPTS_EXCEEDED') {
        setIsMaxAttemptsModalOpen(true);
      } else {
        handleSendCodeError();
      }
    } finally {
      setIsPhoneSending(false);
    }
  };

  const handleEmailOtpComplete = async (code: string) => {
    try {
      const payload = {
          identifier: email,
          channel: 'email',
          document: documentNumber,
          otp: code,
      };
      const isValid = await OTPService.validateOTP(payload);
      setEmailOtpError(!isValid);
      setEmailVerified(isValid);
      if (isValid) {
        setVerifiedEmail(email);
      }
    } catch {
      setEmailOtpError(true);
    }
  };

  const handlePhoneOtpComplete = async (code: string) => {
    try {
      const payload = {
          identifier: phone,
          channel: 'sms',
          document: documentNumber,
          otp: code,
      };
      const isValid = await OTPService.validateOTP(payload);
      setPhoneOtpError(!isValid);
      setPhoneVerified(isValid);
      if (isValid) {
        setVerifiedPhone(phone);
      }
    } catch {
      setPhoneOtpError(true);
    }
  };

  const handleSelectEmail = (value: string | number) => {
    setSelectedEmailIndex(Number(value));
    setEmailSendCount(0);
    setEmailOtp('');
    setEmailOtpError(false);
    setEmailVerified(false);
  };

  const handleSelectPhone = (value: string | number) => {
    setSelectedPhoneIndex(Number(value));
    setPhoneSendCount(0);
    setPhoneOtp('');
    setPhoneOtpError(false);
    setPhoneVerified(false);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleGoToLogin = () => {
    setIsMaxAttemptsModalOpen(false);
    navigation.navigate('Login');
  };

  // Reporta al backend el paso de registro 'unique_agreement' ya con los datos de contacto
  // confirmados. Es un proceso aislado de la obtención del documento de firma: su fallo se
  // maneja de forma independiente y no debe mezclarse con el error de carga del documento.
  const registerUniqueAgreementStep = (): Promise<boolean> => {
    return updateRegistrationStep(REGISTRATION_STEPS.UNIQUE_AGREEMENT);
  };

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }

    switch (accessOrigin) {
      case AccessOrigin.LOGIN:
        authenticate();
        break;
      case AccessOrigin.CONFIGURATION:
        // TODO: definir navegación para el flujo de configuración
        break;
      case AccessOrigin.REGISTER:
      default:
        setIsLoadingDocument(true);
        try {
          const stepRegistered = await registerUniqueAgreementStep();
          if (!stepRegistered) {
            return;
          }

          const {localUri, fileName} = await DocumentService.getSignatureDocument();
          navigation.navigate('SignDocument', {
            documentUri: localUri,
            fileName,
            phone: phone,
            cedula: documentNumber,
          });
        } catch {
          Alert.alert(
            t('customerDataConfirmOtp.loadDocumentErrorTitle'),
            t('customerDataConfirmOtp.loadDocumentErrorMessage'),
          );
        } finally {
          setIsLoadingDocument(false);
        }
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBackButton onBackPress={handleBack}  />
      <Steps totalSteps={3} currentStep={2} containerStyle={styles.steps} />
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {t('customerDataConfirmOtp.title', {firstName: formatName(client.primerNombre)})}
          </Text>

          <View style={styles.fieldGroup}>
            {emailCodeSent && (
              <Text style={styles.sentText}>{t('customerDataConfirmOtp.email.codeSent')}</Text>
            )}
            <View style={styles.selectRow}>
              <Select
                data={emailOptions}
                value={selectedEmailIndex}
                onSelect={handleSelectEmail}
                disabled={
                  emailOptions.length <= 1 ||
                  isEmailSending ||
                  emailVerified ||
                  (emailCodeSent && !emailTimer.finished)
                }
                containerStyle={styles.selectField}
              />
              {emailCodeSent && !emailVerified && (
                <Text style={styles.timerText}>{emailTimer.label}</Text>
              )}
            </View>

            {emailCodeSent ? (
              <>
                <Text style={styles.otpLabel}>{t('customerDataConfirmOtp.email.otpLabel')}</Text>
                <OtpInput
                  length={OTP_LENGTH}
                  value={emailOtp}
                  onChangeCode={code => {
                    setEmailOtp(code);
                    setEmailOtpError(false);
                  }}
                  onComplete={handleEmailOtpComplete}
                  error={emailOtpError}
                  success={emailVerified}
                  disabled={emailVerified}
                  autoFocus
                />
                {emailOtpError && <ErrorText text={t('customerDataConfirmOtp.otpError')} />}
                {!emailVerified && emailTimer.finished && (
                  <ButtonOutlinedFlat
                    width="100%"
                    onPress={handleResendEmailCode}
                    disabled={isEmailSending}>
                    {t('customerDataConfirmOtp.resendCodeButton')}
                  </ButtonOutlinedFlat>
                )}
              </>
            ) : (
              <ButtonOutlinedFlat
                width="100%"
                onPress={handleSendEmailOTP}
                disabled={isEmailSending}>
                {t('customerDataConfirmOtp.sendCodeButton')}
              </ButtonOutlinedFlat>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldGroup}>
            {phoneCodeSent && (
              <Text style={styles.sentText}>{t('customerDataConfirmOtp.phone.codeSent')}</Text>
            )}
            <View style={styles.selectRow}>
              <Select
                data={phoneOptions}
                value={selectedPhoneIndex}
                onSelect={handleSelectPhone}
                disabled={
                  phoneOptions.length <= 1 ||
                  isPhoneSending ||
                  phoneVerified ||
                  (phoneCodeSent && !phoneTimer.finished)
                }
                containerStyle={styles.selectField}
              />
              {phoneCodeSent && !phoneVerified && (
                <Text style={styles.timerText}>{phoneTimer.label}</Text>
              )}
            </View>

            {phoneCodeSent ? (
              <>
                <Text style={styles.otpLabel}>{t('customerDataConfirmOtp.phone.otpLabel')}</Text>
                <OtpInput
                  length={OTP_LENGTH}
                  value={phoneOtp}
                  onChangeCode={code => {
                    setPhoneOtp(code);
                    setPhoneOtpError(false);
                  }}
                  onComplete={handlePhoneOtpComplete}
                  error={phoneOtpError}
                  success={phoneVerified}
                  disabled={phoneVerified}
                />
                {phoneOtpError && <ErrorText text={t('customerDataConfirmOtp.otpError')} />}
                {!phoneVerified && phoneTimer.finished && (
                  <ButtonOutlinedFlat
                    width="100%"
                    onPress={handleResendPhoneCode}
                    disabled={isPhoneSending}>
                    {t('customerDataConfirmOtp.resendCodeButton')}
                  </ButtonOutlinedFlat>
                )}
              </>
            ) : (
              <ButtonOutlinedFlat
                width="100%"
                onPress={handleSendPhoneCode}
                disabled={isPhoneSending}>
                {t('customerDataConfirmOtp.sendCodeButton')}
              </ButtonOutlinedFlat>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomButtons}>
          <ButtonPill
            onPress={handleContinue}
            disabled={!canContinue || isLoadingDocument}
            width="100%"
            backgroundColor={COLORS.primary}
            textColor={COLORS.backgroundLight}>
            {t('customerDataConfirmOtp.continueButton')}
          </ButtonPill>
          <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>{t('customerDataConfirmOtp.exitButton')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <MaximumIntentsModal
        visible={isMaxAttemptsModalOpen}
        onClose={() => {}}
        onGoToHome={handleGoToLogin}
      />
      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
      <Loader visible={isLoadingDocument} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  steps: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.lg,
  },
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: SPACING.lg,
  },
  bottomButtons: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  exitButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  exitButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: SPACING.sm,
  },
});
