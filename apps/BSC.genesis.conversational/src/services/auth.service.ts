import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';
import * as Keychain from 'react-native-keychain';
import {Passkey} from 'react-native-passkey';
import {jwtDecode} from 'jwt-decode';
import {APP_CONFIG, KEYCHAIN_CONFIG} from '@constants/config';
import {AUTH_ENDPOINTS, FIDO_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {useAuthStore} from '@store/auth.store';
import apiClient, {registerAuthTokenHandlers} from './api-client';
import SessionService from './session.service';
import {AUTH_MOCK} from '../mocks/auth/auth.mock';
import {FIDO2_MOCK} from '../mocks/auth/fido2.mock';
import {
  AccessTokenClaims,
  AuthApiResponse,
  AuthErrorCode,
  AuthTokens,
  LogoutApiResponse,
  PasskeyAssertionResult,
  PasskeyAttestationResult,
  PasskeyAuthenticationCompleteApiResponse,
  PasskeyAuthenticationOptionsApiResponse,
  PasskeyAuthenticationOptionsData,
  PasskeyRegistrationCompleteApiResponse,
  PasskeyRegistrationCompleteData,
  PasskeyRegistrationOptionsApiResponse,
  PasskeyRegistrationOptionsData,
} from '@/types/index';

// Marcador local (no sensible) de que este dispositivo tiene un acceso biométrico configurado y
// a qué cuenta pertenece. El secreto real (los tokens de sesión) vive únicamente en el Keychain,
// detrás de `KEYCHAIN_CONFIG.BIOMETRIC_SERVICE` con accessControl biométrico (ver más abajo).
// Mismo criterio que el marcador biométrico, pero para saber si este dispositivo ya tiene un
// Passkey registrado (y para qué cuenta). Lo escribe `completePasskeyRegistration` tras una
// respuesta exitosa; lo consultan las validaciones previas de `getPasskeyRegistrationOptions`.
const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: '@bsc_biometric_enabled',
  BIOMETRIC_USER: '@bsc_biometric_user',
  PASSKEY_ENABLED: '@bsc_passkey_enabled',
  PASSKEY_USER: '@bsc_passkey_user',
} as const;

// Ventana de gracia para no considerar expirado un token que vence en los próximos segundos
// (evita adjuntar un token que muy probablemente expire en pleno vuelo de la petición)
const ACCESS_TOKEN_EXPIRY_LEEWAY_SECONDS = 10;

export class AuthApiError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de Autenticación: login/logout contra el backend real (o mock), refrescamiento
 * automático del access token y guardado seguro de los tokens de sesión (Keychain).
 * Mantiene una copia en memoria de los tokens vigentes para no depender de una lectura
 * asíncrona al Keychain en cada petición saliente.
 */
class AuthService {
  private tokens: AuthTokens | null = null;

  // Deduplica refrescamientos concurrentes: si dos peticiones disparan un refresh al mismo
  // tiempo (el chequeo proactivo de expiración y un 401 reactivo, por ejemplo), ambas esperan
  // el mismo refresh en vez de disparar dos llamadas al backend.
  private refreshPromise: Promise<AuthTokens> | null = null;

  /**
   * Inicia sesión con email/contraseña. Si es exitoso, persiste los tokens de sesión; si no,
   * lanza el `AuthApiError` correspondiente. A diferencia de `loginWithBiometrics`, NO marca al
   * usuario como autenticado en el store: quien llama (`LoginScreen`) todavía necesita revisar
   * si este dispositivo tiene biometría configurada para decidir si avanza directo al Chat o si
   * primero pasa por `ConfigureAuthBiometricScreen`, y marcar la sesión antes de esa decisión
   * provocaría que el navegador cambie de stack (y muestre el Chat de fondo) antes de tiempo.
   */
  /**
   * Devuelve los `AuthTokens` de la sesión recién iniciada (incluye `biometricLivenessRequired` y
   * `deviceId`) para que quien llama (`LoginScreen`) decida si debe exigir la prueba de vida de
   * Autentikar antes de continuar el flujo, sin que este método tome esa decisión por su cuenta.
   */
  async login(
    email: string,
    password: string,
    extraHeaders?: Record<string, string>,
  ): Promise<AuthTokens> {
    let response: AuthApiResponse;

    try {
      response = await this.withTimeout(this.fetchLogin(email, password, extraHeaders));
    } catch (error) {
      throw this.mapApiError(error, 'UNKNOWN_ERROR', 'Ocurrió un error inesperado al iniciar sesión.');
    }

    if (!response.isSucceded || !response.data) {
      throw this.mapAuthErrorCode(response.code, response.message);
    }

    await this.persistTokens(response.data);
    return response.data;
  }

