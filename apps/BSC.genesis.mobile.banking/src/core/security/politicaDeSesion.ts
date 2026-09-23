import type { AxiosInstance } from 'axios';

import { Endpoints } from '../network/endpoints';

import type { SessionPolicy } from './sessionManager';

/**
 * La política de inactividad que publica el banco.
 *
 * Portado de `session_policy_service.dart` y de `_loadPolicy()` en
 * `session_guard.dart`.
 *
 * **Qué cierra esto.** El porte tenía `applyPolicy` en el gestor de sesión y
 * **nadie lo llamaba**: la aplicación usaba siempre los diez minutos de
 * `DEFAULT_SESSION_POLICY` aunque seguridad configurara otra cosa. La omisión
 * no se veía porque hoy los dos números coinciden —la tabla de configuración
 * responde 10 minutos, igual que el valor por defecto—, y se vería justo el día
 * en que el banco lo cambie.
 *
 * **Los números son del banco, no nuestros.** El backend los guarda en la tabla
 * de configuración bajo `session.timeout.inactivity.minutes` y
 * `session.warning.before.timeout.seconds`, y los sirve por
 * `/configuration/session`, que es la misma ruta que lee el portal.
 *
 * **Un fallo aquí no interrumpe a nadie.** Al contrario que en las tasas de
 * cambio, donde la pantalla entera es la consulta, aquí la aplicación ya tiene
 * una política razonable: si la llamada falla, se queda con la suya y el
 * cliente entra igual. El original decide lo mismo, y su comentario lo dice.
 */
export class SessionPolicyRepository {
  constructor(private readonly http: AxiosInstance) {}

  async fetch(): Promise<SessionPolicy | null> {
    try {
      const respuesta = await this.http.get(Endpoints.sessionConfiguration);
      return politicaDesde(respuesta.data);
    } catch {
      return null;
    }
  }
}

/**
 * Traduce la respuesta del backend a la política del gestor.
 *
 * Acepta la clave tal cual la declara el DTO y también con la primera letra en
 * minúscula, porque la serialización del backend no siempre respeta el nombre
 * del DTO y el original ya se cubre de lo mismo.
 */
export function politicaDesde(datos: unknown): SessionPolicy | null {
  if (datos === null || typeof datos !== 'object' || Array.isArray(datos)) {
    return null;
  }

  const mapa = datos as Record<string, unknown>;

  const minutos = entero(mapa, 'InactivityTimeoutMinutes');
  // Un cero o un negativo dejarían la sesión cayéndose sin parar: se descarta
  // la respuesta entera y se conservan los valores por defecto.
  if (minutos === null || minutos <= 0) return null;

  const aviso = entero(mapa, 'WarningBeforeTimeoutSeconds');

  return {
    inactivityTimeoutMs: minutos * 60_000,
    // Los 60 segundos son los del original cuando el campo no viene.
    warningBeforeMs: (aviso ?? 60) * 1_000,
  };
}

/**
 * Pide la política y la aplica. Es el `_loadPolicy()` del original.
 *
 * Se llama justo después de dar la sesión por autenticada, que es cuando el
 * token ya sirve: la ruta exige autorización.
 */
export async function aplicarPoliticaDelBanco(
  servicio: { fetch(): Promise<SessionPolicy | null> },
  gestor: { applyPolicy(politica: SessionPolicy): void },
): Promise<SessionPolicy | null> {
  let politica: SessionPolicy | null = null;

  try {
    politica = await servicio.fetch();
  } catch {
    return null;
  }

  if (politica !== null) gestor.applyPolicy(politica);

  return politica;
}

function entero(mapa: Record<string, unknown>, clave: string): number | null {
  const enMinuscula = clave[0]?.toLowerCase() + clave.slice(1);
  const valor = mapa[clave] ?? mapa[enMinuscula];

  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return Math.trunc(valor);
  }

  if (typeof valor === 'string') {
    const leido = Number.parseInt(valor, 10);
    if (Number.isFinite(leido)) return leido;
  }

  return null;
}
