import type { Producto } from '../../../dashboard/data/productContracts';
import {
  SIN_COMISIONES_DE_PAGO,
  TipoDeMonto,
  TipoDePago,
} from '../../data/paymentContracts';
import {
  balanceAlCorte,
  codigoDeMonedaDelPago,
  comisionDelPago,
  esTarjetaMultimoneda,
  impuestoDelPago,
  monedaDelPago,
  montoADebitar,
  montoDelPago,
  necesitaConversion,
  numeroVisible,
  opcionesDeMonto,
  balanceALaFecha,
  nuevoSaldoDelProducto,
  ordenDePrestamo,
  ordenDeTarjeta,
  pagoMinimo,
  primeraOpcionValida,
  puedeContinuar,
  tipoDeCuentaOrigen,
  totalDebitado,
  type DatosDelPago,
} from '../paymentFlow';

const producto = (sobre: Partial<Producto> = {}): Producto =>
  ({
    categoria: 'TC',
    identificacion: '4539123456780668',
    codigoMoneda: 214,
    estado: 'A',
    saldoActual: 0,
    saldoDisponible: 0,
    numeroEnmascarado: '4539********0668',
    saldoPesos: 12_500,
    saldoDolares: 0,
    disponiblePesos: 37_500,
    disponibleDolares: 0,
    pagoMinimoPesos: 1_250,
    pagoMinimoDolares: 0,
    ...sobre,
  } as Producto);

const cuenta = (sobre: Partial<Producto> = {}): Producto =>
  ({
    categoria: 'CA',
    identificacion: '11042010013953',
    codigoMoneda: 214,
    estado: 'A',
    saldoActual: 128_450.12,
    saldoDisponible: 128_450.12,
    numeroEnmascarado: undefined,
    saldoPesos: 0,
    saldoDolares: 0,
    disponiblePesos: 0,
    disponibleDolares: 0,
    pagoMinimoPesos: 0,
    pagoMinimoDolares: 0,
    ...sobre,
  } as Producto);

const base = (sobre: Partial<DatosDelPago> = {}): DatosDelPago => ({
  tipo: TipoDePago.Tarjeta,
  producto: producto(),
  cuentaOrigen: cuenta(),
  moneda: 'DOP',
  detalleDeLaTarjeta: null,
  tipoDeMonto: TipoDeMonto.Minimo,
  montoEscrito: 0,
  comentario: '',
  cotizacion: null,
  comisiones: SIN_COMISIONES_DE_PAGO,
  ...sobre,
});

describe('montos de una tarjeta', () => {
  it('el mínimo y el balance salen del ciclo en pesos', () => {
    const datos = base();

    expect(pagoMinimo(datos)).toBe(1_250);
    expect(balanceAlCorte(datos)).toBe(12_500);
    expect(montoDelPago(datos)).toBe(1_250);
  });

  it('cambiar de moneda cambia los tres montos, no solo la etiqueta', () => {
    /*
      Una tarjeta lleva dos ciclos a la vez, cada uno con su mínimo y su
      balance. Es el mismo defecto que apareció en la oleada 3, donde el
      selector cambiaba los saldos pero no los movimientos.
    */
    const datos = base({
      producto: producto({
        saldoDolares: 300,
        pagoMinimoDolares: 30,
        disponibleDolares: 700,
      }),
      moneda: 'USD',
    });

    expect(pagoMinimo(datos)).toBe(30);
    expect(balanceAlCorte(datos)).toBe(300);
    expect(codigoDeMonedaDelPago(datos)).toBe(840);
  });

  it('reconoce la tarjeta que tiene ciclo en dólares', () => {
    expect(esTarjetaMultimoneda(base())).toBe(false);
    expect(
      esTarjetaMultimoneda(base({ producto: producto({ saldoDolares: 300 }) })),
    ).toBe(true);
  });

  it('«Otro monto» usa lo que el cliente escribió', () => {
    expect(
      montoDelPago(
        base({ tipoDeMonto: TipoDeMonto.Otro, montoEscrito: 5_000 }),
      ),
    ).toBe(5_000);
  });
});

