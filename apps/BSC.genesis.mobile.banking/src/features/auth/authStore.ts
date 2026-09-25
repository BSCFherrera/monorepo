import { create } from 'zustand';

import { t } from '@bsc/i18n';

import type { Usuario } from './data/authContracts';

/**
 * Estado de la sesión del cliente.
 *
 * Reemplaza a `AuthBloc` de Flutter. La diferencia con un BLoC es deliberada:
 * aquí solo vive el **estado de cliente** —quién está dentro y si hay una
 * operación en curso—, mientras que los datos que vienen del servidor (saldos,
 * movimientos, catálogos) se manejan aparte con caché propia. En la app Flutter
 * todo pasaba por el mismo BLoC, y por eso cada uno reimplementaba a mano sus
 * reintentos y su estado de carga.
 *
 * **Nada de lo que hay aquí persiste en disco.** Los tokens viven en el
 * almacenamiento seguro del sistema; esto es memoria de la aplicación en curso
 * y se pierde al cerrarla, que es lo correcto.
 */

export type EstadoSesion =
  | 'desconocido'
  | 'sin-sesion'
  | 'autenticando'
  | 'autenticado';

export interface AuthState {
  estado: EstadoSesion;
  usuario: Usuario | null;

  /** Mensaje para mostrar al cliente cuando algo falla. */
  error: string | null;

  /** Nombre recordado del último acceso, para saludar antes de entrar. */
  nombreRecordado: string | null;

  /** Si el teléfono tiene reconocimiento facial, para nombrar bien el botón. */
  tieneRostro: boolean;

  /** Si hay biometría utilizable en el dispositivo. */
  biometriaDisponible: boolean;

  comenzarAutenticacion: () => void;
  autenticar: (usuario: Usuario) => void;
  fallar: (mensaje: string) => void;
  limpiarError: () => void;
  cerrarSesion: () => void;
  establecerRecordado: (nombre: string | null) => void;
  establecerCapacidadBiometrica: (disponible: boolean, rostro: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  estado: 'desconocido',
  usuario: null,
  error: null,
  nombreRecordado: null,
  tieneRostro: false,
  biometriaDisponible: false,

  comenzarAutenticacion: () => set({ estado: 'autenticando', error: null }),

  autenticar: usuario => set({ estado: 'autenticado', usuario, error: null }),

  // El estado vuelve a «sin sesión», no se queda en «autenticando»: si se
  // quedara, el botón permanecería girando para siempre.
  fallar: mensaje => set({ estado: 'sin-sesion', error: mensaje }),

  limpiarError: () => set({ error: null }),

  cerrarSesion: () => set({ estado: 'sin-sesion', usuario: null, error: null }),

  establecerRecordado: nombre => set({ nombreRecordado: nombre }),

  establecerCapacidadBiometrica: (disponible, rostro) =>
    set({ biometriaDisponible: disponible, tieneRostro: rostro }),
}));

/**
 * Traduce un fallo de la API a algo que el cliente pueda entender.
 *
 * Nunca muestra el detalle técnico: a un cliente «Request failed with status
 * code 401» no le dice nada, y a un atacante sí le confirma que el usuario
 * existe. Los mensajes distinguen lo que el cliente puede resolver de lo que
 * no.
 */
export function mensajeDeError(causa: unknown): string {
  const error = causa as
    | { response?: { status?: number }; code?: string; message?: string }
    | undefined;

  const estado = error?.response?.status;

  if (estado === 401 || estado === 403) {
    // Deliberadamente no distingue «usuario no existe» de «contraseña
    // incorrecta»: decirlo permitiría averiguar qué usuarios existen.
    return t('auth:errors.invalidCredentials');
  }

  if (estado === 423)
    return t('auth:errors.userLocked');
  if (estado !== undefined && estado >= 500) {
    return t('auth:errors.serviceUnavailable');
  }

  if (error?.code === 'ECONNABORTED') {
    return t('auth:errors.timeout');
  }

  if (error?.code === 'ERR_NETWORK') {
    return t('auth:errors.noConnection');
  }

  return t('auth:errors.generic');
}
