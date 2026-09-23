import type { AxiosInstance } from 'axios';

import { formatDateForCore } from '@bsc/shared';

import { Endpoints } from '../../../core/network/endpoints';
import { lastDaysRange } from '@bsc/utils';
import { type DateRange } from '@bsc/contracts';
import { ProductCategory } from '../../dashboard/data/productContracts';

import {
  parseDetalleDeCuenta,
  type DetalleDeCuenta,
} from './accountDetailContracts';
import {
  parseDetalleDeCertificado,
  type DetalleDeCertificado,
} from './certificateDetailContracts';
import {
  parseDetalleDeTarjeta,
  type DetalleDeTarjeta,
} from './creditCardDetailContracts';
import {
  parseDetalleDePrestamo,
  type DetalleDePrestamo,
} from './loanDetailContracts';
import {
  parseEstadoDeTarjeta,
  type EstadoDeTarjeta,
} from './creditCardStatementContracts';
import { extraerPdfEnBase64 } from './statementPdf';
import {
  esPeriodoSinMovimientos,
  extraerMovimientos,
  type Movimiento,
} from './transactionContracts';

/**
 * Detalle de producto y sus movimientos.
 *
 * Portado de `product_detail_remote_datasource.dart`. La complicación está en
 * que **cada tipo de producto se consulta en un endpoint distinto**, con
 * parámetros distintos: cuentas y tarjetas no comparten ni el nombre del campo
 * que identifica el producto. Aquí eso se resuelve en un solo sitio, de modo
 * que la pantalla pida «los movimientos de este producto» sin saber cuál es.
 */

export type { DateRange };

/**
 * Rango por defecto: los últimos 30 días.
 *
 * Es el que usa la app Flutter al abrir un producto. Pedir un rango más amplio
 * de entrada hace lenta la primera carga, que es la que el cliente siempre ve;
 * quien necesite más entra por la píldora «Personalizado», que llega a un año.
 *
 * El cálculo vive en `design-system/dateRange`, junto al de los atajos de la
 * hoja, para que «30 días» signifique lo mismo en los dos sitios. En la app
 * Flutter no coincidían: la píldora restaba treinta días completos —treinta y
 * uno de rango— y el atajo de la hoja restaba veintinueve.
 */
export function rangoPorDefecto(hoy: Date = new Date()): DateRange {
  return lastDaysRange(30, hoy);
}

/**
 * Saca el detalle del sobre `Result<T>` con el que responde el backend.
 *
 * **Sin esto todo el detalle sale en cero y sin un solo error.** El backend
 * envuelve la respuesta en `{ Value: … }` —a veces `value`, según cómo la
 * serialice el bus— y dentro puede venir el objeto directamente o una lista de
 * la que interesa el primer elemento. Quien lee luego busca `SAL_DISPONIBLE`
 * en el sobre, no lo encuentra, y la conversión tolerante devuelve cero: la
 * pantalla queda perfecta y con todos los saldos a cero.
 */
export function desenvolverDetalle(dato: unknown): Record<string, unknown> {
  if (typeof dato !== 'object' || dato === null) return {};

  if (Array.isArray(dato)) {
    const primero = dato[0];
    return typeof primero === 'object' && primero !== null
      ? (primero as Record<string, unknown>)
      : {};
  }

  const sobre = dato as Record<string, unknown>;
  const contenido = sobre.Value ?? sobre.value;

  if (contenido === undefined || contenido === null) return sobre;

  if (Array.isArray(contenido)) {
    const primero = contenido[0];
    return typeof primero === 'object' && primero !== null
      ? (primero as Record<string, unknown>)
      : {};
  }

  return typeof contenido === 'object'
    ? (contenido as Record<string, unknown>)
    : sobre;
}

export class ProductDetailRepository {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Detalle del producto.
   *
   * La respuesta trae los nombres de campo del core en español y mayúsculas, y
   * su forma **cambia según `productType`**. Se devuelve el objeto crudo: cada
   * tipo de producto lo interpreta a su manera, y normalizarlo aquí obligaría a
   * un modelo con veinte campos opcionales que nadie sabría leer.
   */
  async obtenerDetalle(
    numeroDeProducto: string,
    tipoDeProducto: string,
  ): Promise<Record<string, unknown>> {
    const respuesta = await this.http.get(Endpoints.productDetails, {
      params: { productNumber: numeroDeProducto, productType: tipoDeProducto },
    });

    const dato =
      typeof respuesta.data === 'string'
        ? (JSON.parse(respuesta.data) as unknown)
        : respuesta.data;

    return desenvolverDetalle(dato);
  }

