import {
  SessionManager,
  DEFAULT_SESSION_POLICY,
  msUntilWarning,
  type SessionClock,
  type SessionPolicy,
} from '../sessionManager';
import { InMemoryTokenStore } from '../tokenStore';

/**
 * Portadas de `BSC.MobileApp/test/core/session_manager_test.dart`.
 *
 * El reloj y los temporizadores se inyectan porque, de lo contrario, probar
 * diez minutos de inactividad tomaría diez minutos.
 */

/** Reloj controlado: el tiempo solo avanza cuando la prueba lo dice. */
class RelojFalso implements SessionClock {
  private tiempo = 1_000_000;
  private secuencia = 0;
  private readonly pendientes = new Map<
    number,
    { disparaEn: number; fn: () => void }
  >();

  now(): number {
    return this.tiempo;
  }

  setTimeout(fn: () => void, ms: number): ReturnType<typeof setTimeout> {
    this.secuencia += 1;
    this.pendientes.set(this.secuencia, { disparaEn: this.tiempo + ms, fn });
    return this.secuencia as unknown as ReturnType<typeof setTimeout>;
  }

  clearTimeout(id: ReturnType<typeof setTimeout>): void {
    this.pendientes.delete(id as unknown as number);
  }

  /** Avanza el tiempo y dispara lo que venciera en el camino, en orden. */
  avanzar(ms: number): void {
    const destino = this.tiempo + ms;

    for (;;) {
      const vencidos = [...this.pendientes.entries()]
        .filter(([, t]) => t.disparaEn <= destino)
        .sort((a, b) => a[1].disparaEn - b[1].disparaEn);

      const siguiente = vencidos[0];
      if (siguiente === undefined) break;

      const [id, tarea] = siguiente;
      this.pendientes.delete(id);
      this.tiempo = tarea.disparaEn;
      tarea.fn();
    }

    this.tiempo = destino;
  }

  get temporizadoresActivos(): number {
    return this.pendientes.size;
  }
}

const POLITICA: SessionPolicy = {
  inactivityTimeoutMs: 10 * 60_000,
  warningBeforeMs: 60_000,
};

function montar(policy: SessionPolicy = POLITICA) {
  const reloj = new RelojFalso();
  const store = new InMemoryTokenStore();
  const manager = new SessionManager(store, reloj);

  const eventos = { expirada: 0, aviso: 0, avisoResuelto: 0 };

  manager.initialize({
    onSessionExpired: () => {
      eventos.expirada += 1;
    },
    onWarning: () => {
      eventos.aviso += 1;
    },
    onWarningResolved: () => {
      eventos.avisoResuelto += 1;
    },
  });

  manager.applyPolicy(policy);

  return { reloj, store, manager, eventos };
}

describe('política de sesión', () => {
  it('los valores por defecto solo cubren el fallo del backend', () => {
    // Diez minutos y un aviso de sesenta segundos. Los números reales los sirve
    // el backend en /configuration/session.
    expect(DEFAULT_SESSION_POLICY.inactivityTimeoutMs).toBe(600_000);
    expect(DEFAULT_SESSION_POLICY.warningBeforeMs).toBe(60_000);
  });

  it('el tramo tranquilo es el tiempo menos el aviso', () => {
    expect(msUntilWarning(POLITICA)).toBe(9 * 60_000);
  });

  it('un aviso más largo que el tiempo total no produce un valor negativo', () => {
    expect(
      msUntilWarning({ inactivityTimeoutMs: 30_000, warningBeforeMs: 60_000 }),
    ).toBe(0);
  });
});

describe('inactividad', () => {
  it('sin autenticar no arranca ningún temporizador', () => {
    const { reloj, manager } = montar();
    manager.recordActivity();

    expect(reloj.temporizadoresActivos).toBe(0);
  });

  it('avisa antes de expirar, no en el momento', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    reloj.avanzar(9 * 60_000);

    expect(eventos.aviso).toBe(1);
    expect(eventos.expirada).toBe(0);
  });

  it('expira al cumplirse el tiempo completo', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    reloj.avanzar(10 * 60_000);

    expect(eventos.expirada).toBe(1);
    expect(manager.isAuthenticated).toBe(false);
  });

  it('la actividad durante el aviso lo retira y reinicia la cuenta', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    reloj.avanzar(9 * 60_000);
    expect(eventos.aviso).toBe(1);

    manager.recordActivity();
    expect(eventos.avisoResuelto).toBe(1);

    // La cuenta vuelve a empezar: nueve minutos más sin avisar de nuevo.
    reloj.avanzar(8 * 60_000);
    expect(eventos.aviso).toBe(1);
    expect(eventos.expirada).toBe(0);

    reloj.avanzar(60_000);
    expect(eventos.aviso).toBe(2);
  });

  it('«seguir conectado» hace lo mismo que la actividad', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    reloj.avanzar(9 * 60_000);
    manager.extend();

    reloj.avanzar(5 * 60_000);
    expect(eventos.expirada).toBe(0);
  });

  it('la actividad continua mantiene la sesión indefinidamente', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    for (let i = 0; i < 20; i += 1) {
      reloj.avanzar(5 * 60_000);
      manager.recordActivity();
    }

    expect(eventos.expirada).toBe(0);
    expect(manager.isAuthenticated).toBe(true);
  });

  it('avisa una sola vez por tramo de inactividad', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    reloj.avanzar(9 * 60_000 + 30_000);

    expect(eventos.aviso).toBe(1);
  });

  it('el tiempo restante alimenta la cuenta regresiva', () => {
    const { reloj, manager } = montar();
    manager.markAuthenticated();

    expect(manager.timeRemainingMs).toBe(10 * 60_000);

    reloj.avanzar(9 * 60_000);
    expect(manager.timeRemainingMs).toBe(60_000);
  });

  it('el tiempo restante nunca es negativo', () => {
    const { reloj, manager } = montar();
    manager.markAuthenticated();
    reloj.avanzar(15 * 60_000);

    expect(manager.timeRemainingMs).toBe(0);
  });
});

