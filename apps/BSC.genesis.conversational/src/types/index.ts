// Tipos de mensajes del chat
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'transaction' | 'product' | 'error';
  metadata?: MessageMetadata;
}

export interface ChatOption {
  ref: string;
  label: string;
  product_type?: string;
  currency?: string;
}

export interface Clarification {
  target_action_sequence?: number;
  missing_requirements?: string[];
  suggested_question?: string;
  already_known?: string[];
}

export interface MessageMetadata {
  transactionId?: string;
  amount?: number;
  productType?: string;
  accountNumber?: string;
  status?: 'pending' | 'completed' | 'failed';
  quickReplyType?: 'account_selection' | 'contact_selection';
  conversationId?: string;
  intent?: string;
  intentCategory?: string;
  isTransactional?: boolean;
  executionAllowed?: boolean;
  requiresAuthentication?: boolean;
  requiresConfirmation?: boolean;
  handoffRequired?: boolean;
  riskLevel?: string;
  nextAction?: string;
  latencyMs?: number;
  options?: ChatOption[];
  clarifications?: Clarification[];
}

// Tipos genericos
export interface ApiResponse<T> {
  isSucceded: boolean;
  code: string;
  message: string;
  data: T | null;
}

// Tipos para Auth - Login con credenciales (email/contraseña)
export interface LoginPayload {
  email: string;
  password: string;
}

/** Datos del cliente autenticado, devueltos por el servicio de login */
export interface AuthUser {
  emailPrincipal: string;
  emails: Email[];
  telefonos: Telefono[];
  primerNombre: string;
  primerApellido: string;
  segundoNombre: string;
  segundoApellido: string;
  nombreCompleto: string;
  tipoCliente: string;
  fechaNacimiento: string;
  estadoPersona: string;
  sexo: string;
  isSecureDevice: boolean;
  isDeviceRegistered: boolean;
  relacionBanco: string;
  nacionalidad: string;
  /** Número de documento (cédula), decodificado del claim `document_number` del accessToken. Ver `AccessTokenClaims`. */
  numeroDocumento?: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_BLOCKED'
  | 'TIMEOUT'
  | 'SESSION_EXPIRED'
  | 'SESSION_STORAGE_ERROR'
  | 'PASSKEY_NOT_SUPPORTED'
  | 'PASSKEY_ALREADY_REGISTERED'
  | 'PASSKEY_INVALID_EMAIL'
  | 'PASSKEY_CHALLENGE_EXPIRED'
  | 'PASSKEY_USER_NOT_FOUND'
  | 'PASSKEY_NO_CREDENTIALS_REGISTERED'
  | 'PASSKEY_ASSERTION_FAILED'
  | 'UNKNOWN_ERROR';

/** Tokens de sesión entregados por el backend al iniciar sesión o refrescar el token */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  // Presentes en LOGIN y AUTHENTICATE_COMPLETE; opcionales porque este tipo también lo usa
  // `AuthService.setSessionTokens` para el cierre de sesión de registro (`RegistrationSessionTokens`),
  // cuyo contrato no los incluye.
  deviceId?: string;
  biometricLivenessRequired?: boolean;
}

// Envoltorio de respuesta "core" de autenticación: éxito/error se determina por `isSucceded`
// y `code`, no por el status HTTP (siempre 200)
export interface AuthApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: AuthTokens | null;
}

// Tipos para Auth - Registro de Passkey (FIDO2/WebAuthn), paso 1: opciones de creación de
// credencial. Reflejan 1:1 la `PublicKeyCredentialCreationOptions` que exige el estándar WebAuthn
// (ver https://www.w3.org/TR/webauthn-3/#dictionary-makecredentialoptions), para poder pasarse
// tal cual a `Passkey.create()` de `react-native-passkey`.
export interface PasskeyRegistrationOptionsRequest {
  email: string;
}

export interface PasskeyRelyingParty {
  id: string;
  name: string;
}

export interface PasskeyUserEntity {
  id: string;
  name: string;
  displayName: string;
}

export interface PasskeyCredentialParam {
  type: 'public-key';
  alg: number;
}

