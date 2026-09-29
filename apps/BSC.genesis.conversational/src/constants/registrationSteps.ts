import {RegistrationStepName} from '@/types/index';

/**
 * Biblioteca de pasos disponibles del flujo de registro. Se usan como `stepName` en el
 * body del endpoint de actualización de paso (ver `RegistrationStepService`).
 */
export const REGISTRATION_STEPS = {
  IDENTITY_TERMS_AND_NAME_CONFIRMATION: 'identity_terms_and_name_confirmation',
  CONTACT_DATA: 'contact_data',
  UNIQUE_AGREEMENT: 'unique_agreement',
  LIVENESS_AND_OCR: 'liveness_and_ocr',
  PASSWORD_CREATION: 'password_creation',
  PASSKEY_ENROLLMENT: 'passkey_enrollment',
  BIOMETRIC_ACTIVATION: 'biometric_activation',
  WELCOME_COMPLETED: 'welcome_completed',
} as const satisfies Record<string, RegistrationStepName>;
