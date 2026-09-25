import {
  avisoDePago,
  montosEnMoneda,
  parseDetalleDeTarjeta,
  tieneActividadDePuntos,
  tienePagoVencido,
  ultimosCuatroDigitos,
  usoDelLimite,
} from '../creditCardDetailContracts';

/**
 * Una tarjeta del banco lleva **dos saldos a la vez**, en pesos y en dólares, y
 * el core los devuelve con el sufijo `_RD` y `_US`. Confundir una moneda con la
 * otra no rompe nada visible: enseña un pago mínimo que no es el que hay que
 * pagar, en la pantalla donde el cliente decide cuánto paga.
 */

const CONTEXTO = { numeroDeTarjeta: '4539123456780668' };
const parse = (crudo: unknown) => parseDetalleDeTarjeta(crudo, CONTEXTO);

const DOP = 214;
const USD = 840;

describe('las dos monedas no se mezclan', () => {
  const tarjeta = parse({
    SALDO_ACTUAL_RD: 18_775.3,
    LIMITE_CREDITO_RD: 150_000,
    DISP_COMPRAS_RD: 131_224.7,
    PAGO_MINIMO_RD: 1_877.53,
    PAGO_TOTAL_RD: 18_775.3,
    SALDO_ACTUAL_US: 420.15,
    LIMITE_CREDITO_US: 3_000,
    DISP_COMPRAS_US: 2_579.85,
    PAGO_MINIMO_US: 42.02,
    PAGO_TOTAL_US: 420.15,
  });

  it('lee los importes en pesos', () => {
    expect(tarjeta.pesos).toMatchObject({
      balanceActual: 18_775.3,
      limiteDeCredito: 150_000,
      disponibleParaCompras: 131_224.7,
      pagoMinimo: 1_877.53,
    });
  });

  it('lee los importes en dólares, sin arrastrar los de pesos', () => {
    expect(tarjeta.dolares).toMatchObject({
      balanceActual: 420.15,
      limiteDeCredito: 3_000,
      disponibleParaCompras: 2_579.85,
      pagoMinimo: 42.02,
    });
  });

  it('elige la moneda que la pantalla tiene seleccionada', () => {
    expect(montosEnMoneda(tarjeta, DOP).balanceActual).toBe(18_775.3);
    expect(montosEnMoneda(tarjeta, USD).balanceActual).toBe(420.15);
  });

  it('acepta también los nombres en inglés que a veces manda el bus', () => {
    const traducida = parse({
      currentBalanceDOP: 100,
      currentBalanceUSD: 7,
      minimumPaymentUSD: 1.5,
    });

    expect(traducida.pesos.balanceActual).toBe(100);
    expect(traducida.dolares.balanceActual).toBe(7);
    expect(traducida.dolares.pagoMinimo).toBe(1.5);
  });

  it('lo que no vino queda en cero en esa moneda, no toma el de la otra', () => {
    const soloPesos = parse({ SALDO_ACTUAL_RD: 500 });

    expect(soloPesos.pesos.balanceActual).toBe(500);
    expect(soloPesos.dolares.balanceActual).toBe(0);
  });
});

describe('uso del límite', () => {
  const conLimite = (balance: number, limite: number) =>
    montosEnMoneda(
      parse({ SALDO_ACTUAL_RD: balance, LIMITE_CREDITO_RD: limite }),
      DOP,
    );

  it('es el balance sobre el límite', () => {
    expect(usoDelLimite(conLimite(30_000, 150_000))).toBe(0.2);
  });

  it('se recorta a uno cuando la tarjeta se pasó del límite', () => {
    // Pasa por intereses o por un cargo autorizado por encima. Sin recortar, el
    // anillo se saldría del círculo.
    expect(usoDelLimite(conLimite(160_000, 150_000))).toBe(1);
  });

  it('sin límite es cero, no una división entre cero', () => {
    expect(usoDelLimite(conLimite(30_000, 0))).toBe(0);
  });
});

describe('qué decir sobre el pago del ciclo', () => {
  it('con pago mínimo, lo anuncia', () => {
    expect(
      avisoDePago(
        montosEnMoneda(
          parse({ PAGO_MINIMO_RD: 1_877.53, PAGO_TOTAL_RD: 18_775.3 }),
          DOP,
        ),
      ),
    ).toEqual({ etiqueta: 'Pago mínimo', monto: 1_877.53 });
  });

  it('una tarjeta de contado no tiene mínimo: se anuncia el total', () => {
    // El core manda cero, y «Pago mínimo RD$ 0.00» le diría al cliente que no
    // tiene que pagar nada este mes.
    expect(
      avisoDePago(
        montosEnMoneda(
          parse({ PAGO_MINIMO_RD: 0, PAGO_TOTAL_RD: 18_775.3 }),
          DOP,
        ),
      ),
    ).toEqual({ etiqueta: 'Pago de contado', monto: 18_775.3 });
  });
});

