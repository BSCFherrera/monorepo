import {
  parseProducto,
  type Producto,
} from '../../../dashboard/data/productContracts';
import { numeroVisible } from '../PaymentsHome';

/**
 * La pantalla con la que abre la pestaña de pagos.
 *
 * Se prueba la lógica que decide **qué se enseña de cada producto**, que es lo
 * que hace la pantalla útil o inútil: un número que el cliente no reconoce, o
 * un pago mínimo inventado, convierten la lista en un adivinanza.
 */

const tarjeta = (sobre: Record<string, unknown> = {}): Producto =>
  parseProducto({
    productCategory: 'TC',
    productIdentification: '4539123456780668',
    maskedCardNumber: '4539********0668',
    currencyCode: 214,
    productStatus: 'A',
    domesticCurrencyBalance: 12_500,
    minimumPaymentTcRd: 1_250,
    ...sobre,
  });

describe('numeroVisible', () => {
  it('una tarjeta usa el enmascarado que manda el core', () => {
    // Es el que el cliente lee en su plástico, así que es con el que la
    // reconoce. Recomponerlo por nuestra cuenta daría otro formato.
    expect(numeroVisible(tarjeta())).toBe('4539********0668');
  });

  it('un préstamo se compone con los últimos cuatro dígitos', () => {
    /*
      El core no manda enmascarado para un préstamo y el original lo compone
      como `****` más los últimos cuatro —`Loan.maskedNumber`—. Usar el
      enmascarado de tarjeta daría «**** **** **** 3276», que no es lo que el
      cliente ve en su contrato.
    */
    const prestamo = parseProducto({
      productCategory: 'PR',
      productIdentification: '293276',
      currencyCode: 214,
      productStatus: 'A',
      pendingBalancePr: 450_000,
    });

    expect(numeroVisible(prestamo)).toBe('****3276');
  });

  it('un enmascarado vacío no deja la fila sin número', () => {
    expect(numeroVisible(tarjeta({ maskedCardNumber: '' }))).toBe('****0668');
  });
});

describe('el pago mínimo, que es la mejora sobre el original', () => {
  /*
    La regla es la misma que el dashboard aplica en «Para hoy»: se enseña
    **solo cuando hay uno**. Una tarjeta de contado manda cero, y escribir
    «Mín. RD$ 0.00» le inventaría al cliente una obligación que no tiene —y le
    haría entrar a pagar algo que no debe.
  */
  it('una tarjeta con mínimo lo declara', () => {
    expect(tarjeta().pagoMinimoPesos).toBe(1_250);
    expect(tarjeta().pagoMinimoPesos > 0).toBe(true);
  });

  it('una tarjeta de contado no tiene mínimo que enseñar', () => {
    expect(tarjeta({ minimumPaymentTcRd: 0 }).pagoMinimoPesos > 0).toBe(false);
  });

  it('una tarjeta sin el campo tampoco', () => {
    // El core lo omite en vez de mandar cero en algunos productos.
    const sinCampo = parseProducto({
      productCategory: 'TC',
      productIdentification: '4539123456781234',
      currencyCode: 214,
      productStatus: 'A',
      domesticCurrencyBalance: 9_800,
    });

    expect(sinCampo.pagoMinimoPesos > 0).toBe(false);
  });
});