export interface PasskeyAuthenticatorSelection {
  residentKey: 'discouraged' | 'preferred' | 'required';
  requireResidentKey: boolean;
  userVerification: 'discouraged' | 'preferred' | 'required';
}

export interface PasskeyExcludeCredential {
  type: 'public-key';
  id: string;
  transports?: string[];
}

export interface PasskeyRegistrationOptionsData {
  rp: PasskeyRelyingParty;
  user: PasskeyUserEntity;
  challenge: string;
  pubKeyCredParams: PasskeyCredentialParam[];
  timeout: number;
  attestation: 'none' | 'indirect' | 'direct' | 'enterprise';
  attestationFormats: string[];
  authenticatorSelection: PasskeyAuthenticatorSelection;
  hints: string[];
  excludeCredentials: PasskeyExcludeCredential[];
}

// Envoltorio de respuesta "core" del registro de Passkey: éxito/error se determina por
// `isSucceded` y `code`, no por el status HTTP (siempre 200)
export interface PasskeyRegistrationOptionsApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: PasskeyRegistrationOptionsData | null;
}

// Tipos para Auth - Registro de Passkey (FIDO2/WebAuthn), paso 2: completar el registro subiendo
// la credencial de atestación (`PublicKeyCredential` de WebAuthn) generada por `Passkey.create()`
// a partir de las opciones del paso 1. Se transmite tal cual la entrega el autenticador, sin
// transformarla.
export interface PasskeyAttestationResponse {
  clientDataJSON: string;
  attestationObject: string;
  authenticatorData?: string;
  transports?: string[];
  publicKeyAlgorithm?: number;
  publicKey?: string;
}

export interface PasskeyAttestationResult {
  id: string;
  rawId: string;
  type?: string;
  authenticatorAttachment?: string;
  response: PasskeyAttestationResponse;
  clientExtensionResults?: Record<string, unknown>;
}

export interface PasskeyRegistrationCompleteRequest {
  email: string;
  attestationResponse: PasskeyAttestationResult;
}

export interface PasskeyRegistrationCompleteData {
  credentialId: string;
}

// Envoltorio de respuesta "core" de completar el registro de Passkey. A diferencia del resto de
// endpoints de auth, los errores de este endpoint SÍ vienen con status HTTP de error (400/404)
// además del `code` de negocio en el body (ver `AuthService.mapPasskeyErrorCode`).
export interface PasskeyRegistrationCompleteApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: PasskeyRegistrationCompleteData | null;
}

// Tipos para Auth - Inicio de sesión con Passkey (FIDO2/WebAuthn), paso 1: opciones de aserción.
// Reflejan 1:1 las `PublicKeyCredentialRequestOptions` de WebAuthn, para pasarse tal cual a
// `Passkey.get()`.
export interface PasskeyAuthenticationOptionsRequest {
  email: string;
}

export interface PasskeyAllowCredential {
  type: 'public-key';
  id: string;
}

export interface PasskeyAuthenticationOptionsData {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: PasskeyAllowCredential[];
  userVerification: 'discouraged' | 'preferred' | 'required';
}

// Envoltorio de respuesta "core" de las opciones de autenticación con Passkey. Igual que el
// registro, los errores (404 `USER_NOT_FOUND`, 400 `NO_PASSKEYS_REGISTERED`) llegan con
// `isSucceded: false` en el body, además de su status HTTP correspondiente.
export interface PasskeyAuthenticationOptionsApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: PasskeyAuthenticationOptionsData | null;
}

// Resultado de `Passkey.get()` (WebAuthn `PublicKeyCredential` de aserción). Se define acá para
// que quien orqueste el login con Passkey (ver `usePasskeyRegistration` y su futura contraparte
// de autenticación) no dependa de tipos internos de `react-native-passkey`.
export interface PasskeyAssertionResponse {
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  userHandle?: string;
  attestationObject?: string;
}

export interface PasskeyAssertionResult {
  id: string;
  rawId?: string;
  type?: string;
  authenticatorAttachment?: string;
  response: PasskeyAssertionResponse;
  clientExtensionResults?: Record<string, unknown>;
}

