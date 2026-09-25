import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';
import { mensajeDeError } from '../../../core/network/envelopes';
import {
  parseBeneficiarios,
  type Beneficiario,
} from '../../beneficiaries/data/beneficiaryContracts';

import {
  parseComisiones,
  parseCotizacion,
  parseCuentaValidada,
  parseResultadoDeTransferencia,
  SIN_COMISIONES,
  SIN_VALIDAR,
  type ComisionesDeTransferencia,
  type CotizacionDeCambio,
  type CuentaValidada,
  type ResultadoDeTransferencia,
} from './transferContracts';
import {
  huellaDeTransferencia,
  type CuerpoDeTransferencia,
} from './transferFingerprint';

/**
 * Habla con los endpoints del flujo de transferencias.
 *
 * Portado de `transfer_remote_datasource.dart`. La diferencia importante con
 * aquel archivo está en `ejecutar`: **la huella se calcula aquí, sobre el
 * cuerpo que se va a enviar**, y no en la pantalla sobre el estado que se está
 * mostrando. Ver `transferFingerprint.ts` para por qué.
 */

/** Lo que la pantalla decide y el repositorio convierte en petición. */
export interface OrdenDeTransferencia {
  cuentaOrigen: string;
  /** Tipo de producto de origen: `CA` o `CC`. */
  tipoDeProductoOrigen: string;
  cuentaDestino: string;
  monto: number;
  monedaOrigen: number;
  monedaDestino: number;
  comentario?: string | undefined;
  beneficiarioId?: string | undefined;
  subtipo?: number | null | undefined;
  clienteDestino?: Record<string, unknown> | undefined;
  productoDestino?: Record<string, unknown> | undefined;
}

export class TransferRepository {
  constructor(private readonly http: AxiosInstance) {}

  /** Beneficiarios del tipo que corresponde al flujo, solo activos. */
  async beneficiariosDeTipo(tipo: number): Promise<Beneficiario[]> {
    const respuesta = await this.http.get(Endpoints.beneficiaries, {
      params: { type: tipo, status: 2, onlyTcBeneficiary: false },
    });
    return parseBeneficiarios(respuesta.data);
  }

  /** Comprueba una cuenta del banco y resuelve su titular y su producto. */
  async validarCuenta(
    numeroDeCuenta: string,
    codigoDeCliente: string,
  ): Promise<CuentaValidada> {
    try {
      const respuesta = await this.http.post(Endpoints.validateAccount, {
        accountNumber: numeroDeCuenta,
        clientCode: codigoDeCliente,
      });
      return parseCuentaValidada(respuesta.data);
    } catch {
      return SIN_VALIDAR;
    }
  }

  /**
   * Cotización de la conversión.
   *
   * Solo hay que pedirla cuando origen y destino no comparten moneda: pedirla
   * igual devuelve una tasa de uno que no significa nada y hace más lenta la
   * pantalla que el cliente sí ve.
   */
  async cotizar(parametros: {
    monedaOrigen: number;
    monedaDestino: number;
    codigoDeCliente: number;
    monto: number;
  }): Promise<CotizacionDeCambio> {
    const respuesta = await this.http.get(Endpoints.exchangeRateQuote, {
      params: {
        sourceCurrency: parametros.monedaOrigen,
        destinationCurrency: parametros.monedaDestino,
        clientCode: parametros.codigoDeCliente,
        amount: parametros.monto,
        requestNumber: 'N/A',
      },
    });
    return parseCotizacion(respuesta.data);
  }

  /**
   * Comisión e impuesto del movimiento.
   *
   * Un fallo aquí devuelve ceros y no una excepción: el original hace lo mismo
   * y es lo correcto. El core cobra las comisiones de todas formas, y quedarse
   * sin poder transferir porque el resumen informativo no respondió sería peor
   * que enseñar un total que luego el comprobante corrige.
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
    subtipo?: number | null | undefined;
  }): Promise<ComisionesDeTransferencia> {
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
          ...(parametros.subtipo !== null && parametros.subtipo !== undefined
            ? { transactionSubType: parametros.subtipo }
            : {}),
        },
      });
      return parseComisiones(respuesta.data);
    } catch {
      return SIN_COMISIONES;
    }
  }

  /**
   * Arma el cuerpo de la transferencia.
   *
   * Está separado de `ejecutar` para que la pantalla de confirmación pueda
   * calcular **la huella del cuerpo exacto** antes de pedir la autorización, y
   * después ejecutar ese mismo cuerpo. Si la pantalla compusiera un cuerpo para
   * firmar y otro para enviar, el backend rechazaría la operación y nadie
   * sabría por qué.
   */
  cuerpoDe(orden: OrdenDeTransferencia): CuerpoDeTransferencia & {
    comment: string;
    debitProductType: string;
    exchangeRate: number;
    targetTransactionCurrency: number;
    transactionSubType?: number;
    targetClient?: Record<string, unknown>;
    targetProduct?: Record<string, unknown>;
  } {
    return {
      debitAccountNumber: orden.cuentaOrigen,
      creditAccountNumber: orden.cuentaDestino,
      // Dos decimales exactos, como el original: el backend recibe un decimal
      // y una fracción larga por el binario flotante cambiaría la huella.
      transactionAmount: Number(orden.monto.toFixed(2)),
      // El backend recalcula la tasa; el portal y la app envían siempre cero.
      exchangeRate: 0,
      comment: orden.comentario ?? '',
      debitProductType: orden.tipoDeProductoOrigen,
      sourceTransactionCurrency: orden.monedaOrigen,
      targetTransactionCurrency: orden.monedaDestino,
      ...(orden.beneficiarioId !== undefined && orden.beneficiarioId !== ''
        ? { beneficiaryId: orden.beneficiarioId }
        : {}),
      ...(orden.subtipo !== null && orden.subtipo !== undefined
        ? { transactionSubType: orden.subtipo }
        : {}),
      ...(orden.clienteDestino !== undefined
        ? { targetClient: orden.clienteDestino }
        : {}),
      ...(orden.productoDestino !== undefined
        ? { targetProduct: orden.productoDestino }
        : {}),
    };
  }

  /** La huella del cuerpo, que es lo que hay que autorizar. */
  huellaDe(orden: OrdenDeTransferencia, codigoDeCliente: string): string {
    return huellaDeTransferencia(this.cuerpoDe(orden), codigoDeCliente);
  }

  /**
   * Ejecuta la transferencia.
   *
   * ⚠️ **Sin `autorizacionId` el backend la rechaza** en cuanto
   * `TransactionAuthorizationSettings.Enforce` esté encendido. Hoy la deja
   * pasar y la anota, de modo que una transferencia sin autorización *parece*
   * funcionar: es la peor forma de que un defecto sobreviva hasta producción.
   */
  async ejecutar(
    orden: OrdenDeTransferencia,
    autorizacionId: string | null,
  ): Promise<ResultadoDeTransferencia> {
    const cuerpo = {
      ...this.cuerpoDe(orden),
      ...(autorizacionId !== null ? { authorizationId: autorizacionId } : {}),
    };

    try {
      const respuesta = await this.http.post(
        Endpoints.paymentExecutionTransfer,
        cuerpo,
      );
      return parseResultadoDeTransferencia(respuesta.data);
    } catch (causa) {
      return {
        exito: false,
        mensaje: mensajeDeError(causa, 'No se pudo procesar la transferencia.'),
        transaccionId: '',
        estadoId: '',
        comisionCobrada: 0,
        tasaAplicada: 0,
      };
    }
  }
}
