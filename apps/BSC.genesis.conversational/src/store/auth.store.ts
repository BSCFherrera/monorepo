import {create} from 'zustand';
import {AuthUser, DeviceInfo} from '@/types/index';

interface AuthState {
  /** Indica si existe una sesión autenticada activa (controla el stack de navegación) */
  isAuthenticated: boolean;
  /** Datos del cliente autenticado, obtenidos del servicio de login */
  user: AuthUser | null;
  /** Fingerprint del dispositivo, se llena una vez al abrir la app (ver DeviceInfoService) */
  deviceInfo: DeviceInfo | null;
  /** Marca de tiempo (`Date.now()`) de cuando la app pasó a segundo plano con una sesión activa;
   * `null` mientras la app está en primer plano. Ver useSessionInactivityWatcher */
  backgroundedAt: number | null;
  /** `true` cuando la sesión se cerró automáticamente por inactividad (app en segundo plano más
   * tiempo del permitido). LoginScreen la usa para mostrar el modal de aviso correspondiente */
  sessionExpiredByInactivity: boolean;
  /** Actualiza el usuario mezclando `user` con los datos ya existentes (ej: el nombre decodificado del JWT llega antes que el resto del perfil) */
  setUser: (user: Partial<AuthUser>) => void;
  setDeviceInfo: (deviceInfo: DeviceInfo) => void;
  /** Actualiza solo el campo `ip` de deviceInfo, ej. tras un cambio de red */
  setDeviceIp: (ip: string) => void;
  /** Marca la sesión como autenticada. Los tokens en sí viven en Keychain (ver AuthService), no acá */
  login: () => void;
  /** Cierra la sesión localmente: limpia el usuario y marca la sesión como no autenticada */
  signOut: () => void;
  setBackgroundedAt: (timestamp: number | null) => void;
  setSessionExpiredByInactivity: (value: boolean) => void;
}

/**
 * Store global de Autenticación (Zustand)
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  deviceInfo: null,
  backgroundedAt: null,
  sessionExpiredByInactivity: false,
  setUser: user => set(state => ({user: {...state.user, ...user} as AuthUser})),
  setDeviceInfo: deviceInfo => set({deviceInfo}),
  setDeviceIp: ip => {
    const {deviceInfo} = get();
    if (!deviceInfo) {
      return;
    }
    set({deviceInfo: {...deviceInfo, ip}});
  },
  login: () => set({isAuthenticated: true}),
  signOut: () => set({isAuthenticated: false, user: null, backgroundedAt: null}),
  setBackgroundedAt: timestamp => set({backgroundedAt: timestamp}),
  setSessionExpiredByInactivity: value => set({sessionExpiredByInactivity: value}),
}));
