import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {APP_CONFIG} from '@constants/config';
import {useAuthStore} from '@store/auth.store';
import AuthService from '@services/auth.service';

const isBackgroundState = (state: AppStateStatus) =>
  state === 'background' || state === 'inactive';

// TODO: logs temporales de depuración, remover una vez validado el flujo en dispositivo real.
const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

/**
 * Cierra la sesión automáticamente cuando la app estuvo en segundo plano (o inactiva) más tiempo
 * del permitido (`APP_CONFIG.SESSION_INACTIVITY_TIMEOUT`), y solo si había una sesión activa.
 * Al pasar a segundo plano guarda la marca de tiempo en el store de auth; al volver a primer
 * plano, calcula el tiempo transcurrido y decide si fuerza el logout. Se apoya en
 * `useAuthStore.getState()` (en vez de selectors reactivos) porque no necesita re-renderizar,
 * solo leer el estado más reciente en cada transición de AppState.
 * Debe montarse una sola vez en la raíz de la app (ver App.tsx).
 */
export const useSessionInactivityWatcher = () => {
  const appState = useRef<AppStateStatus>(AppState.currentState as AppStateStatus);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appState.current;
      appState.current = nextState;

      const {isAuthenticated, backgroundedAt, setBackgroundedAt, setSessionExpiredByInactivity} =
        useAuthStore.getState();

      if (!isAuthenticated) {
        return;
      }

      const wentToBackground = !isBackgroundState(previousState) && isBackgroundState(nextState);
      const cameToForeground = isBackgroundState(previousState) && nextState === 'active';

      if (wentToBackground) {
        const now = Date.now();
        setBackgroundedAt(now);
        console.log(
          `[SessionInactivityWatcher] App pasó a segundo plano a las ${formatTimestamp(now)}. ` +
            `La sesión expirará a las ${formatTimestamp(now + APP_CONFIG.SESSION_INACTIVITY_TIMEOUT)} si no vuelve antes.`,
        );
        return;
      }

      if (cameToForeground && backgroundedAt) {
        const now = Date.now();
        const elapsed = now - backgroundedAt;
        const expired = elapsed >= APP_CONFIG.SESSION_INACTIVITY_TIMEOUT;
        setBackgroundedAt(null);

        console.log(
          `[SessionInactivityWatcher] App volvió a primer plano a las ${formatTimestamp(now)}. ` +
            `Estuvo en segundo plano desde las ${formatTimestamp(backgroundedAt)} (${Math.round(
              elapsed / 1000,
            )}s). ¿Expiró?: ${expired}`,
        );

        if (expired) {
          setSessionExpiredByInactivity(true);
          AuthService.logout().catch(error => {
            console.warn('No se pudo cerrar la sesión por inactividad.', error);
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);
};