  /**
   * Detalle de una cuenta de ahorros o corriente, ya interpretado.
   *
   * Se separa de `obtenerDetalle` porque cada tipo de producto interpreta la
   * misma respuesta a su manera: normalizar los cuatro en un solo modelo
   * obligaría a un objeto con cuarenta campos opcionales que nadie sabría leer,
   * y perder un campo ahí no rompe la pantalla, imprime un cero donde hay
   * dinero.
   */
  async obtenerDetalleDeCuenta(opciones: {
    numeroDeCuenta: string;
    codigoMoneda: number;
    tipoDeCuenta: string;
  }): Promise<DetalleDeCuenta> {
    const crudo = await this.obtenerDetalle(
      opciones.numeroDeCuenta,
      opciones.tipoDeCuenta,
    );

    return parseDetalleDeCuenta(crudo, opciones);
  }

  /** Detalle de un préstamo, ya interpretado. */
  async obtenerDetalleDePrestamo(opciones: {
    numeroDePrestamo: string;
    codigoMoneda: number;
  }): Promise<DetalleDePrestamo> {
    const crudo = await this.obtenerDetalle(
      opciones.numeroDePrestamo,
      ProductCategory.Loan,
    );

    return parseDetalleDePrestamo(crudo, opciones);
  }

  /**
   * Detalle de una tarjeta de crédito, ya interpretado.
   *
   * Trae **los dos juegos de importes**, en pesos y en dólares: no se consolida
   * ninguno aquí porque una tarjeta lleva los dos ciclos a la vez y sumarlos con
   * una tasa daría una cifra que no aparece en ningún estado de cuenta.
   */
  async obtenerDetalleDeTarjeta(opciones: {
    numeroDeTarjeta: string;
    numeroEnmascarado?: string;
  }): Promise<DetalleDeTarjeta> {
    const crudo = await this.obtenerDetalle(
      opciones.numeroDeTarjeta,
      ProductCategory.CreditCard,
    );

    return parseDetalleDeTarjeta(crudo, opciones);
  }

  /** Detalle de un certificado financiero, ya interpretado. */
  async obtenerDetalleDeCertificado(opciones: {
    numeroDeCertificado: string;
    codigoMoneda: number;
  }): Promise<DetalleDeCertificado> {
    const crudo = await this.obtenerDetalle(
      opciones.numeroDeCertificado,
      ProductCategory.Certificate,
    );

    return parseDetalleDeCertificado(crudo, opciones);
  }

  /**
   * Movimientos del producto, sea cual sea su tipo.
   *
   * **Un período sin movimientos no es un error.** El core responde con un
   * error HTTP cuando no hay nada en el rango, y tratarlo como tal mostraría
   * una pantalla roja a un cliente que simplemente no usó la cuenta ese mes.
   */
  async obtenerMovimientos(opciones: {
    numeroDeProducto: string;
    tipoDeProducto: string;
    codigoMoneda?: number;
    rango?: DateRange;
  }): Promise<Movimiento[]> {
    const rango = opciones.rango ?? rangoPorDefecto();
    const desde = formatDateForCore(rango.from);
    const hasta = formatDateForCore(rango.to);

    try {
      if (opciones.tipoDeProducto === ProductCategory.CreditCard) {
        const respuesta = await this.http.get(
          Endpoints.creditCardTransactions,
          {
            params: {
              creditCardNumber: opciones.numeroDeProducto,
              currencyCode: String(opciones.codigoMoneda ?? 214),
              startDate: desde,
              endDate: hasta,
            },
          },
        );
        return extraerMovimientos(respuesta.data);
      }

      if (opciones.tipoDeProducto === ProductCategory.Loan) {
        // **GET, no POST**, aunque la ruta termine en `/retrieve`. Lo confirmó
        // la prueba de paridad contra el Swagger del backend: usarlo con POST
        // compila igual y devuelve 405 en ejecución, justo cuando un cliente
        // abre su préstamo.
        //
        // El parámetro además se llama `loanCode` y no `loanNumber`, y el
        // backend espera la moneda, que las cuentas no piden.
        const respuesta = await this.http.get(Endpoints.loanTransactions, {
          params: {
            loanCode: opciones.numeroDeProducto,
            currencyCode: String(opciones.codigoMoneda ?? 214),
            startDate: desde,
            endDate: hasta,
          },
        });
        return extraerMovimientos(respuesta.data);
      }

      // Cuentas de ahorro, corrientes y certificados comparten endpoint.
      const respuesta = await this.http.get(Endpoints.accountTransactions, {
        params: {
          accountNumber: opciones.numeroDeProducto,
          startDate: desde,
          endDate: hasta,
        },
      });
      return extraerMovimientos(respuesta.data);
    } catch (causa) {
      if (esPeriodoSinMovimientos(causa)) return [];
      throw causa;
    }
  }

