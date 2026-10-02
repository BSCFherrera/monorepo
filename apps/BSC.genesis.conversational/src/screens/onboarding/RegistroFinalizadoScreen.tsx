import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {DOCUMENT_CATEGORY} from '@constants/documentCategory';
import {useOnboardingStore} from '@store/index';
import {useAuthStore} from '@store/auth.store';
import {useAndroidBackHandler} from '@hooks/index';
import {formatName} from '@utils/helpers';

// COMPONENTS
import {VerificationStepper} from '@components/onboarding/VerificationStepper';
import {
  BscColors,
  BscIconTile,
  BscPrimaryButton,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';

/**
 * Último paso del registro (ver Figma "Registro finalizado"): mismo checklist que
 * `IdentityVerifiedScreen`, ahora con la firma también en verde. El botón autentica la sesión
 * directamente (reemplaza al modal de bienvenida de `WelcomeOnboardingScreen` para este tramo).
 */
export const RegistroFinalizadoScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const documentCategory = useOnboardingStore(state => state.documentCategory);
  const proofOfLifeCompleted = useOnboardingStore(state => state.proofOfLifeCompleted);
  const authenticate = useAuthStore(state => state.login);

  // Bloquea el back nativo (botón/gesto) de Android: no se puede retroceder desde esta pantalla
  useAndroidBackHandler(() => {});

  // Pasaporte nunca pasa por Autentikar (no aplica); cédula solo cuenta como hecha si de verdad
  // se completó, no si se omitió — ver `CompletedValidationScreen`.
  const livenessDone = documentCategory !== DOCUMENT_CATEGORY.CEDULA || proofOfLifeCompleted;

  const subtitle = t('registroFinalizado.subtitle', {
    name: formatName(verifiedClient?.primerNombre ?? ''),
  });

  const steps = [
    {
      title: t('identityVerified.stepPasswordTitle'),
      subtitle: t('identityVerified.stepPasswordSubtitle'),
      done: true,
      icon: 'password' as const,
    },
    {
      title: t('identityVerified.stepLivenessTitle'),
      subtitle: t('identityVerified.stepLivenessSubtitle'),
      done: livenessDone,
      icon: 'face' as const,
    },
    {
      title: t('identityVerified.stepSignTitle'),
      subtitle: t('identityVerified.stepSignSubtitle'),
      done: true,
      icon: 'document' as const,
    },
  ];

  const handleContinue = () => {
    authenticate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <BscIconTile
          icon="verified"
          size={44}
          iconSize={20}
          color={BscColors.textOnPrimary}
          background={BscColors.success}
        />

        <Text style={styles.title}>{t('registroFinalizado.title')}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <VerificationStepper steps={steps} />
      </View>

      <View style={styles.bottomButtons}>
        <BscPrimaryButton
          label={t('registroFinalizado.continueButton')}
          onPress={handleContinue}
          testID="ir-a-mi-app"
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
    alignItems: 'center',
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.xxl,
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
    marginBottom: BscSpacing.xl,
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingBottom: BscSpacing.md,
  },
});
