import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {useAutentikarVerification} from '@hooks/useAutentikarVerification';
import {formatName} from '@utils/helpers';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {ProofOfLifeSuccessModal} from '@components/onboarding/ProofOfLifeSuccessModal';
import {useAccesRecoveryStore} from '@store/access-recovery.store';
import {
  BscColors,
  BscIconTile,
  BscPrimaryButton,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Prueba de vida de Autentikar (cédula dominicana + rostro). Reutiliza `useAutentikarVerification`
 * para el ciclo backend + módulo nativo; esta pantalla solo aporta la UI y decide a dónde navegar
 * al terminar. Al completar la prueba de vida se avanza a la restauracion respectiva (USERNAME, PASSWORD).
 */
export const FacialVerificationScreen: React.FC = () => {
  const {t} = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useAccesRecoveryStore(state => state.verifiedClient);
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const {status, maxAttemptsReached, run} = useAutentikarVerification();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const numeroDocumento = verifiedClient?.numeroIdentificacion ?? '';
  const isBusy = status === 'starting' || status === 'verifying';

  const goToBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  // Éxito de la prueba de vida: el registro del dispositivo seguro ya se resolvió al iniciar
  // Autentikar (ver `useAutentikarVerification`), así que se avanza a la pantalla de recuperacion
  // respectiva, para continuar con el proceso de recuperacion
  const goToCompletedValidation = () => {
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

  const handleContinue = async () => {
    if (isBusy) {
      return;
    }

    if (!numeroDocumento) {
      setIsErrorModalOpen(true);
      return;
    }

    const completed = await run(numeroDocumento);
    if (completed) {
      setIsSuccessModalOpen(true);
    } else {
      setIsErrorModalOpen(true);
    }
  };

  // Al primer fallo, cerrar el modal solo deja al usuario reintentar con 'Continuar'. Al
  // segundo fallo seguido, devolverlo a la seleccion de identificacion
  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false);
    if (maxAttemptsReached) {
      goToBack();
    }
  };

  const title = verifiedClient?.primerNombre
    ? t('proofOfLife.title', {name: formatName(verifiedClient.primerNombre)})
    : t('proofOfLife.titleDefault');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <View style={styles.content}>
        <BscIconTile icon="fingerprint" size={72} iconSize={32} />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{t('proofOfLife.subtitle')}</Text>

        <Image
          source={require('@assets/biometric-face-color.png')}
          style={styles.faceImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomButtons}>
        <BscPrimaryButton
          label={isBusy ? t('proofOfLife.verifyingButton') : t('proofOfLife.startButton')}
          onPress={handleContinue}
          disabled={isBusy}
          testID="continuar-prueba-vida"
        />
      </View>

      <ProofOfLifeSuccessModal
        visible={isSuccessModalOpen}
        onContinue={() => {
          setIsSuccessModalOpen(false);
          goToCompletedValidation();
        }}
      />

      <ErrorServiceGeneral visible={isErrorModalOpen} onClose={handleErrorModalClose} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: BscSpacing.xl,
    paddingHorizontal: BscSpacing.xl,
  },
  title: {
    ...BscTextStyles['Title XS/24 SemiBold'],
    textAlign: 'center',
    marginTop: BscSpacing.lg,
    marginBottom: BscSpacing.sm,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  faceImage: {
    width: 120,
    height: 120,
    marginTop: BscSpacing.xl,
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.md,
  },
});
