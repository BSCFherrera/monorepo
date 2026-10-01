import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BiometryType } from 'react-native-biometrics';
import { BiometryTypes } from 'react-native-biometrics';
import Icon from '@react-native-vector-icons/feather';

import {
  BscColors,
  BscLogo,
  BscPrimaryButton,
  BscSecondaryButton,
  BscTextButton,
  BscRadius,
  BscSpacing,
  BscTextStyles,
  BscTypography,
  withAlpha,
  FOOTNOTE_TEXT_STYLE,
  BscModalHandle,
} from '@bsc/design-system';

import { ModalErrorUserBlockedLogin } from '@components/onboarding/ModalErrorUserBlockedLogin';
import { ErrorGeneric } from '@components/Common/ErrorGeneric';
import { SessionExpiredModal } from '@components/Common/SessionExpiredModal';
import { AuthApiError, AuthService, BiometricService } from '@services/index';
import { usePasskeyAuthentication } from '@hooks/usePasskeyAuthentication';
import { useLoginPostAuthNavigation } from '@hooks/useLoginPostAuthNavigation';
import { DIMENSIONS, COLORS } from '@constants/theme';
import { AccessOrigin, useOnboardingStore } from '@store/onboarding.store';
import { useAuthStore } from '@store/auth.store';
import type { AuthTokens, RecoveryType, RootStackParamList } from '@/types/index';
import { LoginModal } from '@components/auth/LoginModal';
import { AccessRecoveryOptionsModal } from '@components/access-recovery/AccessRecoveryOptionsModal';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { AccountIdentificationModal } from '@components/access-recovery/AccountIdentificationModal';

const fondoDeAcceso = require('@assets/fondo-de-acceso.jpg');
const iconoAyuda = require('@assets/icono-ayuda.png');
const iconoPuntosDeAtencion = require('@assets/icono-puntos-de-atencion.png');
const iconoTasaDeCambio = require('@assets/icono-tasa-de-cambio.png');

const BIOMETRIC_ICON_BY_TYPE = {
  face: require('@assets/biometric-face.png'),
  default: require('@assets/biometric-fingerprint.webp'),
};

type InicioNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Inicio'>;

/**
 * Pantalla de inicio (acceso).
 *
 * Reemplaza visualmente a `LoginScreen` con `@bsc/design-system` (fondo,
 * logo, layout — ver Figma «SignInScreen»), pero la lógica de autenticación
 * real vive acá dentro (no en props): es la misma de `LoginScreen.tsx`
 * (biometría, Passkey, usuario/contraseña, bloqueo de cuenta, prueba de
 * vida), adaptada a que el Figma muestra Face ID / Passkey / usuario y
 * contraseña como tres accesos paralelos en vez del flujo "un correo decide
 * cuál de los tres" que tenía la pantalla vieja. `LoginScreen.tsx` queda sin
 * usar mientras se termina de migrar el resto de su UI (modales de error,
 * tarjeta de registro) a componentes de la librería.
 */
