import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {ONBOARDING_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {SERVICE_ERRORS} from '@constants/serviceErrors';
import {useAuthStore} from '@store/auth.store';
import {useOnboardingStore} from '@store/onboarding.store';
import {sha256} from '@utils/index';
import DeviceInfoService from './device-info.service';
import {ONBOARDING_MOCK} from '../mocks/onboarding/onboarding.mock';
import {
  AcceptTermsAndConditionsApiResponse,
  AcceptTermsAndConditionsRequest,
  BscResponse,
  ClientInformationRequest,
  ClientInformationResponse,
  OnboardingErrorCode,
  RegisterUserApiResponse,
  RegisterUserRequest,
  RegisterUserResult,
  RegistrationSessionApiResponse,
  RegistrationSessionCompleteApiResponse,
  RegistrationSessionData,
  RegistrationSessionRequest,
  RegistrationSessionTokens,
  RegistrationSessionUserLinkApiResponse,
  RegistrationSessionUserLinkRequest,
  RegistrationSessionUserLinkResult,
  TermsAndConditionsApiResponse,
  VerifyClientDocumentApiResponse,
} from '@/types/index';

export class OnboardingApiError extends Error {
  code: OnboardingErrorCode;

  constructor(code: OnboardingErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de Onboarding: consultas de verificación de identidad del cliente
 */
class OnboardingService {
  // Deduplica renovaciones de sesión concurrentes: si dos llamadas de paso fallan por
  // SESSION_EXPIRED al mismo tiempo, ambas esperan la misma renovación en vez de crear
  // dos sesiones nuevas.
  private refreshSessionPromise: Promise<RegistrationSessionData> | null = null;

  /**
   * Verifica si el número de documento existe y es válido para continuar el registro.
   * Decide mock vs. real según MOCK_CONFIG, aplica timeout, homologa el manejo de errores
   * HTTP con `mapError` y valida la regla de negocio de estado del cliente.
   */
  async verifyClientDocument(
    numeroDocumento: string,
    categoria: string,
  ): Promise<ClientInformationResponse> {
    const request: ClientInformationRequest = {numeroDocumento, categoria};

    const requestPromise = MOCK_CONFIG.ONBOARDING.VERIFY_CLIENT_DOCUMENT
      ? ONBOARDING_MOCK.verifyClientDocument(request)
      : this.fetchClientDocumentReal(request);

    const response = await this.withTimeout(requestPromise);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code ?? errorBody?.headers?.code;

      const reasonPhrase =
        errorBody?.headers?.reasonPhrase ||
        errorBody?.message ||
        (typeof errorBody === 'string' ? errorBody : '') ||
        response.statusText;

      // El backend puede responder con HTTP no-2xx y aun así incluir el código de negocio
      // (EGEN00x) en el body. Se reutiliza el mismo mapeo que la rama `isSucceded: false`
      // para no duplicar la traducción código-a-error; solo se cae al mapeo por status HTTP
      // cuando no viene ningún código de negocio (fallo de red/servidor sin body útil).
      throw backendCode
        ? this.mapBusinessCode(backendCode, reasonPhrase)
        : this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de onboarding.',
      );
    })) as VerifyClientDocumentApiResponse;
    if (!isSucceded) {
      throw this.mapBusinessCode(code, message);
    }

    const cliente = data as ClientInformationResponse;

    if (cliente.estadoPersona !== 'A') {
      throw new OnboardingApiError('CLIENT_WITHOUT_DATA', 'El cliente no se encuentra activo.');
    }

    const haveCelular = cliente.telefonos?.some(telefono => telefono.tipoTelefono === 'Celular');

    if (!haveCelular) {
      throw new OnboardingApiError('CLIENT_WITHOUT_DATA', 'El cliente no tiene un teléfono de tipo celular registrado.');
    }

    return cliente;
  }

  /**
   * Traduce el `code` de negocio devuelto por el endpoint (siempre HTTP 200, éxito/error
   * discriminado por `isSucceded`/`code`) al `OnboardingErrorCode` interno de la app.
   */
  private mapBusinessCode(code: string, message: string): OnboardingApiError {
    const {CLIENT_NOT_VALIDATED, CLIENT_WITHOUT_DATA, MAX_ATTEMPTS_EXCEEDED} =
      SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT;

    if (code === CLIENT_WITHOUT_DATA.code) {
      return new OnboardingApiError('CLIENT_WITHOUT_DATA', message || CLIENT_WITHOUT_DATA.message);
    }

    if (code === CLIENT_NOT_VALIDATED.code) {
      return new OnboardingApiError('CLIENT_NOT_VALIDATED', message || CLIENT_NOT_VALIDATED.message);
    }

    if (code === MAX_ATTEMPTS_EXCEEDED.code) {
      return new OnboardingApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        message || MAX_ATTEMPTS_EXCEEDED.message,
      );
    }

    return new OnboardingApiError('UNKNOWN_ERROR', message || 'Ocurrió un error inesperado.');
  }

  /**
   * Llamada real al endpoint de verificación de cliente (se activa al poner
   * MOCK_CONFIG.ONBOARDING.VERIFY_CLIENT_DOCUMENT en `false`). Traduce errores de red a
   * OnboardingApiError para que el caller solo tenga que manejar un único tipo de error.
   */
  private fetchClientDocumentReal(request: ClientInformationRequest): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.VERIFY_CLIENT_DOCUMENT}`;
    const {deviceInfo} = useAuthStore.getState();
    console.log('deviceinfo',  JSON.stringify(deviceInfo));
    return fetch(url, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al consultar la información del cliente.',
      );
    });
  }

  /**
   * Obtiene el texto de los Términos y Condiciones
   */
  async getTermsAndConditions(): Promise<string> {
    const requestPromise = MOCK_CONFIG.ONBOARDING.TERMS_AND_CONDITIONS
      ? ONBOARDING_MOCK.getTermsAndConditions()
      : this.fetchTermsAndConditionsReal();

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw this.mapError(response.status, errorBody?.message || response.statusText);
    }

    const {isSucceded, message, data} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de términos y condiciones.',
      );
    })) as TermsAndConditionsApiResponse;

    if (!isSucceded || !data) {
      throw this.mapError(response.status, message);
    }

    return data.content;
  }

  /**
   * Registra la aceptación de los Términos y Condiciones del cliente. `numeroDocumento` es el
   * documento verificado en pantalla; se envía hasheado con SHA256. El `termsDocumentId` es
   * siempre 1 (único documento vigente). Su fallo NO debe frenar el avance del onboarding: el
   * caller decide qué hacer con el error (hoy: loguear e ignorar).
   */
  async acceptTermsAndConditions(numeroDocumento: string): Promise<void> {
    const request: AcceptTermsAndConditionsRequest = {
      termsDocumentId: 1,
      documentNumberHash: sha256(numeroDocumento),
    };

    const requestPromise = MOCK_CONFIG.ONBOARDING.ACCEPT_TERMS_AND_CONDITIONS
      ? ONBOARDING_MOCK.acceptTermsAndConditions(request)
      : this.fetchAcceptTermsAndConditionsReal(request);

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw this.mapError(response.status, errorBody?.message || response.statusText);
    }

    const {isSucceded, message} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de aceptación de términos y condiciones.',
      );
    })) as AcceptTermsAndConditionsApiResponse;

    if (!isSucceded) {
      throw this.mapError(response.status, message);
    }
  }

  /**
   * Obtiene el texto de la Política de datos personales
   */
  async getPersonalDataPolicy(): Promise<string> {
    const requestPromise = MOCK_CONFIG.ONBOARDING.PERSONAL_DATA_POLICY
      ? ONBOARDING_MOCK.getPersonalDataPolicy()
      : this.fetchPersonalDataPolicyReal();

    const {bscResponse} = await this.withTimeout(requestPromise);
    const {statusCode, reasonPhrase} = bscResponse.headers;
    const data = bscResponse.content?.data;

    if (statusCode === 200 && data) {
      return data;
    }

    throw this.mapError(statusCode, reasonPhrase);
  }

  /**
   * Registra el email y contraseña con los que el cliente accederá a la aplicación, asociándolos
   * al `internalId` (codigoPersona) del cliente verificado durante el onboarding. Sigue el mismo
   * manejo de errores que `verifyClientDocument`: HTTP no-2xx con código de negocio en el body,
   * o HTTP 200 con `isSucceded: false`.
   */
  async registerUser(request: RegisterUserRequest): Promise<RegisterUserResult> {
    const requestPromise = MOCK_CONFIG.ONBOARDING.REGISTER_USER
      ? ONBOARDING_MOCK.registerUser(request)
      : this.fetchRegisterUserReal(request);

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code;
      const reasonPhrase = errorBody?.message || response.statusText;

      throw backendCode
        ? this.mapRegisterUserBusinessCode(backendCode, reasonPhrase)
        : this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de registro de usuario.',
      );
    })) as RegisterUserApiResponse;

    if (!isSucceded || !data) {
      throw this.mapRegisterUserBusinessCode(code, message);
    }

    return data;
  }

  /**
   * Traduce el `code` de negocio del endpoint de registro de usuario al `OnboardingErrorCode`
   * interno de la app.
   */
  private mapRegisterUserBusinessCode(code: string, message: string): OnboardingApiError {
    const {EMAIL_ALREADY_EXISTS} = SERVICE_ERRORS.ONBOARDING.REGISTER_USER;

    if (code === EMAIL_ALREADY_EXISTS.code) {
      return new OnboardingApiError(
        'EMAIL_ALREADY_EXISTS',
        message || EMAIL_ALREADY_EXISTS.message,
      );
    }

    return new OnboardingApiError('UNKNOWN_ERROR', message || 'Ocurrió un error inesperado.');
  }

  /**
   * Llamada real al endpoint de registro de usuario (se activa al poner
   * MOCK_CONFIG.ONBOARDING.REGISTER_USER en `false`)
   */
  private fetchRegisterUserReal(request: RegisterUserRequest): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.REGISTER_USER}`;
    const {deviceInfo} = useAuthStore.getState();
    const {registrationSession} = useOnboardingStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
        'x-session-token': registrationSession?.sessionToken ?? '',
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al registrar el usuario.',
      );
    });
  }

  /**
   * Registra la sesión del cliente mientras se registra: hashea el número de documento con el
   * que fue verificado (va en la URL) y envía la IP del dispositivo. Se llama antes de avanzar
   * a la confirmación de datos de contacto.
   */
  async createRegistrationSession(numeroDocumento: string): Promise<RegistrationSessionData> {
    const documentHash = sha256(numeroDocumento);
    const ip = await DeviceInfoService.getIpAddress();
    const request: RegistrationSessionRequest = {ip, channel: 'mobile'};

    const requestPromise = MOCK_CONFIG.ONBOARDING.CREATE_REGISTRATION_SESSION
      ? ONBOARDING_MOCK.createRegistrationSession(documentHash, request)
      : this.fetchCreateRegistrationSessionReal(documentHash, request);

    const response = await this.withTimeout(requestPromise);
    console.log('createRegistrationSession response', response);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const reasonPhrase = errorBody?.message || response.statusText;
      throw this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, message, data} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de sesión de registro.',
      );
    })) as RegistrationSessionApiResponse;

    if (!isSucceded) {
      throw new OnboardingApiError('UNKNOWN_ERROR', message || 'No se pudo crear la sesión de registro.');
    }
    console.log('data sesion', data);
    return data as RegistrationSessionData;
  }

  /**
   * Renueva la sesión de registro reutilizando el documento del cliente ya verificado en el
   * store (`verifiedClient.numeroIdentificacion`, disponible mientras el flujo de onboarding
   * sigue activo). Se usa cuando un paso responde con el código de negocio SESSION_EXPIRED,
   * para recrear la sesión y guardar el token nuevo de forma transparente para el usuario.
   */
  async refreshRegistrationSession(): Promise<RegistrationSessionData> {
    if (this.refreshSessionPromise) {
      return this.refreshSessionPromise;
    }

    const {verifiedClient, setRegistrationSession, setRegistrationDevice} =
      useOnboardingStore.getState();

    if (!verifiedClient) {
      throw new OnboardingApiError(
        'SESSION_EXPIRED',
        'No hay datos de cliente verificado para renovar la sesión de registro.',
      );
    }

    this.refreshSessionPromise = this.createRegistrationSession(verifiedClient.numeroIdentificacion)
      .then(session => {
        setRegistrationSession(session);
        setRegistrationDevice({
          deviceId: session.deviceId,
          documentNumberHash: session.documentNumberHash,
        });
        return session;
      })
      .finally(() => {
        this.refreshSessionPromise = null;
      });

    return this.refreshSessionPromise;
  }

  /**
   * Finaliza la sesión de registro en el backend y obtiene los tokens de acceso de la app
   * (accessToken/refreshToken/tokenType). Se llama justo antes de reportar el último paso del
   * flujo de registro, una vez el usuario terminó de configurar su método de autenticación.
   */
  async completeRegistrationSession(): Promise<RegistrationSessionTokens> {
    return withSessionExpiredRetry(() => this.performCompleteRegistrationSession());
  }

  /**
   * Ejecuta el cierre de la sesión de registro propiamente dicho. Lee el token de sesión del
   * store en cada invocación (no en un closure previo) para que, tras una renovación de sesión,
   * el reintento automático de `withSessionExpiredRetry` use el token nuevo.
   */
  private async performCompleteRegistrationSession(): Promise<RegistrationSessionTokens> {
    const {registrationSession} = useOnboardingStore.getState();

    if (!registrationSession) {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'No existe una sesión de registro activa para finalizar.',
      );
    }

    const {documentNumberHash, sessionToken} = registrationSession;

    const requestPromise = MOCK_CONFIG.ONBOARDING.COMPLETE_REGISTRATION_SESSION
      ? ONBOARDING_MOCK.completeRegistrationSession(documentNumberHash)
      : this.fetchCompleteRegistrationSessionReal(documentNumberHash, sessionToken);

    const response = await this.withTimeout(requestPromise);
    console.log('response COMPLETE REGISTER', response);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code;
      const reasonPhrase = errorBody?.message || response.statusText;

      if (backendCode === SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.code) {
        throw new OnboardingApiError('SESSION_EXPIRED', reasonPhrase);
      }

      throw this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de finalización de sesión.',
      );
    })) as RegistrationSessionCompleteApiResponse;

    if (!isSucceded) {
      if (code === SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.code) {
        throw new OnboardingApiError(
          'SESSION_EXPIRED',
          message || SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.message,
        );
      }

      throw new OnboardingApiError('UNKNOWN_ERROR', message || 'No se pudo finalizar la sesión de registro.');
    }
    console.log('data COMPLETE REGISTER', data);
    return data as RegistrationSessionTokens;
  }

  /**
   * Llamada real al endpoint de finalización de sesión de registro (se activa al poner
   * MOCK_CONFIG.ONBOARDING.COMPLETE_REGISTRATION_SESSION en `false`)
   */
  private fetchCompleteRegistrationSessionReal(
    documentHash: string,
    sessionToken: string,
  ): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.COMPLETE_REGISTRATION_SESSION}/${documentHash}/complete`;
    const {deviceInfo} = useAuthStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.PATCH,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
        'x-session-token': sessionToken,
      }),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al finalizar la sesión de registro.',
      );
    });
  }

  /**
   * Vincula el usuario recién registrado (`registerUser`) a la sesión de registro activa, para
   * que el backend asocie las credenciales creadas con la sesión que se venía usando durante el
   * flujo. Se llama justo después de un registro exitoso y antes de reportar el siguiente paso.
   */
  async linkUserToRegistrationSession(userId: string): Promise<RegistrationSessionUserLinkResult> {
    return withSessionExpiredRetry(() => this.performLinkUserToRegistrationSession(userId));
  }

  /**
   * Ejecuta el vínculo usuario-sesión propiamente dicho. Lee el token de sesión del store en
   * cada invocación (no en un closure previo) para que, tras una renovación de sesión, el
   * reintento automático de `withSessionExpiredRetry` use el token nuevo.
   */
  private async performLinkUserToRegistrationSession(
    userId: string,
  ): Promise<RegistrationSessionUserLinkResult> {
    const {registrationSession} = useOnboardingStore.getState();

    if (!registrationSession) {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'No existe una sesión de registro activa para vincular el usuario.',
      );
    }

    const {documentNumberHash, sessionToken} = registrationSession;
    const request: RegistrationSessionUserLinkRequest = {userId};

    const requestPromise = MOCK_CONFIG.ONBOARDING.LINK_USER_TO_REGISTRATION_SESSION
      ? ONBOARDING_MOCK.linkUserToRegistrationSession(documentNumberHash, request)
      : this.fetchLinkUserToRegistrationSessionReal(documentNumberHash, sessionToken, request);

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code;
      const reasonPhrase = errorBody?.message || response.statusText;

      if (backendCode === SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.code) {
        throw new OnboardingApiError('SESSION_EXPIRED', reasonPhrase);
      }

      throw this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data} = (await response.json().catch(() => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de vínculo de usuario a la sesión.',
      );
    })) as RegistrationSessionUserLinkApiResponse;

    if (!isSucceded) {
      if (code === SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.code) {
        throw new OnboardingApiError(
          'SESSION_EXPIRED',
          message || SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.message,
        );
      }

      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        message || 'No se pudo vincular el usuario a la sesión de registro.',
      );
    }

    console.log('data LINK USER', data);
    return data as RegistrationSessionUserLinkResult;
  }

  /**
   * Llamada real al endpoint de vínculo de usuario a la sesión de registro (se activa al poner
   * MOCK_CONFIG.ONBOARDING.LINK_USER_TO_REGISTRATION_SESSION en `false`)
   */
  private fetchLinkUserToRegistrationSessionReal(
    documentHash: string,
    sessionToken: string,
    request: RegistrationSessionUserLinkRequest,
  ): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.LINK_USER_TO_REGISTRATION_SESSION}/${documentHash}/user`;
    const {deviceInfo} = useAuthStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.PATCH,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
        'x-session-token': sessionToken,
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al vincular el usuario a la sesión de registro.',
      );
    });
  }

  /**
   * Llamada real al endpoint de creación de sesión de registro (se activa al poner
   * MOCK_CONFIG.ONBOARDING.CREATE_REGISTRATION_SESSION en `false`)
   */
  private fetchCreateRegistrationSessionReal(
    documentHash: string,
    request: RegistrationSessionRequest,
  ): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.CREATE_REGISTRATION_SESSION}/${documentHash}`;
    const {deviceInfo} = useAuthStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al crear la sesión de registro.',
      );
    });
  }

  /**
   * Aplica un timeout genérico a cualquier petición del módulo (mock o real)
   */
  private withTimeout<T>(requestPromise: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(
          new OnboardingApiError('TIMEOUT', 'Tiempo de espera agotado al consultar el documento.'),
        );
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }

  /**
   * Llamada real al endpoint de Términos y Condiciones (se activa al poner MOCK_CONFIG.ONBOARDING.TERMS_AND_CONDITIONS en `false`)
   */
  private fetchTermsAndConditionsReal(): Promise<Response> {
    return fetch(`${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.TERMS_AND_CONDITIONS}`, {
      method: HTTP_METHODS.GET,
      headers: buildHeaders({'x-channel': 'AppConversationalBSC'}),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al consultar los términos y condiciones.',
      );
    });
  }

  /**
   * Llamada real al endpoint de aceptación de Términos y Condiciones (se activa al poner
   * MOCK_CONFIG.ONBOARDING.ACCEPT_TERMS_AND_CONDITIONS en `false`)
   */
  private fetchAcceptTermsAndConditionsReal(
    request: AcceptTermsAndConditionsRequest,
  ): Promise<Response> {
    const {deviceInfo} = useAuthStore.getState();

    return fetch(`${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.ACCEPT_TERMS_AND_CONDITIONS}`, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
        'x-channel': 'AppConversationalBSC',
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new OnboardingApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al aceptar los términos y condiciones.',
      );
    });
  }

  /**
   * Llamada real al endpoint de Política de datos personales (se activa al poner MOCK_CONFIG.ONBOARDING.PERSONAL_DATA_POLICY en `false`)
   */
  private async fetchPersonalDataPolicyReal(): Promise<BscResponse<string>> {
    const response = await fetch(
      `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.PERSONAL_DATA_POLICY}`,
      {
        method: 'GET',
        headers: buildHeaders(),
      },
    );

    return response.json();
  }

  private mapError(statusCode: number, reasonPhrase: string): OnboardingApiError {
    if (statusCode === 429) {
      return new OnboardingApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        reasonPhrase || 'Se ha excedido el límite de intentos permitidos.',
      );
    }

    if (statusCode === 422) {
      return new OnboardingApiError(
        'CLIENT_NOT_VALIDATED',
        reasonPhrase || 'El cliente existe pero no está habilitado para continuar el registro.',
      );
    }

    return new OnboardingApiError('UNKNOWN_ERROR', reasonPhrase || 'Ocurrió un error inesperado.');
  }
}

const onboardingService = new OnboardingService();

const isSessionExpiredError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as {code?: OnboardingErrorCode}).code === 'SESSION_EXPIRED';

/**
 * Envuelve cualquier llamada de un paso de onboarding que dependa del `sessionToken`
 * (RegistrationStepService.updateStep hoy, futuros pasos mañana). Si la llamada falla con
 * SESSION_EXPIRED, renueva la sesión una única vez y reintenta la llamada original una sola
 * vez más, para que el paso continúe donde se quedó sin que el usuario lo note. Si el
 * reintento vuelve a fallar por sesión expirada (p. ej. una falla persistente del backend), se
 * corta el ciclo con un error terminal en vez de reintentar indefinidamente.
 */
export async function withSessionExpiredRetry<T>(requestFn: () => Promise<T>): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (!isSessionExpiredError(error)) {
      throw error;
    }

    await onboardingService.refreshRegistrationSession();

    try {
      return await requestFn();
    } catch (retryError) {
      if (isSessionExpiredError(retryError)) {
        throw new OnboardingApiError(
          'SESSION_EXPIRED',
          'No fue posible renovar la sesión de registro. Intenta nuevamente más tarde.',
        );
      }
      throw retryError;
    }
  }
}

export default onboardingService;