  /**
   * Traduce cualquier error de una petición HTTP de auth (rechazo de axios, timeout propio, etc.)
   * a un `AuthApiError`, priorizando siempre el `code` de negocio que haya devuelto la API —incluso
   * si vino en una respuesta con status HTTP de error (400/404, como en el endpoint de Passkey)—
   * sobre el motivo de fallo que reporte axios; este último solo se usa como respaldo cuando la
   * API no llegó a responder con un `code` mapeable (caída de red, timeout de axios, error 500 sin
   * body esperado, etc.). `mapCode` permite reutilizar esta misma lógica de extracción para
   * distintos endpoints, cada uno con su propio vocabulario de `code`s (login usa
   * `mapAuthErrorCode`, Passkey usa `mapPasskeyErrorCode`).
   */
  private mapApiError(
    error: unknown,
    fallbackCode: AuthErrorCode,
    fallbackMessage: string,
    mapCode: (code: string, message: string) => AuthApiError = this.mapAuthErrorCode.bind(this),
  ): AuthApiError {
    if (error instanceof AuthApiError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const apiResponse = error.response?.data as Partial<AuthApiResponse> | undefined;
      if (apiResponse?.code) {
        return mapCode(apiResponse.code, apiResponse.message ?? '');
      }
    }

    return new AuthApiError(fallbackCode, fallbackMessage);
  }

  private fetchLogin(
    email: string,
    password: string,
    extraHeaders?: Record<string, string>,
  ): Promise<AuthApiResponse> {
    return MOCK_CONFIG.AUTH.LOGIN
      ? AUTH_MOCK.login({email, password})
      : this.fetchLoginReal(email, password, extraHeaders);
  }

  /**
   * Llamada real al endpoint de login (se activa al poner MOCK_CONFIG.AUTH.LOGIN en `false`).
   * `extraHeaders` permite sumar headers puntuales a esta llamada (además de los headers por
   * defecto de `buildHeaders`) sin tener que tocar la firma de `login`.
   */
  private async fetchLoginReal(
    email: string,
    password: string,
    extraHeaders?: Record<string, string>,
  ): Promise<AuthApiResponse> {
    const {data} = await apiClient.post<AuthApiResponse>(
      AUTH_ENDPOINTS.LOGIN,
      {email, password},
      {headers: buildHeaders(extraHeaders), skipAuthRefresh: true},
    );

    return data;
  }

  /**
   * Cierra la sesión: notifica al backend (best-effort, no bloquea el logout local si falla),
   * limpia los tokens guardados en Keychain y saca al usuario del store.
   */
  async logout(extraHeaders?: Record<string, string>): Promise<void> {
    const refreshToken = this.tokens?.refreshToken;

    try {
      if (refreshToken) {
        await this.fetchLogout(refreshToken, extraHeaders);
      }
    } catch (error) {
      const mappedError = this.mapApiError(
        error,
        'UNKNOWN_ERROR',
        'No se pudo notificar el logout al backend.',
      );
      console.warn(
        'No se pudo notificar el logout al backend, se cierra sesión localmente.',
        mappedError,
      );
    } finally {
      await this.clearPersistedTokens();
      useAuthStore.getState().signOut();
    }
  }

  private fetchLogout(
    refreshToken: string,
    extraHeaders?: Record<string, string>,
  ): Promise<LogoutApiResponse> {
    return MOCK_CONFIG.AUTH.LOGOUT
      ? AUTH_MOCK.logout()
      : this.fetchLogoutReal(refreshToken, extraHeaders);
  }

  /**
   * Llamada real al endpoint de logout (se activa al poner MOCK_CONFIG.AUTH.LOGOUT en `false`).
   * Acepta `extraHeaders` por el mismo motivo que `fetchLoginReal`.
   */
  private async fetchLogoutReal(
    refreshToken: string,
    extraHeaders?: Record<string, string>,
  ): Promise<LogoutApiResponse> {
    const {data} = await apiClient.post<LogoutApiResponse>(
      AUTH_ENDPOINTS.LOGOUT,
      {refreshToken},
      {headers: buildHeaders(extraHeaders), skipAuthRefresh: true},
    );

    return data;
  }

