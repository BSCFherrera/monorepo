import type { AxiosInstance } from 'axios';

import { Endpoints, deviceRevoke } from '../../../core/network/endpoints';
import {
  comoObjeto,
  esVerdadero,
  leerSobreApi,
  mensajeDeError,
  textoOpcional,
} from '../../../core/network/envelopes';

import {
  parseDispositivos,
  parseResultadoDeDispositivo,
  type DispositivoDeConfianza,
  type ResultadoDeDispositivo,
} from './deviceContracts';

/**
 * Habla con `/devices/*`.
 *
 * Portado de `device_repository.dart`. La oleada 5 trajo la mitad de firma
 * —pedir el reto y entregarlo— y la oleada 7 completa la otra: **registrar,
 * verificar, publicar la llave, listar y revocar**. Sin esa otra mitad la
 * primera no sirve de nada en un teléfono real, porque no hay forma de que el
 * dispositivo llegue a tener una llave que el banco reconozca.
 *
 * El código de cliente **no viaja en el cuerpo de ninguna de estas llamadas**:
 * el servidor lo saca del token de sesión. Es una decisión del backend y hay
 * que preservarla — la aplicación nunca debe poder indicar de qué cliente se
 * trata. `DevicesController` lo dice con todas sus letras: un DTO que aceptara
 * `customerCode` invitaría a confiar en él, y quien tuviera cualquier sesión
 * válida podría enrolar un dispositivo a nombre de otro cliente.
 */

export interface RetoDeFirma {
  challengeId: string;
  /** El nonce del servidor, en base64. */
  nonce: string;
  expiraEn: Date | null;
}

export interface ResultadoDeFirma {
  exito: boolean;
  mensaje: string;
  autorizacionId: string | null;
}

/** Lo que la app cuenta de sí misma al registrarse. */
export interface DescripcionDelDispositivo {
  deviceId: string;
  /**
   * Nombre legible del teléfono.
   *
   * **El cliente lo lee en el correo de aviso**, así que tiene que ser
   * reconocible —«Google Pixel 10a»— y no un identificador interno: es lo que
   * le permite decidir si el dispositivo que se está registrando es el suyo.
   */
  nombre: string;
  sistemaOperativo: string;
  versionDeLaApp: string;
  veredictoDeIntegridad: string;
  /**
   * La app perdió su llave y pide volver a verificarse para registrar una nueva.
   *
   * Sin esta bandera el banco respondería que el dispositivo ya está activo y
   * el cliente se quedaría sin salida: el teléfono cree que no puede firmar y
   * el banco cree que sí.
   */
  reEnrolar: boolean;
}

export class DeviceRepository {
  constructor(private readonly http: AxiosInstance) {}

  // ─── Enrolamiento ─────────────────────────────────────────────────────────

  /**
   * Paso 1: inicia el registro.
   *
   * El banco manda un código y **avisa al cliente por todos sus canales**. El
   * aviso sale al iniciar y no al completar, que es lo que le da la
   * oportunidad de detenerlo si no fue él.
   */
  async registrar(
    descripcion: DescripcionDelDispositivo,
  ): Promise<ResultadoDeDispositivo> {
    return this.accion(Endpoints.deviceRegister, {
      deviceId: descripcion.deviceId,
      deviceName: descripcion.nombre,
      deviceOS: descripcion.sistemaOperativo,
      appVersion: descripcion.versionDeLaApp,
      integrityVerdict: descripcion.veredictoDeIntegridad,
      reEnroll: descripcion.reEnrolar,
    });
  }

  /** Paso 2: confirma el registro con el código que recibió el cliente. */
  async verificar(
    deviceId: string,
    codigo: string,
  ): Promise<ResultadoDeDispositivo> {
    return this.accion(Endpoints.deviceVerify, { deviceId, token: codigo });
  }

  /**
   * Paso 3: publica la llave pública del dispositivo.
   *
   * La privada nunca sale del hardware seguro del teléfono. El banco solo
   * guarda la pública, así que **no puede firmar en nombre del cliente** — es
   * la propiedad que sostiene todo lo demás.
   */
  async registrarLlave(parametros: {
    deviceId: string;
    llavePublica: string;
    algoritmo: string;
    atestacion?: string | undefined;
  }): Promise<ResultadoDeDispositivo> {
    return this.accion(Endpoints.deviceRegisterKey, {
      deviceId: parametros.deviceId,
      publicKey: parametros.llavePublica,
      keyAlgorithm: parametros.algoritmo,
      ...(parametros.atestacion !== undefined
        ? { keyAttestation: parametros.atestacion }
        : {}),
    });
  }

  // ─── Lista y revocación ───────────────────────────────────────────────────

  /**
   * Los dispositivos de confianza del cliente.
   *
   * Un fallo devuelve la lista vacía, como el original: la pantalla enseña
   * «sin dispositivos registrados» en vez de un error, que es discutible pero
   * es lo que hace la app Flutter y no cambia ninguna decisión del cliente —en
   * los dos casos lo que puede hacer es reintentar.
   */
  async listar(): Promise<DispositivoDeConfianza[]> {
    try {
      const respuesta = await this.http.get(Endpoints.devices);
      return parseDispositivos(respuesta.data);
    } catch {
      return [];
    }
  }

