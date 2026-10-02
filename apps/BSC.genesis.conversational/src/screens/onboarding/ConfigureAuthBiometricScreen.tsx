import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {AccessOrigin, useOnboardingStore} from '@store/onboarding.store';
import {useAuthStore} from '@store/auth.store';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {
  AuthService,
  BiometricService,
  OnboardingService,
  SessionService,
} from '@services/index';
import {formatName} from '@utils/helpers';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {
  BscCard,
  BscColors,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPrimaryButton,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ConfigureAuthBiometricScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const accessOrigin = useOnboardingStore(state => state.accessOrigin);
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const markAuthenticated = useAuthStore(state => state.login);
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('ConfigureAuthBiometricScreen');

  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [biometryName, setBiometryName] = useState('Biometría');
  const [isProcessingToggle, setIsProcessingToggle] = useState(false);
  const [isCompleteSessionErrorModalOpen, setIsCompleteSessionErrorModalOpen] = useState(false);
  // Evita que un doble tap en 'Continuar'/'Omitir' dispare `navigateNext` dos veces en paralelo:
  // eso llamaba a `completeRegistrationSession` dos veces y la segunda fallaba porque el backend
  // ya había cerrado la sesión de registro en la primera.
  const [isNavigating, setIsNavigating] = useState(false);

  // Al entrar a esta pantalla, el switch debe reflejar el estado real del dispositivo: encendido
  // solo si ya existe un acceso biométrico configurado (venga de este mismo flujo o de otro).
  useEffect(() => {
    const loadBiometricState = async () => {
      const [availability, enabled] = await Promise.all([
        BiometricService.checkAvailability(),
        AuthService.isBiometricLoginEnabled(),
      ]);

      setBiometryAvailable(availability.available);
      if (availability.available) {
        setBiometryName(BiometricService.getBiometricLabel(availability.biometryType));
      }
      setFingerprintEnabled(enabled);
    };

    loadBiometricState();
  }, []);

  /**
   * Activa el acceso biométrico de forma segura: confirma primero la identidad del usuario con
   * un gesto biométrico y, solo si es exitoso, guarda los tokens de la sesión activa detrás de
   * una entrada de Keychain protegida con `accessControl` (ver `AuthService.enableBiometricLogin`).
   * Retorna `true` si el acceso quedó habilitado.
   */
  const enableBiometricLogin = async (): Promise<boolean> => {
    setIsProcessingToggle(true);
    try {
      const confirmed = await BiometricService.authenticate(
        t('configureAuthBiometric.enableConfirmPromptMessage', {biometryName}),
      );

      if (!confirmed) {
        Alert.alert(
          t('configureAuthBiometric.enableCancelledTitle'),
          t('configureAuthBiometric.enableCancelledMessage'),
        );
        return false;
      }

      await AuthService.enableBiometricLogin(SessionService.getClientId(), {
        title: t('configureAuthBiometric.enableKeychainPromptTitle'),
        subtitle: t('configureAuthBiometric.enableKeychainPromptSubtitle'),
        cancel: t('configureAuthBiometric.enableKeychainPromptCancel'),
      });
      setFingerprintEnabled(true);
      return true;
    } catch (error) {
      console.log('[ConfigureAuthBiometricScreen] enableBiometricLogin error', error);
      Alert.alert(
        t('configureAuthBiometric.enableErrorTitle'),
        t('configureAuthBiometric.enableErrorMessage'),
      );
      return false;
    } finally {
      setIsProcessingToggle(false);
    }
  };

  /**
   * Finaliza la sesión de registro en el backend y guarda los tokens de acceso resultantes en
   * el store de autenticación. Maneja su propio error de forma independiente al de
   * `updateRegistrationStep`, ya que es una llamada a un servicio distinto.
   */
  const completeRegistrationSession = async (): Promise<boolean> => {
    try {
      const tokens = await OnboardingService.completeRegistrationSession();
      await AuthService.setSessionTokens(tokens);
      return true;
    } catch (error) {
      console.log(
        '[ConfigureAuthBiometricScreen] OnboardingService.completeRegistrationSession error',
        error,
      );
      setIsCompleteSessionErrorModalOpen(true);
      return false;
    }
  };

  // Punto de convergencia único de ambos caminos de registro (con o sin prueba de vida de
  // Autentikar: cédula pasa por 'RegistrationComplete' → ProofOfLife → 'CompletedValidation';
  // pasaporte llega aquí directo desde 'CreateUserOnboardingScreen'). Por eso el cierre de la
  // sesión de registro vive acá y no en ninguna de esas otras pantallas: así se ejecuta una sola
  // vez sin importar el camino recorrido.
  const navigateRegisterStep = async () => {
    const stepRegistered = await updateRegistrationStep(REGISTRATION_STEPS.WELCOME_COMPLETED);
    if (!stepRegistered) {
      return;
    }
    const sessionCompleted = await completeRegistrationSession();
    if (!sessionCompleted) {
      return;
    }

    navigation.replace('WelcomeOnboarding');
  };

  const navigateNext = async () => {
    switch (accessOrigin) {
      case AccessOrigin.REGISTER:
        await navigateRegisterStep();
        break;
      case AccessOrigin.LOGIN:
        // El login con contraseña ya validó las credenciales pero, a propósito, todavía no marcó
        // la sesión como autenticada (para no saltar al stack protegido -y de paso al Chat- antes
        // de que el usuario termine de decidir su biometría aquí). Se marca recién ahora; la
        // navegación a 'Chat' la resuelve `Navigation` de forma centralizada al reaccionar al
        // cambio de `isAuthenticated` (ver comentario en `src/navigation/Navigation.tsx`).
        markAuthenticated();
        break;
      case AccessOrigin.CONFIGURATION:
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Chat');
        }
        break;
      default:
        navigation.navigate('WelcomeOnboarding');
        break;
    }
  };

  /**
   * El botón "Activar ahora" reemplaza al ToggleSwitch anterior: si la biometría ya estaba
   * habilitada al entrar a esta pantalla, solo continúa (mismo comportamiento que antes tenía
   * el botón "Continuar" ya habilitado); si no, solicita activarla y, de lograrlo, continúa.
   */
  const handleActivate = async () => {
    if (isProcessingToggle || isNavigating) {
      return;
    }

    if (!fingerprintEnabled) {
      if (!biometryAvailable) {
        Alert.alert(
          t('configureAuthBiometric.unavailableTitle'),
          t('configureAuthBiometric.unavailableMessage'),
        );
        return;
      }

      const enabled = await enableBiometricLogin();
      if (!enabled) {
        return;
      }
    }

    setIsNavigating(true);
    try {
      await navigateNext();
    } finally {
      setIsNavigating(false);
    }
  };

  const handleSkip = async () => {
    if (isNavigating) {
      return;
    }
    setIsNavigating(true);
    try {
      await navigateNext();
    } finally {
      setIsNavigating(false);
    }
  };

  const title =
    accessOrigin === AccessOrigin.REGISTER && verifiedClient?.primerNombre
      ? t('configureAuthBiometric.title', {name: formatName(verifiedClient.primerNombre)})
      : t('configureAuthBiometric.titleDefault');

  const isActivateDisabled = isProcessingToggle || isNavigating;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding />

      <View style={styles.mainContent}>
        <View style={styles.content}>
          <BscIconTile
            icon="check"
            size={44}
            iconSize={20}
            color={BscColors.textOnPrimary}
            background={BscColors.primary}
          />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{t('configureAuthBiometric.subtitle')}</Text>

          <BscCard style={styles.biometricBox}>
            <BscIconTile icon="fingerprint" size={64} iconSize={32} />

            <Text style={styles.boxTitle}>{t('configureAuthBiometric.boxTitle')}</Text>
            <Text style={styles.boxSubtitle}>{t('configureAuthBiometric.boxSubtitle')}</Text>

            <View style={styles.benefitsList}>
              {[
                t('configureAuthBiometric.benefit1'),
                t('configureAuthBiometric.benefit2'),
                t('configureAuthBiometric.benefit3'),
              ].map(benefit => (
                <BscListRow
                  key={benefit}
                  leading={
                    <BscIconTile
                      icon="check"
                      size={24}
                      iconSize={14}
                      color={BscColors.textOnPrimary}
                      background={BscColors.primary}
                    />
                  }
                  title={benefit}
                />
              ))}
            </View>
          </BscCard>
        </View>

        <View style={styles.bottomButtons}>
          <BscPrimaryButton
            label={t('configureAuthBiometric.activateButton')}
            onPress={handleActivate}
            disabled={isActivateDisabled}
            leading={<BscIcon name="fingerprint" size={18} color={BscColors.textOnPrimary} />}
            testID="activar-biometria"
          />
          <BscTextButton
            label={t('configureAuthBiometric.skipButton')}
            onPress={handleSkip}
            disabled={isNavigating}
            style={styles.skipButton}
          />
        </View>
      </View>

      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
      <ErrorServiceGeneral
        visible={isCompleteSessionErrorModalOpen}
        onClose={() => setIsCompleteSessionErrorModalOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: BscSpacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: BscSpacing.md,
    alignItems: 'center',
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
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
  biometricBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: BscSpacing.lg,
  },
  boxTitle: {
    ...BscTextStyles['Body S/14 SemiBold'],
    textAlign: 'center',
    marginTop: BscSpacing.md,
    marginBottom: BscSpacing.xs,
  },
  boxSubtitle: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    marginBottom: BscSpacing.md,
  },
  benefitsList: {
    width: '100%',
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.sm,
    gap: BscSpacing.sm,
  },
  skipButton: {
    alignSelf: 'center',
  },
});