  /**
   * Devuelve un access token utilizable para la próxima petición: si el actual sigue vigente
   * (verificado localmente con `jwt-decode`, sin llamar al backend) lo retorna tal cual; si ya
   * expiró, dispara un refresh y retorna el token nuevo. Si no hay sesión o el refresh falla,
   * retorna `null` (la petición sale sin Authorization y, de ser necesario, el interceptor de
   * respuesta de `apiClient` maneja el 401 resultante).
   */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      return null;
    }

    if (!this.isAccessTokenExpired(this.tokens.accessToken)) {
      return this.tokens.accessToken;
    }

    try {
      const refreshedTokens = await this.refreshAccessToken();
      return refreshedTokens.accessToken;
    } catch {
      return null;
    }
  }

  /**
   * Guarda tokens de sesión obtenidos por un flujo distinto al login (p. ej. al finalizar el
   * registro/onboarding), reutilizando el mismo guardado seguro en Keychain que usan
   * `login`/`refreshAccessToken`, para que quede como única fuente de verdad de la sesión.
   */
  async setSessionTokens(tokens: AuthTokens): Promise<void> {
    await this.persistTokens(tokens);
  }

  /**
   * Refresca el access token usando el refreshToken vigente. Deduplicado: llamadas concurrentes
   * comparten la misma promesa en vez de disparar múltiples refresh en paralelo.
   */
  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async performRefresh(): Promise<AuthTokens> {
    const refreshToken = this.tokens?.refreshToken;

    if (!refreshToken) {
      throw new AuthApiError('SESSION_EXPIRED', 'No hay una sesión activa para refrescar.');
    }

    let response: AuthApiResponse;

    try {
      response = await this.fetchRefresh(refreshToken);
    } catch (error) {
      throw this.mapApiError(
        error,
        'SESSION_EXPIRED',
        'La sesión expiró. Inicia sesión nuevamente.',
      );
    }

    if (!response.isSucceded || !response.data) {
      throw new AuthApiError(
        'SESSION_EXPIRED',
        response.message || 'La sesión expiró. Inicia sesión nuevamente.',
      );
    }

    await this.persistTokens(response.data);
    return response.data;
  }

  private fetchRefresh(refreshToken: string): Promise<AuthApiResponse> {
    return MOCK_CONFIG.AUTH.REFRESH
      ? AUTH_MOCK.refresh(refreshToken)
      : this.fetchRefreshReal(refreshToken);
  }

  /**
   * Llamada real al endpoint de refresh (se activa al poner MOCK_CONFIG.AUTH.REFRESH en `false`).
   * Acepta `extraHeaders` por el mismo motivo que `fetchLoginReal`.
   */
  private async fetchRefreshReal(
    refreshToken: string,
    extraHeaders?: Record<string, string>,
  ): Promise<AuthApiResponse> {
    const {data} = await apiClient.post<AuthApiResponse>(
      AUTH_ENDPOINTS.REFRESH,
      {refreshToken},
      {headers: buildHeaders(extraHeaders), skipAuthRefresh: true},
    );

    return data;
  }

  /**
   * Decodifica el payload del accessToken (JWT) para leer su `exp` y decidir localmente si ya
   * venció, sin necesidad de consultar al backend.
   */
  private isAccessTokenExpired(accessToken: string): boolean {
    try {
      const {exp} = jwtDecode<AccessTokenClaims>(accessToken);

      if (!exp) {
        return true;
      }

      const nowInSeconds = Date.now() / 1000;
      return exp - ACCESS_TOKEN_EXPIRY_LEEWAY_SECONDS <= nowInSeconds;
    } catch {
      return true;
    }
  }

  /**
   * Guarda los tokens de sesión en el Keychain del dispositivo. Solo actualiza la copia en
   * memoria si el guardado seguro fue exitoso, para no dejar al usuario en un estado
   * "autenticado" cuya sesión no quedó persistida. Maneja sus propios errores, independientes
   * de los de la petición de login/refresh que la origina.
   */
  private async persistTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Keychain.setGenericPassword(KEYCHAIN_CONFIG.USERNAME, JSON.stringify(tokens), {
        service: KEYCHAIN_CONFIG.SERVICE,
      });
      this.tokens = tokens;
    } catch {
      throw new AuthApiError(
        'SESSION_STORAGE_ERROR',
        'No se pudo guardar la sesión de forma segura en este dispositivo.',
      );
    }

    this.updateUserFromAccessToken(tokens.accessToken);
  }

  /**
   * Decodifica el accessToken recién persistido para leer `full_name` (nombre del cliente, para
   * el store de auth) e `internal_id` (`clientId` real del WebSocket del chat, ver `getClientId`).
   * Se ejecuta desde `persistTokens`, así que cubre por igual login con contraseña, biometría y
   * el cierre de sesión de registro (`setSessionTokens`): ningún flujo necesita sincronizar el
   * `clientId` por su cuenta.
   */
  private updateUserFromAccessToken(accessToken: string): void {
    let claims: AccessTokenClaims;

    try {
      claims = jwtDecode<AccessTokenClaims>(accessToken);
    } catch (error) {
      console.warn('No se pudo decodificar el accessToken de la sesión.', error);
      return;
    }

    if (claims.internal_id) {
      SessionService.setClientId(claims.internal_id);
    }

    if (!claims.full_name) {
      return;
    }

    useAuthStore.getState().setUser({
      nombreCompleto: claims.full_name,
      primerNombre: claims.full_name.split(' ')[0],
      // Solo se sobreescribe si el claim viene presente: un refresh posterior que no lo incluya
      // no debe borrar el numeroDocumento ya conocido de la sesión.
      ...(claims.document_number ? {numeroDocumento: claims.document_number} : {}),
    });
  }

  /**
   * Limpia los tokens del Keychain y de memoria. No relanza errores del Keychain: el logout
   * local (store) siempre debe completarse aunque falle el borrado seguro.
   */
  private async clearPersistedTokens(): Promise<void> {
    this.tokens = null;

    try {
      await Keychain.resetGenericPassword({service: KEYCHAIN_CONFIG.SERVICE});
    } catch (error) {
      console.warn('No se pudo limpiar la sesión almacenada en el Keychain.', error);
    }
  }

  /**
   * Traduce el `code` de negocio del endpoint de login al `AuthErrorCode` interno de la app.
   */
  private mapAuthErrorCode(code: string, message: string): AuthApiError {
    if (code === 'USER_BLOCKED') {
      return new AuthApiError('USER_BLOCKED', message || 'Cuenta bloqueada temporalmente.');
    }

    if (code === 'INVALID_CREDENTIALS') {
      return new AuthApiError(
        'INVALID_CREDENTIALS',
        message || 'Usuario o contraseña incorrectos.',
      );
    }

    return new AuthApiError('UNKNOWN_ERROR', message || 'Ocurrió un error inesperado.');
  }

  /**
   * Traduce el `code` de negocio de los endpoints de Passkey (FIDO2) al `AuthErrorCode` interno
   * de la app. A diferencia de login, estos códigos llegan junto a un status HTTP de error
   * (400 `CHALLENGE_EXPIRED`, 404 `USER_NOT_FOUND`), que `mapApiError` ya se encarga de leer del
   * body de la respuesta de error de axios antes de llegar acá.
   */
  private mapPasskeyErrorCode(code: string, message: string): AuthApiError {
    if (code === 'CHALLENGE_EXPIRED') {
      return new AuthApiError(
        'PASSKEY_CHALLENGE_EXPIRED',
        message || 'El desafío del passkey expiró. Intenta nuevamente.',
      );
    }

    if (code === 'USER_NOT_FOUND') {
      return new AuthApiError(
        'PASSKEY_USER_NOT_FOUND',
        message || 'No se encontró el usuario para el passkey.',
      );
    }

    if (code === 'NO_PASSKEYS_REGISTERED') {
      return new AuthApiError(
        'PASSKEY_NO_CREDENTIALS_REGISTERED',
        message || 'Esta cuenta no tiene ningún passkey registrado.',
      );
    }

    if (code === 'ASSERTION_FAILED') {
      // 401 de POST /oauth/token: email desconocido, credencial no encontrada, credencial de
      // otra cuenta, o falló la verificación de firma. El backend no distingue cuál de esos
      // casos fue, así que se muestra como un error de identidad genérico (equivalente al
      // INVALID_CREDENTIALS del login con contraseña).
      return new AuthApiError(
        'PASSKEY_ASSERTION_FAILED',
        message || 'No se pudo verificar el passkey para esta cuenta.',
      );
    }

    return new AuthApiError(
      'UNKNOWN_ERROR',
      message || 'Ocurrió un error inesperado al procesar el passkey.',
    );
  }

  /**
   * WORKAROUND temporal: `/auth/fido2/register/options` y `/auth/fido2/authenticate/options`
   * devuelven el identificador de Relying Party (`rp.id`/`rpId`) como URL completa
   * (ej. `https://bsc.com.do`), pero WebAuthn exige que sea un dominio puro, sin esquema — de lo
   * contrario `Passkey.create()`/`Passkey.get()` fallan a nivel nativo. Mientras el backend no lo
   * corrija, se sobreescribe con `FIDO_APPLINK_HOST` del `.env` (el mismo dominio que ya usa el
   * App Link del AndroidManifest). Es CRÍTICO que registro y autenticación usen siempre el mismo
   * valor acá: un passkey creado bajo un `rp.id` solo puede autenticar con ese mismo `rp.id`.
   */
  private resolvePasskeyRpId(rpIdFromBackend: string): string {
    if (!Config.FIDO_APPLINK_HOST) {
      console.warn(
        '[AuthService] FIDO_APPLINK_HOST no está configurado en el .env; se usa el rp.id que devolvió el backend tal cual.',
      );
      return rpIdFromBackend;
    }

    return Config.FIDO_APPLINK_HOST;
  }

  /**
   * Aplica un timeout propio a la petición de login, ya sea mock o real
   */
  private withTimeout<T>(requestPromise: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new AuthApiError('TIMEOUT', 'Tiempo de espera agotado al iniciar sesión.'));
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }

  /**
   * Activa el inicio de sesión biométrico para `clientId`: guarda los tokens de la sesión activa
   * detrás de una entrada de Keychain distinta a la de sesión normal, protegida con
   * `accessControl` biométrico, de forma que solo el sistema operativo (no la app) pueda
   * descifrarla, y únicamente tras un gesto biométrico válido. Requiere que ya exista una sesión
   * vigente (login con usuario/contraseña recién exitoso).
   */
  async enableBiometricLogin(
    clientId: string,
    authenticationPrompt: Keychain.AuthenticationPrompt,
  ): Promise<void> {
    if (!this.tokens) {
      throw new AuthApiError(
        'SESSION_STORAGE_ERROR',
        'No hay una sesión activa para asociar a la biometría.',
      );
    }

    const normalizedClientId = clientId.trim().toLowerCase();

    try {
      await Keychain.setGenericPassword(normalizedClientId, JSON.stringify(this.tokens), {
        service: KEYCHAIN_CONFIG.BIOMETRIC_SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        authenticationPrompt,
      });
    } catch {
      throw new AuthApiError(
        'SESSION_STORAGE_ERROR',
        'No se pudo activar la biometría en este dispositivo.',
      );
    }

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.BIOMETRIC_ENABLED, 'true'],
      [STORAGE_KEYS.BIOMETRIC_USER, normalizedClientId],
    ]);
  }

  /**
   * Desactiva el inicio de sesión biométrico: borra la entrada protegida del Keychain y su
   * marcador local. No afecta a la sesión activa (los tokens de `persistTokens`), solo al atajo
   * biométrico de acceso.
   */
  async disableBiometricLogin(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({service: KEYCHAIN_CONFIG.BIOMETRIC_SERVICE});
    } catch (error) {
      console.warn('No se pudo limpiar el acceso biométrico del Keychain.', error);
    }

    await AsyncStorage.multiRemove([STORAGE_KEYS.BIOMETRIC_ENABLED, STORAGE_KEYS.BIOMETRIC_USER]);
  }

  /**
   * Indica si este dispositivo tiene un acceso biométrico configurado, sin disparar el prompt
   * nativo (solo consulta el marcador local, no descifra ningún secreto).
   */
  async isBiometricLoginEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  }

  /** `clientId` (normalizado) asociado al acceso biométrico configurado, o `null` si no hay ninguno. */
  async getBiometricLoginUser(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_USER);
  }

  /**
   * Inicia sesión con biometría: dispara el prompt nativo del sistema operativo (gestionado por
   * el propio Keychain, ligado al hardware biométrico) para descifrar los tokens guardados por
   * `enableBiometricLogin`, los restaura como sesión activa y marca al usuario autenticado.
   * Devuelve `false` si el usuario cancela el gesto, si la biometría del dispositivo cambió
   * (invalidando la entrada) o si no hay ningún acceso biométrico configurado; no lanza en
   * ninguno de esos casos, son parte del flujo esperado de UX.
   */
  async loginWithBiometrics(authenticationPrompt: Keychain.AuthenticationPrompt): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_CONFIG.BIOMETRIC_SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        authenticationPrompt,
      });

      if (!credentials) {
        return false;
      }

      const tokens = JSON.parse(credentials.password) as AuthTokens;
      await this.persistTokens(tokens);
      useAuthStore.getState().login();
      return true;
    } catch (error) {
      console.log('[AuthService] loginWithBiometrics error', error);
      return false;
    }
  }

  /**
   * Indica si este dispositivo soporta Passkeys (autenticador FIDO2/WebAuthn) a nivel de sistema
   * operativo. Chequeo local y síncrono (no dispara ningún prompt nativo ni llama al backend);
   * úsalo para decidir si ofrecer la opción de Passkey antes de intentar registrar una.
   */
  isPasskeySupported(): boolean {
    try {
      const supported = Passkey.isSupported();
      console.log('[AuthService] Passkey.isSupported():', supported);
      return supported;
    } catch (error) {
      console.warn('[AuthService] Passkey.isSupported error', error);
      return false;
    }
  }

  /**
   * Indica si este dispositivo ya tiene un Passkey registrado (marcador local, ver
   * `STORAGE_KEYS.PASSKEY_ENABLED`), sin disparar ningún prompt nativo.
   */
  async isPasskeyRegistered(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.PASSKEY_ENABLED);
    return enabled === 'true';
  }

  /** `email` (normalizado) asociado al Passkey registrado en este dispositivo, o `null` si no hay ninguno. */
  async getPasskeyRegisteredUser(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.PASSKEY_USER);
  }

  /**
   * Primer paso del registro de un Passkey (FIDO2/WebAuthn): obtiene del backend el `challenge` y
   * las `PublicKeyCredentialCreationOptions` que luego se le pasan tal cual a `Passkey.create()`
   * (WebAuthn) para producir el `attestationResponse` que consume `completePasskeyRegistration`.
   * Antes de llamar al backend corre las validaciones de negocio que evitan un viaje de red
   * innecesario:
   * - El dispositivo debe soportar Passkeys a nivel de sistema operativo.
   * - Esta cuenta no debe tener ya un Passkey registrado en este dispositivo.
   * - El email debe venir presente (lo exige el propio payload del endpoint).
   *
   * A propósito NO valida disponibilidad de biometría (`BiometricService`): la verificación de
   * usuario del Passkey (`authenticatorSelection.userVerification`) la resuelve el sistema
   * operativo en `Passkey.create()` y acepta tanto biometría como PIN/patrón del dispositivo, así
   * que exigir biometría acá bloquearía innecesariamente a usuarios con solo PIN configurado.
   */
  async getPasskeyRegistrationOptions(email: string): Promise<PasskeyRegistrationOptionsData> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new AuthApiError(
        'PASSKEY_INVALID_EMAIL',
        'Ingresa un correo válido para registrar el passkey.',
      );
    }

    if (!this.isPasskeySupported()) {
      throw new AuthApiError(
        'PASSKEY_NOT_SUPPORTED',
        'Este dispositivo no soporta el registro de passkeys.',
      );
    }

    const [alreadyRegistered, registeredUser] = await Promise.all([
      this.isPasskeyRegistered(),
      this.getPasskeyRegisteredUser(),
    ]);

    if (alreadyRegistered && registeredUser === normalizedEmail) {
      throw new AuthApiError(
        'PASSKEY_ALREADY_REGISTERED',
        'Ya existe un passkey registrado para esta cuenta en este dispositivo.',
      );
    }

    let response: PasskeyRegistrationOptionsApiResponse;

    try {
      response = await this.withTimeout(this.fetchPasskeyRegistrationOptions(normalizedEmail));
    } catch (error) {
      throw this.mapApiError(
        error,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado al preparar el registro del passkey.',
        this.mapPasskeyErrorCode.bind(this),
      );
    }

    if (!response.isSucceded || !response.data) {
      throw this.mapPasskeyErrorCode(response.code, response.message);
    }

    return {
      ...response.data,
      rp: {...response.data.rp, id: this.resolvePasskeyRpId(response.data.rp.id)},
    };
  }

  private fetchPasskeyRegistrationOptions(
    email: string,
  ): Promise<PasskeyRegistrationOptionsApiResponse> {
    return MOCK_CONFIG.FIDO.REGISTER_OPTIONS
      ? FIDO2_MOCK.getRegisterOptions({email})
      : this.fetchPasskeyRegistrationOptionsReal(email);
  }

  /**
   * Llamada real al primer endpoint FIDO2 (se activa al poner MOCK_CONFIG.FIDO.REGISTER_OPTIONS
   * en `false`). Igual que login/logout/refresh, marca `skipAuthRefresh`: este endpoint se llama
   * antes de que exista sesión (es una vía de inicio de sesión alternativa a usuario/contraseña),
   * así que un eventual 401 no debe disparar el flujo de refresh-token.
   */
  private async fetchPasskeyRegistrationOptionsReal(
    email: string,
  ): Promise<PasskeyRegistrationOptionsApiResponse> {
    const {data} = await apiClient.post<PasskeyRegistrationOptionsApiResponse>(
      FIDO_ENDPOINTS.REGISTER_OPTIONS,
      {email},
      {headers: buildHeaders(), skipAuthRefresh: true},
    );

    return data;
  }

  /**
   * Segundo y último paso del registro de un Passkey: sube al backend el `attestationResponse`
   * que produjo `Passkey.create()` (WebAuthn) a partir de las opciones de
   * `getPasskeyRegistrationOptions`, y se transmite tal cual lo entrega el autenticador, sin
   * transformarlo. Si el backend lo acepta, marca este dispositivo como "con passkey registrado"
   * para esa cuenta (mismo marcador local que consulta `getPasskeyRegistrationOptions`), de forma
   * que este passkey conviva con el resto de accesos configurados en el dispositivo
   * (contraseña, biometría) sin pisarlos: cada uno vive en su propio marcador/entrada de Keychain.
   */
  async completePasskeyRegistration(
    email: string,
    attestationResponse: PasskeyAttestationResult,
  ): Promise<PasskeyRegistrationCompleteData> {
    const normalizedEmail = email.trim().toLowerCase();

    let response: PasskeyRegistrationCompleteApiResponse;

    try {
      response = await this.withTimeout(
        this.fetchCompletePasskeyRegistration(normalizedEmail, attestationResponse),
      );
    } catch (error) {
      console.log(
        '[AuthService] completePasskeyRegistration FALLÓ - error crudo:',
        axios.isAxiosError(error)
          ? {status: error.response?.status, data: error.response?.data, message: error.message}
          : error,
      );
      throw this.mapApiError(
        error,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado al completar el registro del passkey.',
        this.mapPasskeyErrorCode.bind(this),
      );
    }

    if (!response.isSucceded || !response.data) {
      throw this.mapPasskeyErrorCode(response.code, response.message);
    }

    await this.markPasskeyRegistered(normalizedEmail);

    return response.data;
  }

  private fetchCompletePasskeyRegistration(
    email: string,
    attestationResponse: PasskeyAttestationResult,
  ): Promise<PasskeyRegistrationCompleteApiResponse> {
    return MOCK_CONFIG.FIDO.REGISTER_COMPLETE
      ? FIDO2_MOCK.completeRegistration({email, attestationResponse})
      : this.fetchCompletePasskeyRegistrationReal(email, attestationResponse);
  }

  /**
   * Llamada real al segundo endpoint FIDO2 (se activa al poner MOCK_CONFIG.FIDO.REGISTER_COMPLETE
   * en `false`). `skipAuthRefresh` por el mismo motivo que `fetchPasskeyRegistrationOptionsReal`:
   * todavía no hay sesión en este punto del flujo.
   */
  private async fetchCompletePasskeyRegistrationReal(
    email: string,
    attestationResponse: PasskeyAttestationResult,
  ): Promise<PasskeyRegistrationCompleteApiResponse> {
    const {deviceInfo} = useAuthStore.getState();
    const {data} = await apiClient.post<PasskeyRegistrationCompleteApiResponse>(
      FIDO_ENDPOINTS.REGISTER_COMPLETE,
      {email, attestationResponse},
      {
        headers: buildHeaders({'x-device-data': JSON.stringify(deviceInfo)}),
        skipAuthRefresh: true,
      },
    );

    return data;
  }

  /**
   * Guarda el marcador local de que este dispositivo tiene un Passkey registrado para `email`
   * (ver `STORAGE_KEYS.PASSKEY_ENABLED`/`PASSKEY_USER`), igual que `enableBiometricLogin` hace
   * para la biometría. Solo se llama tras una respuesta exitosa de `completePasskeyRegistration`.
   */
  private async markPasskeyRegistered(email: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.PASSKEY_ENABLED, 'true'],
      [STORAGE_KEYS.PASSKEY_USER, email],
    ]);
  }

  /**
   * Primer paso del inicio de sesión con Passkey: obtiene del backend el `challenge` y las
   * `PublicKeyCredentialRequestOptions` que luego se le pasan tal cual a `Passkey.get()`
   * (WebAuthn) para producir la aserción que confirma la identidad del usuario.
   *
   * A propósito NO valida acá si este dispositivo tiene un Passkey registrado localmente (ver
   * `isPasskeyRegistered`): un Passkey con `residentKey: preferred/required` puede sincronizarse
   * entre dispositivos del usuario (Google Password Manager, iCloud Keychain), así que la única
   * fuente de verdad de si existe una credencial usable es el backend — de ahí que
   * `NO_PASSKEYS_REGISTERED` sea un error de negocio de este endpoint y no una validación local.
   *
   * El "paso 2" de este flujo (verificar la aserción y emitir los `AuthTokens`) es
   * `authenticateWithPasskey`, más abajo.
   */
  async getPasskeyAuthenticationOptions(email: string): Promise<PasskeyAuthenticationOptionsData> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new AuthApiError(
        'PASSKEY_INVALID_EMAIL',
        'Ingresa un correo válido para iniciar sesión con passkey.',
      );
    }

    if (!this.isPasskeySupported()) {
      throw new AuthApiError(
        'PASSKEY_NOT_SUPPORTED',
        'Este dispositivo no soporta el inicio de sesión con passkeys.',
      );
    }

    let response: PasskeyAuthenticationOptionsApiResponse;

    try {
      response = await this.withTimeout(this.fetchPasskeyAuthenticationOptions(normalizedEmail));
    } catch (error) {
      throw this.mapApiError(
        error,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado al preparar el inicio de sesión con passkey.',
        this.mapPasskeyErrorCode.bind(this),
      );
    }

    if (!response.isSucceded || !response.data) {
      throw this.mapPasskeyErrorCode(response.code, response.message);
    }

    return {
      ...response.data,
      rpId: this.resolvePasskeyRpId(response.data.rpId),
    };
  }

  private fetchPasskeyAuthenticationOptions(
    email: string,
  ): Promise<PasskeyAuthenticationOptionsApiResponse> {
    return MOCK_CONFIG.FIDO.AUTHENTICATE_OPTIONS
      ? FIDO2_MOCK.getAuthenticateOptions({email})
      : this.fetchPasskeyAuthenticationOptionsReal(email);
  }

  /**
   * Llamada real al tercer endpoint FIDO2 (se activa al poner MOCK_CONFIG.FIDO.AUTHENTICATE_OPTIONS
   * en `false`). `skipAuthRefresh` por el mismo motivo que el resto de llamadas de Passkey: todavía
   * no hay sesión en este punto del flujo (es, precisamente, una vía para iniciarla).
   */
  private async fetchPasskeyAuthenticationOptionsReal(
    email: string,
  ): Promise<PasskeyAuthenticationOptionsApiResponse> {
    const {data} = await apiClient.post<PasskeyAuthenticationOptionsApiResponse>(
      FIDO_ENDPOINTS.AUTHENTICATE_OPTIONS,
      {email},
      {headers: buildHeaders(), skipAuthRefresh: true},
    );

    return data;
  }

  /**
   * Segundo y último paso del inicio de sesión con Passkey: sube al backend la
   * `assertionResponse` que produjo `Passkey.get()` (WebAuthn) a partir de las opciones de
   * `getPasskeyAuthenticationOptions`, transmitida tal cual la entrega el autenticador. Si el
   * backend la verifica, persiste los `AuthTokens` resultantes igual que `login` — de ahí en
   * adelante la sesión es indistinguible de un login con contraseña o biometría — y marca este
   * dispositivo como "con passkey registrado" para esa cuenta (mismo marcador que usa
   * `completePasskeyRegistration`), cubriendo el caso de un passkey sincronizado desde otro
   * dispositivo que nunca pasó por el registro local.
   *
   * A propósito NO marca la sesión como autenticada en el store (`useAuthStore.getState().login()`):
   * mismo motivo que `login()` con contraseña — quien llama (`LoginScreen`) todavía necesita
   * decidir si ofrece configurar biometría antes de saltar al Chat.
   */
  async authenticateWithPasskey(
    email: string,
    assertionResponse: PasskeyAssertionResult,
  ): Promise<AuthTokens> {
    const normalizedEmail = email.trim().toLowerCase();

    let response: PasskeyAuthenticationCompleteApiResponse;

    try {
      response = await this.withTimeout(
        this.fetchCompletePasskeyAuthentication(normalizedEmail, assertionResponse),
      );
    } catch (error) {
      throw this.mapApiError(
        error,
        'UNKNOWN_ERROR',
        'Ocurrió un error inesperado al iniciar sesión con passkey.',
        this.mapPasskeyErrorCode.bind(this),
      );
    }

    if (!response.isSucceded || !response.data) {
      throw this.mapPasskeyErrorCode(response.code, response.message);
    }

    await this.persistTokens(response.data);
    await this.markPasskeyRegistered(normalizedEmail);
    return response.data;
  }

  private fetchCompletePasskeyAuthentication(
    email: string,
    assertionResponse: PasskeyAssertionResult,
  ): Promise<PasskeyAuthenticationCompleteApiResponse> {
    return MOCK_CONFIG.FIDO.AUTHENTICATE_COMPLETE
      ? FIDO2_MOCK.completeAuthentication({email, assertionResponse})
      : this.fetchCompletePasskeyAuthenticationReal(email, assertionResponse);
  }

  /**
   * Llamada real al cuarto endpoint FIDO2 (POST /oauth/token, código de éxito `TOKEN_ISSUED`).
   * `skipAuthRefresh` por el mismo motivo que el resto de llamadas de Passkey: todavía no hay
   * sesión en este punto del flujo.
   */
  private async fetchCompletePasskeyAuthenticationReal(
    email: string,
    assertionResponse: PasskeyAssertionResult,
  ): Promise<PasskeyAuthenticationCompleteApiResponse> {
const {deviceInfo} = useAuthStore.getState();
    const {data} = await apiClient.post<PasskeyAuthenticationCompleteApiResponse>(
      FIDO_ENDPOINTS.AUTHENTICATE_COMPLETE,
      {email, assertionResponse},
      {headers: buildHeaders({'x-device-data': JSON.stringify(deviceInfo)}),
       skipAuthRefresh: true},
    );
    return data;
  }
}

const authService = new AuthService();

// Le da a `apiClient` acceso a los métodos de token sin que `api-client.ts` importe este
// archivo directamente (ver el comentario de `registerAuthTokenHandlers` en api-client.ts).
registerAuthTokenHandlers({
  getValidAccessToken: () => authService.getValidAccessToken(),
  refreshAccessToken: () => authService.refreshAccessToken(),
});

export default authService;
