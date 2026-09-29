import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus, PanResponder, StyleSheet, View} from 'react-native';
import {APP_CONFIG} from '@constants/config';
import {useAuthStore} from '@store/auth.store';
import AuthService from '@services/auth.service';
import {WarningSessionModal} from '@components/Common/WarningSessionModal';

// El 80% del tiempo total de inactividad dispara la advertencia; el 20% restante es el periodo
// de gracia que el usuario tiene para responder antes del cierre de sesión forzado.
const TOTAL_TIMEOUT = APP_CONFIG.SESSION_INACTIVITY_TIMEOUT;
const WARNING_TIMEOUT = TOTAL_TIMEOUT * 0.8;
const GRACE_TIMEOUT = TOTAL_TIMEOUT - WARNING_TIMEOUT;

interface InactivityProviderProps {
  children: React.ReactNode;
}

/**
 * Envuelve las rutas privadas y cierra la sesión automáticamente cuando el usuario deja de
 * interactuar con la app estando en primer plano. Es inerte mientras no haya sesión activa: no
 * arma temporizadores y el `PanResponder` nunca bloquea toques (ver `panResponder` más abajo).
 *
 * La inactividad en segundo plano (app minimizada) ya la cubre `useSessionInactivityWatcher`
 * (montado en App.tsx), que compara el timestamp al volver a foreground contra el mismo
 * `APP_CONFIG.SESSION_INACTIVITY_TIMEOUT` y cierra sesión si corresponde. Este provider no
 * duplica esa cuenta: al pasar a background solo limpia sus propios temporizadores (evita que la
 * advertencia o el logout por inactividad "en pantalla" disparen mientras el usuario no la está
 * viendo) y, si la sesión sigue activa al volver, reinicia su propio ciclo desde cero.
 */
