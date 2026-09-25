import { parseProducto } from '../../../dashboard/data/productContracts';
import { parseDetalleDeTarjeta } from '../../../productDetail/data/creditCardDetailContracts';
import { TipoDeMonto, TipoDePago } from '../../data/paymentContracts';
import {
  montoDelPago,
  pagoMinimo,
  pagoVacio,
  type DatosDelPago,
} from '../paymentFlow';

/**
 * Regresión de **D-26**: el asistente de pagos toma el pago mínimo del
 * **detalle de la tarjeta**, no del listado de productos.
 *
 * El listado entrega los dos mínimos cambiados de moneda —ver
 * `pagoMinimoContradictorio.test.ts`, que fija la evidencia con las respuestas
 * reales del ambiente— y el detalle es el coherente. No se puede arreglar el
 * dato desde aquí (P-03: el core y el BFF no se tocan), así que el banco
 * decidió que la aplicación **pida el detalle** de la tarjeta que se va a
 * pagar y use su cifra.
 *
 * Esto no es una preferencia de estilo: es dinero. Con el mínimo del listado,
 * la tarjeta ****7147 ofrecía pagar **US$ 2,311.41** cuando lo que debe como
 * mínimo son **US$ 174.04**.
 */

const DEL_LISTADO = {
  productCategory: 'TC',
  productIdentification: '220818155480001032',
  maskedCardNumber: '****7147',
  currencyCode: '214',
  productStatus: 'Activa',
  currentBalance: 105509.79,
  availableBalance: 0,
  domesticCurrencyBalance: 62152.31,
  foreignCurrencyBalance: 2838.49,
  availablePurchasesDomestic: 0,
  availablePurchasesForeign: 0,
  minimumPaymentTcRd: 174.04,
  minimumPaymentTcUs: 2311.41,
  pendingBalancePr: 0,
};

const DEL_DETALLE = {
  NUM_TARJETA: '220818155480001032',
  PAGO_MINIMO_RD: 2311.41,
  PAGO_MINIMO_US: 174.04,
  SALDO_CORTE_RD: 33020.49,
  SALDO_CORTE_US: 2716.92,
  PAGO_TOTAL_RD: 31242.3,
  PAGO_TOTAL_US: 2716.92,
  SALDO_ACTUAL_RD: 62052.31,
  SALDO_ACTUAL_US: 2838.49,
  LIMITE_CREDITO_RD: 300000,
  LIMITE_CREDITO_US: 5000,
  ESTADO: 'Activa',
};

const detalle = parseDetalleDeTarjeta(DEL_DETALLE, {
  numeroDeTarjeta: DEL_DETALLE.NUM_TARJETA,
});

const datos = (extra: Partial<DatosDelPago> = {}): DatosDelPago => ({
  ...pagoVacio(TipoDePago.Tarjeta),
  producto: parseProducto(DEL_LISTADO),
  ...extra,
});

describe('el pago mínimo sale del detalle de la tarjeta', () => {
  it('en dólares usa el del detalle, no el del listado', () => {
    expect(
      pagoMinimo(datos({ moneda: 'USD', detalleDeLaTarjeta: detalle })),
    ).toBe(174.04);
  });

  it('en pesos usa el del detalle, no el del listado', () => {
    expect(
      pagoMinimo(datos({ moneda: 'DOP', detalleDeLaTarjeta: detalle })),
    ).toBe(2311.41);
  });

  it('el monto que se va a pagar es el del detalle', () => {
    expect(
      montoDelPago(
        datos({
          moneda: 'USD',
          tipoDeMonto: TipoDeMonto.Minimo,
          detalleDeLaTarjeta: detalle,
        }),
      ),
    ).toBe(174.04);
  });

  it('sin detalle todavía cargado cae al listado, sin romperse', () => {
    // El detalle viaja por la red: entre que se elige la tarjeta y llega la
    // respuesta hay un instante en el que solo está el listado. Que el
    // asistente se quede en blanco ahí sería peor que enseñar la cifra vieja.
    expect(pagoMinimo(datos({ moneda: 'USD' }))).toBe(2311.41);
  });

  it('un préstamo no consulta detalle de tarjeta', () => {
    const prestamo = datos({
      tipo: TipoDePago.Prestamo,
      detalleDeLaTarjeta: detalle,
    });

    expect(pagoMinimo(prestamo)).toBe(0);
  });
});
