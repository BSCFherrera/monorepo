import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { ModalRef, OtpChannel, RootStackParamList } from '@/types/index';
import { MaximumIntentsModal } from '@components/Common';
import { UseOtpVerification, useOtpVerification } from '@hooks/useOtpVerification';
import {
  BscColors,
  BscNavigationHeader,
  BscSpacing,
  BscSteps,
  BscTextButton,
} from '@bsc/design-system';
import { OtpVerfication } from '@components/access-recovery/OtpVerfication';
import { SelectChannelVerification } from '@components/access-recovery/SelectChannelVerification';

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

  const otp: UseOtpVerification = useOtpVerification({
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
            otp={otp}
            verifiedClient={verifiedClient}
            t={t}
            channelVerification={channelVerification}
            handleContinue={handleContinue}
            selectedData={dataSelected}
          />
        )}

        <View style={styles.bottomButtons}>
          <BscTextButton label={t('confirmOtp.exitButton')} onPress={handleBack} />
        </View>
      </ScrollView>
      <MaximumIntentsModal ref={maximumIntentsModalRef} onClose={() => {}} />
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
  content: {
    flexGrow: 1,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.xl,
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
  },
});
