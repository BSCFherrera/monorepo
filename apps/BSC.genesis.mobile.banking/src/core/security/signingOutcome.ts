/**
 * Qué hacer cuando la firma de una operación no sale.
 *
 * Esta es la pieza donde una decisión aparentemente menor —¿le ofrecemos el
 * código por SMS?— cambia la postura de seguridad del producto. Está separada
 * del puente nativo a propósito: así se puede probar por completo sin un
 * teléfono, que es justo lo que el módulo nativo no permite.
 *
 * Portado de `SigningOutcome` y `DeviceBindingService.signOperation` en
 * `lib/features/device_binding/domain/device_binding_service.dart`.
 */

/** Estado del dispositivo respecto a la firma. */
export const DeviceBindingState = {
  /** El teléfono no puede sostener una llave con verificación de usuario. */
  Unsupported: 'unsupported',

  /** No está enrolado. */
  NotEnrolled: 'notEnrolled',

  /** Enrolado y con llave: puede firmar. */
  Ready: 'ready',

  /** Enrolado, pero la llave se perdió o quedó invalidada. Hay que re-enrolar. */
  KeyLost: 'keyLost',
} as const;

export type DeviceBindingState =
  (typeof DeviceBindingState)[keyof typeof DeviceBindingState];

/**
 * Códigos que devuelve el módulo nativo. Son contrato con Kotlin y con Swift:
 * cambiarlos aquí sin cambiarlos allá rompe estas decisiones en silencio.
 */
export const DeviceKeyErrorCode = {
  UserNotAuthenticated: 'user_not_authenticated',
  KeyInvalidated: 'key_invalidated',
  NoKey: 'no_key',
  InvalidArgument: 'invalid_argument',
  SignFailed: 'sign_failed',
  Unknown: 'device_key_error',
} as const;

export interface SigningOutcome {
  /** Autorización a enviar al ejecutar la transacción. */
  authorizationId: string | null;

  /** Motivo cuando no se pudo firmar, para mostrarlo al cliente. */
  failureMessage: string | null;

  /**
   * Si el flujo debe caer al código por SMS o correo.
   *
   * **No todo fallo lo justifica.** Ver `outcomeForSigningError`.
   */
  shouldFallbackToOtp: boolean;
}

export function authorized(authorizationId: string): SigningOutcome {
  return { authorizationId, failureMessage: null, shouldFallbackToOtp: false };
}

export function failed(
  failureMessage: string,
  shouldFallbackToOtp = false,
): SigningOutcome {
  return { authorizationId: null, failureMessage, shouldFallbackToOtp };
}

export function isAuthorized(outcome: SigningOutcome): boolean {
  return outcome.authorizationId !== null;
}

/**
 * Por qué no se puede ni intentar firmar, según el estado del dispositivo.
 *
 * En los tres casos se ofrece el código: **sin un dispositivo capaz de firmar,
 * el código es la vía legítima**, no un rodeo.
 */
export function outcomeForState(
  state: DeviceBindingState,
): SigningOutcome | null {
  switch (state) {
    case DeviceBindingState.Ready:
      return null;

    case DeviceBindingState.Unsupported:
      return failed(
        'Este teléfono no soporta la firma en el dispositivo.',
        true,
      );

    case DeviceBindingState.NotEnrolled:
      return failed(
        'Registra este dispositivo para autorizar con tu rostro o huella.',
        true,
      );

    case DeviceBindingState.KeyLost:
      return failed(
        'La llave de este dispositivo dejó de ser válida. Vuelve a registrarlo.',
        true,
      );
  }
}

/**
 * Qué hacer ante un fallo del módulo nativo durante la firma.
 *
 * La regla que importa está en el primer caso: **si el cliente canceló la
 * verificación biométrica, NO se le ofrece el código.** Ofrecérselo lo
 * entrenaría a esquivar la verificación que acaba de rechazar, y entonces la
 * biometría dejaría de proteger nada — bastaría con cancelarla para llegar a un
 * camino más débil.
 *
 * El resto de los fallos sí caen al código, porque son problemas del
 * dispositivo y no decisiones del cliente.
 */
export function outcomeForSigningError(
  code: string,
  nativeMessage?: string,
): SigningOutcome {
  switch (code) {
    case DeviceKeyErrorCode.UserNotAuthenticated:
      return failed(
        'Verificación cancelada. No autorizamos la operación.',
        false,
      );

    case DeviceKeyErrorCode.KeyInvalidated:
      // La biometría del teléfono cambió y el sistema invalidó la llave. Es la
      // defensa funcionando, no una falla: hay que re-enrolar.
      return failed(
        'La biometría de este teléfono cambió, así que la llave dejó de ser ' +
          'válida. Vuelve a registrar el dispositivo.',
        true,
      );

    case DeviceKeyErrorCode.NoKey:
      return failed(
        'Este dispositivo no tiene una llave registrada. Vuelve a registrarlo.',
        true,
      );

    default:
      return failed(
        nativeMessage && nativeMessage.length > 0
          ? nativeMessage
          : 'No pudimos firmar la operación en este dispositivo.',
        true,
      );
  }
}

/**
 * Cuando el servidor no entrega un reto.
 *
 * Sin reto no hay nada que firmar, y el problema es del canal, no del cliente.
 */
export function outcomeForMissingChallenge(): SigningOutcome {
  return failed(
    'No pudimos preparar la autorización. Intenta con tu código.',
    true,
  );
}
