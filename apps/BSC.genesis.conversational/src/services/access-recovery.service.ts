import {MOCK_CONFIG} from '@constants/mockConfig';
import {
  AccessRecoveryErrorCode,
  ApiResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ClientInformationRequest,
  ClientInformationResponse,
  GetUserIdByInternalIdResponse,
  VerifyClientDocumentApiResponse,
} from '../types';
import {ACCESS_RECOVERY_MOCK} from 'mocks/access-recovery/access-recovery.mock';
import {SERVICE_ERRORS} from '@constants/serviceErrors';
import {ACCESS_RECOVERY_ENDPOINTS, ONBOARDING_ENDPOINTS} from '@constants/endpoints';
import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {useAuthStore} from '@store/auth.store';
import {buildHeaders} from '@constants/headers';

export class AccessRecoveryApiError extends Error {
  code: AccessRecoveryErrorCode;

  constructor(code: AccessRecoveryErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

class AccessRecoveryService {
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

    const requestPromise = MOCK_CONFIG.ACCESS_RECOVERY.VERIFY_CLIENT_DOCUMENT
      ? ACCESS_RECOVERY_MOCK.verifyClientDocument(request)
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
      throw new AccessRecoveryApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de onboarding.',
      );
    })) as VerifyClientDocumentApiResponse;
    if (!isSucceded) {
      throw this.mapBusinessCode(code, message);
    }

    const cliente = data as ClientInformationResponse;

    if (cliente.estadoPersona !== 'A') {
      throw new AccessRecoveryApiError('CLIENT_WITHOUT_DATA', 'El cliente no se encuentra activo.');
    }

    const haveCelular = cliente.telefonos?.some(telefono => telefono.tipoTelefono === 'Celular');

    if (!haveCelular) {
      throw new AccessRecoveryApiError(
        'CLIENT_WITHOUT_DATA',
        'El cliente no tiene un teléfono de tipo celular registrado.',
      );
    }

    return cliente;
  }

  async getUserIdByInternalId(internalId: string): Promise<GetUserIdByInternalIdResponse> {
    const requestPromise = MOCK_CONFIG.ACCESS_RECOVERY.GET_USER_ID_BY_INTERNAL_ID
      ? ACCESS_RECOVERY_MOCK.getUserIdByInternalId(internalId)
      : this.fetchGetUserIdByInternalId(internalId);

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code;
      const reasonPhrase = errorBody?.message || response.statusText;

      throw backendCode
        ? this.mapAccessRecoveryBusinessCode(backendCode, reasonPhrase)
        : this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data} = (await response.json().catch(() => {
      throw new AccessRecoveryApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de registro de usuario.',
      );
    })) as ApiResponse<GetUserIdByInternalIdResponse>;

    if (!isSucceded || !data) {
      throw this.mapAccessRecoveryBusinessCode(code, message);
    }

    return data;
  }

  async changePassword(userId: string, newPassword: string): Promise<ChangePasswordResponse> {
    const request: ChangePasswordRequest = {newPassword, channel: 'app'};

    const requestPromise = MOCK_CONFIG.ACCESS_RECOVERY.CHANGE_PASSWORD
      ? ACCESS_RECOVERY_MOCK.changePassword(userId, request)
      : this.fetchChangePasswordReal(userId, request);

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code;
      const reasonPhrase = errorBody?.message || response.statusText;

      throw backendCode
        ? this.mapAccessRecoveryBusinessCode(backendCode, reasonPhrase)
        : this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data} = (await response.json().catch(() => {
      throw new AccessRecoveryApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de registro de usuario.',
      );
    })) as ApiResponse<ChangePasswordResponse>;

    if (!isSucceded || !data) {
      throw this.mapAccessRecoveryBusinessCode(code, message);
    }

    return data;
  }

  /**
   * Llamada real al endpoint de cambio de contraseña (se activa al poner
   * MOCK_CONFIG.ACCESS_RECOVERY.CHANGE_PASSWORD en `false`)
   */
  private async fetchChangePasswordReal(
    numeroDocumento: string,
    request: ChangePasswordRequest,
  ): Promise<Response> {
    const {deviceInfo} = useAuthStore.getState();

    return fetch(
      `${APP_CONFIG.API_BASE_URL}${ACCESS_RECOVERY_ENDPOINTS.CHANGE_PASSWORD(numeroDocumento)}`,
      {
        method: HTTP_METHODS.PATCH,
        headers: buildHeaders({
          'x-device-data': JSON.stringify(deviceInfo),
          'x-channel': 'AppConversationalBSC',
        }),
        body: JSON.stringify(request),
      },
    ).catch(err => {
      throw new AccessRecoveryApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al cambiar la contraseña.',
      );
    });
  }

  /**
   * Llamada real al endpoint para obtener el id del usuario mediante el internalId / codigoPersona (se activa al poner
   * MOCK_CONFIG.ACCESS_RECOVERY.GET_USER_ID_BY_INTERNAL_ID en `false`)
   */
  private async fetchGetUserIdByInternalId(internalId: string): Promise<Response> {
    const {deviceInfo} = useAuthStore.getState();
    return fetch(
      `${APP_CONFIG.API_BASE_URL}${ACCESS_RECOVERY_ENDPOINTS.GET_USER_ID_BY_INTERNAL_ID}/${internalId}`,
      {
        method: HTTP_METHODS.GET,
        headers: buildHeaders({
          'x-device-data': JSON.stringify(deviceInfo),
          'x-channel': 'AppConversationalBSC',
        }),
      },
    ).catch(err => {
      throw new AccessRecoveryApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al cambiar la contraseña.',
      );
    });
  }

  /**
   * Traduce el `code` de negocio devuelto por el endpoint (siempre HTTP 200, éxito/error
   * discriminado por `isSucceded`/`code`) al `AccessRecoveryErrorCode` interno de la app.
   */
  private mapBusinessCode(code: string, message: string): AccessRecoveryApiError {
    const {CLIENT_NOT_VALIDATED, CLIENT_WITHOUT_DATA, MAX_ATTEMPTS_EXCEEDED} =
      SERVICE_ERRORS.ACCESS_RECOVERY.VERIFY_CLIENT_DOCUMENT;

    if (code === CLIENT_WITHOUT_DATA.code) {
      return new AccessRecoveryApiError(
        'CLIENT_WITHOUT_DATA',
        message || CLIENT_WITHOUT_DATA.message,
      );
    }

    if (code === CLIENT_NOT_VALIDATED.code) {
      return new AccessRecoveryApiError(
        'CLIENT_NOT_VALIDATED',
        message || CLIENT_NOT_VALIDATED.message,
      );
    }

    if (code === MAX_ATTEMPTS_EXCEEDED.code) {
      return new AccessRecoveryApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        message || MAX_ATTEMPTS_EXCEEDED.message,
      );
    }

    return new AccessRecoveryApiError('UNKNOWN_ERROR', message || 'Ocurrió un error inesperado.');
  }

  /**
   * Traduce el `code` de negocio del endpoint de registro de usuario al `AccessRecoveryApiError`
   * interno de la app.
   */
  private mapAccessRecoveryBusinessCode(code: string, message: string): AccessRecoveryApiError {
    const {BAD_REQUEST, USER_NOT_FOUND, SERVICE_UNAVAILABLE} =
      SERVICE_ERRORS.ACCESS_RECOVERY.CHANGE_PASSWORD;
    switch (code) {
      case BAD_REQUEST.code:
        return new AccessRecoveryApiError('BAD_REQUEST', message || BAD_REQUEST.message);
      case USER_NOT_FOUND.code:
        return new AccessRecoveryApiError('USER_NOT_FOUND', message || BAD_REQUEST.message);
      case SERVICE_UNAVAILABLE.code:
        return new AccessRecoveryApiError('SERVICE_UNAVAILABLE', message || BAD_REQUEST.message);
    }

    return new AccessRecoveryApiError('UNKNOWN_ERROR', message || 'Ocurrió un error inesperado.');
  }

  /**
   * Llamada real al endpoint de verificación de cliente (se activa al poner
   * MOCK_CONFIG.ACCESS_RECOVERY.VERIFY_CLIENT_DOCUMENT en `false`). Traduce errores de red a
   * OnboardingApiError para que el caller solo tenga que manejar un único tipo de error.
   */
  private fetchClientDocumentReal(request: ClientInformationRequest): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.VERIFY_CLIENT_DOCUMENT}`;
    const {deviceInfo} = useAuthStore.getState();
    console.log('deviceinfo', JSON.stringify(deviceInfo));
    return fetch(url, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new AccessRecoveryApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al consultar la información del cliente.',
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
          new AccessRecoveryApiError(
            'TIMEOUT',
            'Tiempo de espera agotado al consultar el documento.',
          ),
        );
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }

  private mapError(statusCode: number, reasonPhrase: string): AccessRecoveryApiError {
    if (statusCode === 429) {
      return new AccessRecoveryApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        reasonPhrase || 'Se ha excedido el límite de intentos permitidos.',
      );
    }

    if (statusCode === 422) {
      return new AccessRecoveryApiError(
        'CLIENT_NOT_VALIDATED',
        reasonPhrase || 'El cliente existe pero no está habilitado para continuar el registro.',
      );
    }

    return new AccessRecoveryApiError(
      'UNKNOWN_ERROR',
      reasonPhrase || 'Ocurrió un error inesperado.',
    );
  }
}

const accessRecoveryService = new AccessRecoveryService();

export default accessRecoveryService;
