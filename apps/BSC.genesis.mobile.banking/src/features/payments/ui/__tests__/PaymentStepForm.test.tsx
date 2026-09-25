import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer, { type ReactTestRendererJSON } from 'react-test-renderer';

import { parseProducto } from '../../../dashboard/data/productContracts';
import { parseDetalleDeTarjeta } from '../../../productDetail/data/creditCardDetailContracts';
import { TipoDeMonto, TipoDePago } from '../../data/paymentContracts';
import { pagoVacio, type DatosDelPago } from '../../domain/paymentFlow';
import { PaymentStepForm } from '../PaymentStepForm';

/**
 * El paso 1 del asistente de pagos, que es donde el cliente decide **cuánto
 * paga y de dónde sale**.
 *
 * Tres reglas de presentación que hasta ahora no vigilaba nadie y que deciden
 * dinero:
 *
 * - El **selector de moneda** solo aparece si la tarjeta tiene ciclo en
 *   dólares. Ofrecerlo en una que no lo tiene prometería un pago que el core
 *   rechazaría.
 * - **Una opción de monto en cero no se ofrece**: un «Pago Mínimo RD$ 0.00»
 *   se lee como que este mes no hay nada que pagar.
 * - La cifra de cada opción sale del **detalle de la tarjeta** cuando ya
 *   llegó, que es la decisión de D-26: el listado de productos entrega los dos
 *   mínimos cambiados de moneda.
 */

const TARJETA_MULTIMONEDA = {
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

/** Una tarjeta que solo opera en pesos: ni saldo, ni mínimo, ni disponible. */
const TARJETA_SOLO_PESOS = {
  ...TARJETA_MULTIMONEDA,
  productIdentification: '251128152660000900',
  maskedCardNumber: '****1853',
  foreignCurrencyBalance: 0,
  availablePurchasesForeign: 0,
  minimumPaymentTcUs: 0,
  domesticCurrencyBalance: 3454.33,
  minimumPaymentTcRd: 0,
};

const CUENTA = {
  productCategory: 'CA',
  productIdentification: '123456789',
  currencyCode: '214',
  productStatus: 'A',
  currentBalance: 50000,
  availableBalance: 50000,
  domesticCurrencyBalance: 0,
  foreignCurrencyBalance: 0,
  availablePurchasesDomestic: 0,
  availablePurchasesForeign: 0,
  minimumPaymentTcRd: 0,
  minimumPaymentTcUs: 0,
  pendingBalancePr: 0,
};

const DEL_DETALLE = parseDetalleDeTarjeta(
  {
    NUM_TARJETA: '220818155480001032',
    PAGO_MINIMO_RD: 2311.41,
    PAGO_MINIMO_US: 174.04,
    PAGO_TOTAL_RD: 31242.3,
    PAGO_TOTAL_US: 2716.92,
    SALDO_ACTUAL_RD: 62052.31,
    SALDO_ACTUAL_US: 2838.49,
    ESTADO: 'Activa',
  },
  { numeroDeTarjeta: '220818155480001032' },
);

const datosCon = (extra: Partial<DatosDelPago> = {}): DatosDelPago => ({
  ...pagoVacio(TipoDePago.Tarjeta),
  producto: parseProducto(TARJETA_MULTIMONEDA),
  cuentaOrigen: parseProducto(CUENTA),
  ...extra,
});

const montar = (datos: DatosDelPago): TestRenderer.ReactTestRenderer => {
  let arbol!: TestRenderer.ReactTestRenderer;

  TestRenderer.act(() => {
    arbol = TestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 800 },
          insets: { top: 24, left: 0, right: 0, bottom: 0 },
        }}
      >
        <PaymentStepForm
          datos={datos}
          productos={[datos.producto].filter(p => p !== null)}
          cuentas={[parseProducto(CUENTA)]}
          error={null}
          onProducto={() => {}}
          onCuenta={() => {}}
          onMoneda={() => {}}
          onTipoDeMonto={() => {}}
          onMontoEscrito={() => {}}
          onComentario={() => {}}
          onCancelar={() => {}}
          onContinuar={() => {}}
        />
      </SafeAreaProvider>,
    );
  });

  return arbol;
};

const textos = (arbol: TestRenderer.ReactTestRenderer): string => {
  const recoger = (nodo: ReactTestRendererJSON | string): string[] =>
    typeof nodo === 'string'
      ? [nodo]
      : (nodo.children ?? []).flatMap(h =>
          recoger(h as ReactTestRendererJSON | string),
        );

  const json = arbol.toJSON();
  if (json === null) return '';
  return (Array.isArray(json) ? json : [json]).flatMap(recoger).join(' ');
};

const existe = (arbol: TestRenderer.ReactTestRenderer, id: string): boolean =>
  arbol.root.findAll(n => n.props.testID === id, { deep: true }).length > 0;

describe('PaymentStepForm — el paso de «cuánto y de dónde»', () => {
  it('ofrece el selector de moneda en una tarjeta con ciclo en dólares', () => {
    expect(existe(montar(datosCon()), 'moneda-del-ciclo')).toBe(true);
  });

  it('no lo ofrece en una tarjeta que solo opera en pesos', () => {
    const soloPesos = datosCon({
      producto: parseProducto(TARJETA_SOLO_PESOS),
    });

    expect(existe(montar(soloPesos), 'moneda-del-ciclo')).toBe(false);
  });

  it('no ofrece una opción de monto que vale cero', () => {
    // Esta tarjeta no tiene mínimo ni saldo en dólares: solo queda «Otro».
    const sinCifras = datosCon({
      producto: parseProducto({
        ...TARJETA_SOLO_PESOS,
        domesticCurrencyBalance: 0,
      }),
    });
    const arbol = montar(sinCifras);

    expect(existe(arbol, `monto-${TipoDeMonto.Minimo}`)).toBe(false);
    expect(existe(arbol, `monto-${TipoDeMonto.AlCorte}`)).toBe(false);
    expect(existe(arbol, `monto-${TipoDeMonto.Otro}`)).toBe(true);
  });

  it('con el detalle cargado enseña el mínimo del detalle, no el del listado', () => {
    const enDolares = datosCon({
      moneda: 'USD',
      detalleDeLaTarjeta: DEL_DETALLE,
    });

    // D-26: el listado diría 2,311.41 para el ciclo en dólares.
    expect(textos(montar(enDolares))).toContain('174.04');
    expect(textos(montar(enDolares))).not.toContain('2,311.41');
  });

  it('sin detalle todavía cae al listado en vez de quedarse en blanco', () => {
    const enDolares = datosCon({ moneda: 'USD' });

    expect(textos(montar(enDolares))).toContain('2,311.41');
  });

  it('escribe los rótulos del original, y el monto antes que la cuenta', () => {
    const texto = textos(montar(datosCon()));

    expect(texto).toContain('MONTO A PAGAR');
    expect(texto).toContain('CUENTA ORIGEN');
    expect(texto.indexOf('MONTO A PAGAR')).toBeLessThan(
      texto.indexOf('CUENTA ORIGEN'),
    );
  });
});
