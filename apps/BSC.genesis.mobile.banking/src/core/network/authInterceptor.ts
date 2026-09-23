import {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { TokenStore } from '../security/tokenStore';

/**
 * Adjunta el token de acceso a cada petición y lo mantiene fresco.
 *
 * Portado de `lib/core/network/auth_interceptor.dart`, conservando su
 * comportamiento exacto y sus ocho pruebas.
 *
 * El backend emite tokens de acceso de 15 minutos, así que sin esto la sesión
 * se cae a mitad de uso. La renovación es *single-flight*: el primer 401
 * dispara la renovación mientras todas las demás peticiones en vuelo esperan
 * ese mismo resultado y luego se reenvían. El backend **rota el token de
 * renovación** en cada llamada, de modo que hay que guardar los dos.
 *
 * El comentario del código Flutter documenta que la implementación anterior no
 * podía funcionar nunca: llamaba a `/auth/refresh` cuando la ruta es
 * `/auth/refresh-token`, sobre un cliente sin `baseUrl`, y leía `accessToken`
 * de una respuesta que dice `AccessToken`. Las pruebas existen por eso, y son
 * las primeras que se portaron.
 */

/** Renovar este tiempo antes del vencimiento, en vez de esperar al 401. */
const MARGEN_DE_RENOVACION_MS = 60_000;

/** Marca interna para no reintentar una misma petición más de una vez. */
const YA_REINTENTADA = 'bscRetried';

export interface AuthInterceptorOptions {
  store: TokenStore;

  /** Se invoca cuando la sesión no se puede recuperar. La app va a login. */
  onSessionExpired?: () => void;

  /** Para poder fijar el tiempo en las pruebas. */
  now?: () => Date;

  /**
   * Genera el valor anti-replay. Inyectable para que las pruebas sean
   * determinísticas.
   *
   * ⚠️ El valor por defecto **no es criptográficamente aleatorio**: usa el reloj
   * y `Math.random`. Es lo mismo que hacía la app Flutter, que derivaba el nonce
   * solo del reloj y por tanto era predecible (T-04). Queda así hasta confirmar
   * si el backend valida esta cabecera — ver C-04 y P-18.
   */
  nonce?: () => string;
}

const esRutaDeAutenticacion = (url: string): boolean =>
  url.includes('/auth/login') || url.includes('/auth/refresh-token');

const nonceDefecto = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/**
 * Lee un campo aceptando PascalCase y camelCase.
 *
 * El backend responde en PascalCase (`AccessToken`), pero tolerar ambas formas
 * cuesta nada y evita exactamente el defecto que tenía la app Flutter.
 */
function leerCadena(cuerpo: unknown, ...nombres: string[]): string | null {
  if (typeof cuerpo !== 'object' || cuerpo === null) return null;
  const mapa = cuerpo as Record<string, unknown>;

  for (const nombre of nombres) {
    const valor = mapa[nombre];
    if (typeof valor === 'string' && valor.length > 0) return valor;
  }

  return null;
}

export interface AuthInterceptor {
  /** Instala el interceptor en el cliente y lo devuelve. */
  attach(client: AxiosInstance): AxiosInstance;
}

export function createAuthInterceptor(
  opciones: AuthInterceptorOptions,
): AuthInterceptor {
  const { store, onSessionExpired } = opciones;
  const ahora = opciones.now ?? (() => new Date());
  const nonce = opciones.nonce ?? nonceDefecto;

  /** Renovación en curso, si la hay. Es lo que hace el *single-flight*. */
  let renovacionEnVuelo: Promise<boolean> | null = null;

  return {
    attach(client: AxiosInstance): AxiosInstance {
      /** Ejecuta como máximo una renovación a la vez; los demás comparten el resultado. */
      const renovarUnaVez = (): Promise<boolean> => {
        if (renovacionEnVuelo !== null) return renovacionEnVuelo;

        const enCurso = renovar().finally(() => {
          renovacionEnVuelo = null;
        });
        renovacionEnVuelo = enCurso;
        return enCurso;
      };

      const renovar = async (): Promise<boolean> => {
        const refreshToken = await store.getRefreshToken();
        if (!refreshToken) return false;

        try {
          // Viaja por el mismo cliente para que la renovación y el reenvío
          // pasen por la misma tubería: pinning y registro incluidos.
          const respuesta = await client.post(
            '/api/v1/auth/refresh-token',
            { refreshToken },
            { [YA_REINTENTADA]: true } as never,
          );

          if (respuesta.status !== 200) return false;

          const acceso = leerCadena(
            respuesta.data,
            'AccessToken',
            'accessToken',
          );
          if (acceso === null) return false;

          await store.saveAccessToken(acceso);

          // El backend lo rota; conservar el viejo fallaría la próxima vez.
          const refresco = leerCadena(
            respuesta.data,
            'RefreshToken',
            'refreshToken',
          );
          if (refresco !== null) await store.saveRefreshToken(refresco);

          const vence = leerCadena(respuesta.data, 'ExpiresAt', 'expiresAt');
          if (vence !== null) await store.saveTokenExpiry(vence);

          return true;
        } catch {
          return false;
        }
      };

      const estaPorVencer = async (): Promise<boolean> => {
        const crudo = await store.getTokenExpiry();
        if (!crudo) return false;

        const vencimiento = new Date(crudo);
        if (Number.isNaN(vencimiento.getTime())) return false;

        return (
          ahora().getTime() + MARGEN_DE_RENOVACION_MS >= vencimiento.getTime()
        );
      };

      const terminarSesion = async (): Promise<void> => {
        await store.clearSession();
        onSessionExpired?.();
      };

      client.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          const url = config.url ?? '';

          if (!esRutaDeAutenticacion(url)) {
            // Renovar antes del vencimiento, para que la petición salga con un
            // token válido en vez de fallar por unos segundos de reloj.
            if (await estaPorVencer()) await renovarUnaVez();

            const token = await store.getAccessToken();
            if (token) config.headers.set('Authorization', `Bearer ${token}`);
          }

          // Anti-replay.
          config.headers.set('X-Timestamp', String(ahora().getTime()));
          config.headers.set('X-Nonce', nonce());

          return config;
        },
      );

      client.interceptors.response.use(
        respuesta => respuesta,
        async (error: AxiosError) => {
          const config = error.config as
            | (InternalAxiosRequestConfig & { [YA_REINTENTADA]?: boolean })
            | undefined;
          const estado = error.response?.status;
          const url = config?.url ?? '';

          // Un 401 en el propio login o en la renovación es un fallo real de
          // credenciales, no un token vencido.
          if (
            estado !== 401 ||
            config === undefined ||
            esRutaDeAutenticacion(url)
          ) {
            return Promise.reject(error);
          }

          // Un solo reintento por petición, para que un token que el servidor
          // rechaza siempre no rebote indefinidamente.
          if (config[YA_REINTENTADA] === true) {
            await terminarSesion();
            return Promise.reject(error);
          }

          const renovado = await renovarUnaVez();
          if (!renovado) {
            await terminarSesion();
            return Promise.reject(error);
          }

          const token = await store.getAccessToken();
          config[YA_REINTENTADA] = true;
          if (token) config.headers.set('Authorization', `Bearer ${token}`);

          return client.request(config);
        },
      );

      return client;
    },
  };
}
