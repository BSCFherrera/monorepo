

import {
  aplicarPoliticaDelBanco,
  politicaDesde,
  SessionPolicyRepository,
} from '../politicaDeSesion';
import { DEFAULT_SESSION_POLICY, type SessionPolicy } from '../sessionManager';

describe('lo que responde el backend de verdad', () => {
  /**
   * Medido contra el BFF levantado, el 2026-09-18:
   *
   * ```
   * GET /api/v1/configuration/public/Session
   *   session.timeout.inactivity.minutes        10
   *   session.warning.before.timeout.seconds    60
   * ```
   *
   * `SystemSettingService.GetSessionConfigurationAsync` lee esas filas por
   * categoría y las entrega con los nombres del DTO, así que la respuesta
   * autenticada de `/configuration/session` lleva estos dos valores.
   */
  const RESPUESTA_REAL = {
    InactivityTimeoutMinutes: 10,
    WarningBeforeTimeoutSeconds: 60,
    AbsoluteTimeoutHours: 8,
    ExtensionAllowed: true,
    MaxExtensionCount: 3,
    CountdownVisible: true,
    ActivityDetectionEnabled: true,
    MultiTabSyncEnabled: true,
  };

  it('se traduce a la política del gestor', () => {
    expect(politicaDesde(RESPUESTA_REAL)).toEqual<SessionPolicy>({
      inactivityTimeoutMs: 10 * 60_000,
      warningBeforeMs: 60_000,
    });
  });

  it('hoy coincide con el valor por defecto, y por eso la omisión no se veía', () => {
    // Esta igualdad es la que hace falso el «funciona igual»: coincide por
    // casualidad, no porque el porte lo pida.
    expect(politicaDesde(RESPUESTA_REAL)).toEqual(DEFAULT_SESSION_POLICY);
  });

  it('un valor distinto del banco sí cambia la política', () => {
    expect(
      politicaDesde({
        InactivityTimeoutMinutes: 3,
        WarningBeforeTimeoutSeconds: 30,
      }),
    ).toEqual<SessionPolicy>({
      inactivityTimeoutMs: 3 * 60_000,
      warningBeforeMs: 30_000,
    });
  });
});

describe('la lectura de la respuesta', () => {
  it('acepta los nombres en minúscula inicial, como el original', () => {
    // El original prueba la clave y su versión con la primera en minúscula,
    // porque la serialización del backend no siempre respeta el DTO.
    expect(
      politicaDesde({
        inactivityTimeoutMinutes: 7,
        warningBeforeTimeoutSeconds: 45,
      }),
    ).toEqual<SessionPolicy>({
      inactivityTimeoutMs: 7 * 60_000,
      warningBeforeMs: 45_000,
    });
  });

  it('acepta los números escritos como texto', () => {
    expect(
      politicaDesde({
        InactivityTimeoutMinutes: '15',
        WarningBeforeTimeoutSeconds: '90',
      }),
    ).toEqual<SessionPolicy>({
      inactivityTimeoutMs: 15 * 60_000,
      warningBeforeMs: 90_000,
    });
  });

  it('sin aviso cae a los 60 segundos del original', () => {
    expect(
      politicaDesde({ InactivityTimeoutMinutes: 5 }),
    ).toEqual<SessionPolicy>({
      inactivityTimeoutMs: 5 * 60_000,
      warningBeforeMs: 60_000,
    });
  });

  it('descarta una inactividad de cero o negativa', () => {
    // Aplicarla dejaría la sesión cayéndose sin parar.
    expect(politicaDesde({ InactivityTimeoutMinutes: 0 })).toBeNull();
    expect(politicaDesde({ InactivityTimeoutMinutes: -1 })).toBeNull();
  });

  it('descarta lo que no sea un objeto', () => {
    expect(politicaDesde(null)).toBeNull();
    expect(politicaDesde('10')).toBeNull();
    expect(politicaDesde([])).toBeNull();
  });
});

describe('el repositorio', () => {
  it('pide la ruta del backend', async () => {
    const get = jest
      .fn()
      .mockResolvedValue({ data: { InactivityTimeoutMinutes: 4 } });
    const repositorio = new SessionPolicyRepository({ get } as never);

    await expect(repositorio.fetch()).resolves.toEqual<SessionPolicy>({
      inactivityTimeoutMs: 4 * 60_000,
      warningBeforeMs: 60_000,
    });
    expect(get).toHaveBeenCalledWith('/api/v1/configuration/session');
  });

  it('un fallo de red no se propaga', async () => {
    const get = jest.fn().mockRejectedValue(new Error('sin red'));
    const repositorio = new SessionPolicyRepository({ get } as never);

    await expect(repositorio.fetch()).resolves.toBeNull();
  });
});

describe('aplicarPoliticaDelBanco', () => {
  it('aplica al gestor lo que responde el banco', async () => {
    const politica: SessionPolicy = {
      inactivityTimeoutMs: 3 * 60_000,
      warningBeforeMs: 30_000,
    };
    const applyPolicy = jest.fn();

    await aplicarPoliticaDelBanco(
      { fetch: async () => politica },
      { applyPolicy },
    );

    expect(applyPolicy).toHaveBeenCalledWith(politica);
  });

  it('sin respuesta no toca el gestor: se queda con los valores por defecto', async () => {
    const applyPolicy = jest.fn();

    await aplicarPoliticaDelBanco({ fetch: async () => null }, { applyPolicy });

    expect(applyPolicy).not.toHaveBeenCalled();
  });

  it('un servicio que lanza no rompe el inicio de sesión', async () => {
    const applyPolicy = jest.fn();

    await expect(
      aplicarPoliticaDelBanco(
        {
          fetch: async () => {
            throw new Error('roto');
          },
        },
        { applyPolicy },
      ),
    ).resolves.toBeNull();

    expect(applyPolicy).not.toHaveBeenCalled();
  });
});
