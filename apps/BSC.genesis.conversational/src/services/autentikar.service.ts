import {NativeModules} from 'react-native';
import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {AUTENTIKAR_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {useAuthStore} from '@store/auth.store';
import {AUTENTIKAR_MOCK} from '../mocks/onboarding/autentikar.mock';
import {AutentikarStartApiResponse, AutentikarStartData, AutentikarStartRequest} from '@/types/index';

interface AutentikarBridgeNativeModule {
  authenticate(params: {link: string}): Promise<boolean>;
}

const {AutentikarBridge} = NativeModules as {
  AutentikarBridge?: AutentikarBridgeNativeModule;
};

export class AutentikarApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de verificación de identidad (Autentikar): fotografía de cédula dominicana
 * + reconocimiento facial (prueba de vida). Agrupa las dos mitades del flujo -pedir el link de
 * sesión al backend y luego invocar el módulo nativo con ese link- para que cualquier pantalla
 * de la app pueda exigir una prueba de vida sin conocer los detalles de ninguna de las dos.
 * El módulo nativo `AutentikarBridge` existe tanto en Android (Kotlin) como en iOS (Swift/ObjC);
 * ambos exponen el mismo nombre de módulo y el mismo método `authenticate({link})`, así que la
 * disponibilidad se resuelve simplemente comprobando que el bridge está enlazado, sin ramas por
 * sistema operativo -si mañana se agrega otra plataforma con el mismo contrato, funciona igual.
 */
class AutentikarService {
  isAvailable(): boolean {
    return AutentikarBridge != null;
  }

  /**
   * Pide al backend el link de sesión para verificar a un cliente puntual por su número de
   * documento (cédula). Ese `link` es el que luego se le pasa a `authenticate`.
   */
  async startVerification(numeroDocumento: string): Promise<AutentikarStartData> {
    const request: AutentikarStartRequest = {numeroDocumento};

    const requestPromise = MOCK_CONFIG.AUTENTIKAR.START
      ? AUTENTIKAR_MOCK.start(request)
      : this.fetchStartVerificationReal(request);

    const response = await this.withTimeout(requestPromise);
    const body = await response.json().catch(() => null);

    if (!response.ok || !body?.isSucceded) {
      throw new AutentikarApiError(
        body?.code ?? 'UNKNOWN_ERROR',
        body?.message || 'No se pudo iniciar la verificación de identidad.',
      );
    }

    return (body as AutentikarStartApiResponse).data as AutentikarStartData;
  }

  /**
   * Inicia el flujo nativo de verificación. `link` es el enlace de sesión que devuelve
   * `startVerification`. Resuelve `true` si el usuario completó el flujo, `false` si lo canceló.
   */
  async authenticate(link: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new AutentikarApiError(
        'PLATFORM_NOT_SUPPORTED',
        'Autentikar no está disponible en esta plataforma.',
      );
    }

    return AutentikarBridge!.authenticate({link});
  }

  private fetchStartVerificationReal(request: AutentikarStartRequest): Promise<Response> {
    const url = `${APP_CONFIG.API_BASE_URL}${AUTENTIKAR_ENDPOINTS.START}`;
    const {deviceInfo} = useAuthStore.getState();

    return fetch(url, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders({
        'x-device-data': JSON.stringify(deviceInfo),
      }),
      body: JSON.stringify(request),
    }).catch(err => {
      throw new AutentikarApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al iniciar la verificación de identidad.',
      );
    });
  }

  private withTimeout<T>(requestPromise: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new AutentikarApiError('TIMEOUT', 'Tiempo de espera agotado al iniciar la verificación.'));
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }
}

export default new AutentikarService();
