import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {ONBOARDING_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {SERVICE_ERRORS} from '@constants/serviceErrors';
import {useAuthStore} from '@store/auth.store';
import {useOnboardingStore} from '@store/onboarding.store';
import {withSessionExpiredRetry} from './onboarding.service';
import {REGISTRATION_STEP_MOCK} from '../mocks/onboarding/registration-step.mock';
import {
  OnboardingErrorCode,
  RegistrationStepApiResponse,
  RegistrationStepName,
  RegistrationStepRequest,
  RegistrationStepResult,
} from '@/types/index';

export class RegistrationStepApiError extends Error {
  code: OnboardingErrorCode;

  constructor(code: OnboardingErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de Onboarding: reporta al backend el paso actual del flujo de registro en el que
 * se encuentra el usuario, usando el hash de documento y el token de sesión generados por
 * `OnboardingService.createRegistrationSession`.
 */
class RegistrationStepService {
  /**
   * Actualiza el paso de registro para la sesión activa. Si el backend responde
   * SESSION_EXPIRED, `withSessionExpiredRetry` renueva la sesión (nuevo `sessionToken` en el
   * store) y reintenta esta misma llamada una única vez, de forma transparente para el
   * usuario: el flujo continúa en el paso donde se quedó sin mostrar ningún error.
   */
  async updateStep(
    stepName: RegistrationStepName,
    data: Record<string, unknown> | null = null,
  ): Promise<RegistrationStepResult> {
    return withSessionExpiredRetry(() => this.performUpdateStep(stepName, data));
  }

  /**
   * Ejecuta la actualización de paso propiamente dicha. Lee el token de sesión del store en
   * cada invocación (no en un closure previo) para que, tras una renovación de sesión, el
   * reintento automático de `withSessionExpiredRetry` use el token nuevo. Requiere que exista
   * una `registrationSession` en el store (creada previamente); si no existe, es un error de
   * uso del flujo y se reporta como tal.
   */
  private async performUpdateStep(
    stepName: RegistrationStepName,
    data: Record<string, unknown> | null,
  ): Promise<RegistrationStepResult> {
    const {registrationSession} = useOnboardingStore.getState();

    if (!registrationSession) {
      throw new RegistrationStepApiError(
        'UNKNOWN_ERROR',
        'No existe una sesión de registro activa para actualizar el paso.',
      );
    }

    const {documentNumberHash, sessionToken} = registrationSession;
    const request: RegistrationStepRequest = {stepName, data};

    const requestPromise = MOCK_CONFIG.ONBOARDING.UPDATE_REGISTRATION_STEP
      ? REGISTRATION_STEP_MOCK.updateStep(documentNumberHash, request)
      : this.fetchUpdateStepReal(documentNumberHash, sessionToken, request);

    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const backendCode = errorBody?.code;
      const reasonPhrase = errorBody?.message || response.statusText;

      if (backendCode === SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.code) {
        throw new RegistrationStepApiError('SESSION_EXPIRED', reasonPhrase);
      }

      throw this.mapError(response.status, reasonPhrase);
    }

    const {isSucceded, code, message, data: responseData} = (await response.json().catch(() => {
      throw new RegistrationStepApiError(
        'UNKNOWN_ERROR',
        'Respuesta JSON inválida del servicio de actualización de paso.',
      );
    })) as RegistrationStepApiResponse;

    if (!isSucceded) {
      if (code === SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.code) {
        throw new RegistrationStepApiError(
          'SESSION_EXPIRED',
          message || SERVICE_ERRORS.ONBOARDING.SESSION.EXPIRED.message,
        );
      }

      throw new RegistrationStepApiError('UNKNOWN_ERROR', message || 'No se pudo actualizar el paso de registro.');
    }
    console.log('RegistrationStepService: paso de registro actualizado con éxito:', stepName);
    console.log('RegistrationStepService: objeto:', JSON.stringify(responseData));
    return responseData as RegistrationStepResult;
  }

  /**
   * Llamada real al endpoint de actualización de paso (se activa al poner
   * MOCK_CONFIG.ONBOARDING.UPDATE_REGISTRATION_STEP en `false`)
   */
  private fetchUpdateStepReal(
    documentHash: string,
    sessionToken: string,
    request: RegistrationStepRequest,
  ): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${ONBOARDING_ENDPOINTS.UPDATE_REGISTRATION_STEP}/${documentHash}/step`;
    const {deviceInfo} = useAuthStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.PATCH,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
        'x-session-token': sessionToken,
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new RegistrationStepApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al actualizar el paso de registro.',
      );
    });
  }

  /**
   * Aplica un timeout genérico a la petición (mock o real)
   */
  private withTimeout<T>(requestPromise: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(
          new RegistrationStepApiError(
            'TIMEOUT',
            'Tiempo de espera agotado al actualizar el paso de registro.',
          ),
        );
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }

  private mapError(statusCode: number, reasonPhrase: string): RegistrationStepApiError {
    if (statusCode === 429) {
      return new RegistrationStepApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        reasonPhrase || 'Se ha excedido el límite de intentos permitidos.',
      );
    }

    if (statusCode === 422) {
      return new RegistrationStepApiError(
        'CLIENT_NOT_VALIDATED',
        reasonPhrase || 'La sesión de registro no está habilitada para continuar.',
      );
    }

    return new RegistrationStepApiError('UNKNOWN_ERROR', reasonPhrase || 'Ocurrió un error inesperado.');
  }
}

export default new RegistrationStepService();