describe('opciones de monto', () => {
  it('no ofrece una opción en cero', () => {
    /*
      Un «Pago Mínimo RD$ 0.00» en una tarjeta de contado parece que no hay
      nada que pagar, cuando lo que pasa es que esa tarjeta no tiene mínimo y
      hay que saldar el total del ciclo.
    */
    const deContado = base({
      producto: producto({ pagoMinimoPesos: 0, saldoPesos: 9_800 }),
    });

    const opciones = opcionesDeMonto(deContado);

    expect(opciones.map(o => o.tipo)).toEqual([
      TipoDeMonto.AlCorte,
      TipoDeMonto.Otro,
    ]);
    expect(primeraOpcionValida(deContado)).toBe(TipoDeMonto.AlCorte);
  });

  it('«Otro monto» se ofrece siempre, y es el único si no hay saldos', () => {
    const sinSaldo = base({
      producto: producto({ pagoMinimoPesos: 0, saldoPesos: 0 }),
    });

    expect(opcionesDeMonto(sinSaldo).map(o => o.tipo)).toEqual([
      TipoDeMonto.Otro,
    ]);
    expect(primeraOpcionValida(sinSaldo)).toBe(TipoDeMonto.Otro);
  });

  it('un préstamo ofrece la cuota y otro monto', () => {
    const prestamo = base({
      tipo: TipoDePago.Prestamo,
      producto: producto({ categoria: 'PR', pagoMinimoPesos: 18_450 }),
      tipoDeMonto: TipoDeMonto.Cuota,
    });

    expect(opcionesDeMonto(prestamo).map(o => o.tipo)).toEqual([
      TipoDeMonto.Cuota,
      TipoDeMonto.Otro,
    ]);
    expect(montoDelPago(prestamo)).toBe(18_450);
  });

  it('sin cuota conocida el préstamo solo ofrece otro monto', () => {
    // Enseñar «Pagar cuota RD$ 0.00» sería inventarse la cuota.
    const prestamo = base({
      tipo: TipoDePago.Prestamo,
      producto: producto({ categoria: 'PR', pagoMinimoPesos: 0 }),
    });

    expect(opcionesDeMonto(prestamo).map(o => o.tipo)).toEqual([
      TipoDeMonto.Otro,
    ]);
  });
});

describe('préstamo', () => {
  it('se paga siempre en su moneda: no hay selector', () => {
    const enDolares = base({
      tipo: TipoDePago.Prestamo,
      producto: producto({ categoria: 'PR', codigoMoneda: 840 }),
      // Aunque el selector dijera pesos, manda la moneda del préstamo.
      moneda: 'DOP',
    });

    expect(monedaDelPago(enDolares)).toBe('USD');
    expect(codigoDeMonedaDelPago(enDolares)).toBe(840);
  });

  it('no paga comisión ni impuesto', () => {
    const prestamo = base({
      tipo: TipoDePago.Prestamo,
      producto: producto({ categoria: 'PR', pagoMinimoPesos: 1_000 }),
      tipoDeMonto: TipoDeMonto.Cuota,
      comisiones: { comision: 25, impuesto: 2.25, conocidas: true },
    });

    expect(comisionDelPago(prestamo)).toBe(0);
    expect(impuestoDelPago(prestamo)).toBe(0);
    expect(totalDebitado(prestamo)).toBe(1_000);
  });

  it('pagar la cuota manda cuota 1 y tipo 1; otro monto manda 0 y 2', () => {
    const conCuota = base({
      tipo: TipoDePago.Prestamo,
      producto: producto({
        categoria: 'PR',
        identificacion: '293276',
        pagoMinimoPesos: 1_000,
      }),
      tipoDeMonto: TipoDeMonto.Cuota,
    });

    expect(ordenDePrestamo(conCuota, '80191')).toMatchObject({
      numeroDePrestamo: '293276',
      numeroDeCuota: 1,
      tipoDePago: 1,
      monto: 1_000,
    });

    const abono = {
      ...conCuota,
      tipoDeMonto: TipoDeMonto.Otro,
      montoEscrito: 500,
    };

    expect(ordenDePrestamo(abono, '80191')).toMatchObject({
      numeroDeCuota: 0,
      tipoDePago: 2,
      monto: 500,
    });
  });
});

describe('conversión', () => {
  it('pagar en dólares desde una cuenta en pesos necesita conversión', () => {
    const datos = base({
      producto: producto({ saldoDolares: 300, pagoMinimoDolares: 30 }),
      moneda: 'USD',
    });

    expect(necesitaConversion(datos)).toBe(true);
  });

  it('el débito sale de la cotización, y sin ella cae al monto', () => {
    const datos = base({
      producto: producto({ saldoDolares: 300, pagoMinimoDolares: 30 }),
      moneda: 'USD',
      cotizacion: { montoConvertido: 1_785, tasa: '59.50' },
    });

    expect(montoADebitar(datos)).toBe(1_785);
    expect(montoADebitar({ ...datos, cotizacion: null })).toBe(30);
  });

  it('el total suma comisión e impuesto sobre el monto convertido', () => {
    const datos = base({
      producto: producto({ saldoDolares: 300, pagoMinimoDolares: 30 }),
      moneda: 'USD',
      cotizacion: { montoConvertido: 1_785, tasa: '59.50' },
      comisiones: { comision: 25, impuesto: 2.68, conocidas: true },
    });

    expect(totalDebitado(datos)).toBe(1_812.68);
  });
});

