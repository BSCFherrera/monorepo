import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';
import {
  comoObjeto,
  leerSobreApi,
  mensajeDeError,
  textoOpcional,
} from '../../../core/network/envelopes';

import {
  parseEnvio,
  parseMetodos,
  parseVerificacion,
  type EnvioDeCodigo,
  type MetodoDeSegundoFactor,
  type Proposito,
  type ResultadoDeVerificacion,
} from './twoFactorContracts';

/**
 * Habla con `/two-factor/*`.
 *
 * Portado de `two_factor_repository.dart`. Un fallo de red **no se convierte en
 * un mensaje genérico**: el backend responde 400 con el motivo y los intentos
 * restantes, y eso es lo que se le enseña al cliente.
 */
export class TwoFactorRepository {
  constructor(private readonly http: AxiosInstance) {}

  /**
   * Aprovisiona el token suave y devuelve su secreto en base32.
   *
   * ⚠️ **Hoy esto devuelve siempre `null`, y no es un defecto del porte.**
   *
   * `soft_token_screen.dart` lee el secreto del campo `Base32Secret` de
   * `POST /two-factor/soft-token/provision`. Ese campo **no existe en el
   * backend**: `TokenBscProvisionResponse` declara `Success`, `Message`,
   * `AlreadyProvisioned` y `Error`, y nada más. Como el controlador devuelve
   * ese tipo, aunque TokenBSC mandara el secreto el gateway lo descartaría al
   * deserializar. La pantalla del original, por tanto, **nunca ha podido
   * mostrar un código**: siempre cae en «No pudimos preparar tu token».
   *
   * Se porta la llamada tal cual, aceptando los dos nombres posibles, para que
   * el día en que el banco decida exponer el secreto la pantalla funcione sin
   * tocar nada. Está escalado como pregunta abierta.
   */
  async provisionarTokenSuave(): Promise<string | null> {
    try {
      const respuesta = await this.http.post(Endpoints.provisionSoftToken);

      const sobre = leerSobreApi(respuesta.data);
      const interno = comoObjeto(sobre.datos);
      const cuerpo = comoObjeto(respuesta.data);

      return (
        textoOpcional(interno, 'Base32Secret', 'base32Secret') ??
        textoOpcional(cuerpo, 'Base32Secret', 'base32Secret') ??
        null
      );
    } catch {
      return null;
    }
  }

  async obtenerMetodos(): Promise<MetodoDeSegundoFactor[]> {
    const respuesta = await this.http.get(Endpoints.twoFactorMethods);
    return parseMetodos(respuesta.data);
  }

  async enviarCodigo(
    metodoId: string,
    proposito: Proposito,
  ): Promise<EnvioDeCodigo> {
    try {
      const respuesta = await this.http.post(Endpoints.twoFactorGenerate, {
        methodId: metodoId,
        purpose: proposito,
      });
      return parseEnvio(respuesta.data);
    } catch (causa) {
      return {
        enviado: false,
        mensaje: mensajeDeError(causa, 'No pudimos enviar el código.'),
        tipo: undefined,
        contactoEnmascarado: undefined,
      };
    }
  }

  /**
   * Verifica el código.
   *
   * ⚠️ **Sin `huellaDeOperacion` el backend valida el código pero no emite
   * autorización**, y la transacción se rechaza al ejecutarla. Por eso el
   * parámetro está aquí y no en la capa de arriba: quien verifica un pago tiene
   * que pasarlo, y quien da de alta un beneficiario —que no mueve dinero— lo
   * omite a conciencia.
   */
  async verificarCodigo(
    codigo: string,
    proposito: Proposito,
    huellaDeOperacion?: string,
  ): Promise<ResultadoDeVerificacion> {
    try {
      const respuesta = await this.http.post(Endpoints.twoFactorVerify, {
        token: codigo,
        purpose: proposito,
        ...(huellaDeOperacion !== undefined
          ? { operationHash: huellaDeOperacion }
          : {}),
      });
      return parseVerificacion(respuesta.data);
    } catch (causa) {
      return {
        valido: false,
        mensaje: mensajeDeError(causa, 'Código incorrecto.'),
        autorizacionId: undefined,
      };
    }
  }
}
