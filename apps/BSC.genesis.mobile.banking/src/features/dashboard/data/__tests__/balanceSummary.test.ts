import {
  calcularResumen,
  parseTasaVentaDolar,
  TASA_DOLAR_RESPALDO,
} from '../balanceSummary';
import { agruparProductos, parseProducto } from '../productContracts';

const cuenta = (saldo: number, moneda = 214) =>
  parseProducto({
    ProductCategory: 'CA',
    ProductIdentification: `c${saldo}`,
    CurrencyCode: moneda,
    AvailableBalance: saldo,
  });

const tarjeta = (pesos: number, dolares: number) =>
  parseProducto({
    ProductCategory: 'TC',
    ProductIdentification: `t${pesos}`,
    DomesticCurrencyBalance: pesos,
    ForeignCurrencyBalance: dolares,
  });

const prestamo = (pendiente: number, moneda = 214) =>
  parseProducto({
    ProductCategory: 'PR',
    ProductIdentification: `p${pendiente}`,
    CurrencyCode: moneda,
    PendingBalancePr: pendiente,
  });

const certificado = (saldo: number, moneda = 214) =>
  parseProducto({
    ProductCategory: 'CD',
    ProductIdentification: `d${saldo}`,
    CurrencyCode: moneda,
    CurrentBalance: saldo,
  });

describe('resumen de balance', () => {
  it('suma cuentas y certificados como activos', () => {
    const resumen = calcularResumen(
      agruparProductos([cuenta(1000), certificado(5000)]),
    );

    expect(resumen.activosPesos).toBe(6000);
  });

  it('separa los activos por moneda', () => {
    const resumen = calcularResumen(
      agruparProductos([cuenta(1000, 214), cuenta(100, 840)]),
    );

    expect(resumen.activosPesos).toBe(1000);
    expect(resumen.activosDolares).toBe(100);
  });

  it('una tarjeta aporta deuda en las dos monedas a la vez', () => {
    // No es como una cuenta, que es de una sola moneda: la tarjeta lleva saldo
    // en pesos y en dólares simultáneamente.
    const resumen = calcularResumen(agruparProductos([tarjeta(3000, 50)]));

    expect(resumen.pasivosPesos).toBe(3000);
    expect(resumen.pasivosDolares).toBe(50);
  });

  it('los préstamos suman como deuda en su moneda', () => {
    const resumen = calcularResumen(
      agruparProductos([prestamo(80000), prestamo(1000, 840)]),
    );

    expect(resumen.pasivosPesos).toBe(80000);
    expect(resumen.pasivosDolares).toBe(1000);
  });

  it('el patrimonio neto convierte los dólares a pesos', () => {
    const resumen = calcularResumen(
      agruparProductos([cuenta(10000), cuenta(100, 840), tarjeta(5000, 0)]),
      60,
    );

    // 10.000 + (100 × 60) − 5.000 = 11.000
    expect(resumen.patrimonioNetoPesos).toBe(11000);
    expect(resumen.tasaDolar).toBe(60);
  });

  it('el patrimonio neto puede ser negativo', () => {
    // Un cliente puede deber más de lo que tiene, y ocultarlo sería mentir.
    const resumen = calcularResumen(
      agruparProductos([cuenta(1000), tarjeta(9000, 0)]),
    );

    expect(resumen.patrimonioNetoPesos).toBe(-8000);
  });

  it('sin productos el resumen es todo cero, no NaN', () => {
    const resumen = calcularResumen(agruparProductos([]));

    expect(resumen.activosPesos).toBe(0);
    expect(resumen.patrimonioNetoPesos).toBe(0);
  });

  it('usa la tasa de respaldo si no se le da ninguna', () => {
    expect(calcularResumen(agruparProductos([])).tasaDolar).toBe(
      TASA_DOLAR_RESPALDO,
    );
  });

  it('una tasa inválida cae a la de respaldo en vez de anular los dólares', () => {
    // Con tasa cero, todos los saldos en dólares valdrían nada.
    for (const tasaMala of [0, -5, Number.NaN]) {
      const resumen = calcularResumen(
        agruparProductos([cuenta(100, 840)]),
        tasaMala,
      );
      expect({ tasaMala, tasa: resumen.tasaDolar }).toEqual({
        tasaMala,
        tasa: TASA_DOLAR_RESPALDO,
      });
    }
  });

  it('la tasa de respaldo es la misma que usa la clasificación de riesgo', () => {
    // Si se separaran, una transferencia podría clasificarse con una tasa y
    // mostrarse con otra.
    expect(TASA_DOLAR_RESPALDO).toBe(59.5);
  });

  it('una cuenta sin disponible usa el saldo actual', () => {
    // Mostrar cero por un campo ausente es la clase de error que hace llamar al
    // banco.
    const sinDisponible = parseProducto({
      ProductCategory: 'CA',
      ProductIdentification: 'x',
      CurrentBalance: 7500,
      AvailableBalance: 0,
    });

    expect(
      calcularResumen(agruparProductos([sinDisponible])).activosPesos,
    ).toBe(7500);
  });

  it('un préstamo sin saldo pendiente usa el saldo actual', () => {
    const sinPendiente = parseProducto({
      ProductCategory: 'PR',
      ProductIdentification: 'y',
      CurrentBalance: 45000,
    });

    expect(calcularResumen(agruparProductos([sinPendiente])).pasivosPesos).toBe(
      45000,
    );
  });
});

