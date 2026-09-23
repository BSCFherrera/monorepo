import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';
import { mensajeDeError } from '../../../core/network/envelopes';

import {
  parseComisionesDePago,
  parseResultadoDePago,
  SIN_COMISIONES_DE_PAGO,
  type ComisionesDePago,
  type ResultadoDePago,
} from './paymentContracts';
import {
  huellaDePagoDePrestamo,
  huellaDePagoDeTarjeta,
  type CuerpoDePagoDePrestamo,
  type CuerpoDePagoDeTarjeta,
} from './paymentFingerprint';

/**
 * Habla con los endpoints de pago.
 *
 * Portado de `payment_remote_datasource.dart`. Igual que en transferencias, el
 * cuerpo se arma una vez y la huella sale de él.
 *
 * **El canal se envía como `BSCMOVIL`.** El original manda `BSCLWEB`, que es el
 * de la banca en línea: con eso, las operaciones hechas desde el teléfono
 * quedan registradas en el core como si vinieran del portal, y nadie puede
 * distinguirlas después. Es una corrección deliberada y está anotada.
 */

const CANAL = 'BSCMOVIL';

export interface OrdenDePagoDeTarjeta {
  numeroDeTarjeta: string;
  cuentaOrigen: string;
  /** Lo que se debita: monto más comisión e impuesto. */
  monto: number;
  monedaDelPago: number;
  customerCode: string;
  comentario?: string | undefined;
  tipoDeCuentaOrigen: number;
  nombreDeCuentaOrigen: string;
  monedaDeCuentaOrigen: number;
  nombreDeLaTarjeta: string;
  montoConvertido?: number | undefined;
  monedaConvertida?: number | undefined;
  tasa?: string | undefined;
  comision: number;
  impuesto: number;
}

export interface OrdenDePagoDePrestamo {
  numeroDePrestamo: string;
  cuentaOrigen: string;
  monto: number;
  moneda: number;
  customerCode: string;
  /** 1 cuando se paga la cuota, 0 cuando es otro monto. */
  numeroDeCuota: number;
  /** 1 cuota, 2 abono a capital. */
  tipoDePago: number;
}

export class PaymentRepository {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Comisión e impuesto.
   *
   * **Un préstamo no las tiene**: el original devuelve cero sin preguntar, y
   * aquí tampoco se consulta, para no enseñar una comisión que el core no va a
   * cobrar.
   */
  async comisiones(parametros: {
    codigoDeCliente: number;
    tipoDeProductoOrigen: number;
    tipoDeProductoDestino: number;
    monedaOrigen: number;
    monedaDestino: number;
    monto: number;
    cuentaOrigen: string;
    cuentaDestino: string;
    documentoTipo: number;
    documentoNumero: string;
  }): Promise<ComisionesDePago> {
    try {
      const respuesta = await this.http.get(Endpoints.transferFeesSummary, {
        params: {
          clientCode: parametros.codigoDeCliente,
          sourceProductType: parametros.tipoDeProductoOrigen,
          destinationProductType: parametros.tipoDeProductoDestino,
          sourceCurrency: parametros.monedaOrigen,
          destinationCurrency: parametros.monedaDestino,
          amount: parametros.monto,
          sourceAccount: parametros.cuentaOrigen,
          destinationAccount: parametros.cuentaDestino,
          idDocumentType: parametros.documentoTipo,
          idDocumentNumber: parametros.documentoNumero,
        },
      });
      return parseComisionesDePago(respuesta.data);
    } catch {
      return SIN_COMISIONES_DE_PAGO;
    }
  }

  // ─── Tarjeta ──────────────────────────────────────────────────────────────