  /**
   * El estado de cuenta cerrado de un ciclo de la tarjeta.
   *
   * Es una consulta distinta a la del detalle, y trae lo que el detalle no
   * puede responder: cuántas compras tuvo el ciclo, sobre qué balance se
   * calcula el cargo financiero y qué pasó con los puntos del mes.
   */
  async obtenerEstadoDeTarjeta(opciones: {
    numeroDeTarjeta: string;
    codigoMoneda: number;
    mes: number;
    anio: number;
  }): Promise<EstadoDeTarjeta> {
    const respuesta = await this.http.post(
      Endpoints.creditCardStatement,
      cuerpoDelCiclo(opciones),
    );

    const dato =
      typeof respuesta.data === 'string'
        ? (JSON.parse(respuesta.data) as unknown)
        : respuesta.data;

    return parseEstadoDeTarjeta(desenvolverDetalle(dato));
  }

  /**
   * El PDF del estado de cuenta de la tarjeta, en base64.
   *
   * Devuelve **indefinido cuando el ciclo no tiene estado**, en vez de una
   * cadena vacía: guardarla produciría un archivo de cero bytes que ningún
   * lector abre, y el cliente no tendría forma de saber que el problema no es
   * su teléfono.
   */
  async obtenerPdfDeEstadoDeTarjeta(opciones: {
    numeroDeTarjeta: string;
    codigoMoneda: number;
    mes: number;
    anio: number;
  }): Promise<string | undefined> {
    const respuesta = await this.http.post(
      Endpoints.creditCardStatementPdf,
      cuerpoDelCiclo(opciones),
    );

    return extraerPdfEnBase64(respuesta.data);
  }

  /**
   * El PDF del estado de cuenta de una cuenta, en base64.
   *
   * Las fechas viajan **con guiones**, que es lo que espera el core. Es el
   * mismo formato que hubo que corregir en la consulta de movimientos: con
   * barras el core responde «sin registros» y el estado sale vacío sin ningún
   * error visible.
   */
  async obtenerPdfDeEstadoDeCuenta(opciones: {
    numeroDeCuenta: string;
    desde: Date;
    hasta: Date;
  }): Promise<string | undefined> {
    const respuesta = await this.http.get(Endpoints.accountStatementPdf, {
      params: {
        accountNumber: opciones.numeroDeCuenta,
        startDate: formatDateForCore(opciones.desde),
        endDate: formatDateForCore(opciones.hasta),
      },
    });

    return extraerPdfEnBase64(respuesta.data);
  }
}

/**
 * El cuerpo que comparten las dos consultas de estado de tarjeta.
 *
 * El mes va **con cero a la izquierda y como cadena**, igual que en el
 * original: el core lo compara como texto y `7` no encuentra el ciclo que sí
 * encuentra `07`.
 */
function cuerpoDelCiclo(opciones: {
  numeroDeTarjeta: string;
  codigoMoneda: number;
  mes: number;
  anio: number;
}): Record<string, string> {
  return {
    creditCardNumber: opciones.numeroDeTarjeta,
    currencyCode: String(opciones.codigoMoneda),
    statementMonth: String(opciones.mes).padStart(2, '0'),
    statementYear: String(opciones.anio),
  };
}
