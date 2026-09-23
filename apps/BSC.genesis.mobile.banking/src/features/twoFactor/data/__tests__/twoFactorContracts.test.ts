import {
  esCorreo,
  esSms,
  esTokenDeApp,
  metodoPreferido,
  parseEnvio,
  parseMetodos,
  parseVerificacion,
} from '../twoFactorContracts';

const METODOS = {
  Success: true,
  Message: 'Métodos obtenidos',
  Data: [
    {
      Id: 'm-sms',
      MethodType: 'SMS',
      MethodName: 'Mensaje de texto',
      IsEnabled: true,
      IsPrimary: false,
      MaskedContact: '***-***-0274',
    },
    {
      Id: 'm-app',
      MethodType: 'AppToken',
      MethodName: 'Token BSC',
      IsEnabled: true,
      IsPrimary: true,
    },
    {
      Id: 'm-mail',
      MethodType: 'Email',
      MethodName: 'Correo',
      IsEnabled: false,
      IsPrimary: false,
    },
  ],
};

describe('parseMetodos', () => {
  it('lee los métodos y deja fuera los apagados', () => {
    // Ofrecer un canal apagado manda al cliente a esperar un código que nunca
    // va a llegar.
    const metodos = parseMetodos(METODOS);

    expect(metodos).toHaveLength(2);
    expect(metodos.map(m => m.id)).toEqual(['m-sms', 'm-app']);
  });

  it('sin el campo de habilitado se asume habilitado', () => {
    // El backend solo lo manda cuando está apagado; tratarlo al revés dejaría
    // al cliente sin ningún método y sin poder autorizar nada.
    const metodos = parseMetodos({
      Success: true,
      Data: [{ Id: 'm', MethodType: 'SMS', MethodName: 'SMS' }],
    });

    expect(metodos).toHaveLength(1);
  });

  it('un método sin identificador se descarta', () => {
    expect(
      parseMetodos({ Success: true, Data: [{ MethodType: 'SMS' }] }),
    ).toEqual([]);
  });

  it('reconoce el tipo por palabra y por número', () => {
    const [sms, app] = parseMetodos(METODOS);

    expect(esSms(sms!)).toBe(true);
    expect(esTokenDeApp(app!)).toBe(true);
    expect(esCorreo(app!)).toBe(false);

    const viejo = parseMetodos({
      Success: true,
      Data: [{ Id: 'v', MethodType: '2', MethodName: 'Correo' }],
    });
    expect(esCorreo(viejo[0]!)).toBe(true);
  });
});

describe('metodoPreferido', () => {
  it('elige el principal', () => {
    expect(metodoPreferido(parseMetodos(METODOS))?.id).toBe('m-app');
  });

  it('sin principal elige el primero', () => {
    const metodos = parseMetodos({
      Success: true,
      Data: [
        { Id: 'a', MethodType: 'SMS', MethodName: 'SMS' },
        { Id: 'b', MethodType: 'Email', MethodName: 'Correo' },
      ],
    });

    expect(metodoPreferido(metodos)?.id).toBe('a');
  });

  it('sin métodos devuelve nulo, no revienta', () => {
    expect(metodoPreferido([])).toBeNull();
  });
});

describe('parseEnvio', () => {
  it('lee el envío y con qué contacto se hizo', () => {
    const envio = parseEnvio({
      Success: true,
      Data: {
        Success: true,
        Message: 'Código enviado por SMS.',
        MethodType: 'SMS',
        MaskedContact: '***-***-0274',
      },
    });

    expect(envio.enviado).toBe(true);
    expect(envio.contactoEnmascarado).toBe('***-***-0274');
  });

  it('el sobre basta cuando no hay contenido', () => {
    expect(parseEnvio({ Success: true }).enviado).toBe(true);
  });

  it('un envío fallido conserva el motivo del backend', () => {
    const envio = parseEnvio({
      Success: false,
      Message: 'Espera 60 segundos antes de pedir otro código.',
    });

    expect(envio.enviado).toBe(false);
    expect(envio.mensaje).toBe(
      'Espera 60 segundos antes de pedir otro código.',
    );
  });
});

describe('parseVerificacion', () => {
  it('lee el código válido y su autorización', () => {
    const resultado = parseVerificacion({
      Success: true,
      Data: {
        IsValid: true,
        Message: 'Código verificado.',
        AuthorizationId: 'auth-9f2c',
      },
    });

    expect(resultado.valido).toBe(true);
    expect(resultado.autorizacionId).toBe('auth-9f2c');
  });

  it('sin operación concreta no hay autorización, y está bien', () => {
    // El alta de un beneficiario no mueve dinero: el backend no emite ninguna.
    const resultado = parseVerificacion({
      Success: true,
      Data: { IsValid: true, Message: 'Código verificado.' },
    });

    expect(resultado.valido).toBe(true);
    expect(resultado.autorizacionId).toBeUndefined();
  });

  it('un código rechazado conserva los intentos que quedan', () => {
    const resultado = parseVerificacion({
      Success: false,
      Data: {
        IsValid: false,
        Message: 'Código incorrecto. Te quedan 2 intentos.',
      },
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.mensaje).toBe('Código incorrecto. Te quedan 2 intentos.');
  });

  it('un sobre con éxito y sin contenido se toma por válido', () => {
    expect(parseVerificacion({ Success: true }).valido).toBe(true);
  });

  it('un sobre sin éxito no es válido aunque no diga nada', () => {
    expect(parseVerificacion({ Success: false }).valido).toBe(false);
    expect(parseVerificacion({}).valido).toBe(false);
  });
});
