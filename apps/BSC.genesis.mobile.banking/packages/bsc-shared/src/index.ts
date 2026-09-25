/**
 * Lógica compartida entre la app móvil React Native y el portal Nuxt.
 *
 * Todo lo que vive aquí es **puro**: sin React, sin red, sin acceso a
 * plataforma. Esa restricción es lo que permite que el mismo código corra en el
 * teléfono y en el navegador, y es la razón de ser de la migración — hoy
 * `operationFingerprint` existe tres veces (C#, TypeScript y Dart), y al
 * desaparecer la versión Dart quedan dos.
 *
 * Regla: si algo necesita `fetch`, `window`, `AsyncStorage` o un módulo nativo,
 * no pertenece a este paquete.
 */

export {
  FINGERPRINT_VERSION,
  OPERATION_TYPE,
  canonicalizeOperation,
  computeOperationFingerprint,
  computeFingerprintFrom,
  type OperationDescriptor,
  type OperationType,
} from './operationFingerprint';

export {
  RiskTier,
  ROUTINE_LIMIT_DOP,
  COOLING_OFF_LIMIT_DOP,
  FALLBACK_USD_TO_DOP,
  classifyOperationRisk,
  explainRiskTier,
  type OperationRiskInput,
} from './operationRisk';

export { sha256Hex, sha256Bytes, utf8Encode, hexDe } from './sha256';

export {
  PERIODO_TOTP,
  DIGITOS_TOTP,
  decodificarBase32,
  hmacSha256,
  contadorDeTiempo,
  segundosRestantes,
  codigoTotp,
  codigoTotpAlEstiloDelOriginal,
} from './totp';

export {
  CURRENCY,
  formatInteger,
  formatAmount,
  formatDOP,
  formatUSD,
  formatCurrency,
  currencySymbol,
  maskAccountNumber,
  maskCardNumber,
  parseCoreDate,
  formatDate,
  formatDateShort,
  formatDateForCore,
  formatTransactionDate,
  marcaDeUltimoAcceso,
  repairEncoding,
  softenDescription,
} from './formatters';