describe('dinero disponible de la cabecera', () => {
  // El número más grande de la app. Un primer porte lo calculó como patrimonio
  // neto —certificados incluidos, crédito restando— y salió cinco veces más
  // alto que el de la app Flutter con el mismo cliente.

  const tarjetaConCredito = (disponible: number) =>
    parseProducto({
      ProductCategory: 'TC',
      ProductIdentification: `tc${disponible}`,
      DomesticCurrencyBalance: 90000,
      AvailablePurchasesDomestic: disponible,
    });

  it('suma cuentas en pesos y crédito disponible', () => {
    const resumen = calcularResumen(
      agruparProductos([cuenta(918742.08), tarjetaConCredito(482138.26)]),
    );

    expect(resumen.cuentasPesos).toBeCloseTo(918742.08, 2);
    expect(resumen.creditoDisponiblePesos).toBeCloseTo(482138.26, 2);
    expect(resumen.disponibleTotalPesos).toBeCloseTo(1400880.34, 2);
  });

  it('deja los certificados fuera del disponible', () => {
    // El cliente no puede disponer de un certificado sin cancelarlo, aunque sí
    // sea parte de su patrimonio.
    const resumen = calcularResumen(
      agruparProductos([cuenta(10000), certificado(500000)]),
    );

    expect(resumen.activosPesos).toBe(510000);
    expect(resumen.disponibleTotalPesos).toBe(10000);
  });

  it('el crédito suma en vez de restar', () => {
    // Es poder de compra, no deuda: tratarlo como pasivo daba un disponible
    // menor que el saldo de las cuentas.
    const resumen = calcularResumen(
      agruparProductos([cuenta(1000), tarjetaConCredito(5000)]),
    );

    expect(resumen.disponibleTotalPesos).toBe(6000);
    expect(resumen.disponibleTotalPesos).toBeGreaterThan(resumen.cuentasPesos);
  });

  it('las cuentas en dólares no se suman al disponible en pesos', () => {
    // Van en su propio chip, convertirlas aquí duplicaría la cifra.
    const resumen = calcularResumen(
      agruparProductos([cuenta(1000), cuenta(2000, 840)]),
    );

    expect(resumen.activosDolares).toBe(2000);
    expect(resumen.cuentasPesos).toBe(1000);
    expect(resumen.disponibleTotalPesos).toBe(1000);
  });

  it('el disponible en dólares son cuentas más crédito, sin certificados', () => {
    // El chip de la cabecera sigue el mismo criterio que el total en pesos.
    const tarjetaUsd = parseProducto({
      ProductCategory: 'TC',
      ProductIdentification: 'tcusd',
      AvailablePurchasesForeign: 300,
    });

    const resumen = calcularResumen(
      agruparProductos([cuenta(1200, 840), certificado(9000, 840), tarjetaUsd]),
    );

    expect(resumen.activosDolares).toBe(10200);
    expect(resumen.disponibleDolares).toBe(1500);
  });

  it('sin productos el disponible es cero, no NaN', () => {
    const resumen = calcularResumen(agruparProductos([]));

    expect(resumen.cuentasPesos).toBe(0);
    expect(resumen.creditoDisponiblePesos).toBe(0);
    expect(resumen.disponibleTotalPesos).toBe(0);
  });
});

