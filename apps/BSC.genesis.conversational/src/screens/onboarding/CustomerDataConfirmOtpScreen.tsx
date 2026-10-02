import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {RootStackParamList} from '@/types/index';
import {AccessOrigin, useOnboardingStore} from '@store/onboarding.store';
import {useAuthStore} from '@store/auth.store';
import {useOtpVerification} from '@hooks/useOtpVerification';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {formatName, maskPhone} from '@utils/helpers';

// COMPONENTS
import {
  BscColors,
  BscNavigationHeader,
  BscOtpCodeField,
  BscPrimaryButton,
  BscSelectableListGroup,
  BscSelectableListGroupOption,
  BscSpacing,
  BscSteps,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';
import {MaximumIntentsModal} from '@components/onboarding/MaximumIntentsModal';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 *  The screen where the user confirms their phone number by entering the OTP code sent to it.
 *  It handles sending, resending, and verifying the OTP code.
 * @returns A React component for the Customer Data Confirmation OTP screen.
 */
export const CustomerDataConfirmOtpScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const accessOrigin = useOnboardingStore(state => state.accessOrigin);
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const setVerifiedPhone = useOnboardingStore(state => state.setVerifiedPhone);
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('CustomerDataConfirmOtpScreen');
  const authUser = useAuthStore(state => state.user);
  const keyboardOffset = useKeyboardOffset();
  const authenticate = useAuthStore(state => state.login);

  // En el flujo de login, los datos de contacto vienen del usuario autenticado; en registro, del cliente verificado
  const clientInfo = accessOrigin === AccessOrigin.LOGIN ? authUser : verifiedClient;
  const documentNumber = verifiedClient?.numeroIdentificacion ?? '';

  const [isMaxAttemptsModalOpen, setIsMaxAttemptsModalOpen] = useState(false);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState<number | null>(null);

  const phoneNumber = useMemo(
    () => clientInfo?.telefonos.filter(tel => tel.tipoTelefono === 'Celular') ?? [],
    [clientInfo],
  );

  const selectedPhone = selectedPhoneIndex !== null ? phoneNumber[selectedPhoneIndex] : undefined;

  // Este es el valor real que se envía al servicio de OTP, sin enmascarar
  const phone = selectedPhone
    ? `${selectedPhone.codigoArea}${selectedPhone.numeroTelefono}`
    : '000-000-0000';

  const handleSendCodeError = () => {
    Alert.alert(
      t('customerDataConfirmOtp.sendCodeErrorTitle'),
      t('customerDataConfirmOtp.sendCodeErrorMessage'),
    );
  };

  const handleMaxAttempts = () => setIsMaxAttemptsModalOpen(true);

  // Mismo hook que usa access-recovery (`useOtpVerification`), aquí con un único canal: teléfono.
  const phoneOtp = useOtpVerification({
    identifier: phone,
    document: documentNumber,
    channel: 'sms',
    onVerified: value => setVerifiedPhone(value),
    onMaxAttempts: handleMaxAttempts,
    onError: handleSendCodeError,
  });

  // Lista de teléfonos disponibles para validar (solo "Celular"), vacía una vez verificado.
  const contactOptions: readonly BscSelectableListGroupOption[] = useMemo(() => {
    if (phoneOtp.isVerified) {
      return [];
    }

    return phoneNumber.map((item, index) => ({
      value: String(index),
      icon: 'smartphone' as const,
      title: maskPhone(`${item.codigoArea}${item.numeroTelefono}`),
    }));
  }, [phoneNumber, phoneOtp.isVerified]);

  const selectedValue = selectedPhoneIndex !== null ? String(selectedPhoneIndex) : '';

  const handleSelectContact = (value: string) => {
    setSelectedPhoneIndex(Number(value));
  };

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

  const canSend = selectedPhoneIndex !== null;
  const showValidation = canSend && phoneOtp.hasRequest;

  const handlePrimaryContinue = () => {
    if (!phoneOtp.isVerified) {
      return;
    }

    handleContinue();
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
    if (!phoneOtp.isVerified) {
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
      default: {
        const stepRegistered = await registerUniqueAgreementStep();
        if (!stepRegistered) {
          return;
        }

        navigation.navigate('SelectUsername', {cedula: documentNumber});
        break;
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader onBack={handleBack} showSupportButton title="Contactos" />
      <BscSteps totalSteps={3} current={1} style={styles.steps} />
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {t('customerDataConfirmOtp.title', {firstName: formatName(client.primerNombre)})}
          </Text>

          {!showValidation ? (
            <View style={styles.fieldGroup}>
              <BscSelectableListGroup
                options={contactOptions}
                value={selectedValue}
                onChange={handleSelectContact}
                disabled={canSend && phoneOtp.isSending}
                testID="campo-contacto"
              />

              <BscPrimaryButton
                label={t('customerDataConfirmOtp.sendCodeButton')}
                onPress={phoneOtp.send}
                disabled={!canSend || phoneOtp.isSending}
                loading={canSend && phoneOtp.isSending}
                testID="enviar-codigo-contacto"
              />
            </View>
          ) : (
            <View style={styles.fieldGroup}>
              <Text style={styles.sentText}>{t('customerDataConfirmOtp.codeSent')}</Text>

              <BscOtpCodeField
                otp={phoneOtp.otp}
                changeOtp={phoneOtp.changeOtp}
                validate={phoneOtp.validate}
                resend={phoneOtp.resend}
                timer={phoneOtp.timer}
                hasError={phoneOtp.hasError}
                errorText={t('customerDataConfirmOtp.otpError')}
                isVerified={phoneOtp.isVerified}
                isSending={phoneOtp.isSending}
                label={t('customerDataConfirmOtp.otpLabel')}
                resendLabel={t('customerDataConfirmOtp.resendCodeButton')}
                testID="otp-telefono"
              />

              <BscPrimaryButton
                label={t('customerDataConfirmOtp.continueButton')}
                onPress={handlePrimaryContinue}
                disabled={!phoneOtp.isVerified}
                testID="continuar-contactos"
              />
            </View>
          )}

          <View style={styles.bottomButtons}>
            <BscTextButton
              label={t('customerDataConfirmOtp.exitButton')}
              onPress={handleBack}
              style={styles.exitButton}
            />
          </View>
        </ScrollView>
      </Animated.View>

      <MaximumIntentsModal
        visible={isMaxAttemptsModalOpen}
        onClose={() => {}}
        onGoToHome={handleGoToLogin}
      />
      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  steps: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.xl,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    marginBottom: BscSpacing.lg,
  },
  fieldGroup: {
    gap: BscSpacing.sm,
  },
  sentText: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.secondary,
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    gap: BscSpacing.sm,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
