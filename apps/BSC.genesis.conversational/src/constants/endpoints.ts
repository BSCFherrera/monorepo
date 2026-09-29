// Endpoints REST agrupados por módulo. Al activar el backend real solo se debe ajustar la ruta aquí.

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
} as const;

export const ONBOARDING_ENDPOINTS = {
  VERIFY_CLIENT_DOCUMENT: '/presentation/customer/retrieve',
  TERMS_AND_CONDITIONS: '/terms/terms-and-conditions',
  ACCEPT_TERMS_AND_CONDITIONS: '/terms/terms-and-conditions/accept',
  PERSONAL_DATA_POLICY: '/clientmanagement/v1/client/personal-data-policy',
  REGISTER_USER: '/auth/register',
  CREATE_REGISTRATION_SESSION: '/registration-sessions/by-document',
  UPDATE_REGISTRATION_STEP: '/registration-sessions/by-document',
  COMPLETE_REGISTRATION_SESSION: '/registration-sessions/by-document',
  LINK_USER_TO_REGISTRATION_SESSION: '/registration-sessions/by-document',
} as const;

// Endpoints de inicio de sesión sin contraseña vía Passkey (FIDO2/WebAuthn)
export const FIDO_ENDPOINTS = {
  REGISTER_OPTIONS: '/auth/fido2/register/options',
  REGISTER_COMPLETE: '/auth/fido2/register/complete',
  AUTHENTICATE_OPTIONS: '/auth/fido2/authenticate/options',
  // Verifica la aserción de `Passkey.get()` y emite los tokens de sesión. Confirmado por doc de
  // backend: éxito 200 `TOKEN_ISSUED` con el mismo `data` (AuthTokens) que /auth/login; errores
  // 400 `CHALLENGE_EXPIRED` (sin opciones pedidas para ese email en los últimos 5 min) y 401
  // `ASSERTION_FAILED` (email desconocido, credencial no encontrada/de otra cuenta, o firma
  // inválida) — ver `AuthService.mapPasskeyErrorCode`.
  AUTHENTICATE_COMPLETE: '/auth/oauth/token',
} as const;

export const OTP_ENDPOINTS = {
  SEND_OTP: '/presentation/otp/send',
  RESEND_OTP: '/presentation/otp/resend',
  VALIDATE_OTP: '/presentation/otp/validate',
} as const;

export const AUTENTIKAR_ENDPOINTS = {
  START: '/presentation/autentikar/start',
} as const;

// Endpoints de gestión del dispositivo. Agnósticos: se consumen desde varios flujos
// (registro, login, configuración). El `deviceId` se interpola en la ruta.
export const DEVICE_ENDPOINTS = {
  UPDATE_TRUST_STATUS: '/device',
} as const;

export const DOCUMENT_ENDPOINTS = {
  GET_SIGNATURE_DOCUMENT: '/terms/master-agreement/prefill',
  SEND_SIGNATURE_OTP: 'presentation/otp/send',
  VERIFY_SIGNATURE_OTP: '/presentation/otp/validate',
} as const;

export const ACCESS_RECOVERY_ENDPOINTS = {
  CHANGE_PASSWORD: (id: string) => `user-directory/${id}/password`,
  GET_USER_ID_BY_INTERNAL_ID: 'auth/users/by-internal-id',
};