  /**
   * Revoca un dispositivo.
   *
   * **No exige segundo factor**, y es deliberado: es la acción que un cliente
   * necesita justo cuando perdió el teléfono, y exigir una verificación sobre
   * el dispositivo que ya no tiene haría la revocación imposible en el único
   * momento en que urge.
   */
  async revocar(
    deviceId: string,
    motivo = 'Revocado por el cliente',
  ): Promise<ResultadoDeDispositivo> {
    try {
      const respuesta = await this.http.delete(deviceRevoke(deviceId), {
        params: { reason: motivo },
      });
      return parseResultadoDeDispositivo(respuesta.data);
    } catch (causa) {
      return this.resultadoDelFallo(
        causa,
        'No pudimos revocar el dispositivo.',
      );
    }
  }

  // ─── Firma ────────────────────────────────────────────────────────────────

  /**
   * Pide el reto a firmar para **una operación concreta**.
   *
   * La huella viaja aquí: el reto queda ligado a esa operación y a ninguna
   * otra. Sin eso, una firma válida serviría para mover cualquier cantidad a
   * cualquier destino.
   */
  async pedirReto(
    deviceId: string,
    huellaDeOperacion: string,
  ): Promise<RetoDeFirma | null> {
    try {
      const respuesta = await this.http.post(Endpoints.deviceChallenge, {
        deviceId,
        operationHash: huellaDeOperacion,
      });

      const cuerpo = comoObjeto(respuesta.data);
      if (!esVerdadero(cuerpo.Success ?? cuerpo.success)) return null;

      const challengeId = textoOpcional(cuerpo, 'ChallengeId', 'challengeId');
      const nonce = textoOpcional(cuerpo, 'Nonce', 'nonce');
      if (challengeId === undefined || nonce === undefined) return null;

      const expira = textoOpcional(cuerpo, 'ExpiresAt', 'expiresAt');
      const fecha = expira === undefined ? null : new Date(expira);

      return {
        challengeId,
        nonce,
        expiraEn:
          fecha !== null && !Number.isNaN(fecha.getTime()) ? fecha : null,
      };
    } catch {
      return null;
    }
  }

  /** Entrega la firma y recibe la autorización. */
  async verificarFirma(
    challengeId: string,
    deviceId: string,
    firma: string,
  ): Promise<ResultadoDeFirma> {
    try {
      const respuesta = await this.http.post(Endpoints.deviceVerifySignature, {
        challengeId,
        deviceId,
        signature: firma,
      });

      const sobre = leerSobreApi(respuesta.data);
      const cuerpo = comoObjeto(respuesta.data);
      const interno = comoObjeto(sobre.datos);

      const autorizacionId =
        textoOpcional(interno, 'AuthorizationId', 'authorizationId') ??
        textoOpcional(cuerpo, 'AuthorizationId', 'authorizationId');

      const exito =
        (sobre.exito || esVerdadero(cuerpo.Success ?? cuerpo.success)) &&
        autorizacionId !== undefined;

      return {
        exito,
        mensaje:
          textoOpcional(interno, 'Message', 'message') ??
          sobre.mensaje ??
          (exito ? 'Operación autorizada.' : 'No pudimos validar la firma.'),
        autorizacionId: autorizacionId ?? null,
      };
    } catch (causa) {
      return {
        exito: false,
        mensaje: mensajeDeError(causa, 'No pudimos validar la firma.'),
        autorizacionId: null,
      };
    }
  }

  // ─── Internos ─────────────────────────────────────────────────────────────

  /**
   * Una acción sobre el dispositivo, con su rechazo leído del cuerpo.
   *
   * `DevicesController` responde **409 con el motivo en el cuerpo** cuando
   * niega el registro, la verificación o la llave. Dejar que el error de red se
   * propague perdería ese texto y convertiría cada rechazo en un «algo salió
   * mal»: el cliente no sabría si reintentar, ir a una sucursal o llamar.
   */
  private async accion(
    ruta: string,
    cuerpo: Record<string, unknown>,
  ): Promise<ResultadoDeDispositivo> {
    try {
      const respuesta = await this.http.post(ruta, cuerpo);
      return parseResultadoDeDispositivo(respuesta.data);
    } catch (causa) {
      return this.resultadoDelFallo(causa);
    }
  }

  private resultadoDelFallo(
    causa: unknown,
    respaldo = 'No pudimos completar la operación.',
  ): ResultadoDeDispositivo {
    const respuesta = (causa as { response?: { data?: unknown } } | null)
      ?.response;

    if (respuesta?.data !== undefined) {
      const leido = parseResultadoDeDispositivo(respuesta.data, respaldo);
      // Un cuerpo que sí traía un motivo se respeta aunque no sea el que el
      // contrato describe; uno que no traía nada cae al mensaje de red.
      if (leido.mensaje !== respaldo || leido.codigoDeError !== null) {
        return leido;
      }
    }

    return {
      exito: false,
      codigoDeError: null,
      mensaje: mensajeDeError(causa, respaldo),
      autorizacionId: null,
    };
  }
}
