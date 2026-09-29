import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {APP_CONFIG} from '@constants/config';
import {buildHeaders} from '@constants/headers';
import {useAuthStore} from '@store/auth.store';

declare module 'axios' {
  // Permite marcar peticiones (login/logout/refresh) que no deben disparar el flujo de
  // refresh-token si responden 401, para evitar loops de refresh sobre el propio endpoint.
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

type QueuedRequest = {
  resolve: (accessToken: string) => void;
  reject: (error: unknown) => void;
};

/**
 * Puente hacia AuthService sin importarlo directamente: `auth.service.ts` sí necesita importar
 * `apiClient` (para sus llamadas reales de login/logout/refresh), así que si este archivo
 * también importara `auth.service.ts` se formaría un require cycle (api-client -> auth.service
 * -> api-client). En vez de eso, AuthService se "registra" acá al cargarse (ver la llamada a
 * `registerAuthTokenHandlers` al final de auth.service.ts), y los interceptores solo dependen de
 * esta interfaz mínima.
 */
interface AuthTokenHandlers {
  getValidAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<{accessToken: string}>;
}

let authTokenHandlers: AuthTokenHandlers | null = null;

export const registerAuthTokenHandlers = (handlers: AuthTokenHandlers): void => {
  authTokenHandlers = handlers;
};

/**
 * Cliente HTTP único para todas las peticiones autenticadas de la app. Adjunta el access token
 * vigente en cada petición y, ante un 401, refresca la sesión y reintenta la petición original.
 */
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: buildHeaders(),
});

/**
 * Interceptor de request: adjunta el access token vigente ANTES de que la petición salga.
 * `getValidAccessToken()` ya decide internamente (vía jwt-decode) si el token actual sigue
 * vigente o si hay que refrescarlo primero; acá solo se usa el resultado. Esto cubre el caso
 * "proactivo": evita mandar una petición con un token que ya sabemos vencido localmente, sin
 * necesidad de esperar a que el backend responda 401 para enterarnos.
 */
apiClient.interceptors.request.use(async config => {
  if (config.skipAuthRefresh || !authTokenHandlers) {
    return config;
  }

  const accessToken = await authTokenHandlers.getValidAccessToken();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

// --- Manejo del caso "reactivo": el backend igual respondió 401 (token revocado, reloj
// desincronizado, etc.) aunque localmente pareciera vigente. `isRefreshing` asegura que, si
// varias peticiones fallan con 401 al mismo tiempo, solo la PRIMERA dispare el refresh; el resto
// se encolan en `refreshQueue` y esperan el mismo resultado en vez de refrescar cada una por su
// cuenta. Cuando el refresh termina, `flushRefreshQueue` resuelve (o rechaza) a todas las que
// esperaban, y cada una reintenta su petición original con el token nuevo.
let isRefreshing = false;
let refreshQueue: QueuedRequest[] = [];

const flushRefreshQueue = (error: unknown, accessToken: string | null) => {
  refreshQueue.forEach(({resolve, reject}) => {
    if (error) {
      reject(error);
    } else {
      resolve(accessToken as string);
    }
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // Solo se intenta refrescar si: fue un 401, la petición no es login/logout/refresh
    // (`skipAuthRefresh`), y esta petición puntual no fue ya reintentada una vez (evita loops
    // infinitos si el backend sigue devolviendo 401 después de refrescar).
    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      !!originalRequest &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retriedAfterRefresh;

    if (!shouldAttemptRefresh || !originalRequest || !authTokenHandlers) {
      return Promise.reject(error);
    }

    originalRequest._retriedAfterRefresh = true;

    if (isRefreshing) {
      // Ya hay un refresh en curso disparado por otra petición: esta se encola y espera el
      // mismo resultado en vez de llamar a /auth/refresh de nuevo.
      const accessToken = await new Promise<string>((resolve, reject) => {
        refreshQueue.push({resolve, reject});
      });
      originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
      return apiClient(originalRequest);
    }

    isRefreshing = true;

    try {
      // Si el refresh es exitoso: se actualiza el token, se procesa la cola (todas las
      // peticiones que esperaban) y se reintenta la petición original.
      const {accessToken} = await authTokenHandlers.refreshAccessToken();
      flushRefreshQueue(null, accessToken);
      originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Si el refresh falla (refresh token inválido/expirado): se limpia la cola rechazando a
      // todas las peticiones en espera, se fuerza el signOut en el store y se rechaza la
      // petición original.
      flushRefreshQueue(refreshError, null);
      useAuthStore.getState().signOut();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
