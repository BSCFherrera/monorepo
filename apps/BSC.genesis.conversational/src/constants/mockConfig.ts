/**
 * Interruptores de mock por endpoint/llamada individual.
 * Cambia una entrada a `false` para que esa llamada puntual consuma su endpoint
 * real (ver `@constants/endpoints`), sin afectar el resto de llamadas del mismo servicio.
 */
export const MOCK_CONFIG = {
  AUTH: {
    LOGIN: false,
    LOGOUT: false,
    REFRESH: false,
  },
  FIDO: {
    REGISTER_OPTIONS: false,
    REGISTER_COMPLETE: false,
    AUTHENTICATE_OPTIONS: false,
    AUTHENTICATE_COMPLETE: false,
  },
  ACCESS_RECOVERY: {
    VERIFY_CLIENT_DOCUMENT: false,
    CHANGE_PASSWORD: false,
    GET_USER_ID_BY_INTERNAL_ID: false,
  },
  ONBOARDING: {
    VERIFY_CLIENT_DOCUMENT: false,
    TERMS_AND_CONDITIONS: false,
    ACCEPT_TERMS_AND_CONDITIONS: false,
    PERSONAL_DATA_POLICY: true,
    REGISTER_USER: false,
    CREATE_REGISTRATION_SESSION: false,
    UPDATE_REGISTRATION_STEP: false,
    COMPLETE_REGISTRATION_SESSION: false,
    LINK_USER_TO_REGISTRATION_SESSION: false,
  },
  DOCUMENT: {
    GET_SIGNATURE_DOCUMENT: true,
  },
  OTP: {
    REQUEST_OTP: false,
    REQUEST_RESEND_OTP: false,
    VALIDATE_OTP: false,
  },
  DOCUMENT_SIGNATURE_OTP: {
    REQUEST_OTP: false,
    REQUEST_RESEND_OTP: false,
    VALIDATE_OTP: false,
  },
  AUTENTIKAR: {
    // El SDK nativo de Autentikar SIEMPRE se invoca real (no tiene mock): esto solo simula
    // la respuesta del backend que genera el `link` de sesión. Cambiar a `true` cuando el
    // endpoint POST /presentation/autentikar/start esté disponible en el ambiente.
    START: false,
  },
  DEVICE: {
    UPDATE_TRUST_STATUS: false,
  },
} as const;
