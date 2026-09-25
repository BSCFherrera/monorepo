import {
  DeviceBindingState,
  DeviceKeyErrorCode,
  authorized,
  failed,
  isAuthorized,
  outcomeForState,
  outcomeForSigningError,
  outcomeForMissingChallenge,
} from '../signingOutcome';

describe('resultado de la firma', () => {
  it('una autorización trae identificador y no ofrece código', () => {
    const resultado = authorized('auth-123');

    expect(isAuthorized(resultado)).toBe(true);
    expect(resultado.authorizationId).toBe('auth-123');
    expect(resultado.shouldFallbackToOtp).toBe(false);
  });

  it('un fallo no trae identificador', () => {
    expect(isAuthorized(failed('cualquier motivo'))).toBe(false);
  });

  it('un fallo no ofrece código salvo que se indique', () => {
    expect(failed('motivo').shouldFallbackToOtp).toBe(false);
    expect(failed('motivo', true).shouldFallbackToOtp).toBe(true);
  });
});

describe('estado del dispositivo antes de firmar', () => {
  it('con el dispositivo listo no hay nada que impedir', () => {
    expect(outcomeForState(DeviceBindingState.Ready)).toBeNull();
  });

  it.each([
    DeviceBindingState.Unsupported,
    DeviceBindingState.NotEnrolled,
    DeviceBindingState.KeyLost,
  ])(
    'sin dispositivo capaz de firmar (%s) el código es la vía legítima',
    estado => {
      const resultado = outcomeForState(estado);

      expect(resultado).not.toBeNull();
      expect(isAuthorized(resultado!)).toBe(false);
      expect(resultado!.shouldFallbackToOtp).toBe(true);
      expect(resultado!.failureMessage).toBeTruthy();
    },
  );

  it('cada estado explica algo distinto al cliente', () => {
    const mensajes = [
      DeviceBindingState.Unsupported,
      DeviceBindingState.NotEnrolled,
      DeviceBindingState.KeyLost,
    ].map(estado => outcomeForState(estado)!.failureMessage);

    expect(new Set(mensajes).size).toBe(3);
  });
});

describe('fallos durante la firma', () => {
  it('si el cliente cancela la biometría, NO se le ofrece el código', () => {
    // Es la regla de seguridad más importante de este archivo. Ofrecer el
    // código aquí entrenaría al cliente a cancelar la biometría para llegar a
    // un camino más débil, y entonces la biometría dejaría de proteger nada.
    const resultado = outcomeForSigningError(
      DeviceKeyErrorCode.UserNotAuthenticated,
    );

    expect(resultado.shouldFallbackToOtp).toBe(false);
    expect(isAuthorized(resultado)).toBe(false);
  });

  it('si la biometría del teléfono cambió, se pide re-enrolar y sí hay código', () => {
    const resultado = outcomeForSigningError(DeviceKeyErrorCode.KeyInvalidated);

    expect(resultado.shouldFallbackToOtp).toBe(true);
    expect(resultado.failureMessage).toMatch(/registrar el dispositivo/i);
  });

  it('sin llave registrada se pide registrar el dispositivo', () => {
    const resultado = outcomeForSigningError(DeviceKeyErrorCode.NoKey);

    expect(resultado.shouldFallbackToOtp).toBe(true);
    expect(resultado.failureMessage).toMatch(/registrarlo/i);
  });

  it.each([
    DeviceKeyErrorCode.SignFailed,
    DeviceKeyErrorCode.InvalidArgument,
    DeviceKeyErrorCode.Unknown,
    'un_codigo_que_todavia_no_existe',
  ])('un fallo del dispositivo (%s) sí cae al código', codigo => {
    // Un código desconocido debe comportarse como un fallo técnico, no romper
    // el flujo: el módulo nativo puede ganar códigos nuevos y esta capa no
    // tiene por qué enterarse para seguir funcionando.
    expect(outcomeForSigningError(codigo).shouldFallbackToOtp).toBe(true);
  });

  it('usa el mensaje del módulo nativo cuando lo hay', () => {
    expect(
      outcomeForSigningError(
        DeviceKeyErrorCode.SignFailed,
        'Detalle del sistema',
      ).failureMessage,
    ).toBe('Detalle del sistema');
  });

  it('cae a un mensaje propio cuando el nativo no dice nada', () => {
    for (const mensajeNativo of [undefined, '']) {
      const resultado = outcomeForSigningError(
        DeviceKeyErrorCode.SignFailed,
        mensajeNativo,
      );
      expect(resultado.failureMessage).toBe(
        'No pudimos firmar la operación en este dispositivo.',
      );
    }
  });

  it('ningún fallo devuelve jamás una autorización', () => {
    const codigos = Object.values(DeviceKeyErrorCode);
    for (const codigo of codigos) {
      expect(outcomeForSigningError(codigo).authorizationId).toBeNull();
    }
  });
});

describe('sin reto del servidor', () => {
  it('es un problema del canal, así que se ofrece el código', () => {
    const resultado = outcomeForMissingChallenge();

    expect(isAuthorized(resultado)).toBe(false);
    expect(resultado.shouldFallbackToOtp).toBe(true);
  });
});