// Tipos para Auth - Inicio de sesión con Passkey (FIDO2/WebAuthn), paso 2: verificar la aserción
// (`PasskeyAssertionResult` de `Passkey.get()`) y obtener los tokens de sesión.
// POST /oauth/token (ver `AuthService.authenticateWithPasskey` y `FIDO_ENDPOINTS.AUTHENTICATE_COMPLETE`).
export interface PasskeyAuthenticationCompleteRequest {
  email: string;
  assertionResponse: PasskeyAssertionResult;
}

// Mismo envoltorio "core" que el resto de auth: éxito/error por `isSucceded`/`code`, y en éxito
// devuelve los mismos `AuthTokens` que login/refresh, ya que autenticarse con Passkey debe ser
// indistinguible —de cara al resto de la app— de cualquier otro inicio de sesión exitoso.
export interface PasskeyAuthenticationCompleteApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: AuthTokens | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: null;
}

/** Claims mínimos que se leen del payload del accessToken (JWT) para validar su expiración */
export interface AccessTokenClaims {
  exp: number;
  /** Nombre completo del cliente, usado para poblar `nombreCompleto`/`primerNombre` en el store de auth */
  full_name?: string;
  /** Identificador interno del cliente, usado como `clientId` del WebSocket del chat */
  internal_id?: string;
  /** Número de documento (cédula) del cliente autenticado. Solo presente cuando el login exige
   * prueba de vida de Autentikar (`biometricLivenessRequired`): es la fuente de `numeroDocumento`
   * para ese flujo, ya que el login (a diferencia del registro) no pasa por verificación de
   * documento. */
  document_number?: string;
  [claim: string]: unknown;
}

/** Información del dispositivo/entorno del cliente, enviada como contexto en peticiones al backend */
export interface DeviceInfo {
  os: string;
  osVersion: string;
  browser: string;
  browserMajor: string;
  browserVersion: string;
  deviceModel: string;
  deviceVendor: string;
  deviceType: string;
  cpuArchitecture: string;
  engineName: string;
  screenResolution: string;
  colorDepth: number;
  language: string;
  ip: string;
  deviceUuid: string;
}

// Tipos de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  isAuthenticated: boolean;
}

// Tipos de transacciones
export interface Transaction {
  id: string;
  type: 'transfer' | 'payment' | 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  fromAccount: string;
  toAccount?: string;
  description: string;
}

// Tipos de productos bancarios
export interface BankProduct {
  id: string;
  type: 'savings_account' | 'credit_card' | 'loan' | 'investment';
  name: string;
  description: string;
  status: 'active' | 'pending' | 'rejected';
  balance?: number;
  creditLimit?: number;
  interestRate?: number;
}

// Tipos para WebSocket
/**
 * Estado de la conexión del chat en tiempo real:
 * - `idle`: sin conexión pedida (antes de `connect` o después de `disconnect`).
 * - `connecting`: primer intento de un ciclo de conexión.
 * - `connected`: socket abierto.
 * - `reconnecting`: se perdió o no se logró la conexión y el servicio reintenta solo.
 * - `failed`: se agotaron los reintentos; hace falta que el usuario pida reintentar.
 */
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

/**
 * Origen de un error del WebSocket: `connection` (no se pudo abrir o se cayó el socket,
 * incluidos los reintentos), `send` (falló un envío; el mensaje queda en cola) o
 * `parse` (llegó un mensaje que no es JSON válido).
 */
export type WebSocketErrorKind = 'connection' | 'send' | 'parse';