describe('tasa de venta del dólar', () => {
  it('lee la forma que devuelve el core: Value, Currency y Sales', () => {
    // Es la forma real del endpoint. Un primer porte solo reconocía `rates` y
    // `sellRate`, así que la tasa del día se descartaba en silencio y todos
    // los saldos en dólares se consolidaban con la de respaldo.
    expect(
      parseTasaVentaDolar({
        Value: [
          { Currency: '214', Sales: 1 },
          { Currency: '840', Sales: 62.75 },
        ],
      }),
    ).toBe(62.75);
  });

  it('acepta la tasa como texto', () => {
    expect(
      parseTasaVentaDolar({ value: [{ currency: '840', sales: '61.5' }] }),
    ).toBe(61.5);
  });

  it('la encuentra por código numérico', () => {
    expect(parseTasaVentaDolar([{ CurrencyCode: '840', SellRate: 62.5 }])).toBe(
      62.5,
    );
  });

  it('la encuentra por código alfabético', () => {
    expect(parseTasaVentaDolar([{ currency: 'USD', sellRate: 61 }])).toBe(61);
  });

  it('acepta la lista envuelta en un objeto', () => {
    expect(
      parseTasaVentaDolar({ Rates: [{ CurrencyCode: '840', SellRate: 60 }] }),
    ).toBe(60);
  });

  it('ignora las monedas que no son dólar', () => {
    expect(
      parseTasaVentaDolar([
        { CurrencyCode: '978', SellRate: 70 },
        { CurrencyCode: '840', SellRate: 62 },
      ]),
    ).toBe(62);
  });

  it('devuelve null si no la encuentra, en vez de cero', () => {
    // Un cero haría que todos los saldos en dólares valieran nada.
    expect(parseTasaVentaDolar([])).toBeNull();
    expect(parseTasaVentaDolar(null)).toBeNull();
    expect(
      parseTasaVentaDolar([{ CurrencyCode: '840', SellRate: 0 }]),
    ).toBeNull();
    expect(parseTasaVentaDolar('error')).toBeNull();
  });
});

describe('tasa del día frente a la de respaldo', () => {
  // La tarjeta «Tu balance» lo dice en voz alta, así que la distinción tiene
  // que llegar hasta ella y no perderse en un valor por defecto.

  it('sin tasa del día usa la de respaldo y lo marca', () => {
    const resumen = calcularResumen(agruparProductos([cuenta(100, 840)]));

    expect(resumen.usaTasaDelDia).toBe(false);
    expect(resumen.tasaDolar).toBe(TASA_DOLAR_RESPALDO);
  });

  it('con tasa del día la usa y lo marca', () => {
    const resumen = calcularResumen(agruparProductos([cuenta(100, 840)]), 62.5);

    expect(resumen.usaTasaDelDia).toBe(true);
    expect(resumen.activosTotalesPesos).toBe(6250);
  });

  it('una tasa en cero o negativa no se toma por buena', () => {
    // Un cero haría que todos los saldos en dólares valieran nada.
    expect(calcularResumen(agruparProductos([]), 0).usaTasaDelDia).toBe(false);
    expect(calcularResumen(agruparProductos([]), -5).tasaDolar).toBe(
      TASA_DOLAR_RESPALDO,
    );
  });

  it('el porcentaje de activos sale del total consolidado', () => {
    const resumen = calcularResumen(
      agruparProductos([cuenta(750), tarjeta(250, 0)]),
    );

    expect(resumen.activosTotalesPesos).toBe(750);
    expect(resumen.pasivosTotalesPesos).toBe(250);
    expect(resumen.porcentajeActivos).toBe(75);
  });

  it('sin productos el porcentaje es cero, no NaN', () => {
    // La barra se dibuja vacía en vez de romperse.
    expect(calcularResumen(agruparProductos([])).porcentajeActivos).toBe(0);
  });
});
