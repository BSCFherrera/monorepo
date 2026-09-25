import { NivelDeRiesgo } from '../../../core/security/operationRisk';
import type { SigningOutcome } from '../../../core/security/signingOutcome';

/**
 * La compuerta por la que pasa **toda** operación monetaria de la aplicación.
 *
 * Portada de `authorize_operation.dart`. Decide entre firma del dispositivo y
 * código según el nivel de riesgo:
 *
 * - **Cotidiana** con dispositivo enrolado: se firma con rostro o huella, sin
 *   código. Es la ganancia de experiencia de todo el proyecto.
 * - **Cotidiana** sin dispositivo enrolado: código, como siempre.
 * - **Alto riesgo**: firma **y** código. El segundo canal es lo que impide que
 *   un teléfono comprometido se baste solo.
 *
 * Está escrita como una función pura sobre dos operaciones inyectadas —firmar y
 * pedir código— y **no toca la interfaz**. Esa es la diferencia con el
 * original, que recibe un `BuildContext` y muestra los avisos él mismo, y por
 * eso no se puede probar sin levantar la aplicación. Aquí la política de
 * seguridad se prueba entera, y lo que se dibuja lo decide la pantalla con lo
 * que esta función devuelve.
 */

export interface PasosDeAutorizacion {
  /** Si este teléfono puede firmar ahora mismo. */
  puedeFirmar: () => Promise<boolean>;
  /** Firma la operación y devuelve su autorización. */
  firmar: () => Promise<SigningOutcome>;
  /**
   * Pide el código al cliente y lo verifica.
   *
   * Devuelve la autorización, o nulo si el cliente no completó la
   * verificación —canceló, se quedó sin intentos o cerró la hoja—.
   */
  pedirCodigo: (motivo: MotivoDelCodigo) => Promise<string | null>;
}

/** Por qué se le está pidiendo el código, para que la hoja lo explique. */
export const MotivoDelCodigo = {
  /** No hay dispositivo capaz de firmar: el código es la vía legítima. */
  UnicaVia: 'unica-via',
  /** La firma falló y el fallo admite reintentar por otro canal. */
  TrasFalloDeFirma: 'tras-fallo-de-firma',
  /** Alto riesgo: se pide además de la firma. */
  VerificacionAdicional: 'verificacion-adicional',
} as const;

export type MotivoDelCodigo =
  (typeof MotivoDelCodigo)[keyof typeof MotivoDelCodigo];

export interface ResultadoDeAutorizacion {
  /** La autorización a enviar al ejecutar, o nula si no se autorizó. */
  autorizacionId: string | null;
  /** Lo que hay que decirle al cliente, si hay algo. */
  aviso: string | null;
}

const sinAutorizar = (aviso: string | null): ResultadoDeAutorizacion => ({
  autorizacionId: null,
  aviso,
});

export async function autorizarOperacion(
  nivel: NivelDeRiesgo,
  pasos: PasosDeAutorizacion,
): Promise<ResultadoDeAutorizacion> {
  // Una consulta no se autoriza. Llegar aquí con una es un error de quien
  // llama, y es mejor detenerlo que emitir una autorización que nadie pidió.
  if (nivel === NivelDeRiesgo.Consulta) {
    return sinAutorizar(null);
  }

  const puedeFirmar = await pasos.puedeFirmar();

  // ─── Sin dispositivo enrolado ─────────────────────────────────────────────
  // El código es la vía legítima en cualquier nivel, no un rodeo.
  if (!puedeFirmar) {
    const id = await pasos.pedirCodigo(MotivoDelCodigo.UnicaVia);
    return { autorizacionId: id, aviso: null };
  }

  const firma = await pasos.firmar();

  // ─── Cotidiana con dispositivo enrolado ───────────────────────────────────
  if (nivel === NivelDeRiesgo.Cotidiana) {
    if (firma.authorizationId !== null) {
      return { autorizacionId: firma.authorizationId, aviso: null };
    }

    /*
      **Si el cliente canceló la biometría, no se le ofrece un código.** Eso lo
      entrenaría a esquivar la verificación que acaba de rechazar, y entonces la
      biometría dejaría de proteger nada: bastaría con cancelarla para llegar a
      un camino más débil. La distinción la hace `outcomeForSigningError`.
    */
    if (!firma.shouldFallbackToOtp) {
      return sinAutorizar(firma.failureMessage);
    }

    const id = await pasos.pedirCodigo(MotivoDelCodigo.TrasFalloDeFirma);
    return { autorizacionId: id, aviso: firma.failureMessage };
  }

  // ─── Alto riesgo con dispositivo enrolado ─────────────────────────────────
  // La firma sola no alcanza aquí, y el código solo tampoco: se piden los dos.
  if (firma.authorizationId === null && !firma.shouldFallbackToOtp) {
    return sinAutorizar(firma.failureMessage);
  }

  /*
    El código emite su propia autorización, y **es la que se usa**: es la más
    reciente y la que el backend consumirá. La firma ya cumplió su papel, que
    era probar que el dispositivo y el cliente están presentes.
  */
  const id = await pasos.pedirCodigo(MotivoDelCodigo.VerificacionAdicional);
  return { autorizacionId: id, aviso: firma.failureMessage };
}