export interface WebSocketMessage {
  type: 'message' | 'transaction' | 'query' | 'request' | 'response' | 'error';
  action?: string;
  clientId?: string;
  data: any;
  toolData?: {
    status?: string;
    options?: ChatOption[];
    clarifications?: Clarification[];
  };
  timestamp: number;
  requestId?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export interface ChatApiRequest {
  question: string;
  topK?: number;
  conversationId: string;
  clientId: string;
}

export interface ChatApiResponse {
  reply?: string;
  content?: string;
  message?: string;
  conversation_id?: string;
  intent?: string;
  intent_category?: string;
  is_transactional?: boolean;
  execution_allowed?: boolean;
  requires_authentication?: boolean;
  requires_confirmation?: boolean;
  handoff_required?: boolean;
  risk_level?: string;
  next_action?: string;
  latency_ms?: number;
}

// Tipos para navegación
export type RootStackParamList = {
  Inicio: undefined;
  Login: undefined;
  ChooseDocument: undefined;
  CustomerDataConfirmOtp: undefined;
  CompletedValidation: undefined;
  SelectUsername: { cedula: string };
  CreateUserOnboarding: { cedula: string };
  RegistrationComplete: undefined;
  ConfigurePasskey: { email: string };
  ConfigureAuthBiometric: undefined;
  RegisterSecureDevice: undefined;
  ProofOfLife: { numeroDocumento?: string; deviceId?: string; username?: string } | undefined;
  WelcomeOnboarding: undefined;
  IdentityVerified: undefined;
  FirmaDeDocumento: undefined;
  RegistroFinalizado: undefined;
  Chat: { prefillMessage?: string } | undefined;
  Transactions: undefined;
  Products: undefined;
  Profile: undefined;
  TransactionDetail: { transactionId: string };
  AccessRecovery: undefined;
  AccountIdentification: undefined;
  ResetPassword: undefined;
  FacialVerification: undefined;
  UsernameRecovery: undefined;
  ConfirmOtp: undefined;
  ResetPasswordFinished: undefined;
};

// Tipos para Onboarding - Verificación de documento del cliente
export interface ClientInformationRequest {
  numeroDocumento: string;
  categoria: string;
}

export interface VerifyClientDocumentRequest {
  clientInformationRequest: ClientInformationRequest;
}

// Tipos para Onboarding - Registro de usuario y contraseña
export interface RegisterUserRequest {
  email: string;
  internalId: string;
  documentNumber: string;
  documentType: string;
  password: string;
}

export interface RegisterUserResult {
  id: string;
  internalId: string;
  createdAt: string;
  deviceId: string;
}

// Envoltorio de respuesta "core" del registro: éxito/error se determina por `isSucceded` y
// `code`, no por el status HTTP (siempre 200)
export interface RegisterUserApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: RegisterUserResult | null;
}

export interface Telefono {
  codigoArea: string;
  codigoPersona: string;
  codigoTelefono: string | null;
  codigoTipoTelefono: string;
  codigoUbicacionTelefono: string;
  extension: string | null;
  numeroTelefono: string;
  telefonoPorDefecto: string;
  tipoTelefono: string;
  ubicacionTelefono: string;
}

export interface Email {
  codigoEmail: string;
  codigoPersona: string;
  codigoTipoEmail: string;
  email: string;
  emailPorDefecto: string;
  tipoEmail: string;
}

export interface ClientInformationResponse {
  aceptaPublicidadDigital: string;
  aceptaPublicidadTelefonica: string;
  actividad: string;
  apellidoCasada: string | null;
  codigoPersona: string;
  dobleNacionalidad: string;
  emails: Email[];
  emailSecundario: string | null;
  esResidente: string;
  estadoCivil: string;
  estadoPersona: string;
  fechaNacimiento: string;
  fechaVencimientoId: string;
  firmoContrato: string;
  generaDivisas: string;
  nacionalidad: string;
  nivelEstudios: string;
  nivelRiesgo: string;
  nombreCompleto: string;
  nombreOficial: string;
  numeroIdentificacion: string;
  personaDesactualizada: string;
  primerApellido: string;
  primerNombre: string;
  profesion: string;
  relacionBanco: string;
  scoring: number | null;
  sectorEconomico: string;
  segundoApellido: string;
  segundoNombre: string;
  sexo: string;
  telefonos: Telefono[];
  tipoCliente: string;
  tipoPersona: string;
  isSecureDevice?: boolean;
  isDeviceRegistered?: boolean;
  redirectToLogin: boolean;
}

// Envoltorio de respuesta "core" del cliente: éxito/error se determina por `isSucceded` y
// `code`, no por el status HTTP (siempre 200)
export interface VerifyClientDocumentApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: ClientInformationResponse | Record<string, never>;
}

// Términos y condiciones: contenido legal versionado que devuelve el backend
export interface TermsAndConditions {
  id: number;
  title: string;
  content: string;
  version: string;
}

// Mismo envoltorio "core" que `VerifyClientDocumentApiResponse`: éxito/error se determina por
// `isSucceded`/`code`, no por el status HTTP (siempre 200)
export interface TermsAndConditionsApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: TermsAndConditions | null;
}

