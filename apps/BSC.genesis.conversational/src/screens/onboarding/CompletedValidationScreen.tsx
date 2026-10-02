import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {useOnboardingStore} from '@store/index';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {
  BscColors,
  BscIconTile,
  BscPrimaryButton,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CompletedValidationScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const setProofOfLifeCompleted = useOnboardingStore(state => state.setProofOfLifeCompleted);

  // Esta pantalla solo se alcanza cuando Autentikar terminó la prueba de vida con éxito (nunca al
  // omitirla) — ver `ProofOfLifeScreen.goToCompletedValidation`. Es el único punto seguro (fuera
  // de Autentikar) donde queda registrado que de verdad se completó, no solo que se saltó.
  useEffect(() => {
    setProofOfLifeCompleted(true);
  }, [setProofOfLifeCompleted]);

  const handleExit = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // El dispositivo seguro ya quedó registrado en el paso previo (prueba de vida de Autentikar);
  // desde aquí se avanza a decidir el acceso biométrico de inicio de sesión (Face ID/huella),
  // igual que si nunca hubiera habido prueba de vida.
  const handleContinue = () => {
    navigation.replace('ConfigureAuthBiometric');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <View style={styles.content}>
        <BscIconTile
          icon="verified"
          size={64}
          iconSize={32}
          color={BscColors.textOnPrimary}
          background={BscColors.success}
        />
        <Text style={styles.title}>{t('completedValidation.title')}</Text>
        <Text style={styles.subtitle}>{t('completedValidation.subtitle')}</Text>
      </View>

      <View style={styles.bottomButtons}>
        <BscPrimaryButton
          label={t('completedValidation.continueButton')}
          onPress={handleContinue}
          testID="continuar-validacion-completa"
        />
        <BscTextButton
          label={t('completedValidation.exitButton')}
          onPress={handleExit}
          style={styles.exitButton}
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
    justifyContent: 'center',
    paddingHorizontal: BscSpacing.xl,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'center',
    marginTop: BscSpacing.xl,
    marginBottom: BscSpacing.lg,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.md,
    gap: BscSpacing.sm,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
