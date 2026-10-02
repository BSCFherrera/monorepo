import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HeaderOnboarding } from '@components/onboarding/HeaderOnboarding';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@constants/theme';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { Steps } from '@components/Common/Steps';
import { formatName, maskEmail, maskPhone } from '@utils/helpers';
import { SelectOption } from '@components/Common/Select';
import { ModalRef, OtpChannel, RootStackParamList } from '@/types/index';
import { ButtonPill } from '@components/Common/ButtonPill';
import { MaximumIntentsModal } from '@components/Common';
import { useOtpVerification } from '@hooks/useOtpVerification';
import { OtpVerificationField } from '@components/Common/OtpVerificationField';
import {
  BscNavigationHeader,
  BscPrimaryButton,
  BscSelectableListGroup,
  BscSelectableListGroupOption,
  BscSteps,
} from '@bsc/design-system';
import { SelectChannelVerification } from '../../components/access-recovery/SelectChannelVerification';
import { OtpVerfication } from '@components/access-recovery/OtpVerfication';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ConfirmOtpScreen = () => {
  const { t } = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useAccesRecoveryStore(state => state.verifiedClient);
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const setVerifiedPhone = useAccesRecoveryStore(state => state.setVerifiedPhone);
  const setVerifiedEmail = useAccesRecoveryStore(state => state.setVerifiedEmail);

  // En el flujo de recovery, los datos de contacto vienen del usuario verificado.
  const documentNumber = verifiedClient?.numeroIdentificacion ?? '';

  const [dataSelected, setDataSelected] = useState('');
  const [step, setStep] = useState(1);
  const [channelVerification, setChannelVerification] = useState<OtpChannel | ''>('');

  const handleChannelChange = (value: OtpChannel | ''): void => {
    setChannelVerification(value);
  };

  const maximumIntentsModalRef = useRef<ModalRef>(null);

  // Este es el valor real que se envía al servicio de OTP, sin enmascarar

  const handleSendCodeError = () => {
    Alert.alert(t('confirmOtp.sendCodeErrorTitle'), t('confirmOtp.sendCodeErrorMessage'));
  };

  const handleVerifiedOtp = (value: string) => {
    switch (channelVerification) {
      case 'email':
        setVerifiedEmail(value);
        break;
      case 'phone':
        setVerifiedPhone(value);
        break;
    }
  };

  const otp = useOtpVerification({
    identifier: dataSelected,
    document: documentNumber,
    channel: channelVerification,
    onVerified: handleVerifiedOtp,
    onMaxAttempts: () => maximumIntentsModalRef.current?.open(),
    onError: handleSendCodeError,
  });

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const canContinue = otp.isVerified;

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

  const handleOnClose = () => {
    navigation.navigate('Inicio');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader
        onBack={handleBack}
        onClose={handleOnClose}
        showSupportButton
        title="Contactos"
      />

      <BscSteps totalSteps={recoveryType === 'BOTH' ? 4 : 3} current={step} style={styles.steps} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!otp.hasRequest ? (
          <SelectChannelVerification
            setDataSelected={setDataSelected}
            verifiedClient={verifiedClient}
            t={t}
            channelVerification={channelVerification}
            handleChannelChange={handleChannelChange}
            handleSendCode={otp.send}
          />
        ) : (
          <OtpVerfication
            verifiedClient={verifiedClient}
            t={t}
            channelVerification={channelVerification}
            handleContinue={handleContinue}
            selectedData={dataSelected}
            isVerified={otp.isVerified}
          />
        )}

        <View style={styles.bottomButtons}>
          <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>{t('confirmOtp.exitButton')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <MaximumIntentsModal ref={maximumIntentsModalRef} onClose={() => {}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
