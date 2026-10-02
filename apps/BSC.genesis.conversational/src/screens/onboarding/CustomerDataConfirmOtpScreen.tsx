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
import {formatName, maskEmail, maskPhone} from '@utils/helpers';

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

  const [isMaxAttemptsModalOpen, setIsMaxAttemptsModalOpen] = useState(false);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);
  // Igual que `ConfirmOtpScreen` de access-recovery: una sola lista combinada (correo + teléfono),
  // el usuario elige UN radio para enviar/validar, nunca los dos canales a la vez. A diferencia de
  // recovery, acá basta con validar ese único canal para continuar (ver `handlePrimaryContinue`) —
  // no se vuelve a pedir el otro.
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'phone' | ''>('');

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

  const handleSendCodeError = () => {
    Alert.alert(
      t('customerDataConfirmOtp.sendCodeErrorTitle'),
      t('customerDataConfirmOtp.sendCodeErrorMessage'),
    );
  };

  const handleMaxAttempts = () => setIsMaxAttemptsModalOpen(true);

  // Mismo hook que usa access-recovery (`useOtpVerification`): maneja envío, reenvío, contador y
  // validación de cada canal de forma idéntica, uno por correo y otro por teléfono.
  const emailOtp = useOtpVerification({
    identifier: email,
    document: documentNumber,
    channel: 'email',
    onVerified: value => setVerifiedEmail(value),
    onMaxAttempts: handleMaxAttempts,
    onError: handleSendCodeError,
  });

  const phoneOtp = useOtpVerification({
    identifier: phone,
    document: documentNumber,
    channel: 'phone',
    onVerified: value => setVerifiedPhone(value),
    onMaxAttempts: handleMaxAttempts,
    onError: handleSendCodeError,
  });

  // Lista combinada: una fila por correo y una por teléfono disponibles (igual que
  // `SelectChannelVerification` de access-recovery), excluyendo el canal que ya quedó verificado.
  // El `value` codifica canal+índice ("email:0"/"phone:0") para resolver cuál dato real usar.
  const contactOptions: readonly BscSelectableListGroupOption[] = useMemo(() => {
    const emailRows = emailOtp.isVerified
      ? []
      : emailList.map((item, index) => ({
          value: `email:${index}`,
          icon: 'mail' as const,
          title: maskEmail(item.email),
        }));

    const phoneRows = phoneOtp.isVerified
      ? []
      : phoneNumber.map((item, index) => ({
          value: `phone:${index}`,
          icon: 'smartphone' as const,
          title: maskPhone(`${item.codigoArea}${item.numeroTelefono}`),
        }));

    return [...emailRows, ...phoneRows];
  }, [emailList, phoneNumber, emailOtp.isVerified, phoneOtp.isVerified]);

  const selectedValue =
    selectedChannel === 'email'
      ? `email:${selectedEmailIndex}`
      : selectedChannel === 'phone'
        ? `phone:${selectedPhoneIndex}`
        : '';

  const handleSelectContact = (value: string) => {
    const [channel, index] = value.split(':');
    if (channel === 'email') {
      setSelectedEmailIndex(Number(index));
      setSelectedChannel('email');
    } else {
      setSelectedPhoneIndex(Number(index));
      setSelectedChannel('phone');
    }
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

  const isEmailRound = selectedChannel === 'email';
  const currentOtp = isEmailRound ? emailOtp : phoneOtp;
  const canSend = selectedChannel !== '';
  const showValidation = canSend && currentOtp.hasRequest;

  // Igual que access-recovery: basta con validar UN canal (el que el cliente elija) para
  // continuar — no se le vuelve a pedir el otro.
  const handlePrimaryContinue = () => {
    if (!currentOtp.isVerified) {
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
    if (!emailOtp.isVerified && !phoneOtp.isVerified) {
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
                disabled={canSend && currentOtp.isSending}
                testID="campo-contacto"
              />

              <BscPrimaryButton
                label={t('customerDataConfirmOtp.sendCodeButton')}
                onPress={currentOtp.send}
                disabled={!canSend || currentOtp.isSending}
                loading={canSend && currentOtp.isSending}
                testID="enviar-codigo-contacto"
              />
            </View>
          ) : (
            <View style={styles.fieldGroup}>
              <Text style={styles.sentText}>
                {isEmailRound
                  ? t('customerDataConfirmOtp.email.codeSent')
                  : t('customerDataConfirmOtp.phone.codeSent')}
              </Text>

              <BscOtpCodeField
                otp={currentOtp.otp}
                changeOtp={currentOtp.changeOtp}
                validate={currentOtp.validate}
                resend={currentOtp.resend}
                timer={currentOtp.timer}
                hasError={currentOtp.hasError}
                errorText={t('customerDataConfirmOtp.otpError')}
                isVerified={currentOtp.isVerified}
                isSending={currentOtp.isSending}
                label={
                  isEmailRound
                    ? t('customerDataConfirmOtp.email.otpLabel')
                    : t('customerDataConfirmOtp.phone.otpLabel')
                }
                resendLabel={t('customerDataConfirmOtp.resendCodeButton')}
                testID={isEmailRound ? 'otp-email' : 'otp-telefono'}
              />

              <BscPrimaryButton
                label={t('customerDataConfirmOtp.continueButton')}
                onPress={handlePrimaryContinue}
                disabled={!currentOtp.isVerified}
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