// Aceptación de T&C: `documentNumberHash` es el número de documento verificado, hasheado con SHA256
export interface AcceptTermsAndConditionsRequest {
  termsDocumentId: number;
  documentNumberHash: string;
}

// Mismo envoltorio "core": el endpoint responde HTTP 200 con `data: null` en el caso exitoso
export interface AcceptTermsAndConditionsApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: null;
}

// Tipos para Autentikar (verificación de identidad: cédula + rostro)
export interface AutentikarStartRequest {
  numeroDocumento: string;
}

export interface AutentikarStartData {
  instanceId: string;
  link: string;
  expiresAt: string;
  qr: string;
  path: string;
  host: string;
}

// Mismo envoltorio "core" que `VerifyClientDocumentApiResponse`: éxito/error se determina por
// `isSucceded`/`code`, no por el status HTTP (siempre 200)
export interface AutentikarStartApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: AutentikarStartData | Record<string, never>;
}

export interface BscResponseHeaders {
  statusCode: number;
  reasonPhrase: string;
}

// Envoltorio estándar de respuestas del backend BSC
export interface BscResponse<T = ClientInformationResponse> {
  bscResponse: {
    headers: BscResponseHeaders;
    content?: {
      data?: T;
    };
  };
}

export type OnboardingErrorCode =
  | 'CLIENT_NOT_VALIDATED'
  | 'CLIENT_WITHOUT_DATA'
  | 'TIMEOUT'
  | 'MAX_ATTEMPTS_EXCEEDED'
  | 'SESSION_EXPIRED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'UNKNOWN_ERROR';

// Tipos para Onboarding - Registro de sesión del cliente durante el proceso de registro
export interface RegistrationSessionRequest {
  ip: string;
  channel: string;
}

export interface RegistrationSessionData {
  sessionId: string;
  sessionToken: string;
  /** Id del dispositivo asociado a la sesión; se reutiliza para registrar el dispositivo como seguro */
  deviceId: string;
  documentNumberHash: string;
  expiresAt: string;
}

// Envoltorio de respuesta "core": éxito/error se determina por `isSucceded` y `code`, no por el status HTTP
export interface RegistrationSessionApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: RegistrationSessionData | Record<string, never>;
}

// Tokens de acceso a la app entregados al finalizar la sesión de registro
export interface RegistrationSessionTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// Tipos para el registro de dispositivo seguro (estado de confianza del dispositivo).
// Endpoint agnóstico reutilizable por varios flujos: PATCH /device/{deviceId}/trust-status/update
export interface UpdateDeviceTrustStatusRequest {
  // 0: desconocido, 1: confiable, 2: bloqueado
  trustStatus: number;
}

export interface UpdateDeviceTrustStatusApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: null;
}

// Envoltorio de respuesta "core": éxito/error se determina por `isSucceded` y `code`, no por el status HTTP
export interface RegistrationSessionCompleteApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: RegistrationSessionTokens | Record<string, never>;
}

// Tipos para Onboarding - Vínculo del usuario recién registrado a la sesión de registro
export interface RegistrationSessionUserLinkRequest {
  userId: string;
}

export interface RegistrationSessionUserLinkResult {
  userId: string;
  email: string;
  internalId: string;
}

// Envoltorio de respuesta "core": éxito/error se determina por `isSucceded` y `code`, no por el status HTTP
export interface RegistrationSessionUserLinkApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: RegistrationSessionUserLinkResult | Record<string, never>;
}

// Tipos para Onboarding - Actualización de paso del flujo de registro
export type RegistrationStepName =
  | 'identity_terms_and_name_confirmation'
  | 'contact_data'
  | 'unique_agreement'
  | 'liveness_and_ocr'
  | 'password_creation'
  | 'passkey_enrollment'
  | 'biometric_activation'
  | 'welcome_completed';

export interface RegistrationStepRequest {
  stepName: RegistrationStepName;
  data: Record<string, unknown> | null;
}

export interface RegistrationStepResult {
  currentStep: number;
  lastActivityAt: string;
}

