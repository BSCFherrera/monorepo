import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {DEVICE_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {useAuthStore} from '@store/auth.store';
import {DEVICE_MOCK} from '../mocks/device/device.mock';
import {UpdateDeviceTrustStatusApiResponse, UpdateDeviceTrustStatusRequest} from '@/types/index';

/** Estados de confianza del dispositivo que acepta el backend. Siempre se envía `TRUSTED`. */
export const DEVICE_TRUST_STATUS = {
  UNKNOWN: 0,
  TRUSTED: 1,
  BLOCKED: 2,
} as const;

export type DeviceTrustStatus = (typeof DEVICE_TRUST_STATUS)[keyof typeof DEVICE_TRUST_STATUS];

export class DeviceApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de gestión del dispositivo. Es agnóstico del flujo que lo invoque (registro, login,
 * configuración): recibe el `deviceId` y no conoce navegación ni UI. Cada pantalla decide cuándo
 * llamarlo y qué hacer con el resultado.
 */
class DeviceService {
  /**
   * Marca el dispositivo como confiable (o el estado que se indique) contra el backend:
   * PATCH /device/{deviceId}/trust-status/update con `{trustStatus}`. Resuelve sin valor si
   * la actualización fue exitosa; lanza `DeviceApiError` en cualquier otro caso.
   */
  async updateTrustStatus(
    deviceId: string,
    trustStatus: DeviceTrustStatus = DEVICE_TRUST_STATUS.TRUSTED,
  ): Promise<void> {
    if (!deviceId) {
      throw new DeviceApiError(
        'MISSING_DEVICE_ID',
        'No hay un identificador de dispositivo para actualizar su estado de confianza.',
      );
    }

    const request: UpdateDeviceTrustStatusRequest = {trustStatus};

    const requestPromise = MOCK_CONFIG.DEVICE.UPDATE_TRUST_STATUS
      ? DEVICE_MOCK.updateTrustStatus(deviceId, request)
      : this.fetchUpdateTrustStatusReal(deviceId, request);

    const response = await this.withTimeout(requestPromise);
    const body = (await response.json().catch(() => null)) as UpdateDeviceTrustStatusApiResponse | null;

    if (!response.ok || !body?.isSucceded) {
      throw new DeviceApiError(
        body?.code ?? 'UNKNOWN_ERROR',
        body?.message || 'No se pudo actualizar el estado de confianza del dispositivo.',
      );
    }
  }

  /**
   * Llamada real al endpoint de actualización de estado de confianza (se activa al poner
   * MOCK_CONFIG.DEVICE.UPDATE_TRUST_STATUS en `false`)
   */
  private fetchUpdateTrustStatusReal(
    deviceId: string,
    request: UpdateDeviceTrustStatusRequest,
  ): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${DEVICE_ENDPOINTS.UPDATE_TRUST_STATUS}/${deviceId}/trust-status/update`;
    const {deviceInfo} = useAuthStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.PATCH,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new DeviceApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al actualizar el estado de confianza del dispositivo.',
      );
    });
  }

  private withTimeout<T>(requestPromise: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(
          new DeviceApiError('TIMEOUT', 'Tiempo de espera agotado al actualizar el dispositivo.'),
        );
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }
}

export default new DeviceService();