export function HomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('auth');
  const navigation = useNavigation<InicioNavigationProp>();

  const setRecoveryType = useAccesRecoveryStore(state => state.setRecoveryType);
  const setAccessOrigin = useOnboardingStore(state => state.setAccessOrigin);
  const clearAccessOrigin = useOnboardingStore(state => state.clearAccessOrigin);
  const sessionExpiredByInactivity = useAuthStore(state => state.sessionExpiredByInactivity);
  const setSessionExpiredByInactivity = useAuthStore(state => state.setSessionExpiredByInactivity);

  const { isAuthenticating: authenticatingWithPasskey, authenticateWithPasskey } =
    usePasskeyAuthentication();
  const { proceedAfterLogin } = useLoginPostAuthNavigation();

  // Chequeo local y síncrono (no cambia durante la vida de la pantalla).
  const [passkeySupported] = useState(() => AuthService.isPasskeySupported());

  const [biometryType, setBiometryType] = useState<BiometryType | undefined>(undefined);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [enrolledUsername, setEnrolledUsername] = useState<string | null>(null);
  const [rememberedPasskeyEmail, setRememberedPasskeyEmail] = useState<string | null>(null);
  const [rememberedFirstName, setRememberedFirstName] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [tocado, setTocado] = useState(false);

  const [authenticating, setAuthenticating] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [userBlockedModalVisible, setUserBlockedModalVisible] = useState(false);
  const [genericError, setGenericError] = useState<{ title: string; description: string } | null>(
    null,
  );

  const loginRef = useRef<BscModalHandle>(null);
  const accesRecoveryRef = useRef<BscModalHandle>(null);
  const accountIdentificacionRef = useRef<BscModalHandle>(null);

  useEffect(() => {
    clearAccessOrigin();
  }, [clearAccessOrigin]);

  useEffect(() => {
    const cargarAccesosGuardados = async () => {
      const [availability, enabled, enrolledUser, passkeyEmail, firstName] = await Promise.all([
        BiometricService.checkAvailability(),
        AuthService.isBiometricLoginEnabled(),
        AuthService.getBiometricLoginUser(),
        AuthService.getPasskeyRegisteredUser(),
        AuthService.getRememberedFirstName(),
      ]);

      if (availability.available) {
        setBiometryAvailable(true);
        setBiometryType(availability.biometryType);
      }
      setBiometricEnabled(enabled);
      setEnrolledUsername(enrolledUser);
      setRememberedPasskeyEmail(passkeyEmail);
      setRememberedFirstName(firstName);
    };

    cargarAccesosGuardados();
  }, []);

  // const correoRecordado = enrolledUsername ?? rememberedPasskeyEmail ?? '';
  // const conocido = correoRecordado !== '';
  // const mostrarBiometria = biometricEnabled && biometryAvailable;
  // const mostrarPasskey = passkeySupported && rememberedPasskeyEmail !== null;
  const correoRecordado = 'Francisco';
  const conocido = true;
  const mostrarBiometria = true;
  const mostrarPasskey = true;
  const isBusy = loggingIn || authenticating || authenticatingWithPasskey;

  /**
   * Decide a dónde navegar tras CUALQUIER autenticación exitosa (contraseña,
   * biometría o Passkey): a `ProofOfLife` si el backend exige prueba de vida,
   * o a lo que decida `useLoginPostAuthNavigation` en cualquier otro caso.
   * Idéntica a `proceedAfterAuthentication` de `LoginScreen.tsx`.
   */
  const proceedAfterAuthentication = useCallback(
    async (normalizedUsername: string, tokens: AuthTokens) => {
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
    },
    [navigation, proceedAfterLogin],
  );

  const handleBiometricPress = useCallback(async () => {
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
    }
  }, [biometryAvailable, biometricEnabled, setAccessOrigin, t]);

  /**
   * "Entrar con Passkey" del Figma: a diferencia de `LoginScreen.tsx` (donde
   * el Passkey se intentaba automáticamente al continuar con el correo), acá
   * es su propio botón porque el diseño nuevo lo muestra como un acceso
   * paralelo a Face ID y a usuario/contraseña, no como un paso previo.
   */
  const handlePasskeyPress = useCallback(async () => {
    if (correoRecordado === '') return;

    setAccessOrigin(AccessOrigin.LOGIN);
    setFormError(null);

    const outcome = await authenticateWithPasskey(correoRecordado);

    if (outcome.status === 'cancelled') {
      setGenericError({
        title: t('login.passkeyAuthCancelledTitle'),
        description: t('login.passkeyAuthCancelledMessage'),
      });
      return;
    }

    if (outcome.status === 'error') {
      setGenericError({
        title: t('login.passkeyUnavailableTitle'),
        description:
          outcome.error.code === 'PASSKEY_ASSERTION_FAILED'
            ? t('login.passkeyAssertionFailedError')
            : t('login.genericPasskeyLoginError'),
      });
      return;
    }

    await proceedAfterAuthentication(correoRecordado, outcome.tokens);
  }, [correoRecordado, authenticateWithPasskey, setAccessOrigin, t, proceedAfterAuthentication]);

  const abrirCredenciales = useCallback(() => {
    setAccessOrigin(AccessOrigin.LOGIN);
    setFormError(null);
    setTocado(false);
    setPassword('');
    loginRef.current?.open();
  }, [setAccessOrigin]);

  const handleSubmitCredentials = useCallback(async () => {
    setTocado(true);
    if (username.trim() === '' || password === '') return;

    setAccessOrigin(AccessOrigin.LOGIN);
    setLoggingIn(true);

    let tokens: AuthTokens | null = null;
    try {
      tokens = await AuthService.login(username.trim().toLowerCase(), password);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'USER_BLOCKED') {
        setUserBlockedModalVisible(true);
      } else if (error instanceof AuthApiError && error.code === 'INVALID_CREDENTIALS') {
        setFormError(t('login.invalidCredentialsFieldError'));
      } else {
        setFormError(t('login.genericLoginError'));
      }
    } finally {
      setLoggingIn(false);
    }

    if (!tokens) return;

    const normalizedUsername = username.trim();
    loginRef.current?.close();
    await proceedAfterAuthentication(normalizedUsername, tokens);
  }, [username, password, setAccessOrigin, t, proceedAfterAuthentication]);

  const handleRegister = useCallback(() => {
    setAccessOrigin(AccessOrigin.REGISTER);
    navigation.navigate('ChooseDocument');
  }, [navigation, setAccessOrigin]);

  const handleAccessRecovery = useCallback(() => {
    setAccessOrigin(AccessOrigin.LOGIN);
    navigation.navigate('AccessRecovery');
  }, [navigation, setAccessOrigin]);

  const biometricIcon =
    biometryType === BiometryTypes.FaceID
      ? BIOMETRIC_ICON_BY_TYPE.face
      : BIOMETRIC_ICON_BY_TYPE.default;

  const handleAccessRecoveryPress = useCallback(() => {
    loginRef.current?.close();
    accesRecoveryRef.current?.open();
  }, []);

  const handleTypeRecoveryPress = (type: RecoveryType) => {
    setRecoveryType(type);
    accesRecoveryRef.current?.close();
    accountIdentificacionRef.current?.open();
  };

  return (
    <View style={styles.fondo} testID="inicio">
      <Image source={fondoDeAcceso} resizeMode="cover" style={styles.foto} />
      <View
        style={[
          styles.contenedor,
          {
            paddingTop: insets.top + MEDIDAS.logoBajoLaBarra,
            paddingBottom: insets.bottom + MEDIDAS.accionesSobreElBorde,
          },
        ]}
      >
        <View style={styles.logo}>
          <BscLogo height={MEDIDAS.altoDelLogo} />
        </View>

        <View style={styles.espacioSuperior} />

        {/* ─── Bienvenida ─────────────────────────────────────────────── */}
        <Text style={styles.titulo} accessibilityRole="header">
          {conocido && rememberedFirstName !== null
            ? t('home.greeting', { name: rememberedFirstName })
            : t('home.title')}
        </Text>
        <Text style={styles.lema}>{t('home.tagline')}</Text>

        {/* ─── Acciones ───────────────────────────────────────────────── */}
        <View style={styles.acciones}>
          {formError !== null && !loginRef.current?.isOpen() ? (
            <Text style={styles.error} testID="inicio-error">
              {formError}
            </Text>
          ) : null}

          {conocido ? (
            <>
              {mostrarBiometria ? (
                <BscPrimaryButton
                  size="lg"
                  label={
                    biometryType === BiometryTypes.FaceID
                      ? t('home.signInWithFaceId')
                      : t('home.signInWithFingerprint')
                  }
                  leading={
                    <Image
                      source={biometricIcon}
                      resizeMode="contain"
                      style={styles.iconoBiometrico}
                    />
                  }
                  loading={authenticating}
                  disabled={isBusy}
                  onPress={handleBiometricPress}
                  testID="inicio-biometrico"
                />
              ) : null}

              <View style={styles.entreBotones} />

              <BscSecondaryButton
                size="lg"
                label={t('home.useCredentials')}
                disabled={isBusy}
                onPress={() => abrirCredenciales()}
                testID="inicio-credenciales"
              />

              {mostrarPasskey ? (
                <>
                  <View style={styles.entreBotones} />
                  <BscTextButton
                    size="md"
                    label={t('home.useOtherAccessPasskey')}
                    color={BscColors.textOnDark}
                    disabled={isBusy}
                    onPress={handlePasskeyPress}
                    testID="inicio-passkey"
                  />
                </>
              ) : null}

              <BscTextButton
                size="md"
                label={t('home.switchAccount', { name: rememberedFirstName ?? correoRecordado })}
                color={BscColors.textOnDark}
                disabled={isBusy}
                onPress={() => abrirCredenciales()}
                testID="inicio-olvidar"
              />
            </>
          ) : (
            <>
              <BscPrimaryButton
                size="lg"
                label={t('home.signIn')}
                loading={isBusy}
                onPress={() => abrirCredenciales()}
                testID="inicio-credenciales"
              />

              <View style={styles.entreBotones} />

              <BscTextButton
                size="md"
                label={t('home.register')}
                color={BscColors.textOnDark}
                onPress={handleRegister}
                testID="inicio-registro"
              />
            </>
          )}

          <BscTextButton
            size="md"
            label={t('home.accessRecovery')}
            color={BscColors.textOnDark}
            disabled={isBusy}
            onPress={handleAccessRecovery}
            testID="inicio-recuperar-acceso"
          />
        </View>

        <View style={styles.espacioInferior} />

        {/* ─── Accesos sin sesión ─────────────────────────────────────── */}
        <View style={styles.filaDeAccesos}>
          <AccesoRapido
            icono={iconoTasaDeCambio}
            etiqueta={t('shortcuts.exchangeRates')}
            testID="inicio-tasa-de-cambio"
          />
          <AccesoRapido
            icono={iconoPuntosDeAtencion}
            etiqueta={t('shortcuts.servicePoints')}
            testID="inicio-puntos-de-atencion"
          />
          <AccesoRapido icono={iconoAyuda} etiqueta={t('shortcuts.help')} testID="inicio-ayuda" />
        </View>
      </View>

      <LoginModal
        ref={loginRef}
        username={username}
        password={password}
        onChangeUsername={text => {
          setUsername(text);
          setFormError(null);
        }}
        onChangePassword={text => {
          setPassword(text);
          setFormError(null);
        }}
        loading={loggingIn}
        error={loginRef.current?.isOpen() ? formError : null}
        onHandleContinue={handleSubmitCredentials}
        handleAccessRecoveryPress={handleAccessRecoveryPress}
      />

      <AccessRecoveryOptionsModal
        ref={accesRecoveryRef}
        handleTypeRecoveryPress={handleTypeRecoveryPress}
      />

      <AccountIdentificationModal ref={accountIdentificacionRef} />

      <ModalErrorUserBlockedLogin
        visible={userBlockedModalVisible}
        onClose={() => setUserBlockedModalVisible(false)}
      />

      <ErrorGeneric
        visible={genericError !== null}
        onClose={() => setGenericError(null)}
        title={genericError?.title ?? ''}
        description={genericError?.description ?? ''}
        icon={<Icon name="alert-triangle" size={DIMENSIONS.iconSize.xl} color={COLORS.error} />}
      />

      <SessionExpiredModal
        visible={sessionExpiredByInactivity}
        onClose={() => setSessionExpiredByInactivity(false)}
      />
    </View>
  );
}

