import {
  codigoDeBeneficiario,
  codigoDeDocumentoDelCliente,
  esEnDolares,
  parseComisiones,
  parseCotizacion,
  parseCuentaValidada,
  parseResultadoDeTransferencia,
  quedaPendienteDeAprobacion,
  subtipoDeTransaccion,
  TipoDeTransferencia,
  tipoParaBeneficiario,
  usaBeneficiario,
  usaValidacionDeCuenta,
} from '../transferContracts';

describe('tipos de transferencia', () => {
  it('sabe cuáles eligen destino de la lista de beneficiarios', () => {
    expect(usaBeneficiario(TipoDeTransferencia.Terceros)).toBe(true);
    expect(usaBeneficiario(TipoDeTransferencia.OtrosBancos)).toBe(true);
    expect(usaBeneficiario(TipoDeTransferencia.Internacional)).toBe(true);
    expect(usaBeneficiario(TipoDeTransferencia.CuentasPropias)).toBe(false);
    expect(usaBeneficiario(TipoDeTransferencia.Expresa)).toBe(false);
  });

  it('y cuáles resuelven el destino validando una cuenta', () => {
    expect(usaValidacionDeCuenta(TipoDeTransferencia.CuentasPropias)).toBe(
      true,
    );
    expect(usaValidacionDeCuenta(TipoDeTransferencia.Expresa)).toBe(true);
    expect(usaValidacionDeCuenta(TipoDeTransferencia.Terceros)).toBe(false);
  });

  it('traduce entre tipo de flujo y código de beneficiario en los dos sentidos', () => {
    // Llegando desde la lista de beneficiarios el destino ya está decidido, y
    // volver a preguntar el tipo solo sería una ocasión de equivocarse.
    expect(codigoDeBeneficiario(TipoDeTransferencia.Terceros)).toBe(1);
    expect(codigoDeBeneficiario(TipoDeTransferencia.OtrosBancos)).toBe(2);
    expect(codigoDeBeneficiario(TipoDeTransferencia.Internacional)).toBe(3);
    expect(codigoDeBeneficiario(TipoDeTransferencia.Expresa)).toBeNull();

    expect(tipoParaBeneficiario(1)).toBe(TipoDeTransferencia.Terceros);
    expect(tipoParaBeneficiario(2)).toBe(TipoDeTransferencia.OtrosBancos);
    expect(tipoParaBeneficiario(3)).toBe(TipoDeTransferencia.Internacional);
    expect(tipoParaBeneficiario(9)).toBeNull();
  });

  it('el subtipo solo existe en los flujos sin beneficiario', () => {
    expect(subtipoDeTransaccion(TipoDeTransferencia.CuentasPropias)).toBe(1);
    expect(subtipoDeTransaccion(TipoDeTransferencia.Expresa)).toBe(2);
    expect(subtipoDeTransaccion(TipoDeTransferencia.Terceros)).toBeNull();
  });
});

describe('parseCuentaValidada', () => {
  const RESPUESTA = {
    IsSuccess: true,
    Value: {
      Client: [
        {
          IdentificationType: 'NationalId',
          IdentificationNumber: '00100000003',
          CustomerFullName: 'CARMEN ALTAGRACIA SOSA',
          FirstName: 'CARMEN',
          LastName: 'SOSA',
          Email: 'carmen@example.com',
        },
      ],
      Products: [{ Number: '11042010013953', Type: 'CA', Currency: '214' }],
    },
  };

  it('lee el titular y el producto del sobre Result', () => {
    const { cliente, producto } = parseCuentaValidada(RESPUESTA);

    expect(cliente?.nombreCompleto).toBe('CARMEN ALTAGRACIA SOSA');
    expect(producto?.numero).toBe('11042010013953');
    expect(producto?.moneda).toBe('214');
  });

  it('una cuenta desconocida devuelve los dos en nulo', () => {
    expect(parseCuentaValidada({ Value: {} })).toEqual({
      cliente: null,
      producto: null,
    });
    expect(parseCuentaValidada(null).producto).toBeNull();
  });

  it('sin moneda el producto se asume en pesos', () => {
    const { producto } = parseCuentaValidada({
      Value: { Products: [{ Number: '1104', Type: 'CA' }] },
    });

    expect(producto?.moneda).toBe('214');
  });

  it('el documento se traduce con el mismo traductor que beneficiarios', () => {
    // Tener dos produjo el defecto de la oleada 4, donde el módulo de
    // beneficiarios mapeaba RNC y pasaporte al revés que el backend.
    const { cliente } = parseCuentaValidada({
      Value: {
        Client: [{ IdentificationType: 'RNC', IdentificationNumber: '1' }],
      },
    });

    expect(codigoDeDocumentoDelCliente(cliente!)).toBe(2);
  });

  it('un documento que no se reconoce cae a cédula, no a cero', () => {
    const { cliente } = parseCuentaValidada({
      Value: { Client: [{ IdentificationType: 'QUIENSABE' }] },
    });

    expect(codigoDeDocumentoDelCliente(cliente!)).toBe(1);
  });
});

