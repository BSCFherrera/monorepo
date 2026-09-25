import {
  avanceDelPrestamo,
  estaCancelado,
  parseDetalleDePrestamo,
  saldoDeLaCabecera,
} from '../loanDetailContracts';

const CONTEXTO = { numeroDePrestamo: '293276', codigoMoneda: 214 };
const parse = (crudo: unknown) => parseDetalleDePrestamo(crudo, CONTEXTO);

describe('nombres de campo del core', () => {
  it('lee los montos con los nombres en español', () => {
    const prestamo = parse({
      SALDO_ACTUAL: 312_450.18,
      MONTO_DESEMBOLSADO: 450_000,
      MONTO_PAGADO: 137_549.82,
      SALDO_CANCELACION: 318_220.5,
      INTERESES_PENDIENTES: 5_770.32,
    });

    expect({
      saldo: prestamo.saldoActual,
      desembolsado: prestamo.montoDesembolsado,
      pagado: prestamo.totalPagado,
      cancelacion: prestamo.saldoDeCancelacion,
      pendientes: prestamo.interesesPendientes,
    }).toEqual({
      saldo: 312_450.18,
      desembolsado: 450_000,
      pagado: 137_549.82,
      cancelacion: 318_220.5,
      pendientes: 5_770.32,
    });
  });

  it('lee el tipo de préstamo por sus tres nombres', () => {
    expect(parse({ DESC_TIPO_CREDITO: 'Consumo' }).tipoDePrestamo).toBe(
      'Consumo',
    );
    expect(parse({ TIPO_PRESTAMO: 'Consumo' }).tipoDePrestamo).toBe('Consumo');
    expect(parse({ loanTypeDescription: 'Consumo' }).tipoDePrestamo).toBe(
      'Consumo',
    );
  });

  it('sin tipo cae en «Préstamo», como el original', () => {
    expect(parse({}).tipoDePrestamo).toBe('Préstamo');
  });

  it('el número del core manda sobre el que traía la pantalla', () => {
    // La lista de productos a veces entrega el número recortado.
    expect(parse({ NO_PRESTAMO: '0000293276' }).numeroDePrestamo).toBe(
      '0000293276',
    );
    expect(parse({}).numeroDePrestamo).toBe('293276');
  });

  it('tolera el plazo redactado, no solo el número', () => {
    // El core manda «120 DIAS» en algunos productos.
    expect(parse({ PLAZO: '120 DIAS' }).plazoEnMeses).toBe(120);
    expect(parse({ PLAZO: 36 }).plazoEnMeses).toBe(36);
  });
});

describe('último pago: cero no es lo mismo que todavía no', () => {
  it('sin pagos, los dos últimos pagos quedan sin definir', () => {
    // Un préstamo recién desembolsado no ha pagado nada. «Último pago capital:
    // RD$ 0.00» sugiere que se pagó cero, no que aún no se ha pagado.
    const prestamo = parse({});

    expect(prestamo.ultimoPagoDeCapital).toBeUndefined();
    expect(prestamo.ultimoPagoDeIntereses).toBeUndefined();
  });

  it('un pago de cero que el core sí mandó se conserva', () => {
    const prestamo = parse({ ULT_PAGO_PRINCIPAL: 0, ULT_PAG_INTERESES: 0 });

    expect(prestamo.ultimoPagoDeCapital).toBe(0);
    expect(prestamo.ultimoPagoDeIntereses).toBe(0);
  });

  it('lee los pagos por sus dos nombres', () => {
    expect(parse({ ULT_PAGO_PRINCIPAL: 8_200 }).ultimoPagoDeCapital).toBe(
      8_200,
    );
    expect(
      parse({ lastPrincipalPaymentAmount: 8_200 }).ultimoPagoDeCapital,
    ).toBe(8_200);
  });
});

describe('tasas', () => {
  it('la tasa anual efectiva distingue cero de ausente', () => {
    expect(parse({}).tasaAnualEfectiva).toBeUndefined();
    expect(parse({ TAE: 0 }).tasaAnualEfectiva).toBe(0);
    expect(parse({ TAE: 18.5 }).tasaAnualEfectiva).toBe(18.5);
  });
});

describe('préstamo cancelado', () => {
  it('lo es cuando el core manda fecha de cancelación', () => {
    expect(estaCancelado(parse({ FEC_CANCELACION: '2026-04-30' }))).toBe(true);
  });

  it('no lo es cuando la fecha falta o viene en blanco', () => {
    expect(estaCancelado(parse({}))).toBe(false);
    expect(estaCancelado(parse({ FEC_CANCELACION: '   ' }))).toBe(false);
  });
});

describe('avance del préstamo', () => {
  it('es lo pagado sobre lo desembolsado', () => {
    expect(
      avanceDelPrestamo(parse({ MONTO_DESEMBOLSADO: 400, MONTO_PAGADO: 100 })),
    ).toBe(0.25);
  });

  it('se recorta a uno cuando lo pagado supera lo desembolsado', () => {
    // Pasa porque el core incluye intereses en lo pagado. Sin recortar, la
    // barra de progreso se sale de la tarjeta.
    expect(
      avanceDelPrestamo(parse({ MONTO_DESEMBOLSADO: 400, MONTO_PAGADO: 900 })),
    ).toBe(1);
  });

  it('sin desembolso es cero, no una división entre cero', () => {
    expect(
      avanceDelPrestamo(parse({ MONTO_DESEMBOLSADO: 0, MONTO_PAGADO: 100 })),
    ).toBe(0);
  });

  it('nunca es negativo', () => {
    expect(
      avanceDelPrestamo(parse({ MONTO_DESEMBOLSADO: 400, MONTO_PAGADO: -50 })),
    ).toBe(0);
  });
});

describe('la cifra grande de la cabecera', () => {
  it('usa el balance actual cuando el core lo manda', () => {
    expect(
      saldoDeLaCabecera(
        parse({ SALDO_ACTUAL: 312_450.18, SALDO_CANCELACION: 318_220.5 }),
      ),
    ).toEqual({ monto: 312_450.18, etiqueta: 'Balance actual' });
  });

  it('cae al saldo de cancelación cuando el balance viene en cero', () => {
    // Es lo que pasa en los préstamos activos. Abrir con «RD$ 0.00» encima se
    // leería como que el cliente no debe nada: el malentendido más caro posible
    // en la pantalla de un préstamo.
    expect(
      saldoDeLaCabecera(
        parse({ SALDO_ACTUAL: 0, SALDO_CANCELACION: 318_220.5 }),
      ),
    ).toEqual({ monto: 318_220.5, etiqueta: 'Saldo de cancelación' });
  });

  it('cambia también la etiqueta, para no llamar balance a lo que no lo es', () => {
    const { etiqueta } = saldoDeLaCabecera(parse({ SALDO_CANCELACION: 100 }));
    expect(etiqueta).toBe('Saldo de cancelación');
  });
});
