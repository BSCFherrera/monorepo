import {useState} from 'react';
import {Passkey, type PasskeyCreateRequest} from 'react-native-passkey';
import {AuthApiError, AuthService} from '@services/index';
import {isPasskeyUserCancelledError} from '@utils/passkey';
import type {PasskeyAttestationResult} from '@/types/index';

export type PasskeyRegistrationOutcome =
  | {status: 'success'; credentialId: string}
  | {status: 'cancelled'}
  | {status: 'error'; error: AuthApiError};

interface UsePasskeyRegistrationResult {
  isRegistering: boolean;
  registerPasskey: (email: string) => Promise<PasskeyRegistrationOutcome>;
}

/**
 * Orquesta el registro completo de un Passkey (FIDO2/WebAuthn) en 3 pasos: pide las opciones de
 * creación al backend (`AuthService.getPasskeyRegistrationOptions`), dispara el prompt nativo
 * (`Passkey.create()`) para que el usuario confirme con biometría/PIN, y sube la credencial
 * resultante para completar el registro (`AuthService.completePasskeyRegistration`). Centraliza
 * este flujo para que cualquier pantalla lo dispare con una sola llamada, sin duplicar el manejo
 * de cancelación del usuario ni el mapeo de errores.
 */
export const usePasskeyRegistration = (): UsePasskeyRegistrationResult => {
  const [isRegistering, setIsRegistering] = useState(false);

  const registerPasskey = async (email: string): Promise<PasskeyRegistrationOutcome> => {
    setIsRegistering(true);

    try {
      const options = await AuthService.getPasskeyRegistrationOptions(email);
      console.log('[usePasskeyRegistration] opciones recibidas del backend:', options);

      let attestation: PasskeyAttestationResult;

      try {
        // `excludeCredentials[].transports` viaja como `string[]` en el DTO del backend, pero
        // `react-native-passkey` lo tipa contra su propio enum `AuthenticatorTransport`; el cast
        // es seguro porque los valores reales (usb/nfc/ble/...) son un subconjunto válido de ese
        // enum, y evita reescribir el tipo central del DTO solo para calzar con la librería nativa.
        console.log(
          '[usePasskeyRegistration] llamando a Passkey.create() con rp.id:',
          options.rp.id,
        );
        attestation = await Passkey.create(options as unknown as PasskeyCreateRequest);
        console.log('[usePasskeyRegistration] Passkey.create() OK:', attestation);
      } catch (error) {
        // Acá cae cualquier error del Credential Manager nativo de Android/iOS: cancelación,
        // "Make sure your devices are nearby...", falta de Play Services, etc. Se loguea completo
        // (raw, sin mapear) porque `AuthApiError` más abajo solo guarda un mensaje genérico y
        // pierde el detalle nativo real.
        console.log('[usePasskeyRegistration] Passkey.create() FALLÓ - error crudo:', error);
        console.log(
          '[usePasskeyRegistration] Passkey.create() FALLÓ - error serializado:',
          JSON.stringify(error, Object.getOwnPropertyNames(error ?? {})),
        );
        if (isPasskeyUserCancelledError(error)) {
          return {status: 'cancelled'};
        }
        throw error;
      }

      const {credentialId} = await AuthService.completePasskeyRegistration(email, attestation);
      return {status: 'success', credentialId};
    } catch (error) {
      console.log('[usePasskeyRegistration] registerPasskey FALLÓ - error crudo:', error);
      const mappedError =
        error instanceof AuthApiError
          ? error
          : new AuthApiError(
              'UNKNOWN_ERROR',
              'No se pudo registrar el passkey en este dispositivo.',
            );
      return {status: 'error', error: mappedError};
    } finally {
      setIsRegistering(false);
    }
  };

  return {isRegistering, registerPasskey};
};