describe('moneda', () => {
  it('reconoce el dólar por código y por letras', () => {
    expect(esEnDolares('840')).toBe(true);
    expect(esEnDolares('usd')).toBe(true);
    expect(esEnDolares('214')).toBe(false);
  });
});

describe('parseCotizacion', () => {
  it('lee la conversión del sobre Result', () => {
    const cotizacion = parseCotizacion({
      Value: { amountConverted: 5900.25, exchangeRate: '59.0025' },
    });

    expect(cotizacion.montoConvertido).toBe(5900.25);
    expect(cotizacion.tasa).toBe('59.0025');
  });

  it('acepta que el core la devuelva dentro de una lista', () => {
    expect(
      parseCotizacion({ Value: [{ AmountConverted: 100, ExchangeRate: '1' }] })
        .montoConvertido,
    ).toBe(100);
  });

  it('una respuesta vacía es un error, no una tasa de cero', () => {
    // Seguir con una conversión en cero movería una cantidad equivocada.
    expect(() => parseCotizacion({ Value: null })).toThrow();
    expect(() => parseCotizacion(null)).toThrow();
  });
});

describe('parseComisiones', () => {
  it('lee la comisión y el impuesto', () => {
    const comisiones = parseComisiones({
      Value: { commissionAmount: 25, taxAmount: 2.25 },
    });

    expect(comisiones).toEqual({ comision: 25, impuesto: 2.25 });
  });

  it('lo que no viene se lee como cero, no como indefinido', () => {
    expect(parseComisiones({ Value: {} })).toEqual({
      comision: 0,
      impuesto: 0,
    });
  });
});

describe('parseResultadoDeTransferencia', () => {
  const APLICADA = {
    isSuccess: true,
    value: {
      backendTransactionId: 'TX-99120',
      backendStatusId: '0',
      backendStatusDescription: 'Aplicada',
      backendMessage: 'Transferencia realizada satisfactoriamente.',
      backendTransactionCommission: 25,
      backendTransactionRate: 0,
    },
  };

  it('lee una transferencia aplicada', () => {
    const resultado = parseResultadoDeTransferencia(APLICADA);

    expect(resultado.exito).toBe(true);
    expect(resultado.transaccionId).toBe('TX-99120');
    expect(resultado.comisionCobrada).toBe(25);
    expect(quedaPendienteDeAprobacion(resultado)).toBe(false);
  });

  it('el estado «1» es éxito y queda pendiente de aprobación', () => {
    // Tratarlo como fallo haría que el cliente reintentara una transferencia
    // que ya está en curso, que es la peor forma de equivocarse aquí.
    const resultado = parseResultadoDeTransferencia({
      isSuccess: true,
      value: { ...APLICADA.value, backendStatusId: '1' },
    });

    expect(resultado.exito).toBe(true);
    expect(quedaPendienteDeAprobacion(resultado)).toBe(true);
  });

  it('el estado «00» también es aplicada', () => {
    expect(
      parseResultadoDeTransferencia({
        isSuccess: true,
        value: { ...APLICADA.value, backendStatusId: '00' },
      }).exito,
    ).toBe(true);
  });

  it('un fallo conserva el mensaje del core', () => {
    const resultado = parseResultadoDeTransferencia({
      isFailure: true,
      error: 'Fondos insuficientes',
      value: { backendStatusId: '9', backendMessage: 'Balance insuficiente' },
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toBe('Balance insuficiente');
  });

  it('sin contenido no se da por buena aunque el sobre diga que sí', () => {
    // Un sobre con éxito y sin transacción dentro no prueba que el dinero se
    // haya movido, y enseñar un comprobante vacío sería mentir.
    expect(parseResultadoDeTransferencia({ isSuccess: true }).exito).toBe(
      false,
    );
    expect(parseResultadoDeTransferencia({}).exito).toBe(false);
    expect(parseResultadoDeTransferencia(null).exito).toBe(false);
  });

  it('sin mensaje del core se escribe uno entendible', () => {
    expect(
      parseResultadoDeTransferencia({
        isSuccess: true,
        value: { backendStatusId: '0', backendTransactionId: 'TX-1' },
      }).mensaje,
    ).toBe('Transferencia realizada satisfactoriamente.');

    expect(parseResultadoDeTransferencia({ isFailure: true }).mensaje).toBe(
      'No se pudo procesar la transferencia.',
    );
  });
});
