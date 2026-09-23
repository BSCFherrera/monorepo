/**
 * Nivel de riesgo de una operación, y por lo tanto la verificación que exige.
 *
 * «Silencioso» significa «sin código que digitar», no «sin cliente presente».
 * Esa distinción es la que separa una buena experiencia de un agujero: el
 * cliente siempre participa, lo que cambia es cómo.
 *
 * Portado de `lib/core/security/operation_risk.dart`, conservando la lógica
 * literalmente. Al ser lógica pura, el portal puede consumir la misma
 * implementación en vez de reescribirla.
 */

export const RiskTier = {
  /** Consulta. No mueve dinero, no necesita firma. */
  Inquiry: 'inquiry',

  /** Operación cotidiana: firma con rostro o huella, sin código. */
  Routine: 'routine',

  /**
   * Alto riesgo: firma **más** código fuera de banda. El segundo canal es lo
   * que impide que un teléfono comprometido se baste solo.
   */
  Elevated: 'elevated',
} as const;

export type RiskTier = (typeof RiskTier)[keyof typeof RiskTier];

/**
 * Monto sobre el cual una transferencia deja de ser cotidiana, en pesos.
 *
 * ⚠️ Los umbrales son del banco, no nuestros. Están aquí como valores por
 * defecto razonables y deberían venir de configuración cuando Cumplimiento los
 * fije — ver P-05 en `docs/migration/11-open-questions.md`.
 */
export const ROUTINE_LIMIT_DOP = 50_000;

/**
 * Durante el enfriamiento de un dispositivo nuevo, el límite se reduce. Es lo
 * que impide que quien logre enrolar un dispositivo ajeno vacíe la cuenta antes
 * de que el cliente lea la notificación.
 */
export const COOLING_OFF_LIMIT_DOP = 5_000;

/**
 * Tasa de respaldo para convertir dólares cuando no hay tasa del día. Coincide
 * con la que usa el resumen de balance.
 */
export const FALLBACK_USD_TO_DOP = 59.5;

export interface OperationRiskInput {
  movesMoney: boolean;
  amount: number;
  isUsd: boolean;
  isOwnAccount?: boolean;

  /**
   * La señal más fuerte de riesgo después del monto: un destino que el cliente
   * nunca usó es el patrón de la mayoría del fraude.
   */
  isNewBeneficiary?: boolean;
  isInternational?: boolean;
  deviceInCoolingOff?: boolean;
}

/** Clasifica una operación monetaria. */
export function classifyOperationRisk(input: OperationRiskInput): RiskTier {
  const {
    movesMoney,
    amount,
    isUsd,
    isOwnAccount = false,
    isNewBeneficiary = false,
    isInternational = false,
    deviceInCoolingOff = false,
  } = input;

  if (!movesMoney) return RiskTier.Inquiry;

  // Internacional siempre escala: el dinero sale del país y la reversión es
  // mucho más difícil.
  if (isInternational) return RiskTier.Elevated;

  // Un beneficiario nuevo escala aunque el monto sea bajo. Es el momento en que
  // se establece un destino, y establecerlo importa más que la primera cantidad
  // que se le envíe.
  if (isNewBeneficiary) return RiskTier.Elevated;

  // Entre cuentas propias el dinero no sale del cliente, así que el umbral no
  // aplica: sigue siendo cotidiana.
  if (isOwnAccount) return RiskTier.Routine;

  const inDop = isUsd ? amount * FALLBACK_USD_TO_DOP : amount;
  const limit = deviceInCoolingOff ? COOLING_OFF_LIMIT_DOP : ROUTINE_LIMIT_DOP;

  return inDop > limit ? RiskTier.Elevated : RiskTier.Routine;
}

/**
 * Explicación para el cliente de por qué se le pide más.
 *
 * Un cliente que entiende por qué se le pide un código lo tolera; uno que no,
 * aprende a desconfiar de la app.
 */
export function explainRiskTier(tier: RiskTier): string {
  switch (tier) {
    case RiskTier.Inquiry:
      return '';
    case RiskTier.Routine:
      return 'Confirma con tu rostro o huella.';
    case RiskTier.Elevated:
      return 'Por el tipo de operación pedimos también un código de verificación.';
  }
}
