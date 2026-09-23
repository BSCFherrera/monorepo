import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';
import { mensajeDeError } from '../../../core/network/envelopes';

import {
  CATALOGOS_VACIOS,
  CUENTA_NO_VALIDADA,
  parseBancos,
  parseBeneficiarioPendiente,
  parseBeneficiarios,
  parseConfirmacion,
  parseDocumentos,
  parseTiposDeCuenta,
  parseValidacionDeCuenta,
  TipoDeBeneficiario,
  type Beneficiario,
  type BeneficiarioPendiente,
  type CatalogosDeBeneficiario,
  type ResultadoDeConfirmacion,
  type ValidacionDeCuenta,
} from './beneficiaryContracts';

/**
 * Habla con `/beneficiaries/*`.
 *
 * Portado de `beneficiary_repository.dart`. Toda la interpretación vive en
 * `beneficiaryContracts`: aquí solo está **qué se pide y con qué cuerpo**, que
 * es lo que hay que poder comparar contra el original de un vistazo.
 */

/** Estado con el que el backend marca un beneficiario utilizable. */
const ESTADO_ACTIVO = 2;

export interface AltaInterna {
  numeroDeCuenta: string;
  nombre: string;
  tipoDeCuenta: number;
  documentoTipo: number;
  documentoNumero: string;
  codigoMoneda: string;
  alias?: string | undefined;
  email?: string | undefined;
  notificar?: boolean;
}

export interface AltaInterbancaria extends AltaInterna {
  bancoCodigo: string;
  bancoNombre: string;
  bancoSwift?: string | undefined;
}

export class BeneficiaryRepository {
  private catalogos: CatalogosDeBeneficiario | null = null;

  constructor(private readonly http: AxiosInstance) {}

  /**
   * Beneficiarios registrados.
   *
   * Pide **solo los activos** por defecto, igual que el original: uno recién
   * creado sigue pendiente de confirmación y ofrecerlo para transferir sería
   * ofrecer algo que el backend va a rechazar.
   */
  async listar(
    opciones: { tipo?: number; soloActivos?: boolean } = {},
  ): Promise<Beneficiario[]> {
    const { tipo, soloActivos = true } = opciones;

    const respuesta = await this.http.get(Endpoints.beneficiaries, {
      params: {
        ...(tipo !== undefined ? { type: tipo } : {}),
        ...(soloActivos ? { status: ESTADO_ACTIVO } : {}),
        onlyTcBeneficiary: false,
      },
    });

    return parseBeneficiarios(respuesta.data);
  }

  /**
   * Catálogos del formulario de alta, una sola vez por sesión.
   *
   * **Un catálogo que falla degrada su selector, no rompe el formulario.** Es
   * la decisión del original y es la correcta: el de tipos de documento no
   * tiene datos sembrados en este ambiente, y si eso impidiera registrar
   * beneficiarios no se podría usar nada de lo que viene detrás.
   */
  async obtenerCatalogos(
    opciones: { forzar?: boolean } = {},
  ): Promise<CatalogosDeBeneficiario> {
    const guardados = this.catalogos;
    if (opciones.forzar !== true && guardados !== null) return guardados;

    const [bancos, tiposDeCuenta, documentos] = await Promise.all([
      this.catalogo(Endpoints.beneficiaryBanks, parseBancos),
      this.catalogo(Endpoints.beneficiaryAccountTypes, parseTiposDeCuenta),
      this.catalogo(Endpoints.beneficiaryDocumentTypes, parseDocumentos),
    ]);

    const catalogos = { bancos, tiposDeCuenta, documentos };
    this.catalogos = catalogos;
    return catalogos;
  }

  private async catalogo<T>(
    ruta: string,
    leer: (cuerpo: unknown) => T[],
  ): Promise<T[]> {
    try {
      const respuesta = await this.http.get(ruta);
      return leer(respuesta.data);
    } catch {
      return [];
    }
  }

  /**
   * Comprueba una cuenta del banco antes de registrarla.
   *
   * El cliente ve el nombre del titular antes de guardar, en vez de descubrir
   * que se equivocó de dígito cuando ya transfirió.
   */
  async validarCuenta(numeroDeCuenta: string): Promise<ValidacionDeCuenta> {
    try {
      const respuesta = await this.http.post(Endpoints.validateAccount, {
        accountNumber: numeroDeCuenta,
      });
      return parseValidacionDeCuenta(respuesta.data);
    } catch (causa) {
      return {
        ...CUENTA_NO_VALIDADA,
        mensaje: mensajeDeError(causa, 'No pudimos validar la cuenta.'),
      };
    }
  }

  /** Alta de un beneficiario con cuenta en el banco. Queda pendiente. */
  async agregarInterno(datos: AltaInterna): Promise<BeneficiarioPendiente> {
    const respuesta = await this.http.post(Endpoints.beneficiaryAddInternal, {
      accountNumber: datos.numeroDeCuenta,
      beneficiaryName: datos.nombre,
      accountType: datos.tipoDeCuenta,
      identificationType: datos.documentoTipo,
      identificationNumber: datos.documentoNumero,
      currencyCode: datos.codigoMoneda,
      sendNotification: datos.notificar ?? false,
      ...opcional('alias', datos.alias),
      ...opcional('email', datos.email),
    });

    return parseBeneficiarioPendiente(respuesta.data);
  }

  /** Alta de un beneficiario en otro banco local. */
  async agregarInterbancario(
    datos: AltaInterbancaria,
  ): Promise<BeneficiarioPendiente> {
    const respuesta = await this.http.post(
      Endpoints.beneficiaryAddLocalInterbank,
      {
        bankCode: datos.bancoCodigo,
        bankName: datos.bancoNombre,
        ...opcional('bankSwiftCode', datos.bancoSwift),
        accountNumber: datos.numeroDeCuenta,
        accountType: datos.tipoDeCuenta,
        beneficiaryName: datos.nombre,
        identificationType: datos.documentoTipo,
        identificationNumber: datos.documentoNumero,
        currencyCode: datos.codigoMoneda,
        sendNotification: datos.notificar ?? false,
        ...opcional('alias', datos.alias),
        ...opcional('email', datos.email),
      },
    );

    return parseBeneficiarioPendiente(respuesta.data);
  }

  /** Activa un beneficiario pendiente con el código que recibió el cliente. */
  async confirmar(
    beneficiarioId: string,
    codigo: string,
  ): Promise<ResultadoDeConfirmacion> {
    try {
      const respuesta = await this.http.post(Endpoints.beneficiaryConfirm, {
        beneficiaryId: beneficiarioId,
        verificationToken: codigo,
      });
      return parseConfirmacion(respuesta.data);
    } catch (causa) {
      return {
        exito: false,
        mensaje: mensajeDeError(causa, 'No pudimos confirmar el beneficiario.'),
      };
    }
  }

  /** Olvida los catálogos. Hay que llamarlo al cerrar sesión. */
  limpiar(): void {
    this.catalogos = null;
  }
}

/** Un campo vacío no se manda: el backend lo trataría como un valor escrito. */
function opcional(
  nombre: string,
  valor: string | undefined,
): Record<string, string> {
  return valor !== undefined && valor.trim() !== ''
    ? { [nombre]: valor.trim() }
    : {};
}

export { CATALOGOS_VACIOS, TipoDeBeneficiario };