  cuerpoDeTarjeta(orden: OrdenDePagoDeTarjeta): CuerpoDePagoDeTarjeta & {
    transactionId: number;
    customerCode: string;
    channel: string;
    comment: string;
    sourceAccountType: number;
    sourceAccountName: string;
    sourceCurrencyCode: number;
    destinationAccountName: string;
    destinationCurrencyCode: number;
    convertedAmount?: number;
    convertedCurrencyCode?: number;
    exchangeRate?: string;
    commission: number;
    taxAmount: number;
  } {
    return {
      transactionId: 0,
      cardNumber: orden.numeroDeTarjeta,
      customerCode: orden.customerCode,
      paymentAmount: Number(orden.monto.toFixed(2)),
      transactionCurrency: orden.monedaDelPago,
      debitAccountNumber: orden.cuentaOrigen,
      channel: CANAL,
      comment: orden.comentario ?? '',
      sourceAccountType: orden.tipoDeCuentaOrigen,
      sourceAccountName: orden.nombreDeCuentaOrigen,
      sourceCurrencyCode: orden.monedaDeCuentaOrigen,
      destinationAccountName: orden.nombreDeLaTarjeta,
      destinationCurrencyCode: orden.monedaDelPago,
      ...(orden.montoConvertido !== undefined
        ? { convertedAmount: orden.montoConvertido }
        : {}),
      ...(orden.monedaConvertida !== undefined
        ? { convertedCurrencyCode: orden.monedaConvertida }
        : {}),
      ...(orden.tasa !== undefined ? { exchangeRate: orden.tasa } : {}),
      commission: orden.comision,
      taxAmount: orden.impuesto,
    };
  }

  huellaDeTarjeta(orden: OrdenDePagoDeTarjeta): string {
    return huellaDePagoDeTarjeta(
      this.cuerpoDeTarjeta(orden),
      orden.customerCode,
    );
  }

  async pagarTarjeta(
    orden: OrdenDePagoDeTarjeta,
    autorizacionId: string | null,
  ): Promise<ResultadoDePago> {
    const cuerpo = {
      ...this.cuerpoDeTarjeta(orden),
      ...(autorizacionId !== null ? { authorizationId: autorizacionId } : {}),
    };

    try {
      const respuesta = await this.http.post(
        Endpoints.creditCardPayment,
        cuerpo,
      );
      return parseResultadoDePago(respuesta.data);
    } catch (causa) {
      return {
        exito: false,
        mensaje: mensajeDeError(causa, 'No se pudo procesar el pago.'),
        estadoId: '',
        transaccionId: '',
      };
    }
  }

  // ─── Préstamo ─────────────────────────────────────────────────────────────

  cuerpoDePrestamo(orden: OrdenDePagoDePrestamo): CuerpoDePagoDePrestamo & {
    customerCode: string;
    installmentNumber: number;
    paymentType: number;
    channel: string;
  } {
    return {
      loanNumber: orden.numeroDePrestamo,
      customerCode: orden.customerCode,
      installmentNumber: orden.numeroDeCuota,
      paymentAmount: Number(orden.monto.toFixed(2)),
      currencyCode: orden.moneda,
      paymentType: orden.tipoDePago,
      debitAccountNumber: orden.cuentaOrigen,
      channel: CANAL,
    };
  }

  huellaDePrestamo(orden: OrdenDePagoDePrestamo): string {
    return huellaDePagoDePrestamo(
      this.cuerpoDePrestamo(orden),
      orden.customerCode,
    );
  }

  async pagarPrestamo(
    orden: OrdenDePagoDePrestamo,
    autorizacionId: string | null,
  ): Promise<ResultadoDePago> {
    const cuerpo = {
      ...this.cuerpoDePrestamo(orden),
      ...(autorizacionId !== null ? { authorizationId: autorizacionId } : {}),
    };

    try {
      const respuesta = await this.http.post(Endpoints.loanPayment, cuerpo);
      return parseResultadoDePago(respuesta.data);
    } catch (causa) {
      return {
        exito: false,
        mensaje: mensajeDeError(causa, 'No se pudo procesar el pago.'),
        estadoId: '',
        transaccionId: '',
      };
    }
  }
}
