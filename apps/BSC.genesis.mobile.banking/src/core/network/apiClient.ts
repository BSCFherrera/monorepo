import axios, { type AxiosInstance } from 'axios';

import type { TokenStore } from '../security/tokenStore';

import { createAuthInterceptor } from './authInterceptor';

/**
 * Cliente HTTP de la aplicación. Todas las llamadas a la API pasan por aquí.
 *
 * Portado de `lib/core/network/api_client.dart`, conservando los mismos
 * tiempos de espera y las mismas cabeceras fijas: el backend distingue el canal
 * por `X-Channel` y `X-Channel-Type`, así que cambiarlos cambia cómo se
 * registra y se autoriza la operación del otro lado.
 */

/** 30 segundos, igual que en la app Flutter. */
export const TIMEOUT_MS = 30_000;

export interface ApiClientOptions {
  /**
   * URL base del backend.
   *
   * Sin valor por defecto, **a propósito**. La app Flutter traía como respaldo
   * una dirección interna del banco, en claro y escrita en el código (T-10).
   * No se reproduce aquí: describir el defecto no exige repetirlo.
   *
   * Aquí la configuración se inyecta y una compilación mal configurada falla al
   * arrancar, que es preferible a una que apunte en silencio a un servidor
   * equivocado.
   */
  baseURL: string;

  store: TokenStore;
  onSessionExpired?: () => void;
}

export function createApiClient(opciones: ApiClientOptions): AxiosInstance {
  if (!opciones.baseURL) {
    throw new Error(
      'Falta la URL base del backend. Debe inyectarse en la compilación.',
    );
  }

  const cliente = axios.create({
    baseURL: opciones.baseURL,
    timeout: TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Channel': 'MobileBanking',
      'X-Channel-Type': '2',
    },
  });

  createAuthInterceptor({
    store: opciones.store,
    ...(opciones.onSessionExpired
      ? { onSessionExpired: opciones.onSessionExpired }
      : {}),
  }).attach(cliente);

  return cliente;
}
