import {create} from 'zustand';
import {
  ClientInformationResponse,
  RegistrationSessionData,
  RegistrationStepResult,
} from '@/types/index';

/** Flujo de acceso desde el que se origina la navegación */
export enum AccessOrigin {
  LOGIN = 'login',
  REGISTER = 'register',
  CONFIGURATION = 'configuration',
}

interface OnboardingState {
  /** Cliente verificado tras una consulta exitosa de documento */
  verifiedClient: ClientInformationResponse | null;
  /** Categoría del documento con el que se verificó al cliente (ver `DOCUMENT_CATEGORY`). No
   * viene en la respuesta de verificación, así que se guarda aparte para decisiones posteriores
   * del flujo que dependen de ella (ej. exigir prueba de vida de Autentikar solo para cédula). */
  documentCategory: string | null;
  /** Teléfono con el que se validó exitosamente el OTP de celular */
  verifiedPhone: string | null;
  /** Correo con el que se validó exitosamente el OTP de email */
  verifiedEmail: string | null;
  /** Origen del acceso (login o register) para futuras validaciones */
  accessOrigin: AccessOrigin | null;
  /** Sesión de registro creada al confirmar el cliente verificado (sessionId/sessionToken) */
  registrationSession: RegistrationSessionData | null;
  /** Datos del dispositivo devueltos al crear la sesión de registro (`deviceId` y
   * `documentNumberHash`). Se guardan aparte para reutilizarlos en endpoints posteriores
   * (ej. registro de dispositivo seguro / trust-status) desde cualquier flujo. */
  registrationDevice: {deviceId: string; documentNumberHash: string} | null;
  /** Último paso del flujo de registro reportado como exitoso por el backend */
  registrationStep: RegistrationStepResult | null;
  setVerifiedClient: (client: ClientInformationResponse) => void;
  setDocumentCategory: (category: string) => void;
  setVerifiedPhone: (phone: string) => void;
  setVerifiedEmail: (email: string) => void;
  clearVerifiedClient: () => void;
  setAccessOrigin: (origin: AccessOrigin) => void;
  clearAccessOrigin: () => void;
  setRegistrationSession: (session: RegistrationSessionData) => void;
  clearRegistrationSession: () => void;
  setRegistrationDevice: (device: {deviceId: string; documentNumberHash: string}) => void;
  setRegistrationStep: (step: RegistrationStepResult) => void;
}

/**
 * Store global del flujo de Onboarding (Zustand)
 */
export const useOnboardingStore = create<OnboardingState>(set => ({
  verifiedClient: null,
  documentCategory: null,
  verifiedPhone: null,
  verifiedEmail: null,
  accessOrigin: null,
  registrationSession: null,
  registrationDevice: null,
  registrationStep: null,
  setVerifiedClient: client => set({verifiedClient: client}),
  setDocumentCategory: category => set({documentCategory: category}),
  setVerifiedPhone: phone => set({verifiedPhone: phone}),
  setVerifiedEmail: email => set({verifiedEmail: email}),
  clearVerifiedClient: () =>
    set({verifiedClient: null, documentCategory: null, verifiedPhone: null, verifiedEmail: null}),
  setAccessOrigin: origin => set({accessOrigin: origin}),
  clearAccessOrigin: () => set({accessOrigin: null}),
  setRegistrationSession: session => set({registrationSession: session}),
  clearRegistrationSession: () => set({registrationSession: null, registrationDevice: null}),
  setRegistrationDevice: device => set({registrationDevice: device}),
  setRegistrationStep: step => set({registrationStep: step}),
}));
