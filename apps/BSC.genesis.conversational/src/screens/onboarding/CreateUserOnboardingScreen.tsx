import React, {useMemo, useState} from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {DOCUMENT_CATEGORY} from '@constants/documentCategory';
import {RegisterUserRequest, RootStackParamList} from '@/types/index';
import {EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH} from '@utils/helpers';

// COMPONENTS
import {
  BscBanner,
  BscColors,
  BscNavigationHeader,
  BscPrimaryButton,
  BscSpacing,
  BscSteps,
  BscTextButton,
  BscTextField,
  BscTextStyles,
} from '@bsc/design-system';
import {PasswordStrengthMeter} from '@components/onboarding/PasswordStrengthMeter';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {useOnboardingStore, useUserStore} from '@store/index';
import {useAuthStore} from '@store/auth.store';
import {AuthService, OnboardingApiError, OnboardingService} from '@services/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CreateUserOnboardingScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedEmail = useOnboardingStore(state => state.verifiedEmail);
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const documentCategory = useOnboardingStore(state => state.documentCategory);
  const biometryEnabled = useUserStore(state => state.preferences.biometryEnabled);
  const setAuthUser = useAuthStore(state => state.setUser);
  const {
    isServiceErrorModalOpen: isStepUpdateErrorModalOpen,
    closeServiceErrorModal: closeStepUpdateErrorModal,
    updateRegistrationStep,
  } = useRegistrationStepUpdate('CreateUserOnboardingScreen');
  const keyboardOffset = useKeyboardOffset();

  const [email, setEmail] = useState((verifiedEmail ?? '').toLowerCase());
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isServiceErrorModalOpen, setIsServiceErrorModalOpen] = useState(false);
  const [isLinkUserErrorModalOpen, setIsLinkUserErrorModalOpen] = useState(false);
  const [isLoginErrorModalOpen, setIsLoginErrorModalOpen] = useState(false);

  const isPasswordValid = useMemo(
    () => /^(?=.{8,20}$)(?=.*[A-Za-z])(?=.*\d).+$/.test(password),
    [password],
  );
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;
  const canContinue = isPasswordValid && isConfirmPasswordValid && !isCreatingUser;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEmailChange = (text: string) => {
    setEmailError(false);
    setEmail(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPasswordError('');
    setConfirmPassword(text);
  };

  /**
   * Vincula el usuario recién registrado a la sesión de registro activa. Maneja su propio error
   * de forma independiente al resto de llamadas de `handleContinue` (registro y actualización de
   * paso), mostrando su propio modal en vez de reutilizar el de las otras.
   */
  const linkUserToRegistrationSession = async (userId: string): Promise<boolean> => {
    try {
      await OnboardingService.linkUserToRegistrationSession(userId);
      return true;
    } catch (error) {
      console.log(
        '[CreateUserOnboardingScreen] OnboardingService.linkUserToRegistrationSession error',
        error,
      );
      setIsLinkUserErrorModalOpen(true);
      return false;
    }
  };

  /**
   * Autentica al usuario recién registrado con las credenciales que acaba de crear, generando una
   * sesión JWT válida a través del mismo mecanismo que usa `LoginScreen` (`AuthService.login`
   * persiste los tokens en Keychain). El resto del flujo de registro (activación de biometría en
   * `ConfigureAuthBiometricScreen`, etc.) depende de que ya exista una sesión vigente en este punto.
   * Maneja su propio error de forma independiente al resto de llamadas de `handleContinue`.
   */
  const loginNewUser = async (): Promise<boolean> => {
    try {
      await AuthService.login(email.toLowerCase(), password);
      return true;
    } catch (error) {
      console.log('[CreateUserOnboardingScreen] AuthService.login error', error);
      setIsLoginErrorModalOpen(true);
      return false;
    }
  };

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }
    setEmailError(false);
    setIsCreatingUser(true);
    try {
      const normalizedEmail = email.toLowerCase();
      const internalId = verifiedClient?.codigoPersona ?? '';
      const documentNumber = verifiedClient?.numeroIdentificacion ?? '';
      const documentType = documentCategory ?? '';
      const request: RegisterUserRequest = {
        email: normalizedEmail,
        internalId,
        documentNumber,
        documentType,
        password,
      };
      const registerResult = await OnboardingService.registerUser(request);

      if (verifiedClient) {
        setAuthUser({
          ...verifiedClient,
          isSecureDevice: !!verifiedClient.isSecureDevice,
          isDeviceRegistered: !!verifiedClient.isDeviceRegistered,
        });
      }

      const userLinked = await linkUserToRegistrationSession(registerResult.id);
      if (!userLinked) {
        return;
      }

      const loggedIn = await loginNewUser();
      console.log('[CreateUserOnboardingScreen] loginNewUser result', loggedIn);
      if (!loggedIn) {
        return;
      }

      // 'RegistrationComplete' (la decisión de iniciar o no la prueba de vida de Autentikar) solo
      // tiene sentido para cédula — pasaporte nunca pasa por Autentikar, así que sigue directo a
      // 'ConfigureAuthBiometric' como antes de que existiera esa pantalla.
      const requiresProofOfLife = documentCategory === DOCUMENT_CATEGORY.CEDULA;
      const nextScreen = biometryEnabled
        ? 'RegisterSecureDevice'
        : requiresProofOfLife
          ? 'RegistrationComplete'
          : 'ConfigureAuthBiometric';
      const nextStep = biometryEnabled
        ? REGISTRATION_STEPS.PASSKEY_ENROLLMENT
        : REGISTRATION_STEPS.BIOMETRIC_ACTIVATION;

      const stepRegistered = await updateRegistrationStep(nextStep);
      if (!stepRegistered) {
        return;
      }

      navigation.navigate(nextScreen);
    } catch (error) {
      if (error instanceof OnboardingApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setEmailError(true);
      } else {
        setIsServiceErrorModalOpen(true);
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader onBack={handleBack} showSupportButton title="Contraseña" />
      <BscSteps totalSteps={3} current={2} style={styles.steps} />
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t('createUser.title')}</Text>
            <Text style={styles.subtitle}>{t('createUser.subtitle')}</Text>

            <BscTextField
              label={t('createUser.usernameLabel')}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              maxLength={EMAIL_MAX_LENGTH}
              error={emailError ? t('createUser.emailAlreadyInUseError') : undefined}
              testID="campo-usuario"
            />
            {!emailError && (
              <BscBanner tone="info" icon="info" title={t('createUser.usernameHint')} />
            )}

            <BscTextField
              style={styles.fieldSpacing}
              label={t('createUser.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              maxLength={PASSWORD_MAX_LENGTH}
              secure
              testID="campo-contrasena"
            />
            <PasswordStrengthMeter password={password} />
            <Text style={styles.hintText}>{t('createUser.passwordHint')}</Text>

            <BscTextField
              style={styles.fieldSpacing}
              label={t('createUser.confirmPasswordLabel')}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              maxLength={PASSWORD_MAX_LENGTH}
              secure
              error={confirmPasswordError || undefined}
              testID="campo-confirmar-contrasena"
            />
          </ScrollView>

          <View style={styles.bottomButtons}>
            <BscPrimaryButton
              label={
                isCreatingUser ? t('createUser.creatingUserButton') : t('createUser.continueButton')
              }
              onPress={handleContinue}
              disabled={!canContinue}
              loading={isCreatingUser}
              testID="continuar-crear-usuario"
            />
            <BscTextButton
              label={t('createUser.exitButton')}
              onPress={handleBack}
              style={styles.exitButton}
            />
          </View>
        </View>
      </Animated.View>

      <ErrorServiceGeneral
        visible={isServiceErrorModalOpen}
        onClose={() => setIsServiceErrorModalOpen(false)}
      />
      <ErrorServiceGeneral
        visible={isStepUpdateErrorModalOpen}
        onClose={closeStepUpdateErrorModal}
      />
      <ErrorServiceGeneral
        visible={isLinkUserErrorModalOpen}
        onClose={() => setIsLinkUserErrorModalOpen(false)}
      />
      <ErrorServiceGeneral
        visible={isLoginErrorModalOpen}
        onClose={() => setIsLoginErrorModalOpen(false)}
      />
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
  mainContent: {
    flex: 1,
    paddingHorizontal: BscSpacing.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    marginBottom: BscSpacing.sm,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    marginBottom: BscSpacing.xl,
  },
  fieldSpacing: {
    marginTop: BscSpacing.lg,
  },
  hintText: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: BscSpacing.xs,
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.sm,
    gap: BscSpacing.sm,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
