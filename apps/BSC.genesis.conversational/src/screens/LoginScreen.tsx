import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BiometryType } from 'react-native-biometrics';
import { BiometryTypes } from 'react-native-biometrics';
import { useTranslation } from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';
import { HeaderOnboarding } from '@components/onboarding/HeaderOnboarding';
import { ModalErrorUserBlockedLogin } from '@components/onboarding/ModalErrorUserBlockedLogin';
import { TextField } from '@components/Common/TextField';
import { ButtonPill } from '@components/Common/ButtonPill';
import { RegisterPromptCard } from '@components/Common/RegisterPromptCard';
import { useLoader } from '@components/Common/Loader';
import { ErrorGeneric } from '@components/Common/ErrorGeneric';
import { SessionExpiredModal } from '@components/Common/SessionExpiredModal';
import {
  BORDER_RADIUS,
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import { AuthApiError, AuthService, BiometricService } from '@services/index';
import { useKeyboardOffset } from '@hooks/useKeyboardOffset';
import { usePasskeyAuthentication } from '@hooks/usePasskeyAuthentication';
import { useLoginPostAuthNavigation } from '@hooks/useLoginPostAuthNavigation';
import { EMAIL_MAX_LENGTH } from '@utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthTokens, RootStackParamList } from '@/types/index';
import { AccessOrigin, useOnboardingStore } from '@store/onboarding.store';
import { useAuthStore } from '@store/auth.store';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const BIOMETRIC_ICON_BY_TYPE = {
  face: require('@assets/biometric-face.png'),
  default: require('@assets/biometric-fingerprint.webp'),
};

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const keyboardOffset = useKeyboardOffset();
  const { withLoader } = useLoader();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Mensaje de error a mostrar debajo del formulario (credenciales inválidas, error genérico o
  // biometría sin configurar); su sola presencia también pinta el borde rojo de los TextField.
  const [formError, setFormError] = useState<string | null>(null);
  const [userBlockedModalVisible, setUserBlockedModalVisible] = useState(false);
  // Modal genérico de error (cancelación de biometría, biometría no disponible, etc.); null
  // cuando está cerrado, y con el título/descripción del caso puntual cuando se abre.
  const [genericError, setGenericError] = useState<{ title: string; description: string } | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType | undefined>(undefined);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  // Indica si este dispositivo ya tiene un acceso biométrico configurado (y para qué cuenta),
  // no si el sensor existe. Mientras no se resuelva, se asume `false` para no mostrar de más.
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  // Usuario/email asociado al acceso biométrico configurado, para mostrarlo (deshabilitado) en
  // vez del campo editable mientras no se pida explícitamente cambiar de cuenta.
  const [enrolledUsername, setEnrolledUsername] = useState<string | null>(null);
  // Permite al usuario forzar el formulario de usuario/contraseña aunque haya biometría activa
  // (p. ej. para entrar con otra cuenta en el mismo dispositivo).
  const [manualLoginRequested, setManualLoginRequested] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  // Soporte de Passkey a nivel de sistema operativo, calculado una sola vez al montar (chequeo
  // local y síncrono, no cambia durante la vida de la pantalla).
  const [passkeySupported] = useState(() => AuthService.isPasskeySupported());
  // Controla si ya se reveló el campo de contraseña: el flujo arranca pidiendo solo el correo, y
  // recién se muestra contraseña si ese correo no tiene passkey (o el usuario prefiere usarla).
  const [showPasswordField, setShowPasswordField] = useState(false);
  const { isAuthenticating: authenticatingWithPasskey, authenticateWithPasskey } =
    usePasskeyAuthentication();
  const { proceedAfterLogin } = useLoginPostAuthNavigation();

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const setAccessOrigin = useOnboardingStore(state => state.setAccessOrigin);
  const clearAccessOrigin = useOnboardingStore(state => state.clearAccessOrigin);
  const sessionExpiredByInactivity = useAuthStore(state => state.sessionExpiredByInactivity);
  const setSessionExpiredByInactivity = useAuthStore(state => state.setSessionExpiredByInactivity);

  useEffect(() => {
    clearAccessOrigin();
  }, [clearAccessOrigin]);

  useEffect(() => {
    const loadBiometry = async () => {
      const [availability, enabled, enrolledUser] = await Promise.all([
        BiometricService.checkAvailability(),
        AuthService.isBiometricLoginEnabled(),
        AuthService.getBiometricLoginUser(),
      ]);

      if (availability.available) {
        setBiometryAvailable(true);
        setBiometryType(availability.biometryType);
      }

      setBiometricEnabled(enabled);
      setEnrolledUsername(enrolledUser);
    };

    loadBiometry();
  }, []);

  useEffect(() => {
    // Precarga el correo con el que se inició sesión con Passkey por última vez en este
    // dispositivo, para no obligar a reescribirlo cada vez que se cierra sesión; el usuario puede
    // editarlo libremente, y si entra con otro correo, `AuthService` actualiza este marcador solo.
    const loadRememberedPasskeyEmail = async () => {
      const rememberedEmail = await AuthService.getPasskeyRegisteredUser();

      if (rememberedEmail) {
        setUsername(current => (current ? current : rememberedEmail));
      }
    };

    loadRememberedPasskeyEmail();
  }, []);

  /**
   * Llama al servicio de login y maneja sus propios errores de forma independiente a la
   * navegación posterior al éxito: usuario bloqueado abre su modal dedicado, credenciales
   * inválidas muestra el mensaje puntual, y cualquier otro error (timeout, fallo de red, etc.)
   * cae en un mensaje genérico para no filtrar detalles técnicos al usuario.
   */
  const loginWithCredentials = async (): Promise<AuthTokens | null> => {
    try {
      return await AuthService.login(username.toLowerCase(), password);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'USER_BLOCKED') {
        requestAnimationFrame(() => setUserBlockedModalVisible(true));
      } else if (error instanceof AuthApiError && error.code === 'INVALID_CREDENTIALS') {
        setFormError(t('login.invalidCredentialsFieldError'));
      } else {
        setFormError(t('login.genericLoginError'));
      }
      return null;
    }
  };

  /**
   * Decide a dónde navegar después de CUALQUIER autenticación exitosa (contraseña o Passkey). Si
   * el backend exige prueba de vida (`biometricLivenessRequired` en `AuthTokens`, devuelto por
   * LOGIN y AUTHENTICATE_COMPLETE), primero se envía a 'ProofOfLife'; al completarla u omitirla,
   * esa pantalla retoma esta misma decisión (ver `useLoginPostAuthNavigation`). El resto de la
   * decisión (Passkey/Biometría/Chat) vive en `useLoginPostAuthNavigation` para que
   * 'ProofOfLifeScreen' pueda reutilizarla tal cual.
   */
  const proceedAfterAuthentication = async (normalizedUsername: string, tokens: AuthTokens) => {
    if (tokens.biometricLivenessRequired) {
      navigation.navigate('ProofOfLife', {
        username: normalizedUsername,
        deviceId: tokens.deviceId,
      });
      return;
    }

    await proceedAfterLogin(normalizedUsername, {
      onDifferentAccountEnrolled: () => {
        setBiometricEnabled(false);
        setEnrolledUsername(null);
      },
    });
  };

  const handlePasswordLogin = async () => {
    setAccessOrigin(AccessOrigin.LOGIN);
    setLoggingIn(true);

    let tokens = null;
    try {
      tokens = await withLoader(loginWithCredentials);
    } finally {
      setLoggingIn(false);
    }

    if (!tokens) {
      return;
    }

    await proceedAfterAuthentication(username.trim(), tokens);
  };

  /**
   * Punto de entrada único del formulario manual: arranca pidiendo solo el correo y, al
   * continuar, valida contra el backend si esa cuenta tiene un Passkey usable
   * (`getPasskeyAuthenticationOptions`, dentro de `authenticateWithPasskey`) e inmediatamente
   * dispara su prompt nativo si lo tiene. Si la cuenta no tiene Passkey (o el dispositivo no lo
   * soporta), revela el campo de contraseña sin tratarlo como un error, para no bloquear al
   * usuario que simplemente nunca configuró uno. Un passkey cancelado por el usuario se distingue
   * de "no tiene passkey": se avisa pero se lo deja reintentar en vez de forzar la contraseña.
   */
  const handleContinue = async () => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setFormError(t('login.emailRequiredError'));
      return;
    }

    setFormError(null);
    setAccessOrigin(AccessOrigin.LOGIN);

    if (!passkeySupported) {
      setShowPasswordField(true);
      return;
    }

    const outcome = await authenticateWithPasskey(normalizedUsername);

    if (outcome.status === 'cancelled') {
      setGenericError({
        title: t('login.passkeyAuthCancelledTitle'),
        description: t('login.passkeyAuthCancelledMessage'),
      });
      return;
    }

    if (outcome.status === 'error') {
      const accountHasNoUsablePasskey =
        outcome.error.code === 'PASSKEY_USER_NOT_FOUND' ||
        outcome.error.code === 'PASSKEY_NO_CREDENTIALS_REGISTERED' ||
        outcome.error.code === 'PASSKEY_NOT_SUPPORTED';

      if (!accountHasNoUsablePasskey) {
        setFormError(
          outcome.error.code === 'PASSKEY_ASSERTION_FAILED'
            ? t('login.passkeyAssertionFailedError')
            : t('login.genericPasskeyLoginError'),
        );
      }

      setShowPasswordField(true);
      return;
    }

    await proceedAfterAuthentication(normalizedUsername, outcome.tokens);
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setFormError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setFormError(null);
  };

  /**
   * Navegar hasta la pantalla de recuperación de acceso,
   * que ofrece opciones para recuperar la cuenta.
   */
  const handleAccessRecoveryPress = () => {
    setAccessOrigin(AccessOrigin.LOGIN);
    navigation.navigate('AccessRecovery');
  };

  /**
   * Inicia sesión con el acceso biométrico ya configurado en este dispositivo: el propio
   * Keychain dispara el prompt nativo y solo entrega los tokens guardados si la biometría es
   * válida, sin que la app tenga que confiar por su cuenta en el resultado de un sensor. El botón
   * biométrico siempre está visible; si no hay ningún acceso configurado, se lo indica al usuario
   * en el propio formulario en vez de intentar autenticar.
   */
  const handleBiometricPress = async () => {
    setAccessOrigin(AccessOrigin.LOGIN);

    if (!biometryAvailable) {
      setGenericError({
        title: t('login.biometricUnavailableTitle'),
        description: t('login.biometricUnavailableMessage'),
      });
      return;
    }

    if (!biometricEnabled) {
      setFormError(t('login.biometricNotConfiguredError'));
      return;
    }

    // Ya hay biometría configurada: si el usuario había pedido usar otro usuario, se vuelve a la
    // vista con la contraseña oculta y el email deshabilitado antes de lanzar el prompt nativo.
    setManualLoginRequested(false);
    setFormError(null);

    setAuthenticating(true);
    const success = await AuthService.loginWithBiometrics({
      title: t('login.biometricLoginPromptTitle'),
      subtitle: t('login.biometricLoginPromptSubtitle'),
      cancel: t('login.biometricLoginPromptCancel'),
    });
    setAuthenticating(false);

    if (!success) {
      setGenericError({
        title: t('login.biometricAuthCancelledTitle'),
        description: t('login.biometricAuthCancelledMessage'),
      });
      return;
    }
  };

  const biometricIcon =
    biometryType === BiometryTypes.FaceID
      ? BIOMETRIC_ICON_BY_TYPE.face
      : BIOMETRIC_ICON_BY_TYPE.default;

  // Cualquier autenticación en curso bloquea el resto de accesos (contraseña/Passkey/biometría no
  // pueden dispararse en simultáneo), pero ya no se exigen longitudes mínimas/máximas de más: el
  // botón solo evita el envío vacío, y es el backend quien valida el resto para no bloquear al
  // usuario con reglas de UI adivinadas.
  const isBusy = loggingIn || authenticating || authenticatingWithPasskey;
  const isContinueDisabled = isBusy || username.trim().length === 0;
  const isPasswordLoginDisabled = isBusy || username.trim().length === 0 || password.length === 0;

  // Un dispositivo con biometría activa está atado a una sola cuenta: mientras no se pida
  // explícitamente cambiar de usuario, se oculta la contraseña y el campo de usuario queda fijo
  // (deshabilitado) mostrando la cuenta vinculada a la biometría.
  const isPasswordHidden = biometricEnabled && !manualLoginRequested;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.keyboardContainer, { paddingBottom: keyboardOffset }]}>
        <HeaderOnboarding showBottomLine />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

          <Text style={styles.label}>{t('login.usernameLabel')}</Text>
          <TextField
            width="100%"
            value={isPasswordHidden ? enrolledUsername ?? '' : username}
            onChangeText={handleUsernameChange}
            onFocus={() => setFormError(null)}
            placeholder={t('login.usernamePlaceholder')}
            autoCorrect={false}
            maxLength={EMAIL_MAX_LENGTH}
            disabled={isPasswordHidden}
            error={!!formError}
          />

          {!isPasswordHidden && showPasswordField && (
            <>
              <Text style={[styles.label, styles.labelSpacing]}>{t('login.passwordLabel')}</Text>
              <TextField
                width="100%"
                value={password}
                onChangeText={handlePasswordChange}
                onFocus={() => setFormError(null)}
                secureTextEntry={!showPassword}
                iconName={showPassword ? 'eye-off' : 'eye'}
                iconPosition="right"
                onIconPress={() => setShowPassword(prev => !prev)}
                error={!!formError}
              />
            </>
          )}

          {formError && <Text style={styles.errorText}>{formError}</Text>}

          {!isPasswordHidden && (
            <View style={styles.loginButtonWrapper}>
              <ButtonPill
                onPress={showPasswordField ? handlePasswordLogin : handleContinue}
                disabled={showPasswordField ? isPasswordLoginDisabled : isContinueDisabled}
                width="100%"
                backgroundColor={COLORS.primary}
                textColor={COLORS.backgroundLight}
              >
                {showPasswordField
                  ? loggingIn
                    ? t('login.loggingInButton')
                    : t('login.loginButton')
                  : authenticatingWithPasskey
                  ? t('login.passkeyLoggingInButton')
                  : t('login.continueButton')}
              </ButtonPill>
            </View>
          )}

          {!isPasswordHidden && !showPasswordField && (
            <TouchableOpacity onPress={() => setShowPasswordField(true)}>
              <Text style={styles.register}>{t('login.usePasswordInsteadLink')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleBiometricPress}
            disabled={authenticating || authenticatingWithPasskey || loggingIn}
            style={styles.biometricButtonContainer}
          >
            <Image
              source={biometricIcon}
              style={styles.biometricButtonImage}
              resizeMode="contain"
            />
            <Text style={styles.biometricButtonText}>{t('login.biometricButtonLabel')}</Text>
          </TouchableOpacity>

          {isPasswordHidden && (
            <TouchableOpacity onPress={() => setManualLoginRequested(true)}>
              <Text style={styles.register}>{t('login.switchAccountLink')}</Text>
            </TouchableOpacity>
          )}

          <View>
            <Text style={styles.center}>{t('login.problemsLabel')}</Text>
            <TouchableOpacity onPress={handleAccessRecoveryPress}>
              <Text style={styles.register}>{t('login.accessRecovery')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerCardWrapper}>
            <RegisterPromptCard
              title={t('login.registerCardTitle')}
              subtitle={t('login.registerCardSubtitle')}
              onPress={() => {
                setAccessOrigin(AccessOrigin.REGISTER);
                navigation.navigate('ChooseDocument');
              }}
            />
          </View>
        </ScrollView>
      </Animated.View>

      <ModalErrorUserBlockedLogin
        visible={userBlockedModalVisible}
        onClose={() => setUserBlockedModalVisible(false)}
      />

      <ErrorGeneric
        visible={!!genericError}
        onClose={() => setGenericError(null)}
        title={genericError?.title ?? ''}
        description={genericError?.description ?? ''}
        icon={<Icon name="alert-triangle" size={DIMENSIONS.iconSize.xl} color={COLORS.error} />}
      />

      <SessionExpiredModal
        visible={sessionExpiredByInactivity}
        onClose={() => setSessionExpiredByInactivity(false)}
      />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.xxl + SPACING.sm,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  labelSpacing: {
    marginTop: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  loginButtonWrapper: {
    marginTop: SPACING.lg,
  },
  biometricButtonContainer: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: SPACING.md,
  },
  biometricButtonImage: {
    width: DIMENSIONS.iconSize.md,
    height: DIMENSIONS.iconSize.md,
    marginRight: SPACING.sm,
  },
  biometricButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
  },
  register: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    color: COLORS.secondary,
    fontWeight: FONT_WEIGHTS.bold,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  center: {
    textAlign: 'center',
    textDecorationStyle: 'solid',
  },
  registerCardWrapper: {
    marginTop: SPACING.xl,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.xs,
    paddingVertical: SPACING.sm,
  },
});
