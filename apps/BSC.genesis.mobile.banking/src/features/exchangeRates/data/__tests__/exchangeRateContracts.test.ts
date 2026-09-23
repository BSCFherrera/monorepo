import {
  convertirAPesos,
  nombreDeMoneda,
  parseTasas,
  simboloDeMoneda,
  type TasaDeCambio,
} from '../exchangeRateContracts';

/**
 * El contrato de `/currency-exchange/rates`.
 *
 * Responde con el sobre `Result<T>` porque pasa por MediatR. Leerlo como
 * `ApiResponse<T>` no produce ningún error: produce una tabla vacía, que es el
 * defecto que ya ha aparecido cuatro veces en esta migración.
 */

describe('parseTasas', () => {
  it('lee el sobre Result con la lista dentro', () => {
    const tasas = parseTasas({
      value: [
        { currency: 840, buys: 59.15, sales: 60.25 },
        { currency: 978, buys: 63.4, sales: 65.1 },
      ],
      isSuccess: true,
    });

    expect(tasas).toEqual<TasaDeCambio[]>([
      { moneda: 840, compra: 59.15, venta: 60.25 },
      { moneda: 978, compra: 63.4, venta: 65.1 },
    ]);
  });

  it('lee también el sobre en PascalCase', () => {
    const tasas = parseTasas({
      Value: [{ Currency: 840, Buys: 59.15, Sales: 60.25 }],
    });

    expect(tasas).toHaveLength(1);
    expect(tasas[0]?.compra).toBe(59.15);
  });

  it('acepta los números como texto, que es como a veces llegan del core', () => {
    const tasas = parseTasas({
      value: [{ currency: '840', buys: '59.15', sales: '60.25' }],
    });

    expect(tasas[0]).toEqual({ moneda: 840, compra: 59.15, venta: 60.25 });
  });

  it('una respuesta sin lista da el arreglo vacío y no lanza', () => {
    expect(parseTasas({ value: null })).toEqual([]);
    expect(parseTasas({})).toEqual([]);
    expect(parseTasas(null)).toEqual([]);
  });
});

describe('cómo se nombra cada moneda', () => {
  it('conoce el dólar y el euro, que son las dos que el backend devuelve', () => {
    expect(simboloDeMoneda(840)).toBe('US$');
    expect(nombreDeMoneda(840)).toBe('Dólar Estadounidense');
    expect(simboloDeMoneda(978)).toBe('EUR');
    expect(nombreDeMoneda(978)).toBe('Euro');
  });

  it('una moneda desconocida se muestra con su código en vez de desaparecer', () => {
    /*
      Es la lección del catálogo de productos: una categoría que el porte no
      conocía borraba la fila entera de la pantalla. Hoy el backend filtra a
      dólar y euro, pero si mañana añade una tercera, la tabla tiene que
      enseñarla aunque sea con su número.
    */
    expect(simboloDeMoneda(124)).toBe('124');
    expect(nombreDeMoneda(124)).toBe('Moneda 124');
  });
});

describe('convertirAPesos', () => {
  const dolar: TasaDeCambio = { moneda: 840, compra: 59.15, venta: 60.25 };

  it('con la tasa de venta usa la venta, y con la de compra la compra', () => {
    // La diferencia entre las dos es lo que el cliente viene a ver, así que
    // equivocar cuál se aplica sería el peor defecto posible de esta pantalla.
    expect(convertirAPesos(100, dolar, true)).toBeCloseTo(6_025, 2);
    expect(convertirAPesos(100, dolar, false)).toBeCloseTo(5_915, 2);
  });

  it('un monto en cero convierte a cero', () => {
    expect(convertirAPesos(0, dolar, true)).toBe(0);
  });
});
