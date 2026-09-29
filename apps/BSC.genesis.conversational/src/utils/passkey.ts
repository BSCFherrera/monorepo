/**
 * Indica si un error lanzado por `react-native-passkey` (`Passkey.create()`/`Passkey.get()`)
 * corresponde a una cancelación del usuario (shape mínima de `PasskeyError` de la librería:
 * `{error: string, message: string}`). Compartido entre `usePasskeyRegistration` y
 * `usePasskeyAuthentication` para no duplicar el chequeo.
 */
export const isPasskeyUserCancelledError = (error: unknown): boolean =>
  !!error && typeof error === 'object' && (error as {error?: string}).error === 'UserCancelled';
