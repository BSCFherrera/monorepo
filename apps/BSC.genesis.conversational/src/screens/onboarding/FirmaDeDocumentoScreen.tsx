import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {RootStackParamList} from '@/types/index';
import {DocumentSignatureOtpApiError, DocumentService, OTPService} from '@services/index';
import {useOnboardingStore} from '@store/index';
import {useCountdown} from '@hooks/useCountdown';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {maskPhone} from '@utils/helpers';

// COMPONENTS
import {MaximumIntentsModal} from '@components/onboarding/MaximumIntentsModal';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {PdfFullScreenViewer} from '@components/onboarding/PdfFullScreenViewer';
import {
  BscBanner,
  BscColors,
  BscLoadingOverlay,
  BscNavigationHeader,
  BscOtpCodeField,
  BscPrimaryButton,
  BscSelectableListGroup,
  BscSelectableListGroupOption,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export const FirmaDeDocumentoScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const verifiedEmail = useOnboardingStore(state => state.verifiedEmail);
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('FirmaDeDocumentoScreen');
  const keyboardOffset = useKeyboardOffset();

  const documentNumber = verifiedClient?.numeroIdentificacion ?? '';
  const phoneList = useMemo(
    () => verifiedClient?.telefonos.filter(tel => tel.tipoTelefono === 'Celular') ?? [],
    [verifiedClient],
  );

  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [documentUri, setDocumentUri] = useState('');
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [isLoadDocumentError, setIsLoadDocumentError] = useState(false);

  const [sendCount, setSendCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isMaxAttemptsModalOpen, setIsMaxAttemptsModalOpen] = useState(false);

  const codeSent = sendCount > 0;
  const timer = useCountdown(sendCount, RESEND_SECONDS);

  const selectedPhone = phoneList[selectedPhoneIndex];
  const phone = selectedPhone
    ? `${selectedPhone.codigoArea}${selectedPhone.numeroTelefono}`
    : '000-000-0000';

  const phoneOptions: readonly BscSelectableListGroupOption[] = useMemo(
    () =>
      phoneList.map((item, index) => ({
        value: String(index),
        icon: 'smartphone' as const,
        title: maskPhone(`${item.codigoArea}${item.numeroTelefono}`),
      })),
    [phoneList],
  );

  // Carga el documento a firmar al entrar a la pantalla (antes vivía en el modal de firma).
  const loadDocument = useCallback(async () => {
    setIsLoadingDocument(true);
    setIsLoadDocumentError(false);
    try {
      const {localUri} = await DocumentService.getSignatureDocument();
      setDocumentUri(localUri);
    } catch {
      setIsLoadDocumentError(true);
      Alert.alert(
        t('firmaDeDocumento.loadDocumentErrorTitle'),
        t('firmaDeDocumento.loadDocumentErrorMessage'),
      );
    } finally {
      setIsLoadingDocument(false);
    }
  }, [t]);

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDocument = () => {
    if (documentUri) {
      setIsViewerVisible(true);
    }
  };

  const handleChangeEmail = () => {
    navigation.navigate('SelectUsername', {cedula: documentNumber});
  };

  const handleSendCodeError = () => {
    Alert.alert(
      t('firmaDeDocumento.sendCodeErrorTitle'),
      t('firmaDeDocumento.sendCodeErrorMessage'),
    );
  };

  // Reporta al backend el paso de registro 'liveness_and_ocr' al iniciar la firma del documento.
  const registerLivenessAndOcrStep = (): Promise<boolean> => {
    return updateRegistrationStep(REGISTRATION_STEPS.LIVENESS_AND_OCR);
  };

  const handleSendCode = async () => {
    const stepRegistered = await registerLivenessAndOcrStep();
    if (!stepRegistered) {
      return;
    }

    setIsSending(true);
    try {
      await OTPService.requestOTP({identifier: phone, channel: 'sms', document: documentNumber});
      setSendCount(count => count + 1);
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
        document: documentNumber,
      });
      setOtp('');
      setOtpError(false);
      setSendCount(count => count + 1);
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

  const handleValidateCode = async (code: string) => {
    try {
      const isValid = await OTPService.validateOTP({
        identifier: phone,
        channel: 'sms',
        document: documentNumber,
        otp: code,
      });
      setOtpError(!isValid);
      setOtpVerified(isValid);
      if (isValid) {
        navigation.replace('RegistroFinalizado');
      }
    } catch {
      setOtpError(true);
    }
  };

  const handleGoToLogin = () => {
    setIsMaxAttemptsModalOpen(false);
    navigation.navigate('Login');
  };

  const handleExit = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader
        onBack={handleExit}
        showSupportButton
        title={codeSent ? t('firmaDeDocumento.otpTitle') : t('firmaDeDocumento.title')}
      />
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!codeSent ? (
            <>
              <Text style={styles.title}>{t('firmaDeDocumento.title')}</Text>
              <Text style={styles.subtitle}>{t('firmaDeDocumento.subtitle')}</Text>

              <Text style={styles.reviewLabel}>{t('firmaDeDocumento.reviewDocumentLabel')}</Text>
              <BscTextButton
                label={t('firmaDeDocumento.documentLinkLabel')}
                onPress={handleOpenDocument}
                disabled={!documentUri}
                style={styles.documentLink}
              />

              <Text style={styles.smsNotice}>{t('firmaDeDocumento.smsNoticeLabel')}</Text>
              <BscSelectableListGroup
                options={phoneOptions}
                value={String(selectedPhoneIndex)}
                onChange={value => setSelectedPhoneIndex(Number(value))}
                disabled={phoneOptions.length <= 1 || isSending}
                testID="campo-telefono-firma"
              />

              <BscBanner
                tone="info"
                icon="mail"
                title={`${t('firmaDeDocumento.emailNoticePrefix')}${verifiedEmail ?? ''}`}
              />
              <BscTextButton
                label={t('firmaDeDocumento.changeEmailButton')}
                onPress={handleChangeEmail}
                style={styles.changeEmailLink}
              />

              <View style={styles.sendButtonSpacing}>
                {isLoadDocumentError ? (
                  <BscPrimaryButton
                    label={t('firmaDeDocumento.retryButton')}
                    onPress={loadDocument}
                    testID="reintentar-cargar-documento"
                  />
                ) : (
                  <BscPrimaryButton
                    label={t('firmaDeDocumento.sendCodeButton')}
                    onPress={handleSendCode}
                    disabled={isSending || isLoadingDocument}
                    loading={isSending}
                    testID="enviar-codigo-firma"
                  />
                )}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{t('firmaDeDocumento.otpTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('firmaDeDocumento.otpSubtitle', {phone: maskPhone(phone)})}
              </Text>

              <BscOtpCodeField
                length={OTP_LENGTH}
                otp={otp}
                changeOtp={code => {
                  setOtp(code);
                  setOtpError(false);
                }}
                validate={handleValidateCode}
                hasError={otpError}
                errorText={t('firmaDeDocumento.otpError')}
                isVerified={otpVerified}
                isSending={isSending}
                codeSent={codeSent}
                timer={timer}
                resend={handleResendCode}
                resendLabel={t('firmaDeDocumento.resendButton')}
                autoFocus
                testID="otp-firma"
              />
            </>
          )}

          <View style={styles.bottomButtons}>
            <BscTextButton
              label={t('firmaDeDocumento.exitButton')}
              onPress={handleExit}
              style={styles.exitButton}
            />
          </View>
        </ScrollView>
      </Animated.View>

      <PdfFullScreenViewer
        visible={isViewerVisible}
        uri={documentUri}
        onClose={() => setIsViewerVisible(false)}
      />

      <MaximumIntentsModal
        visible={isMaxAttemptsModalOpen}
        onClose={() => {}}
        onGoToHome={handleGoToLogin}
      />
      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
      <BscLoadingOverlay visible={isLoadingDocument} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.xl,
    gap: BscSpacing.md,
  },
  title: {
    ...BscTextStyles['Title XS/24 SemiBold'],
    textAlign: 'center',
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    marginBottom: BscSpacing.sm,
  },
  reviewLabel: {
    ...BscTextStyles['Body MD/16 Regular'],
  },
  documentLink: {
    alignItems: 'flex-start',
  },
  smsNotice: {
    ...BscTextStyles['Body MD/16 Regular'],
  },
  changeEmailLink: {
    alignSelf: 'center',
  },
  sendButtonSpacing: {
    marginTop: BscSpacing.sm,
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