/**
 * Medidas del marco de Figma que no son de la escala de espaciado.
 *
 * Los dos huecos grandes —entre el logotipo y la bienvenida, y entre los
 * botones y los accesos— **no** son fijos: en Figma miden 234 y 115 sobre 852
 * de alto, y aquí se reparten en esa misma proporción (2 a 1) el espacio que
 * sobre en cada teléfono.
 */
const MEDIDAS = {
  logoBajoLaBarra: 25,
  altoDelLogo: 64,
  bienvenidaABotones: 48,
  accionesSobreElBorde: 10,
  cuadroDeAcceso: 60,
  iconoDeAcceso: 28,
} as const;

/**
 * Un acceso de la fila inferior (`QuickAction` en Figma).
 *
 * El cuadro es negro con un filo claro casi invisible: en Figma son dos
 * rellenos (`#E6E6E6` al 70 % y `#333333` al 30 %) que, sobre el fondo, se ven
 * como se reproducen aquí —medido contra la referencia—.
 *
 * Sin acción propia todavía (no hay pantallas de tasa de cambio / puntos de
 * atención / ayuda en este flujo): se deja deshabilitado a propósito en vez
 * de navegar a algo que no existe.
 */
function AccesoRapido({
  icono,
  etiqueta,
  testID,
}: {
  icono: ImageSourcePropType;
  etiqueta: string;
  testID: string;
}): React.JSX.Element {
  return (
    <View style={styles.acceso} testID={testID}>
      <View style={styles.cuadroDeAcceso}>
        <Image source={icono} style={styles.iconoDeAcceso} />
      </View>
      <Text style={styles.etiquetaDeAcceso} numberOfLines={1}>
        {etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notaAlPie: FOOTNOTE_TEXT_STYLE,
  fondo: {
    flex: 1,
    backgroundColor: '#1A1718',
  },
  foto: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  contenedor: {
    flex: 1,
    paddingHorizontal: BscSpacing.gutter,
  },
  logo: {
    alignItems: 'center',
  },
  espacioSuperior: {
    flex: 2,
  },
  titulo: {
    ...BscTextStyles['Title L/48 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  lema: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  acciones: {
    marginTop: MEDIDAS.bienvenidaABotones,
  },
  entreBotones: {
    height: BscSpacing.sm,
  },
  error: {
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.onBrandNegative,
    textAlign: 'center',
    marginBottom: BscSpacing.sm,
  },
  iconoBiometrico: {
    width: 20,
    height: 20,
  },
  espacioInferior: {
    flex: 1,
    minHeight: BscSpacing.xl,
  },
  filaDeAccesos: {
    flexDirection: 'row',
  },
  acceso: {
    flex: 1,
    alignItems: 'center',
    gap: BscSpacing.xxs,
  },
  cuadroDeAcceso: {
    width: MEDIDAS.cuadroDeAcceso,
    height: MEDIDAS.cuadroDeAcceso,
    borderRadius: BscRadius.sm,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#E6E6E624',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoDeAcceso: {
    width: MEDIDAS.iconoDeAcceso,
    height: MEDIDAS.iconoDeAcceso,
  },
  etiquetaDeAcceso: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  fondoModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: withAlpha('#0F2033', 0.45),
  },
  zonaCierre: {
    flex: 1,
  },
  hoja: {
    backgroundColor: BscColors.surface,
    borderTopLeftRadius: BscRadius.sheet,
    borderTopRightRadius: BscRadius.sheet,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
  asa: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: BscColors.border,
    marginBottom: BscSpacing.md,
  },
  tituloHoja: {
    ...BscTypography.headlineSmall,
    marginBottom: BscSpacing.md,
  },
  errorHoja: {
    ...BscTypography.bodyMedium,
    color: BscColors.error,
    marginBottom: BscSpacing.xs,
  },
});
