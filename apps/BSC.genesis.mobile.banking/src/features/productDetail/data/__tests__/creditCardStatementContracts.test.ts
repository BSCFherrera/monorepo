import {
  estaEnAtraso,
  parseEstadoDeTarjeta,
  tieneActividadDelCiclo,
  tienePuntosDelMes,
  usoAlCorte,
} from '../creditCardStatementContracts';

/**
 * El estado de cuenta cerrado de un ciclo.
 *
 * Portado de `CreditCardStatementModel.toEntity` y de la entidad
 * `CreditCardStatement`. Este endpoint **sabe cosas que el detalle del producto
 * no sabe**: cuántas compras tuvo el ciclo, sobre qué balance se calcula el
 * cargo financiero y qué pasó con los puntos del mes.
 */

const CICLO_COMPLETO = {
  Number: '4023********0668',
  ProductName: 'Visa Platinum',
  Currency: 'DOP',
  CycleDate: '2026-07-25',
  DueDate: '2026-08-14',
  Start: '2026-06-26',
  End: '2026-07-25',
  ExpirationDate: '2028/05',
  CurrentBalance: 48250.75,
  AvailableBalance: 101749.25,
  CreditLimit: 150000,
  PreviousBalance: 39100.2,
  NewBalance: 48250.75,
  DuePayment: 48250.75,
  MinimumPayment: 2412.54,
  OverduePayment: 0,
  QtyDelinquentPayments: 0,
  OverLimit: 0,
  LastPaymentAmount: 15000,
  QtyPurchases: 23,
  PurchasesAmount: 24150.55,
  QtyCashAdvance: 1,
  CashAdvanceAmount: 5000,
  MonthDailyAverageBalance: 41320.4,
  InterestRateFinanceCharge: 2.95,
  FinanceBalance: 33210.1,
  AccumulatedPointMonth: 482,
  ExpiredPointMonth: 0,
  RedeemedPointMonth: 1200,
  EliminatedPointMonth: 0,
  TaxReceiptNumber: 'B0100000123',
  Movements: [
    {
      Description: 'SUPERMERCADO NACIONAL',
      TransactionDate: '2026-07-10',
      Amount: 3250.4,
      Operation: 'D',
    },
    {
      Description: 'PAGO RECIBIDO GRACIAS',
      TransactionDate: '2026-07-02',
      Amount: 15000,
      Operation: 'C',
    },
  ],
};

describe('estado de cuenta de tarjeta', () => {
  it('lee el ciclo completo que manda el core', () => {
    const estado = parseEstadoDeTarjeta(CICLO_COMPLETO);

    expect(estado.nombreDelProducto).toBe('Visa Platinum');
    expect(estado.saldoAlCorte).toBe(48250.75);
    expect(estado.pagoMinimo).toBe(2412.54);
    expect(estado.pagoDeContado).toBe(48250.75);
    expect(estado.limiteDeCredito).toBe(150000);
    expect(estado.numeroDeComprobanteFiscal).toBe('B0100000123');
  });

  it('acepta los nombres de campo en minúscula inicial', () => {
    const estado = parseEstadoDeTarjeta({
      productName: 'Mastercard Gold',
      currentBalance: '1250.30',
      minimumPayment: 62.5,
      qtyPurchases: '4',
    });

    expect(estado.nombreDelProducto).toBe('Mastercard Gold');
    expect(estado.saldoAlCorte).toBe(1250.3);
    expect(estado.cantidadDeCompras).toBe(4);
  });

  it('interpreta los movimientos del ciclo con la regla de signo de siempre', () => {
    const estado = parseEstadoDeTarjeta(CICLO_COMPLETO);

    expect(estado.movimientos).toHaveLength(2);
    expect(estado.movimientos[0]?.tipo).toBe('D');
    expect(estado.movimientos[1]?.tipo).toBe('C');
    expect(estado.movimientos[1]?.monto).toBe(15000);
  });

  it('un ciclo sin movimientos no es un error, es una lista vacía', () => {
    const estado = parseEstadoDeTarjeta({ ...CICLO_COMPLETO, Movements: null });

    expect(estado.movimientos).toEqual([]);
  });

  it('una respuesta que no es un objeto devuelve un estado en cero, no revienta', () => {
    const estado = parseEstadoDeTarjeta(null);

    expect(estado.saldoAlCorte).toBe(0);
    expect(estado.movimientos).toEqual([]);
    expect(estado.nombreDelProducto).toBe('Tarjeta de Crédito');
  });

  it('las fechas del ciclo se quedan sin definir cuando no vienen', () => {
    const estado = parseEstadoDeTarjeta({ CurrentBalance: 100 });

    expect(estado.fechaDeCorte).toBeUndefined();
    expect(estado.fechaDePago).toBeUndefined();
    expect(estado.inicioDelPeriodo).toBeUndefined();
  });
});

describe('lo que el estado dice de un vistazo', () => {
  it('reconoce el atraso por monto vencido o por cuotas en atraso', () => {
    expect(estaEnAtraso(parseEstadoDeTarjeta(CICLO_COMPLETO))).toBe(false);

    expect(
      estaEnAtraso(
        parseEstadoDeTarjeta({ ...CICLO_COMPLETO, OverduePayment: 1200 }),
      ),
    ).toBe(true);

    // El core puede mandar el monto en cero y contar las cuotas igual.
    expect(
      estaEnAtraso(
        parseEstadoDeTarjeta({
          ...CICLO_COMPLETO,
          OverduePayment: 0,
          QtyDelinquentPayments: 2,
        }),
      ),
    ).toBe(true);
  });

  it('hay actividad si hubo compras o avances, por cantidad o por monto', () => {
    expect(tieneActividadDelCiclo(parseEstadoDeTarjeta(CICLO_COMPLETO))).toBe(
      true,
    );

    expect(
      tieneActividadDelCiclo(
        parseEstadoDeTarjeta({
          QtyPurchases: 0,
          PurchasesAmount: 0,
          QtyCashAdvance: 0,
          CashAdvanceAmount: 0,
        }),
      ),
    ).toBe(false);
  });

  it('hay puntos que contar si se ganaron, se canjearon, vencieron o se eliminaron', () => {
    expect(tienePuntosDelMes(parseEstadoDeTarjeta(CICLO_COMPLETO))).toBe(true);

    expect(
      tienePuntosDelMes(
        parseEstadoDeTarjeta({ ...CICLO_COMPLETO, Movements: [] }),
      ),
    ).toBe(true);

    expect(
      tienePuntosDelMes(
        parseEstadoDeTarjeta({
          AccumulatedPointMonth: 0,
          RedeemedPointMonth: 0,
          ExpiredPointMonth: 0,
          EliminatedPointMonth: 0,
        }),
      ),
    ).toBe(false);
  });

  it('el uso al corte se recorta a uno cuando la tarjeta se pasó del límite', () => {
    const excedida = parseEstadoDeTarjeta({
      CurrentBalance: 160000,
      CreditLimit: 150000,
    });

    expect(usoAlCorte(excedida)).toBe(1);
  });

  it('sin límite declarado el uso es cero, no una división por cero', () => {
    const sinLimite = parseEstadoDeTarjeta({
      CurrentBalance: 5000,
      CreditLimit: 0,
    });

    expect(usoAlCorte(sinLimite)).toBe(0);
  });
});