export const InactivityProvider: React.FC<InactivityProviderProps> = ({children}) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const setSessionExpiredByInactivity = useAuthStore(
    state => state.setSessionExpiredByInactivity,
  );

  // Único estado que dispara render en este provider: solo cambia al cruzar el umbral del 80% o
  // al resolverse la advertencia, nunca en cada toque de pantalla.
  const [warningVisible, setWarningVisible] = useState(false);

  // Temporizadores y timestamps en refs (no state) para que reiniciar el conteo en cada toque no
  // dispare renders globales.
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState as AppStateStatus);
  // Espejo en ref de `warningVisible`, legible de forma síncrona desde el `PanResponder`. El
  // modal de advertencia no es un surface aislado del toque: un toque dentro de él (incluso sobre
  // sus propios botones) también atraviesa la fase de captura del `View` exterior. Sin este guard,
  // ese toque reinicia el ciclo (`armTimers`) y oculta el modal a mitad de gesto, cancelando el
  // `onPress` del botón que el usuario estaba presionando ("No, cerrar sesión" quedaba sin efecto
  // y la sesión seguía activa). Mientras el modal esté visible, solo sus propios botones
  // (`handleExtendSession`/`handleCancelSession`) pueden resolver el ciclo.
  const warningVisibleRef = useRef(false);

  const updateWarningVisible = useCallback((visible: boolean) => {
    warningVisibleRef.current = visible;
    setWarningVisible(visible);
  }, []);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  /**
   * Cierra la sesión ya, notificando al backend y limpiando Keychain (ver auth.service.ts).
   * `showExpiredModal` solo debe ser `true` cuando el logout lo dispara el propio vencimiento del
   * periodo de gracia (nadie respondió la advertencia a tiempo): ahí sí se marca el flag que
   * `LoginScreen` observa para pintar `SessionExpiredModal` tras el reset de navegación (ver
   * Navigation.tsx). Cuando el usuario cierra sesión explícitamente desde el botón "No, cerrar
   * sesión" del propio modal de advertencia, es un logout normal y no debe mostrar ese aviso.
   */
  const forceLogout = useCallback(
    (showExpiredModal: boolean) => {
      clearTimers();
      updateWarningVisible(false);
      if (showExpiredModal) {
        setSessionExpiredByInactivity(true);
      }
      AuthService.logout().catch(error => {
        console.warn('No se pudo cerrar la sesión por inactividad.', error);
      });
    },
    [clearTimers, setSessionExpiredByInactivity, updateWarningVisible],
  );

  /** Arma el ciclo completo desde cero: 80% hasta la advertencia, 20% más hasta el logout. */
  const armTimers = useCallback(() => {
    clearTimers();
    updateWarningVisible(false);

    warningTimerRef.current = setTimeout(() => {
      updateWarningVisible(true);
      logoutTimerRef.current = setTimeout(() => forceLogout(true), GRACE_TIMEOUT);
    }, WARNING_TIMEOUT);
  }, [clearTimers, forceLogout, updateWarningVisible]);

  /**
   * Reinicia el ciclo por interacción del usuario. No-op si no hay sesión activa o si el modal de
   * advertencia ya está visible (ver comentario de `warningVisibleRef`): en ese punto, solo los
   * botones del propio modal pueden resolver el ciclo.
   */
  const resetTimers = useCallback(() => {
    if (!useAuthStore.getState().isAuthenticated || warningVisibleRef.current) {
      return;
    }
    // TODO: log temporal de depuración, remover una vez validado el flujo en dispositivo real.
    console.log('[InactivityProvider] Interacción detectada, se reinicia el conteo de inactividad.');
    armTimers();
  }, [armTimers]);

  // El `PanResponder` se instancia una única vez (ver `panResponder` abajo), así que su callback
  // no puede cerrar directamente sobre `resetTimers` sin quedar obsoleto. Este ref siempre apunta
  // a la versión más reciente.
  const resetTimersRef = useRef(resetTimers);
  useEffect(() => {
    resetTimersRef.current = resetTimers;
  }, [resetTimers]);

  // Instanciado una sola vez dentro de un useRef: evita recrear el objeto de gestos en cada
  // render, lo que podría interferir con el sistema de responders nativo.
  const panResponder = useRef(
    PanResponder.create({
      // Solo la fase de captura: se ejecuta antes de que el toque llegue a cualquier hijo. Se usa
      // únicamente para reiniciar el contador y SIEMPRE retorna `false` para no capturar el toque
      // ni bloquearlo hacia botones/inputs hijos. Se evita a propósito `onPanResponderMove`, que
      // dispararía en cada frame de un scroll/drag y saturaría el puente nativo.
      onStartShouldSetPanResponderCapture: () => {
        resetTimersRef.current();
        return false;
      },
    }),
  ).current;

  // Arranca o detiene el ciclo según cambie `isAuthenticated` (login/logout en caliente).
  useEffect(() => {
    if (isAuthenticated) {
      armTimers();
    } else {
      clearTimers();
      updateWarningVisible(false);
    }

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Background: limpia los temporizadores propios (memory leak / bloqueos evitados; el logout por
  // tiempo en background ya lo resuelve `useSessionInactivityWatcher`). Foreground: si la sesión
  // sigue activa, reinicia el ciclo desde cero.
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      const wentToBackground = previousState === 'active' && nextState !== 'active';
      const cameToForeground = previousState !== 'active' && nextState === 'active';

      if (wentToBackground) {
        clearTimers();
        updateWarningVisible(false);
      } else if (cameToForeground && useAuthStore.getState().isAuthenticated) {
        armTimers();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [clearTimers, armTimers, updateWarningVisible]);

  /** El usuario confirma que sigue ahí: refresca el token y reinicia el ciclo. */
  const handleExtendSession = useCallback(async () => {
    try {
      await AuthService.refreshAccessToken();
      armTimers();
    } catch (error) {
      // El refresh falló con el usuario ya en el aviso de inactividad: la sesión efectivamente
      // expiró, así que sí corresponde mostrar `SessionExpiredModal`.
      console.warn('No se pudo refrescar la sesión por inactividad, se cierra sesión.', error);
      forceLogout(true);
    }
  }, [armTimers, forceLogout]);

  /** El usuario prefiere cerrar sesión ya mismo: logout normal, sin `SessionExpiredModal`. */
  const handleCancelSession = useCallback(() => {
    forceLogout(false);
  }, [forceLogout]);

  return (
    <View style={styles.flex} {...panResponder.panHandlers}>
      {children}

      <WarningSessionModal
        visible={warningVisible}
        onConfirm={handleExtendSession}
        onCancel={handleCancelSession}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
