/**
 * Interruptores de mock por endpoint/llamada individual.
 * Cambia una entrada a `true` para que esa llamada puntual consuma su endpoint
 * real (ver `@constants/endpoints`), sin afectar el resto de llamadas del mismo servicio.
 */
export const MOCK_CONFIG = {
  AUTH: {
    LOGIN: true,
    LOGOUT: true,
    REFRESH: true,
  },
  FIDO: {
    REGISTER_OPTIONS: true,
    REGISTER_COMPLETE: true,
    AUTHENTICATE_OPTIONS: true,
    AUTHENTICATE_COMPLETE: true,
  },
  ACCESS_RECOVERY: {
    VERIFY_CLIENT_DOCUMENT: true,
    CHANGE_PASSWORD: true,
    GET_USER_ID_BY_INTERNAL_ID: true,
  },
  ONBOARDING: {
    VERIFY_CLIENT_DOCUMENT: true,
    TERMS_AND_CONDITIONS: true,
    ACCEPT_TERMS_AND_CONDITIONS: true,
    PERSONAL_DATA_POLICY: true,
    REGISTER_USER: true,
    CREATE_REGISTRATION_SESSION: true,
    UPDATE_REGISTRATION_STEP: true,
    COMPLETE_REGISTRATION_SESSION: true,
    LINK_USER_TO_REGISTRATION_SESSION: true,
  },
  DOCUMENT: {
    GET_SIGNATURE_DOCUMENT: true,
  },
  OTP: {
    REQUEST_OTP: true,
    REQUEST_RESEND_OTP: true,
    VALIDATE_OTP: true,
  },
  DOCUMENT_SIGNATURE_OTP: {
    REQUEST_OTP: true,
    REQUEST_RESEND_OTP: true,
    VALIDATE_OTP: true,
  },
  AUTENTIKAR: {
    // El SDK nativo de Autentikar SIEMPRE se invoca real (no tiene mock): esto solo simula
    // la respuesta del backend que genera el `link` de sesión. Cambiar a `true` cuando el
    // endpoint POST /presentation/autentikar/start esté disponible en el ambiente.
    START: true,
  },
  DEVICE: {
    UPDATE_TRUST_STATUS: true,
  },
} as const;
