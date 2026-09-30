import {create} from 'zustand';
import {ClientInformationResponse, RecoveryStepResult, RecoveryType} from '../types';

interface AccessRecoveryState {
  /** Cliente verificado tras una consulta exitosa de documento */
  verifiedClient: ClientInformationResponse | null;
  /** Categoría del documento con el que se verificó al cliente (ver `DOCUMENT_CATEGORY`). No
   * viene en la respuesta de verificación, así que se guarda aparte para decisiones posteriores
   * del flujo que dependen de ella (ej. exigir prueba de vida de Autentikar solo para cédula). */
  documentCategory: string | null;
  /** Último paso del flujo de registro reportado como exitoso por el backend */
  recoveryStep: RecoveryStepResult | null;
  /** Teléfono con el que se validó exitosamente el OTP de celular */
  verifiedPhone: string | null;
  /** Correo con el que se validó exitosamente el OTP de email */
  verifiedEmail: string | null;
  /**  Tipo de recuperacion ('USERNAME', 'PASSWORD', 'BOTH') */
  recoveryType: RecoveryType | null;
  setVerifiedClient: (client: ClientInformationResponse) => void;
  setVerifiedPhone: (phone: string) => void;
  setVerifiedEmail: (email: string) => void;
  clearVerifiedClient: () => void;
  setDocumentCategory: (category: string) => void;
  setRecoveryStep: (step: RecoveryStepResult) => void;
  setRecoveryType: (type: RecoveryType) => void;
}

/**
 * Store global del flujo de Onboarding (Zustand)
 */
export const useAccesRecoveryStore = create<AccessRecoveryState>(set => ({
  verifiedClient: null,
  documentCategory: null,
  recoveryType: null,
  recoveryStep: null,
  verifiedPhone: null,
  verifiedEmail: null,
  setVerifiedClient: client => set({verifiedClient: client}),
  setDocumentCategory: category => set({documentCategory: category}),
  setVerifiedPhone: phone => set({verifiedPhone: phone}),
  setVerifiedEmail: email => set({verifiedEmail: email}),
  clearVerifiedClient: () =>
    set({
      verifiedClient: null,
      documentCategory: null,
      verifiedPhone: null,
      verifiedEmail: null,
      recoveryType: null,
    }),
  setRecoveryType: type => set({recoveryType: type}),
  setRecoveryStep: step => set({recoveryStep: step}),
}));