// Envoltorio de respuesta "core": éxito/error se determina por `isSucceded` y `code`, no por el status HTTP
export interface RegistrationStepApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: RegistrationStepResult | Record<string, never>;
}

// Tipos para Onboarding - Verificación OTP de contacto (correo / teléfono)
export type OtpChannel = 'email' | 'sms';

export interface SendOtpRequest {
  canal: OtpChannel;
  destino: string;
}

export interface RequestOTPResponse {
  enviado: boolean;
}

export interface OTPSendRequest {
  channel: string;
  identifier: string;
  document: string;
}

export interface OTPResendRequest {
  channel: string;
  identifier: string;
  document: string;
}

export interface OTPValidateRequest {
  channel: string;
  identifier: string;
  document: string;
  otp: string;
}

export interface RequestOTPPayload {
  otpSendRequest: OTPSendRequest;
}

export interface RequestResendOTPPayload {
  otpResendRequest: OTPResendRequest;
}

export interface ValidateOTPPayload {
  otpValidateRequest: OTPValidateRequest;
}

export interface ValidateOTPResponse {
  valido: boolean;
}

export type OtpErrorCode = 'MAX_ATTEMPTS_EXCEEDED' | 'TIMEOUT' | 'UNKNOWN_ERROR';

// Tipos para Onboarding - Firma de documentos (descarga del PDF a firmar)
export interface SignatureDocumentResponseData {
  /** Ruta local (file://) donde quedó cacheado el documento, lista para react-native-pdf */
  localUri: string;
  fileName: string;
}

/** Datos del cliente enviados al prefill del convenio único, para rellenar sus placeholders */
export interface SignatureDocumentCustomer {
  nombresYApellidos: string;
  nacionalidad: string;
  rncCedulaPasaporte: string;
  estadoCivil: string | null;
  profesion: string | null;
  domicilio: string | null;
  registroMercantil: string | null;
  representantes: string | null;
  telefonos: string | null;
  direccion: string | null;
  email: string | null;
  fecha: string | null;
}

export interface SignatureDocumentRequest {
  customer: SignatureDocumentCustomer;
}

/** Datos del prefill devueltos por el backend. Se omite `html` al tipar: es pesado (~5MB) y no
 * se usa, el documento se previsualiza a partir de `contentBase64`. */
export interface SignatureDocumentApiData {
  masterAgreementId: number;
  version: string;
  contentBase64: string;
  missingPlaceholders: string[];
}

// Envoltorio de respuesta "core": éxito/error se determina por `isSucceded`/`code`, no por el
// status HTTP (siempre 200)
export interface SignatureDocumentApiResponse {
  isSucceded: boolean;
  code: string;
  message: string;
  data: SignatureDocumentApiData | null;
}

export type DocumentErrorCode = 'TIMEOUT' | 'UNKNOWN_ERROR';

export type BottomTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Chat: { prefillMessage?: string } | undefined;
  Products: undefined;
};

// Tipos para Modales usando referencias
export interface ModalRef {
  open: () => void;
  close: () => void;
}

// Tipos para AccessRecovery - Actualización de paso del flujo de la recuperacion de accesos
export type RecoveryStepName =
  | 'account_validation'
  | 'username_recovery'
  | 'liveness_and_ocr'
  | 'change_password';

export interface RecoveryStepRequest {
  stepName: RecoveryStepName;
  data: Record<string, unknown> | null;
}

export interface RecoveryStepResult {
  currentStep: number;
  lastActivityAt: string;
}

export type RecoveryType = 'USERNAME' | 'PASSWORD' | 'BOTH';

export type AccessRecoveryErrorCode =
  | 'CLIENT_NOT_VALIDATED'
  | 'CLIENT_WITHOUT_DATA'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'BAD_REQUEST'
  | 'BAD_REQUEST'
  | 'MAX_ATTEMPTS_EXCEEDED'
  | 'UNKNOWN_ERROR';

// Cambiar contraseña
export interface ChangePasswordResponse {
  id: string;
  updatedAt: string;
  auditLogged: boolean;
  revokedTokens: number;
}

export interface ChangePasswordRequest {
  newPassword: string;
  channel: string;
}

// Obtener usuario by internal-id
export interface GetUserIdByInternalIdResponse {
  id: string;
  internalId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
