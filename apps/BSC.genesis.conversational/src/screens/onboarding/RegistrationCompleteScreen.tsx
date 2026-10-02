import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {DOCUMENT_CATEGORY} from '@constants/documentCategory';
import {useOnboardingStore} from '@store/index';

// COMPONENTS
import {VerificationStepper} from '@components/onboarding/VerificationStepper';
import {
  BscBanner,
  BscColors,
  BscPrimaryButton,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Ver Figma "RegistrationCompleteScreen/LimitedAccess": entre la contraseña y la prueba de vida
 * de Autentikar. Reemplaza en esta posición a lo que antes resolvía `ConfigureAuthBiometricScreen`
 * (cierre de la sesión de registro + decidir si corresponde prueba de vida) — esa pantalla ahora
 * solo se ve DESPUÉS de esto, nunca antes.
 */
export const RegistrationCompleteScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const documentCategory = useOnboardingStore(state => state.documentCategory);

  const [isNavigating, setIsNavigating] = useState(false);

  const requiresProofOfLife = documentCategory === DOCUMENT_CATEGORY.CEDULA;

  const steps = [
    {
      title: t('registrationComplete.stepPasswordTitle'),
      subtitle: t('registrationComplete.stepPasswordSubtitle'),
      done: true,
      icon: 'password' as const,
    },
    {
      title: t('registrationComplete.stepLivenessTitle'),
      subtitle: t('registrationComplete.stepLivenessSubtitle'),
      done: false,
      icon: 'face' as const,
    },
    {
      title: t('registrationComplete.stepSignTitle'),
      subtitle: t('registrationComplete.stepSignSubtitle'),
      done: false,
      icon: 'document' as const,
    },
  ];

  // El cierre de la sesión de registro en el backend (`completeRegistrationSession`) vive en
  // `ConfigureAuthBiometricScreen`, el punto donde de verdad convergen los dos caminos posibles
  // desde aquí (con o sin prueba de vida) — así se ejecuta una sola vez sin importar cuál se
  // recorra.
  const navigateNext = (goToProofOfLife: boolean) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    navigation.replace(goToProofOfLife ? 'ProofOfLife' : 'ConfigureAuthBiometric');
  };

  const handleStartProofOfLife = () => navigateNext(true);
  const handleSkip = () => navigateNext(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('registrationComplete.title')}</Text>
        <Text style={styles.subtitle}>{t('registrationComplete.subtitle')}</Text>

        <VerificationStepper steps={steps} />

        <BscBanner
          tone="info"
          icon="info"
          title={t('registrationComplete.limitedAccessNotice')}
        />
      </View>

      <View style={styles.bottomButtons}>
        {requiresProofOfLife && (
          <BscPrimaryButton
            label={t('registrationComplete.startButton')}
            onPress={handleStartProofOfLife}
            disabled={isNavigating}
            testID="iniciar-prueba-de-vida"
          />
        )}
        <BscTextButton
          label={t('registrationComplete.skipButton')}
          onPress={handleSkip}
          disabled={isNavigating}
          style={styles.skipButton}
        />
      </View>
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
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.xxl,
    gap: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Title XS/24 SemiBold'],
    textAlign: 'center',
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingBottom: BscSpacing.md,
    gap: BscSpacing.sm,
  },
  skipButton: {
    alignSelf: 'center',
  },
});
