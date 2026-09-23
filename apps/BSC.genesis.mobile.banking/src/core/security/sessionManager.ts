import type { TokenStore } from './tokenStore';

/**
 * Cierra la sesión tras un rato de inactividad **real**.
 *
 * Portado de `lib/core/security/session_manager.dart`. Dos cosas faltaban en la
 * app Flutter antes de ese archivo y juntas expulsaban a la gente a mitad de
 * una tarea: nada llamaba a `recordActivity`, así que la cuenta corría desde el
 * inicio de sesión e ignoraba al cliente por completo; y nada llamaba a
 * `initialize`, así que el vencimiento ocurría en silencio y la siguiente
 * navegación rebotaba a login sin explicación.
 *
 * La actividad viene de interacción real del cliente, y se le avisa antes de
 * dejarlo fuera.
 */

/**
 * Cuánto puede estar la sesión inactiva, y cuánto aviso recibe el cliente.
 *
 * **Los números son del backend**, que los sirve desde `/configuration/session`
 * — la misma ruta que lee el portal. Los valores de abajo solo cubren el caso
 * en que esa llamada falle.
 */
export interface SessionPolicy {
  inactivityTimeoutMs: number;
  warningBeforeMs: number;
}

export const DEFAULT_SESSION_POLICY: SessionPolicy = {
  inactivityTimeoutMs: 10 * 60_000,
  warningBeforeMs: 60_000,
};

/** El tramo tranquilo antes de que aparezca el aviso. */
export function msUntilWarning(policy: SessionPolicy): number {
  return Math.max(0, policy.inactivityTimeoutMs - policy.warningBeforeMs);
}

export interface SessionCallbacks {
  onSessionExpired: () => void;
  onWarning?: () => void;
  /** La actividad rescató la sesión: el aviso puede retirarse. */
  onWarningResolved?: () => void;
}

/**
 * Relojes y temporizadores inyectables.
 *
 * Sin esto, probar diez minutos de inactividad tomaría diez minutos. Los
 * temporizadores falsos de Jest cubren el caso.
 */
export interface SessionClock {
  now(): number;
  setTimeout(fn: () => void, ms: number): ReturnType<typeof setTimeout>;
  clearTimeout(id: ReturnType<typeof setTimeout>): void;
}

const relojReal: SessionClock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: id => clearTimeout(id),
};

export class SessionManager {
  private readonly store: TokenStore;
  private readonly clock: SessionClock;

  private policy: SessionPolicy = DEFAULT_SESSION_POLICY;
  private callbacks: SessionCallbacks | null = null;

  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  private authenticated = false;
  private warningShowing = false;
  private lastActivity: number | null = null;
  private expiresAt: number | null = null;

  constructor(store: TokenStore, clock: SessionClock = relojReal) {
    this.store = store;
    this.clock = clock;
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  get currentPolicy(): SessionPolicy {
    return this.policy;
  }

  /** Milisegundos que quedan, para la cuenta regresiva del aviso. */
  get timeRemainingMs(): number {
    if (this.expiresAt === null) return 0;
    return Math.max(0, this.expiresAt - this.clock.now());
  }

  initialize(callbacks: SessionCallbacks): void {
    this.callbacks = callbacks;
  }

  /** Aplica la política que sirve el backend. Se puede llamar en cualquier momento. */
  applyPolicy(policy: SessionPolicy): void {
    this.policy = policy;
    if (this.authenticated) this.restartTimers();
  }

  markAuthenticated(): void {
    this.authenticated = true;
    this.restartTimers();
  }

  /**
   * Cada toque, desplazamiento y tecla llega aquí, así que tiene que ser
   * barato: con el aviso visible se reconstruyen los temporizadores para que la
   * cuenta regresiva desaparezca; el resto del tiempo solo se empuja el plazo.
   */
  recordActivity(): void {
    if (!this.authenticated) return;

    this.lastActivity = this.clock.now();

    if (this.warningShowing) {
      this.warningShowing = false;
      this.callbacks?.onWarningResolved?.();
    }

    this.restartTimers();
  }

  /** «Seguir conectado» en el aviso. Lo mismo que la actividad, dicho en voz alta. */
  extend(): void {
    this.recordActivity();
  }

  async clearSession(): Promise<void> {
    this.olvidarEstado();
    await this.store.clearSession();
  }

  /**
   * Bloquea la sesión sin cerrarla.
   *
   * Es lo que corresponde a una inactividad: se tira el token de acceso y se
   * **conserva el de refresco**, para que «Entrar con tu huella» tenga algo que
   * desbloquear. Ver `finDeSesion.ts`, que explica por qué los dos finales no
   * son el mismo.
   */
  async lockSession(): Promise<void> {
    this.olvidarEstado();
    await this.store.lockSession();
  }

  private olvidarEstado(): void {
    this.authenticated = false;
    this.warningShowing = false;
    this.cancelTimers();
    this.lastActivity = null;
    this.expiresAt = null;
  }

  /**
   * Cambio de estado de la aplicación.
   *
   * **Aquí no hay equivalencia directa con Flutter.** Flutter observa el ciclo
   * de vida con `WidgetsBindingObserver` y estados `paused` / `inactive` /
   * `resumed`; React Native usa `AppState`, con `background` / `inactive` /
   * `active`. El comportamiento es el mismo y la traducción se hace en el
   * borde: quien escuche `AppState` llama a este método.
   *
   * Los temporizadores no sobreviven de forma fiable a una app en segundo
   * plano, así que se registra cuándo se fue y se mide el hueco al volver, en
   * vez de confiar en que el temporizador siga vivo.
   */
  handleAppStateChange(state: 'active' | 'background' | 'inactive'): void {
    if (state === 'background' || state === 'inactive') {
      this.lastActivity = this.clock.now();
      this.cancelTimers();
      return;
    }

    this.checkSessionOnResume();
  }

  dispose(): void {
    this.cancelTimers();
    this.callbacks = null;
  }

  // ─── Interno ────────────────────────────────────────────────────────────

  private restartTimers(): void {
    this.cancelTimers();
    if (!this.authenticated) return;

    const ahora = this.clock.now();
    this.expiresAt = ahora + this.policy.inactivityTimeoutMs;

    const anticipacion = msUntilWarning(this.policy);
    if (this.callbacks?.onWarning && anticipacion > 0) {
      this.warningTimer = this.clock.setTimeout(() => {
        if (!this.authenticated) return;
        this.warningShowing = true;
        this.callbacks?.onWarning?.();
      }, anticipacion);
    }

    this.expiryTimer = this.clock.setTimeout(() => {
      this.onTimeout();
    }, this.policy.inactivityTimeoutMs);
  }

  private cancelTimers(): void {
    if (this.warningTimer !== null) {
      this.clock.clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expiryTimer !== null) {
      this.clock.clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private onTimeout(): void {
    this.authenticated = false;
    this.warningShowing = false;
    this.cancelTimers();
    this.callbacks?.onSessionExpired();
  }

  private checkSessionOnResume(): void {
    if (!this.authenticated) return;

    if (this.lastActivity === null) {
      this.restartTimers();
      return;
    }

    if (
      this.clock.now() - this.lastActivity >=
      this.policy.inactivityTimeoutMs
    ) {
      this.onTimeout();
    } else {
      this.restartTimers();
    }
  }
}
