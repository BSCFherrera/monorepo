import {useState} from 'react';
import {Passkey} from 'react-native-passkey';
import {AuthApiError, AuthService} from '@services/index';
import {isPasskeyUserCancelledError} from '@utils/passkey';
import type {AuthTokens, PasskeyAssertionResult} from '@/types/index';

export type PasskeyAuthenticationOutcome =
  | {status: 'success'; tokens: AuthTokens}
  | {status: 'cancelled'}
  | {status: 'error'; error: AuthApiError};

interface UsePasskeyAuthenticationResult {
  isAuthenticating: boolean;
  authenticateWithPasskey: (email: string) => Promise<PasskeyAuthenticationOutcome>;
}

/**
 * Orquesta el inicio de sesión con un Passkey ya registrado, en 3 pasos: pide las opciones de
 * aserción al backend (`AuthService.getPasskeyAuthenticationOptions`), dispara el prompt nativo
 * (`Passkey.get()`) para que el usuario confirme con biometría/PIN, y verifica esa aserción para
 * obtener los tokens de sesión (`AuthService.authenticateWithPasskey`). Misma estructura que
 * `usePasskeyRegistration`, pero para el flujo de login en vez del de alta.
 */
export const usePasskeyAuthentication = (): UsePasskeyAuthenticationResult => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateWithPasskey = async (email: string): Promise<PasskeyAuthenticationOutcome> => {
    setIsAuthenticating(true);

    try {
      const options = await AuthService.getPasskeyAuthenticationOptions(email);

      let assertion: PasskeyAssertionResult;

      try {
        // A diferencia de `Passkey.create()`, acá no hace falta castear: todos los campos de
        // `PasskeyAuthenticationOptionsData` (challenge/rpId/timeout/allowCredentials/
        // userVerification) calzan tal cual con `PasskeyGetRequest` de la librería.
        assertion = await Passkey.get(options);
      } catch (error) {
        if (isPasskeyUserCancelledError(error)) {
          return {status: 'cancelled'};
        }
        throw error;
      }

      const tokens = await AuthService.authenticateWithPasskey(email, assertion);
      return {status: 'success', tokens};
    } catch (error) {
      const mappedError =
        error instanceof AuthApiError
          ? error
          : new AuthApiError(
              'UNKNOWN_ERROR',
              'No se pudo iniciar sesión con el passkey de este dispositivo.',
            );
      return {status: 'error', error: mappedError};
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {isAuthenticating, authenticateWithPasskey};
};
