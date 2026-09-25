import { parseProducto } from '../../../dashboard/data/productContracts';
import {
  montosEnMoneda,
  parseDetalleDeTarjeta,
} from '../../../productDetail/data/creditCardDetailContracts';

/**
 * El pago mínimo de una tarjeta **llega invertido entre monedas** según por
 * dónde se pregunte.
 *
 * Los dos juegos de datos de abajo son la respuesta literal del ambiente el
 * 2026-09-17 para el cliente 80191, capturada con el backend levantado. No son
 * ejemplos inventados: son el servidor hablando, igual que los vectores de la
 * huella de operación.
 *
 * - `products/get-products-by-customer-id` dice, para la tarjeta ****7147,
 *   mínimo **RD$ 174.04** y **US$ 2,311.41**.
 * - `products/details` dice, para la misma tarjeta, mínimo **RD$ 2,311.41** y
 *   **US$ 174.04**.
 *
 * **Cuál de los dos es el bueno se puede decidir sin preguntar**, y por eso
 * esta prueba existe: el detalle es coherente consigo mismo y el listado no.
 * En la tarjeta ****7473 el listado afirma un mínimo de **US$ 1,351.82** sobre
 * un saldo al corte en dólares de **US$ 122.34** — once veces lo que se debe—,
 * mientras que el detalle coloca esa misma cifra en pesos, donde el saldo al
 * corte es RD$ 22,347.33 y el mínimo sale al 6 %.
 *
 * **Ni el porte ni el portal Nuxt hacen la inversión.** Los dos leen
 * `MinimumPaymentTcRd` y `MinimumPaymentTcUs` tal cual, igual que la app
 * Flutter (`product_models.dart`), y el BFF los copia uno a uno desde
 * `CoreBankingProduct` sin renombrar nada. El origen es el core.
 *
 * Queda escalado como **D-26**. La prueba no arregla el dato —no se puede desde
 * aquí—: lo deja fijado, de modo que el día que el core se corrija esta prueba
 * falle y avise de que hay que revisar las pantallas que hoy lo compensan.
 */

/** Tal como lo devuelve el listado de productos. */
const DEL_LISTADO_7147 = {
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

const DEL_LISTADO_7473 = {
  ...DEL_LISTADO_7147,
  productIdentification: '240805171640001764',
  maskedCardNumber: '****7473',
  domesticCurrencyBalance: 24571.4,
  foreignCurrencyBalance: 1280.87,
  minimumPaymentTcRd: 0,
  minimumPaymentTcUs: 1351.82,
};

/** Tal como lo devuelve el detalle, con los nombres del core. */
const DEL_DETALLE_7147 = {
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

const DEL_DETALLE_7473 = {
  ...DEL_DETALLE_7147,
  NUM_TARJETA: '240805171640001764',
  PAGO_MINIMO_RD: 1351.82,
  PAGO_MINIMO_US: 0,
  SALDO_CORTE_RD: 22347.33,
  SALDO_CORTE_US: 122.34,
  PAGO_TOTAL_RD: 22347.33,
  PAGO_TOTAL_US: 122.34,
};

const DOP = 214;
const USD = 840;

const detalle = (crudo: Record<string, unknown>) =>
  parseDetalleDeTarjeta(crudo, {
    numeroDeTarjeta: String(crudo.NUM_TARJETA),
  });

describe('D-26 — el pago mínimo llega invertido entre monedas', () => {
  it('el listado y el detalle se contradicen en la misma tarjeta', () => {
    const listado = parseProducto(DEL_LISTADO_7147);
    const montos = montosEnMoneda(detalle(DEL_DETALLE_7147), DOP);
    const montosUsd = montosEnMoneda(detalle(DEL_DETALLE_7147), USD);

    expect(listado.pagoMinimoPesos).toBe(174.04);
    expect(montos.pagoMinimo).toBe(2311.41);

    expect(listado.pagoMinimoDolares).toBe(2311.41);
    expect(montosUsd.pagoMinimo).toBe(174.04);

    // Una es la otra, cambiada de sitio.
    expect(listado.pagoMinimoPesos).toBe(montosUsd.pagoMinimo);
    expect(listado.pagoMinimoDolares).toBe(montos.pagoMinimo);
  });

  it('el listado propone un mínimo once veces mayor que lo que se debe', () => {
    const listado = parseProducto(DEL_LISTADO_7473);
    const enDolares = montosEnMoneda(detalle(DEL_DETALLE_7473), USD);

    // US$ 1,351.82 de mínimo sobre US$ 122.34 al corte: imposible.
    expect(listado.pagoMinimoDolares).toBeGreaterThan(
      enDolares.saldoAlCorte * 10,
    );
  });

  it('el detalle sí guarda una proporción creíble en las dos monedas', () => {
    const enPesos = montosEnMoneda(detalle(DEL_DETALLE_7147), DOP);
    const enDolares = montosEnMoneda(detalle(DEL_DETALLE_7147), USD);

    const proporcion = (m: { pagoMinimo: number; saldoAlCorte: number }) =>
      m.pagoMinimo / m.saldoAlCorte;

    expect(proporcion(enPesos)).toBeGreaterThan(0.03);
    expect(proporcion(enPesos)).toBeLessThan(0.15);
    expect(proporcion(enDolares)).toBeGreaterThan(0.03);
    expect(proporcion(enDolares)).toBeLessThan(0.15);
  });

  it('el porte lee los dos campos tal cual, sin invertir nada', () => {
    // Si alguien "arregla" esto invirtiendo el contrato del porte, la
    // corrección quedaría escondida y el día que el core se arregle volvería
    // el defecto. La compensación, si se decide, va en la pantalla.
    const listado = parseProducto(DEL_LISTADO_7147);

    expect(listado.pagoMinimoPesos).toBe(DEL_LISTADO_7147.minimumPaymentTcRd);
    expect(listado.pagoMinimoDolares).toBe(DEL_LISTADO_7147.minimumPaymentTcUs);
  });
});