describe('nuevoSaldoDelProducto', () => {
  /*
    El comprobante del original enseña, en la fila del producto pagado, el
    saldo que le queda a la tarjeta o al préstamo después del pago: lo calcula
    como `balance - finalAmount` en `payment_bloc.dart`. El porte no lo tenía y
    por eso su comprobante había sustituido la fila con icono del original por
    dos renglones sueltos.

    Se calcula sobre el monto del pago, **no sobre el total debitado**: la
    comisión y el impuesto salen de la cuenta, no se aplican a la tarjeta.
  */
  it('descuenta de la tarjeta lo que se le aplicó, no lo que salió de la cuenta', () => {
    const datos = base({
      comisiones: { comision: 25, impuesto: 2.25, conocidas: true },
    });

    expect(nuevoSaldoDelProducto(datos)).toBe(
      balanceALaFecha(datos) - montoDelPago(datos),
    );
    // Y no descuenta la comisión ni el impuesto, que salen de la cuenta.
    expect(nuevoSaldoDelProducto(datos)).not.toBe(
      balanceALaFecha(datos) - totalDebitado(datos),
    );
  });

  it('sin producto seleccionado no inventa un saldo', () => {
    expect(nuevoSaldoDelProducto(base({ producto: null }))).toBe(0);
  });
});

describe('ordenDeTarjeta', () => {
  it('manda el número COMPLETO, no el enmascarado', () => {
    // El core no sabe resolver `4539********0668`, y el backend recalcula la
    // huella sobre este mismo campo.
    const orden = ordenDeTarjeta(base(), '80191');

    expect(orden.numeroDeTarjeta).toBe('4539123456780668');
    expect(numeroVisible(base())).toBe('4539********0668');
  });

  it('el monto que viaja es el del pago, sin comisión ni impuesto', () => {
    /*
      **El core cobra el impuesto por su cuenta, en un movimiento aparte.** Lo
      que reciba en `paymentAmount` lo entiende como el monto a aplicar a la
      tarjeta, así que sumarle los cargos aplicaría de más a la tarjeta y haría
      que el impuesto se calculara sobre esa cifra. El BFF tampoco se los
      reenvía: `Commission` y `TaxAmount` solo alimentan su propio registro de
      la transacción, y al core le llega únicamente `paymentAmount`.

      El cliente sí ve el impuesto y el total a debitar en la confirmación; eso
      es informativo y se comprueba justo debajo.
    */
    const datos = base({
      comisiones: { comision: 25, impuesto: 2.25, conocidas: true },
    });

    expect(ordenDeTarjeta(datos, '80191').monto).toBe(1_250);
    expect(totalDebitado(datos)).toBe(1_277.25);
  });

  it('la comisión y el impuesto viajan en sus propios campos, no sumados al monto', () => {
    /*
      Se envían aparte porque el BFF los registra en su tabla de
      transacciones. Que existan estos campos es justamente la razón por la que
      sumarlos otra vez al monto era un error difícil de ver: la información ya
      viajaba, y viajaba dos veces.
    */
    const orden = ordenDeTarjeta(
      base({ comisiones: { comision: 25, impuesto: 2.25, conocidas: true } }),
      '80191',
    );

    expect(orden.comision).toBe(25);
    expect(orden.impuesto).toBe(2.25);
    expect(orden.monto).toBe(1_250);
  });

  it('sin conversión no se mandan ni el monto convertido ni la tasa', () => {
    const orden = ordenDeTarjeta(base(), '80191');

    expect(orden.montoConvertido).toBeUndefined();
    expect(orden.tasa).toBeUndefined();
  });

  it('un comentario vacío no viaja', () => {
    expect(ordenDeTarjeta(base(), '80191').comentario).toBeUndefined();
    expect(
      ordenDeTarjeta(base({ comentario: 'Abono' }), '80191').comentario,
    ).toBe('Abono');
  });

  it('una cuenta de ahorros se declara como 2 y una corriente como 1', () => {
    expect(tipoDeCuentaOrigen(base())).toBe(2);
    expect(
      tipoDeCuentaOrigen(base({ cuentaOrigen: cuenta({ categoria: 'CC' }) })),
    ).toBe(1);
  });
});

describe('puedeContinuar', () => {
  it('exige producto, cuenta y un monto mayor que cero', () => {
    expect(puedeContinuar(base())).toBe(true);
    expect(puedeContinuar(base({ producto: null }))).toBe(false);
    expect(puedeContinuar(base({ cuentaOrigen: null }))).toBe(false);
    expect(
      puedeContinuar(base({ tipoDeMonto: TipoDeMonto.Otro, montoEscrito: 0 })),
    ).toBe(false);
  });
});
