/**
 * Contratos de productos del cliente.
 *
 * El core bancario devuelve los montos a veces como número y a veces como
 * cadena, y los nombres de campo en PascalCase o camelCase según el endpoint.
 * La app Flutter lo resuelve con tres ayudantes de conversión tolerante
 * (`_toDouble`, `_toInt`, `_toStr`), y hay que conservar esa tolerancia: el
 * backend no se modifica.
 *
 * Lo que sí cambia es que aquí **una forma inesperada se detecta**, en vez de
 * convertirse silenciosamente en cero. Un saldo que aparece en cero porque el
 * campo cambió de nombre es peor que un error visible.
 */

/** Categorías de producto del core. */
export const ProductCategory = {
  /** Cuenta de ahorros. */
  Savings: 'CA',
  /** Cuenta corriente. */
  Checking: 'CC',
  /** Tarjeta de crédito. */
  CreditCard: 'TC',
  /** Préstamo. */
  Loan: 'PR',
  /** Certificado financiero. */
  Certificate: 'CD',
} as const;

export type ProductCategory =
  (typeof ProductCategory)[keyof typeof ProductCategory];

/** Convierte a número tolerando cadenas, nulos y formas inesperadas. */
export function aNumero(valor: unknown, porDefecto = 0): number {
  if (typeof valor === 'number')
    return Number.isFinite(valor) ? valor : porDefecto;
  if (typeof valor === 'string') {
    const limpio = valor.trim().replace(/,/g, '');
    if (limpio === '') return porDefecto;
    const numero = Number(limpio);
    return Number.isFinite(numero) ? numero : porDefecto;
  }
  return porDefecto;
}

/** Convierte a entero con la misma tolerancia. */
export function aEntero(valor: unknown, porDefecto = -1): number {
  const numero = aNumero(valor, Number.NaN);
  return Number.isFinite(numero) ? Math.trunc(numero) : porDefecto;
}

/** Convierte a cadena recortada. */
export function aTexto(valor: unknown, porDefecto = ''): string {
  if (valor === null || valor === undefined) return porDefecto;
  const texto = String(valor).trim();
  return texto === '' ? porDefecto : texto;
}

/** Lee un campo probando PascalCase y camelCase. */
function campo(fuente: Record<string, unknown>, ...nombres: string[]): unknown {
  for (const nombre of nombres) {
    if (fuente[nombre] !== undefined && fuente[nombre] !== null) {
      return fuente[nombre];
    }
  }
  return undefined;
}

export interface Producto {
  categoria: string;
  /** Número de cuenta, préstamo o certificado. */
  identificacion: string;
  /** Código de moneda del core: 214 peso, 840 dólar. */
  codigoMoneda: number;
  estado: string;

  saldoActual: number;
  saldoDisponible: number;

  /** Solo tarjetas: número enmascarado tal como lo manda el core. */
  numeroEnmascarado: string | undefined;

  // Campos propios de tarjeta de crédito.
  saldoPesos: number;
  saldoDolares: number;
  disponiblePesos: number;
  disponibleDolares: number;
  pagoMinimoPesos: number;
  pagoMinimoDolares: number;

  /** Solo préstamos. */
  saldoPendiente: number;
}

export function parseProducto(crudo: unknown): Producto {
  const fuente =
    typeof crudo === 'object' && crudo !== null
      ? (crudo as Record<string, unknown>)
      : {};

  const numeroEnmascarado = aTexto(
    campo(fuente, 'maskedCardNumber', 'MaskedCardNumber'),
  );

  return {
    categoria: aTexto(campo(fuente, 'productCategory', 'ProductCategory')),
    identificacion: aTexto(
      campo(fuente, 'productIdentification', 'ProductIdentification'),
    ),
    codigoMoneda: aEntero(campo(fuente, 'currencyCode', 'CurrencyCode'), 214),
    estado: aTexto(campo(fuente, 'productStatus', 'ProductStatus')),

    saldoActual: aNumero(campo(fuente, 'currentBalance', 'CurrentBalance')),
    saldoDisponible: aNumero(
      campo(fuente, 'availableBalance', 'AvailableBalance'),
    ),

    numeroEnmascarado: numeroEnmascarado === '' ? undefined : numeroEnmascarado,

    saldoPesos: aNumero(
      campo(fuente, 'domesticCurrencyBalance', 'DomesticCurrencyBalance'),
    ),
    saldoDolares: aNumero(
      campo(fuente, 'foreignCurrencyBalance', 'ForeignCurrencyBalance'),
    ),
    disponiblePesos: aNumero(
      campo(fuente, 'availablePurchasesDomestic', 'AvailablePurchasesDomestic'),
    ),
    disponibleDolares: aNumero(
      campo(fuente, 'availablePurchasesForeign', 'AvailablePurchasesForeign'),
    ),
    pagoMinimoPesos: aNumero(
      campo(fuente, 'minimumPaymentTcRd', 'MinimumPaymentTcRd'),
    ),
    pagoMinimoDolares: aNumero(
      campo(fuente, 'minimumPaymentTcUs', 'MinimumPaymentTcUs'),
    ),

    saldoPendiente: aNumero(
      campo(fuente, 'pendingBalancePr', 'PendingBalancePr'),
    ),
  };
}