describe('pago vencido', () => {
  it('basta con que lo haya en una de las dos monedas', () => {
    expect(tienePagoVencido(parse({ PAGO_VENCIDO_RD: 1_200 }))).toBe(true);
    expect(tienePagoVencido(parse({ PAGO_VENCIDO_US: 30 }))).toBe(true);
  });

  it('sin vencidos en ninguna, no lo hay', () => {
    expect(
      tienePagoVencido(parse({ PAGO_VENCIDO_RD: 0, PAGO_VENCIDO_US: 0 })),
    ).toBe(false);
    expect(tienePagoVencido(parse({}))).toBe(false);
  });
});

describe('puntos', () => {
  it('lee el balance y el movimiento del mes', () => {
    const { puntos } = parse({
      PTOS_BALANCE_ACT: 12_400,
      PTOS_BALANCE_ANT: 10_000,
      PTOS_GAN_MES_ACT: 2_800,
      PTOS_USA_MES_ACT: 300,
      PTOS_EXP_MES_ACT: 100,
    });

    expect(puntos).toEqual({
      balance: 12_400,
      anterior: 10_000,
      ganadosEnElMes: 2_800,
      usadosEnElMes: 300,
      vencidosEnElMes: 100,
    });
  });

  it('hay actividad si se ganaron, se usaron o se vencieron puntos', () => {
    expect(tieneActividadDePuntos(parse({ PTOS_GAN_MES_ACT: 10 }))).toBe(true);
    expect(tieneActividadDePuntos(parse({ PTOS_USA_MES_ACT: 10 }))).toBe(true);
    expect(tieneActividadDePuntos(parse({ PTOS_EXP_MES_ACT: 10 }))).toBe(true);
  });

  it('tener saldo de puntos no es tener actividad', () => {
    // El bloque del mes no tiene nada que contar aunque el balance no sea cero.
    expect(tieneActividadDePuntos(parse({ PTOS_BALANCE_ACT: 12_400 }))).toBe(
      false,
    );
  });
});

describe('número de la tarjeta', () => {
  it('la pantalla enseña el número con el que se abrió, no el del core', () => {
    // Verificado en el Pixel contra la app Flutter: la lista entrega una
    // tarjeta terminada en 7147 y el detalle responde 1032. El original enseña
    // el de la lista —su tarjeta de resumen lee `widget.maskedCardNumber`— y
    // así se queda: el cliente acaba de tocar la 7147 y abrirle una que dice
    // 1032 le haría pensar que se equivocó de producto.
    const tarjeta = parseDetalleDeTarjeta(
      { NUM_TARJETA: '**** **** **** 1032' },
      { numeroDeTarjeta: '4539', numeroEnmascarado: '**** 7147' },
    );

    expect(ultimosCuatroDigitos(tarjeta)).toBe('7147');
  });

  it('conserva aparte el número que reporta el core, que no es el mismo', () => {
    // Cuál de los dos es el plástico está sin resolver con el banco, así que el
    // dato no se descarta: se guarda para poder consultarlo.
    const tarjeta = parseDetalleDeTarjeta(
      { NUM_TARJETA: '**** **** **** 1032' },
      { numeroDeTarjeta: '4539', numeroEnmascarado: '**** 7147' },
    );

    expect(tarjeta.numeroDelCore).toBe('**** **** **** 1032');
  });

  it('sin número en la pantalla cae en el que reporta el core', () => {
    const tarjeta = parseDetalleDeTarjeta(
      { NUM_TARJETA: '**** **** **** 1032' },
      { numeroDeTarjeta: '4539' },
    );

    expect(ultimosCuatroDigitos(tarjeta)).toBe('1032');
  });

  it('sin número en el detalle usa el que venía', () => {
    const tarjeta = parseDetalleDeTarjeta(
      {},
      { numeroDeTarjeta: '4539', numeroEnmascarado: '**** 0668' },
    );

    expect(ultimosCuatroDigitos(tarjeta)).toBe('0668');
  });

  it('un número más corto que cuatro se devuelve entero', () => {
    const tarjeta = parseDetalleDeTarjeta(
      {},
      { numeroDeTarjeta: '668', numeroEnmascarado: '668' },
    );

    expect(ultimosCuatroDigitos(tarjeta)).toBe('668');
  });
});

describe('tasas y nombre', () => {
  it('las tasas distinguen cero de ausente', () => {
    // Enseñar «0%» afirmaría una tasa que el banco nunca mandó.
    expect(parse({}).tasaDeFinanciamiento).toBeUndefined();
    expect(parse({}).tasaAnualEfectiva).toBeUndefined();
    expect(parse({ TASA_FINANCIAMIENTO: 0 }).tasaDeFinanciamiento).toBe(0);
    expect(parse({ TAE_RD: 59.9 }).tasaAnualEfectiva).toBe(59.9);
  });

  it('sin nombre de producto cae en «Tarjeta de Crédito»', () => {
    expect(parse({}).nombreDelProducto).toBe('Tarjeta de Crédito');
    expect(parse({ NOMBRE_PRODUCTO: 'Visa Signature' }).nombreDelProducto).toBe(
      'Visa Signature',
    );
  });
});
