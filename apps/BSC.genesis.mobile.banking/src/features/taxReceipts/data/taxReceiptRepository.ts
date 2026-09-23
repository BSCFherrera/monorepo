import type { AxiosInstance } from 'axios';

import { formatDateForCore } from '@bsc/shared';

import { Endpoints } from '../../../core/network/endpoints';

import {
  esPeriodoSinComprobantes,
  parseComprobantes,
  parseDetalleDeComprobante,
  parseMovimientoDelComprobante,
  type Comprobante,
  type DetalleDeComprobante,
  type MovimientoDelComprobante,
} from './taxReceiptContracts';

/**
 * Habla con `/customer-billing-procedure/*`.
 *
 * Portado de `tax_receipt_repository.dart`. Son los «Comprobantes Fiscales» que
 * el portal expone bajo Consultas.
 *
 * ⚠️ **Las fechas viajan con guiones**, `27-05-2026`, no con barras. Es el
 * defecto que dejó sin datos a toda consulta de movimientos en la oleada 3: el
 * backend no interpreta la fecha, la reenvía al core tal cual, y el core
 * responde «no se encontraron registros» —que aquí se traduce a lista vacía—,
 * de modo que la pantalla se queda en blanco sin un solo error a la vista.
 */

export interface ConsultaDeComprobantes {
  codigoDeCliente: string;
  numeroDeCuenta: string;
  /** ISO numérico como texto, tal como viene del producto. */
  codigoDeMoneda: string;
  desde: Date;
  hasta: Date;
}

export class TaxReceiptRepository {
  constructor(private readonly http: AxiosInstance) {}

  async buscar(consulta: ConsultaDeComprobantes): Promise<Comprobante[]> {
    try {
      const respuesta = await this.http.get(Endpoints.ncfSummary, {
        params: {
          customerCode: consulta.codigoDeCliente,
          accountNumber: consulta.numeroDeCuenta,
          currencyCode: consulta.codigoDeMoneda,
          startDate: formatDateForCore(consulta.desde),
          endDate: formatDateForCore(consulta.hasta),
        },
      });

      return parseComprobantes(respuesta.data);
    } catch (causa) {
      // Un período vacío llega como 400 con «no se encontraron registros». No
      // es un fallo y la pantalla no debe enseñar uno.
      if (esPeriodoSinComprobantes(causa)) return [];
      throw causa;
    }
  }

  /**
   * El detalle del comprobante.
   *
   * Devuelve nulo en vez de lanzar: la hoja ya enseña la cabecera con lo que
   * trajo la lista, y que el core no amplíe un NCF concreto no debe tumbar la
   * hoja entera.
   */
  async detalle(
    codigoDeCliente: string,
    ncf: string,
  ): Promise<DetalleDeComprobante | null> {
    try {
      const respuesta = await this.http.get(Endpoints.ncfDetail, {
        params: { customerCode: codigoDeCliente, ncfCode: ncf },
      });
      return parseDetalleDeComprobante(respuesta.data);
    } catch {
      return null;
    }
  }

  /** El movimiento que produjo el comprobante. Nulo con el mismo criterio. */
  async movimiento(ncf: string): Promise<MovimientoDelComprobante | null> {
    try {
      const respuesta = await this.http.get(Endpoints.ncfTransactionDetail, {
        params: { ncfCode: ncf },
      });
      return parseMovimientoDelComprobante(respuesta.data);
    } catch {
      return null;
    }
  }
}