export interface RespuestaProductos {
  codigoResultado: number;
  mensaje: string | undefined;
  productos: Producto[];
}

/**
 * Interpreta la respuesta de `/products/get-products-by-customer-id`.
 *
 * El core devuelve un `resultCode` propio **dentro de una respuesta HTTP 200**:
 * un fallo de negocio no viaja como error HTTP. Ignorarlo mostraría una lista
 * vacía como si el cliente no tuviera productos.
 */
export function parseRespuestaProductos(cuerpo: unknown): RespuestaProductos {
  // Algunas respuestas del core llegan como cadena JSON en vez de objeto.
  const dato =
    typeof cuerpo === 'string' ? (JSON.parse(cuerpo) as unknown) : cuerpo;

  if (typeof dato !== 'object' || dato === null) {
    throw new Error('La respuesta de productos no es un objeto');
  }

  const raiz = dato as Record<string, unknown>;
  const lista = campo(raiz, 'products', 'Products');
  const mensaje = aTexto(campo(raiz, 'resultMessage', 'ResultMessage'));

  return {
    codigoResultado: aEntero(campo(raiz, 'resultCode', 'ResultCode'), -1),
    mensaje: mensaje === '' ? undefined : mensaje,
    productos: Array.isArray(lista) ? lista.map(parseProducto) : [],
  };
}

export interface ProductosAgrupados {
  cuentas: Producto[];
  tarjetas: Producto[];
  prestamos: Producto[];
  certificados: Producto[];
  /** Categorías que el core mandó y la app no conoce. */
  desconocidos: Producto[];
}

/**
 * Agrupa los productos por categoría.
 *
 * A diferencia de la app Flutter, **las categorías desconocidas no se
 * descartan**: allí el `switch` sin `default` hacía que un producto con una
 * categoría nueva desapareciera de la pantalla sin dejar rastro. Aquí quedan
 * aparte, para poder mostrarlos o al menos registrarlos.
 */
export function agruparProductos(productos: Producto[]): ProductosAgrupados {
  const agrupados: ProductosAgrupados = {
    cuentas: [],
    tarjetas: [],
    prestamos: [],
    certificados: [],
    desconocidos: [],
  };

  for (const producto of productos) {
    switch (producto.categoria) {
      case ProductCategory.Savings:
      case ProductCategory.Checking:
        agrupados.cuentas.push(producto);
        break;
      case ProductCategory.CreditCard:
        agrupados.tarjetas.push(producto);
        break;
      case ProductCategory.Loan:
        agrupados.prestamos.push(producto);
        break;
      case ProductCategory.Certificate:
        agrupados.certificados.push(producto);
        break;
      default:
        agrupados.desconocidos.push(producto);
    }
  }

  return agrupados;
}

/** Nombre legible de la categoría, para la interfaz. */
export function nombreDeCategoria(categoria: string): string {
  // Mayúsculas como en el original (`displayName` de cada entidad): son los
  // nombres comerciales de los productos, no frases sueltas, y salen así en
  // los contratos y en el portal.
  switch (categoria) {
    case ProductCategory.Savings:
      return 'Cuenta de Ahorros';
    case ProductCategory.Checking:
      return 'Cuenta Corriente';
    case ProductCategory.CreditCard:
      return 'Tarjeta de Crédito';
    case ProductCategory.Loan:
      return 'Préstamo';
    case ProductCategory.Certificate:
      return 'Certificado';
    default:
      return 'Producto';
  }
}
