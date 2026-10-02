import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {DOCUMENT_CATEGORY} from '@constants/documentCategory';
import {useOnboardingStore} from '@store/index';
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

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Primer paso del tramo final de registro (ver Figma "IdentityVerifiedScreen"): a este punto ya
 * se creó la contraseña y se resolvió la biometría/prueba de vida — lo único pendiente es firmar
 * el Convenio Único de Productos y Servicios, que es justo lo que arranca "Validar número".
 */
export const IdentityVerifiedScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const documentCategory = useOnboardingStore(state => state.documentCategory);
  const proofOfLifeCompleted = useOnboardingStore(state => state.proofOfLifeCompleted);
  // Pasaporte nunca pasa por Autentikar (no aplica), así que no cuenta como pendiente; cédula
  // solo se marca hecha si de verdad se completó (no si se omitió) — ver
  // `CompletedValidationScreen`, el único punto donde se registra el éxito real.
  const livenessDone = documentCategory !== DOCUMENT_CATEGORY.CEDULA || proofOfLifeCompleted;

  const title = t('identityVerified.title');
  const subtitle = t('identityVerified.subtitle', {
    name: formatName(verifiedClient?.primerNombre ?? ''),
    documentName: t('identityVerified.documentNameDefault'),
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
      done: false,
      icon: 'document' as const,
    },
  ];

  const handleContinue = () => {
    navigation.navigate('FirmaDeDocumento');
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

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <VerificationStepper steps={steps} />
      </View>

      <View style={styles.bottomButtons}>
        <BscPrimaryButton
          label={t('identityVerified.continueButton')}
          onPress={handleContinue}
          testID="validar-numero"
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
