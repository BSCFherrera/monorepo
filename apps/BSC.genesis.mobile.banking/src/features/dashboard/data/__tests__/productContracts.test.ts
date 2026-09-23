import {
  aNumero,
  aEntero,
  aTexto,
  parseProducto,
  parseRespuestaProductos,
  agruparProductos,
  nombreDeCategoria,
  ProductCategory,
  type Producto,
} from '../productContracts';

describe('conversión tolerante del core', () => {
  it('acepta montos como número o como cadena', () => {
    // El core manda las dos formas según el endpoint.
    expect(aNumero(1234.5)).toBe(1234.5);
    expect(aNumero('1234.5')).toBe(1234.5);
    expect(aNumero('  1234.5  ')).toBe(1234.5);
  });

  it('acepta montos con separador de millar', () => {
    expect(aNumero('1,234.50')).toBe(1234.5);
  });

  it('un valor ausente o ilegible cae al valor por defecto', () => {
    for (const valor of [null, undefined, '', 'abc', {}, NaN, Infinity]) {
      expect({ valor, resultado: aNumero(valor) }).toEqual({
        valor,
        resultado: 0,
      });
    }
  });

  it('los enteros truncan en vez de redondear', () => {
    expect(aEntero(214.9)).toBe(214);
    expect(aEntero('840')).toBe(840);
    expect(aEntero('x', 214)).toBe(214);
  });

  it('el texto se recorta y los vacíos caen al valor por defecto', () => {
    expect(aTexto('  CA  ')).toBe('CA');
    expect(aTexto('   ', 'sin-dato')).toBe('sin-dato');
    expect(aTexto(null, 'sin-dato')).toBe('sin-dato');
  });
});

describe('parseProducto', () => {
  it('lee los campos en PascalCase', () => {
    const producto = parseProducto({
      ProductCategory: 'CA',
      ProductIdentification: '11042010013953',
      CurrencyCode: '214',
      ProductStatus: 'A',
      CurrentBalance: '25000.50',
      AvailableBalance: 24000,
    });

    expect(producto.categoria).toBe('CA');
    expect(producto.identificacion).toBe('11042010013953');
    expect(producto.codigoMoneda).toBe(214);
    expect(producto.saldoActual).toBe(25000.5);
    expect(producto.saldoDisponible).toBe(24000);
  });

  it('lee los mismos campos en camelCase', () => {
    const producto = parseProducto({
      productCategory: 'TC',
      productIdentification: '4539',
      currencyCode: 840,
      currentBalance: 100,
    });

    expect(producto.categoria).toBe('TC');
    expect(producto.codigoMoneda).toBe(840);
  });

  it('sin moneda asume pesos, que es la moneda del país', () => {
    expect(parseProducto({ ProductCategory: 'CA' }).codigoMoneda).toBe(214);
  });

  it('el número de tarjeta es opcional', () => {
    expect(
      parseProducto({ ProductCategory: 'CA' }).numeroEnmascarado,
    ).toBeUndefined();
    expect(
      parseProducto({ MaskedCardNumber: '**** 0668' }).numeroEnmascarado,
    ).toBe('**** 0668');
  });

  it('tolera un producto que no es un objeto sin reventar', () => {
    // Una fila corrupta en la respuesta no debe tumbar todo el dashboard.
    const producto = parseProducto('basura');
    expect(producto.categoria).toBe('');
    expect(producto.saldoActual).toBe(0);
  });
});

describe('parseRespuestaProductos', () => {
  const RESPUESTA_OK = {
    ResultCode: 0,
    Products: [
      {
        ProductCategory: 'CA',
        ProductIdentification: '1',
        CurrentBalance: 100,
      },
      {
        ProductCategory: 'TC',
        ProductIdentification: '2',
        CurrentBalance: 200,
      },
    ],
  };

  it('interpreta la lista de productos', () => {
    const respuesta = parseRespuestaProductos(RESPUESTA_OK);

    expect(respuesta.codigoResultado).toBe(0);
    expect(respuesta.productos).toHaveLength(2);
  });

  it('conserva el código de resultado del core', () => {
    // El core devuelve fallos de negocio DENTRO de un HTTP 200. Ignorarlo
    // mostraría una lista vacía como si el cliente no tuviera productos.
    const respuesta = parseRespuestaProductos({
      ResultCode: 5,
      ResultMessage: 'Cliente no encontrado',
      Products: [],
    });

    expect(respuesta.codigoResultado).toBe(5);
    expect(respuesta.mensaje).toBe('Cliente no encontrado');
  });

  it('acepta la respuesta como cadena JSON', () => {
    // Algunas respuestas del core llegan así.
    const respuesta = parseRespuestaProductos(JSON.stringify(RESPUESTA_OK));
    expect(respuesta.productos).toHaveLength(2);
  });

  it('una respuesta sin lista devuelve cero productos, no falla', () => {
    expect(parseRespuestaProductos({ ResultCode: 0 }).productos).toEqual([]);
  });

  it('rechaza lo que no es una respuesta', () => {
    expect(() => parseRespuestaProductos(42)).toThrow();
    expect(() => parseRespuestaProductos(null)).toThrow();
  });
});

describe('agrupación por categoría', () => {
  const producto = (categoria: string): Producto =>
    parseProducto({
      ProductCategory: categoria,
      ProductIdentification: categoria,
    });

  it('separa cuentas, tarjetas, préstamos y certificados', () => {
    const agrupados = agruparProductos([
      producto('CA'),
      producto('CC'),
      producto('TC'),
      producto('PR'),
      producto('CD'),
    ]);

    expect(agrupados.cuentas).toHaveLength(2);
    expect(agrupados.tarjetas).toHaveLength(1);
    expect(agrupados.prestamos).toHaveLength(1);
    expect(agrupados.certificados).toHaveLength(1);
  });

  it('NO descarta las categorías que no conoce', () => {
    // En la app Flutter el `switch` sin `default` hacía que un producto con una
    // categoría nueva desapareciera de la pantalla sin dejar rastro. El cliente
    // vería menos productos de los que tiene y nadie se enteraría.
    const agrupados = agruparProductos([producto('XX'), producto('CA')]);

    expect(agrupados.desconocidos).toHaveLength(1);
    expect(agrupados.desconocidos[0]?.categoria).toBe('XX');
    expect(agrupados.cuentas).toHaveLength(1);
  });

  it('una lista vacía produce grupos vacíos, no undefined', () => {
    const agrupados = agruparProductos([]);

    expect(agrupados.cuentas).toEqual([]);
    expect(agrupados.desconocidos).toEqual([]);
  });
});

describe('nombres de categoría', () => {
  it('nombra cada categoría conocida', () => {
    expect(nombreDeCategoria(ProductCategory.Savings)).toBe(
      'Cuenta de Ahorros',
    );
    expect(nombreDeCategoria(ProductCategory.Checking)).toBe(
      'Cuenta Corriente',
    );
    expect(nombreDeCategoria(ProductCategory.CreditCard)).toBe(
      'Tarjeta de Crédito',
    );
    expect(nombreDeCategoria(ProductCategory.Loan)).toBe('Préstamo');
    expect(nombreDeCategoria(ProductCategory.Certificate)).toBe('Certificado');
  });

  it('una categoría desconocida tiene un nombre genérico, no vacío', () => {
    expect(nombreDeCategoria('XX')).toBe('Producto');
  });
});
