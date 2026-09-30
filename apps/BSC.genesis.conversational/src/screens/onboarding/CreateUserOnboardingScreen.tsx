import React, {useMemo, useState} from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {RegisterUserRequest, RootStackParamList} from '@/types/index';
import {EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH} from '@utils/helpers';
import Icon from '@react-native-vector-icons/feather';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {PasswordStrengthMeter} from '@components/onboarding/PasswordStrengthMeter';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {TextField} from '@components/Common/TextField';
import {ErrorText} from '@components/Common/ErrorText';
import {ButtonPill} from '@components/Common/ButtonPill';
import {useOnboardingStore, useUserStore} from '@store/index';
import {useAuthStore} from '@store/auth.store';
import {AuthService, OnboardingApiError, OnboardingService} from '@services/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import { Steps } from '@components/Common/Steps';

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
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordError(
      confirmPassword && confirmPassword !== password ? t('createUser.confirmPasswordError') : '',
    );
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

      const nextScreen = biometryEnabled ? 'RegisterSecureDevice' : 'ConfigureAuthBiometric';
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
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <HeaderOnboarding showBackButton onBackPress={handleBack} />
      <Steps totalSteps={3} currentStep={3} containerStyle={styles.steps} />
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('createUser.title')}</Text>
          <Text style={styles.subtitle}>{t('createUser.subtitle')}</Text>

          <Text style={styles.label}>{t('createUser.usernameLabel')}</Text>
          <TextField
            width="100%"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            maxLength={EMAIL_MAX_LENGTH}
            iconName="mail"
            iconPosition="left"
            error={emailError}
            rightElement={
              !emailError && (
                <Icon name="check-circle" size={DIMENSIONS.iconSize.sm} color={COLORS.success} />
              )
            }
          />
          {emailError ? (
            <ErrorText text={t('createUser.emailAlreadyInUseError')} />
          ) : (
            <Text style={styles.hintText}>{t('createUser.usernameHint')}</Text>
          )}

          <Text style={[styles.label, styles.labelSpacing]}>{t('createUser.passwordLabel')}</Text>
          <TextField
            width="100%"
            value={password}
            onChangeText={setPassword}
            maxLength={PASSWORD_MAX_LENGTH}
            secureTextEntry={!showPassword}
            iconName={showPassword ? 'eye-off' : 'eye'}
            iconPosition="right"
            onIconPress={() => setShowPassword(prev => !prev)}
          />
          <PasswordStrengthMeter password={password} />
          <Text style={styles.hintText}>{t('createUser.passwordHint')}</Text>

          <Text style={[styles.label, styles.labelSpacing]}>
            {t('createUser.confirmPasswordLabel')}
          </Text>
          <TextField
            width="100%"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            maxLength={PASSWORD_MAX_LENGTH}
            secureTextEntry={!showConfirmPassword}
            error={!!confirmPasswordError}
            rightElement={
              <View style={styles.confirmIconsRow}>
                {isConfirmPasswordValid && (
                  <Icon name="check-circle" size={DIMENSIONS.iconSize.sm} color={COLORS.success} />
                )}
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(prev => !prev)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={DIMENSIONS.iconSize.sm}
                    color={COLORS.border}
                  />
                </TouchableOpacity>
              </View>
            }
          />
          {confirmPasswordError ? <ErrorText text={confirmPasswordError} /> : null}
        </ScrollView>

        <View style={styles.bottomButtons}>
          <View style={styles.continueButtonContainer}>
            <ButtonPill
              onPress={handleContinue}
              disabled={!canContinue}
              width="100%"
              backgroundColor={COLORS.primary}
              textColor={COLORS.backgroundLight}>
              {isCreatingUser ? t('createUser.creatingUserButton') : t('createUser.continueButton')}
            </ButtonPill>
          </View>
          <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>{t('createUser.exitButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>

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
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  keyboardContainer: {
    flex: 1,
  },
  steps: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  labelSpacing: {
    marginTop: SPACING.lg,
  },
  hintText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  confirmIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bottomButtons: {
    paddingTop: SPACING.md,
  },
  continueButtonContainer: {
    marginBottom: SPACING.sm,
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
