/**
 * Nivel de riesgo de una operación, y por lo tanto la verificación que exige.
 *
 * Portado de `operation_risk.dart`. «Silencioso» significa «sin código que
 * digitar», no «sin cliente presente»: esa distinción es la que separa una
 * buena experiencia de un agujero, porque el cliente siempre participa y lo que
 * cambia es cómo.
 */

export const NivelDeRiesgo = {
  /** Consulta. No mueve dinero, no necesita firma. */
  Consulta: 'consulta',
  /** Operación cotidiana: firma con rostro o huella, sin código. */
  Cotidiana: 'cotidiana',
  /**
   * Alto riesgo: firma **más** código fuera de banda. El segundo canal es lo
   * que impide que un teléfono comprometido se baste solo.
   */
  Elevado: 'elevado',
} as const;

export type NivelDeRiesgo = (typeof NivelDeRiesgo)[keyof typeof NivelDeRiesgo];

/**
 * Monto sobre el cual una transferencia deja de ser cotidiana, en pesos.
 *
 * ⚠️ **Los umbrales son del banco, no nuestros.** Están aquí como valores por
 * defecto razonables y deberían venir de configuración cuando Cumplimiento los
 * fije. Es lo mismo que dice el original, y sigue sin resolverse.
 */
export const LIMITE_COTIDIANO_DOP = 50_000;

/**
 * Durante el enfriamiento de un dispositivo recién enrolado el límite baja.
 *
 * Es lo que impide que quien logre enrolar un dispositivo ajeno vacíe la cuenta
 * antes de que el cliente lea la notificación.
 */
export const LIMITE_EN_ENFRIAMIENTO_DOP = 5_000;

/**
 * Tasa de respaldo para convertir dólares cuando no hay tasa del día.
 * Coincide con la que usa el resumen de balance del dashboard.
 */
export const TASA_DE_RESPALDO_USD = 59.5;

export interface OperacionAClasificar {
  mueveDinero: boolean;
  monto: number;
  enDolares: boolean;
  entreCuentasPropias?: boolean;
  beneficiarioNuevo?: boolean;
  internacional?: boolean;
  dispositivoEnEnfriamiento?: boolean;
}

/**
 * Clasifica una operación monetaria.
 *
 * `beneficiarioNuevo` es la señal más fuerte de riesgo después del monto: un
 * destino que el cliente nunca usó es el patrón de la mayoría del fraude.
 */
export function clasificarRiesgo({
  mueveDinero,
  monto,
  enDolares,
  entreCuentasPropias = false,
  beneficiarioNuevo = false,
  internacional = false,
  dispositivoEnEnfriamiento = false,
}: OperacionAClasificar): NivelDeRiesgo {
  if (!mueveDinero) return NivelDeRiesgo.Consulta;

  // Internacional siempre escala: el dinero sale del país y revertirlo es
  // mucho más difícil.
  if (internacional) return NivelDeRiesgo.Elevado;

  // Un beneficiario nuevo escala aunque el monto sea bajo. Es el momento en
  // que se establece un destino, y establecerlo importa más que la primera
  // cantidad que se le envíe.
  if (beneficiarioNuevo) return NivelDeRiesgo.Elevado;

  // Entre cuentas propias el dinero no sale del cliente, así que el umbral no
  // aplica: sigue siendo cotidiana por alto que sea el monto.
  if (entreCuentasPropias) return NivelDeRiesgo.Cotidiana;

  // Un umbral en moneda extranjera se evalúa convertido: US$ 400 no es una
  // operación pequeña aunque el número parezca bajo.
  const enPesos = enDolares ? monto * TASA_DE_RESPALDO_USD : monto;
  const limite = dispositivoEnEnfriamiento
    ? LIMITE_EN_ENFRIAMIENTO_DOP
    : LIMITE_COTIDIANO_DOP;

  return enPesos > limite ? NivelDeRiesgo.Elevado : NivelDeRiesgo.Cotidiana;
}

/**
 * Por qué se le pide más al cliente.
 *
 * Un cliente que entiende por qué se le pide un código lo tolera; uno que no,
 * aprende a desconfiar de la aplicación.
 */
export function explicarRiesgo(nivel: NivelDeRiesgo): string {
  switch (nivel) {
    case NivelDeRiesgo.Consulta:
      return '';
    case NivelDeRiesgo.Cotidiana:
      return 'Confirma con tu rostro o huella.';
    case NivelDeRiesgo.Elevado:
      return 'Por el tipo de operación pedimos también un código de verificación.';
  }
}
