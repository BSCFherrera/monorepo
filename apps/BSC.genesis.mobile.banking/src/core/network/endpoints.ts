/**
 * Rutas de la API, relativas a la URL base.
 *
 * Portado de `lib/core/network/api_endpoints.dart`, que a su vez se mantiene en
 * sincronía con `src/api/constants/endpoints.ts` del portal. Los tres clientes
 * hablan con la misma API del banco, así que **cualquier ruta que no coincida
 * con la del portal es un defecto**: el portal es la implementación de
 * referencia.
 *
 * Solo entran rutas que el backend expone de verdad. La app Flutter tuvo
 * constantes de rutas inexistentes: compilaban bien y fallaban en ejecución.
 */

const V1 = '/api/v1';

export const Endpoints = {
  // ─── Autenticación ──────────────────────────────────────────────────────
  login: `${V1}/auth/login`,
  logout: `${V1}/auth/logout`,
  logoutAll: `${V1}/auth/logout-all`,
  refreshToken: `${V1}/auth/refresh-token`,
  me: `${V1}/auth/me`,
  validateToken: `${V1}/auth/validate-token`,

  // ─── Cliente ────────────────────────────────────────────────────────────
  /**
   * Fuente de verdad de la identidad del titular, su sucursal y su oficial.
   * La respuesta del login describe al *usuario de la app*, que es otra cosa.
   */
  customerProfile: `${V1}/customers/get-customer-profile`,

  // ─── Productos ──────────────────────────────────────────────────────────
  products: `${V1}/products/get-products-by-customer-id`,

  /**
   * Detalle por producto. Devuelve los nombres de campo del core en español y
   * mayúsculas, con forma distinta según `productType` (CA/CC/TC/PR/CD).
   */
  productDetails: `${V1}/products/details`,

  // ─── Cuentas ────────────────────────────────────────────────────────────
  accountTransactions: `${V1}/account-management/account-transactions`,
  accountStatementPdf: `${V1}/account-management/account-statement-pdf`,

  // ─── Tarjetas de crédito ────────────────────────────────────────────────
  creditCardTransactions: `${V1}/credit-card-management/transactions`,
  creditCardStatement: `${V1}/credit-card-management/statement`,
  creditCardStatementPdf: `${V1}/credit-card-management/statement/pdf`,
  creditCardPayment: `${V1}/credit-card-management/apply-credit-card-payment/execute`,
  creditCardBeneficiaryPayment: `${V1}/credit-card-management/apply-credit-card-beneficiary-payment/execute`,

  // ─── Préstamos ──────────────────────────────────────────────────────────
  loanTransactions: `${V1}/loan-management/loan-transactions/retrieve`,
  loanPayment: `${V1}/loan-management/apply-loan-payment/execute`,

  // ─── Ejecución de pagos ─────────────────────────────────────────────────
  transferFeesSummary: `${V1}/payment-execution/transfer-fees-summary`,
  paymentExecutionTransfer: `${V1}/payment-execution/transfer`,

  // ─── Divisas ────────────────────────────────────────────────────────────
  exchangeRateList: `${V1}/currency-exchange/rates`,
  exchangeRateQuote: `${V1}/currency-exchange/rate-quote`,

  // ─── Configuración ──────────────────────────────────────────────────────
  /** Política de inactividad que define el backend; el portal lee la misma. */
  sessionConfiguration: `${V1}/configuration/session`,

  // ─── Beneficiarios ──────────────────────────────────────────────────────
  beneficiaries: `${V1}/beneficiaries`,
  validateAccount: `${V1}/beneficiaries/validate-account`,
  beneficiaryAddInternal: `${V1}/beneficiaries/add-internal-bank`,
  beneficiaryAddLocalInterbank: `${V1}/beneficiaries/add-local-interbank`,
  beneficiaryConfirm: `${V1}/beneficiaries/confirm`,
  beneficiaryBanks: `${V1}/beneficiaries/catalogs/banks`,
  beneficiaryAccountTypes: `${V1}/beneficiaries/catalogs/account-types`,
  beneficiaryDocumentTypes: `${V1}/beneficiaries/catalogs/document-types`,

  // ─── Segundo factor ─────────────────────────────────────────────────────
  twoFactorMethods: `${V1}/two-factor/methods`,
  twoFactorGenerate: `${V1}/two-factor/generate-token`,
  twoFactorVerify: `${V1}/two-factor/verify-token`,

  /**
   * Aprovisiona el secreto TOTP del cliente. Es **uno por cliente**, de modo
   * que el mismo código sirve en todos los canales.
   */
  provisionSoftToken: `${V1}/two-factor/soft-token/provision`,

  // ─── Dispositivos de confianza ──────────────────────────────────────────
  /**
   * El `customerCode` **no viaja en el cuerpo**: el servidor lo obtiene del
   * token de sesión. Es la decisión correcta y hay que preservarla — la app
   * nunca debe poder indicar de qué cliente se trata.
   */
  devices: `${V1}/devices`,
  deviceRegister: `${V1}/devices/register`,
  deviceVerify: `${V1}/devices/verify`,
  deviceRegisterKey: `${V1}/devices/register-key`,
  deviceChallenge: `${V1}/devices/challenge`,
  deviceVerifySignature: `${V1}/devices/verify-signature`,

  // ─── Comprobantes fiscales (NCF) ────────────────────────────────────────
  ncfSummary: `${V1}/customer-billing-procedure/search-ncf-summary/retrieve`,

  /** El backend la escribe «retrive», sin la «e». No es un error de copia. */
  ncfDetail: `${V1}/customer-billing-procedure/search-ncf-detail/retrive`,
  ncfTransactionDetail: `${V1}/customer-billing-procedure/search-ncf-transaction-detail/retrieve`,
} as const;

export type EndpointName = keyof typeof Endpoints;

/** Ruta de revocación de un dispositivo concreto. */
export const deviceRevoke = (deviceId: string): string =>
  `${Endpoints.devices}/${encodeURIComponent(deviceId)}`;
