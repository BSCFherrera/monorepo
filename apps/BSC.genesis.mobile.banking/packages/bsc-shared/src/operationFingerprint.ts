import { sha256Hex } from './sha256';

/**
 * Huella canónica de una operación monetaria.
 *
 * Debe producir exactamente el mismo hash que `OperationFingerprint` en el
 * backend (C#) y que `operationFingerprint.ts` en el portal. Si un solo
 * carácter difiere —un espacio, una minúscula, un decimal— el backend rechaza
 * la transacción con «La operación no coincide con la autorizada», que es
 * precisamente lo que debe pasar: el sistema no adivina.
 *
 * Por eso las reglas son rígidas: separador fijo, monto siempre con dos
 * decimales, campos ausentes como cadena vacía, texto en mayúsculas y sin
 * espacios al borde, y un prefijo de versión al frente.
 *
 * Esta es la implementación que sustituye a la de Dart. La versión Flutter
 * desaparece con la migración, de modo que quedan dos implementaciones —una por
 * lenguaje de plataforma— en vez de tres.
 */

/** Cambiarlo obliga a coordinar el despliegue de los canales. */
export const FINGERPRINT_VERSION = 'v1';

/** Tipos de operación, iguales a `TokenBscOperationType` del backend. */
export const OPERATION_TYPE = {
  TRANSFER: 2,
  CREDIT_CARD_PAYMENT: 7,
  LOAN_PAYMENT: 8,
} as const;

export type OperationType =
  (typeof OPERATION_TYPE)[keyof typeof OPERATION_TYPE];

export interface OperationDescriptor {
  operationType: number;
  customerCode: string;
  sourceAccount?: string | null;
  destinationAccount?: string | null;
  amount: number;
  currencyCode: number;
}

/**
 * Espacios al borde y mayúsculas son las dos formas en que dos canales calculan
 * distinto sobre el mismo dato. Se normalizan las dos.
 */
function normalize(value?: string | null): string {
  if (value === null || value === undefined) return '';
  const trimmed = String(value).trim();
  return trimmed === '' ? '' : trimmed.toUpperCase();
}

/**
 * El monto tiene que quedar igual que `decimal.ToString("F2")` en C#, que
 * redondea los medios alejándose del cero.
 *
 * `toFixed` de JavaScript no sirve: por el binario flotante devuelve "1.00"
 * para 1.005, porque el `double` más cercano a 1.005 es ligeramente menor. Se
 * redondea sobre centavos enteros, corrigiendo con un épsilon relativo antes de
 * formatear, que es lo mismo que hace el portal.
 *
 * Nota: la app Flutter usa `toStringAsFixed(2)`, que sí tiene ese sesgo. En la
 * práctica no importaba —un monto bancario nunca trae tres decimales— pero la
 * implementación correcta es esta, porque es la que coincide con el backend,
 * que es quien decide si acepta la transacción.
 */
function formatAmount(amount: number): string {
  const cents = Math.round(Math.abs(amount) * 100 * (1 + Number.EPSILON));
  const sign = amount < 0 ? '-' : '';
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  return `${sign}${whole}.${fraction}`;
}

/**
 * Cadena canónica. Exportada para poder registrarla al diagnosticar: sin verla,
 * una huella que no coincide es imposible de depurar.
 *
 * ⚠️ Solo debe registrarse en compilaciones de desarrollo: lleva el código de
 * cliente, las cuentas y el monto.
 */
export function canonicalizeOperation(op: OperationDescriptor): string {
  return [
    FINGERPRINT_VERSION,
    String(op.operationType),
    normalize(op.customerCode),
    normalize(op.sourceAccount),
    normalize(op.destinationAccount),
    formatAmount(op.amount),
    String(op.currencyCode),
  ].join('|');
}

/** SHA-256 en hexadecimal minúscula de la cadena canónica. */
export function computeOperationFingerprint(op: OperationDescriptor): string {
  return computeFingerprintFrom(canonicalizeOperation(op));
}

export function computeFingerprintFrom(canonical: string): string {
  return sha256Hex(canonical);
}
