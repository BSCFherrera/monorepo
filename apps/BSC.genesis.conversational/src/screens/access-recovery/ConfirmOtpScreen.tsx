import React, {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '@constants/theme';
import {useAccesRecoveryStore} from '@store/access-recovery.store';
import {Steps} from '@components/Common/Steps';
import {formatName, maskEmail, maskPhone} from '@utils/helpers';
import {SelectOption} from '@components/Common/Select';
import {ModalRef, RootStackParamList} from '@/types/index';
import {ButtonPill} from '@components/Common/ButtonPill';
import {MaximumIntentsModal} from '@components/Common';
import {useOtpVerification} from '@hooks/useOtpVerification';
import {OtpVerificationField} from '@components/Common/OtpVerificationField';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ConfirmOtpScreen = () => {
  const {t} = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useAccesRecoveryStore(state => state.verifiedClient);
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const setVerifiedPhone = useAccesRecoveryStore(state => state.setVerifiedPhone);
  const setVerifiedEmail = useAccesRecoveryStore(state => state.setVerifiedEmail);

  // En el flujo de recovery, los datos de contacto vienen del usuario verificado.
  const documentNumber = verifiedClient?.numeroIdentificacion ?? '';

  const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState(0);

  const maximumIntentsModalRef = useRef<ModalRef>(null);

  const phoneNumber = useMemo(
    () => verifiedClient?.telefonos.filter(tel => tel.tipoTelefono === 'Celular') ?? [],
    [verifiedClient],
  );
  const emailList = useMemo(() => verifiedClient?.emails ?? [], [verifiedClient]);

  const selectedPhone = phoneNumber[selectedPhoneIndex];
  const selectedEmail = emailList[selectedEmailIndex];

  // Este es el valor real que se envía al servicio de OTP, sin enmascarar
  const phone = selectedPhone
    ? `${selectedPhone.codigoArea}${selectedPhone.numeroTelefono}`
    : '000-000-0000';
  const email = selectedEmail?.email ?? '';

  const handleSendCodeError = () => {
    Alert.alert(t('confirmOtp.sendCodeErrorTitle'), t('confirmOtp.sendCodeErrorMessage'));
  };

  const emailOtp = useOtpVerification({
    identifier: email,
    document: documentNumber,
    channel: 'email',
    onVerified: setVerifiedEmail,
    onMaxAttempts: () => maximumIntentsModalRef.current?.open(),
    onError: handleSendCodeError,
  });

  const phoneOtp = useOtpVerification({
    identifier: phone,
    document: documentNumber,
    channel: 'sms',
    onVerified: setVerifiedPhone,
    onMaxAttempts: () => maximumIntentsModalRef.current?.open(),
    onError: handleSendCodeError,
  });

  const canContinue = emailOtp.isVerified && phoneOtp.isVerified;

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

  const title = t('confirmOtp.title', {
    firstName: formatName(verifiedClient?.primerNombre || ''),
  });

  const handleSelectEmail = (value: string | number) => {
    setSelectedEmailIndex(Number(value));
    emailOtp.reset();
  };

  const handleSelectPhone = (value: string | number) => {
    setSelectedPhoneIndex(Number(value));
    phoneOtp.reset();
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    switch (recoveryType) {
      case 'USERNAME':
      case 'BOTH':
        navigation.navigate('UsernameRecovery');
        break;
      case 'PASSWORD':
        navigation.navigate('ResetPassword');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />
      <Steps
        totalSteps={recoveryType === 'BOTH' ? 4 : 3}
        currentStep={2}
        containerStyle={styles.steps}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>

        <OtpVerificationField
          options={emailOptions}
          selectedValue={selectedEmailIndex}
          onSelect={handleSelectEmail}
          codeSent={emailOtp.codeSent}
          isSending={emailOtp.isSending}
          verified={emailOtp.isVerified}
          timer={emailOtp.timer}
          otp={emailOtp.otp}
          otpError={emailOtp.hasError}
          onOtpChange={emailOtp.changeOtp}
          onOtpComplete={emailOtp.validate}
          onSend={emailOtp.send}
          onResend={emailOtp.resend}
          sentText={t('confirmOtp.email.codeSent')}
          otpLabel={t('confirmOtp.email.otpLabel')}
          otpErrorText={t('confirmOtp.otpError')}
          sendButtonText={t('confirmOtp.sendCodeButton')}
          resendButtonText={t('confirmOtp.resendCodeButton')}
          autoFocus
        />
        <View style={styles.divider} />
        <OtpVerificationField
          options={phoneOptions}
          selectedValue={selectedPhoneIndex}
          onSelect={handleSelectPhone}
          codeSent={phoneOtp.codeSent}
          isSending={phoneOtp.isSending}
          verified={phoneOtp.isVerified}
          timer={phoneOtp.timer}
          otp={phoneOtp.otp}
          otpError={phoneOtp.hasError}
          onOtpChange={phoneOtp.changeOtp}
          onOtpComplete={phoneOtp.validate}
          onSend={phoneOtp.send}
          onResend={phoneOtp.resend}
          sentText={t('confirmOtp.phone.codeSent')}
          otpLabel={t('confirmOtp.phone.otpLabel')}
          otpErrorText={t('confirmOtp.otpError')}
          sendButtonText={t('confirmOtp.sendCodeButton')}
          resendButtonText={t('confirmOtp.resendCodeButton')}
        />
      </ScrollView>
      <View style={styles.bottomButtons}>
        <ButtonPill
          onPress={handleContinue}
          disabled={!canContinue}
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}>
          {t('confirmOtp.continueButton')}
        </ButtonPill>
        <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>{t('confirmOtp.exitButton')}</Text>
        </TouchableOpacity>
      </View>
      <MaximumIntentsModal ref={maximumIntentsModalRef} onClose={() => {}} />
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