describe('política del backend', () => {
  it('aplicar una política nueva reinicia la cuenta en curso', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();
    reloj.avanzar(8 * 60_000);

    manager.applyPolicy({
      inactivityTimeoutMs: 2 * 60_000,
      warningBeforeMs: 30_000,
    });

    // La cuenta arranca de cero con el tiempo nuevo, no continúa la anterior.
    reloj.avanzar(90_000);
    expect(eventos.aviso).toBe(1);
    expect(eventos.expirada).toBe(0);

    reloj.avanzar(30_000);
    expect(eventos.expirada).toBe(1);
  });

  it('sin sesión activa, la política se guarda sin arrancar nada', () => {
    const { reloj, manager } = montar();
    manager.applyPolicy({
      inactivityTimeoutMs: 60_000,
      warningBeforeMs: 10_000,
    });

    expect(manager.currentPolicy.inactivityTimeoutMs).toBe(60_000);
    expect(reloj.temporizadoresActivos).toBe(0);
  });
});

describe('paso a segundo plano', () => {
  it('al irse cancela los temporizadores en vez de confiar en ellos', () => {
    const { reloj, manager } = montar();
    manager.markAuthenticated();

    manager.handleAppStateChange('background');

    // Los temporizadores no sobreviven de forma fiable a una app en segundo
    // plano: se mide el hueco al volver.
    expect(reloj.temporizadoresActivos).toBe(0);
  });

  it('volver dentro del plazo conserva la sesión', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    manager.handleAppStateChange('background');
    reloj.avanzar(5 * 60_000);
    manager.handleAppStateChange('active');

    expect(eventos.expirada).toBe(0);
    expect(manager.isAuthenticated).toBe(true);
  });

  it('volver pasado el plazo expira la sesión', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    manager.handleAppStateChange('background');
    reloj.avanzar(11 * 60_000);
    manager.handleAppStateChange('active');

    expect(eventos.expirada).toBe(1);
    expect(manager.isAuthenticated).toBe(false);
  });

  it('justo en el límite expira', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    manager.handleAppStateChange('background');
    reloj.avanzar(10 * 60_000);
    manager.handleAppStateChange('active');

    expect(eventos.expirada).toBe(1);
  });

  it('«inactive» se trata igual que segundo plano', () => {
    // En React Native, iOS emite «inactive» al bajar el centro de control o al
    // aparecer una llamada. Tratarlo como actividad dejaría la sesión abierta
    // con la pantalla tapada.
    const { reloj, manager } = montar();
    manager.markAuthenticated();

    manager.handleAppStateChange('inactive');

    expect(reloj.temporizadoresActivos).toBe(0);
  });

  it('volver sin sesión no hace nada', () => {
    const { manager, eventos } = montar();

    manager.handleAppStateChange('background');
    manager.handleAppStateChange('active');

    expect(eventos.expirada).toBe(0);
  });
});

describe('cierre de sesión', () => {
  it('limpia el estado y las credenciales', async () => {
    const { reloj, manager, store } = montar();
    await store.saveAccessToken('acceso-1');
    manager.markAuthenticated();

    await manager.clearSession();

    expect(manager.isAuthenticated).toBe(false);
    expect(manager.timeRemainingMs).toBe(0);
    expect(reloj.temporizadoresActivos).toBe(0);
    expect(await store.getAccessToken()).toBeNull();
  });

  it('tras cerrar sesión, el tiempo no vuelve a expirarla', async () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();
    await manager.clearSession();

    reloj.avanzar(30 * 60_000);

    // Sin esto, el aviso podría aparecer sobre la pantalla de acceso.
    expect(eventos.expirada).toBe(0);
    expect(eventos.aviso).toBe(0);
  });

  it('dispose deja de observar y cancela todo', () => {
    const { reloj, manager, eventos } = montar();
    manager.markAuthenticated();

    manager.dispose();
    reloj.avanzar(30 * 60_000);

    expect(eventos.expirada).toBe(0);
    expect(reloj.temporizadoresActivos).toBe(0);
  });
});
