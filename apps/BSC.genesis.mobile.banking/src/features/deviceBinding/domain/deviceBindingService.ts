import {
  DeviceKey,
  DeviceKeyError,
  type DeviceKeySecurity,
  meetsBankingBar,
} from '../../../core/security/deviceKey';
import {
  evaluarIntegridad,
  mensajeDeVeredicto,
  VEREDICTO_OK,
} from '../../../core/security/deviceIntegrity';
import {
  authorized,
  DeviceBindingState,
  failed,
  outcomeForMissingChallenge,
  outcomeForSigningError,
  outcomeForState,
  type SigningOutcome,
} from '../../../core/security/signingOutcome';
import type { SecureStorage } from '../../../core/security/secureStorage';
import type {
  DispositivoDeConfianza,
  ResultadoDeDispositivo,
} from '../data/deviceContracts';
import type { DeviceRepository } from '../data/deviceRepository';

import {
  describirDispositivo,
  describirDispositivoParaElBanco,
  generarDeviceId,
} from './deviceDescription';

/**
 * Orquesta el enrolamiento del dispositivo y la firma de operaciones.
 *
 * Portado de `device_binding_service.dart`. Es la pieza que une tres cosas que
 * ya existían por separado: la llave en el hardware (oleada 0), los endpoints
 * del banco, y la huella canónica de la operación (oleadas 5 y 6).
 *
 * La oleada 5 trajo solo la parte de firma, y eso dejaba la ganancia a medias:
 * **sin enrolamiento no hay llave que el banco reconozca, así que toda
 * operación caía al código y la firma en StrongBox no se usaba nunca en un
 * teléfono real.** La oleada 7 cierra el círculo.
 *
 * Las decisiones difíciles de la firma no están aquí: están en
 * `signingOutcome.ts`, que las resuelve como funciones puras y con pruebas,
 * porque son las que deciden cuándo se le ofrece un código al cliente y cuándo
 * no. Este archivo solo las encadena y es deliberadamente aburrido.
 */

export class DeviceBindingService {
  constructor(
    private readonly repositorio: DeviceRepository,
    private readonly almacenamiento: SecureStorage,
  ) {}

  /**
   * Identificador de este dispositivo, o nulo si nunca se enroló.
   *
   * Es el mismo `deviceInstallId` que guarda el almacenamiento seguro desde la
   * oleada 0: no se inventa uno nuevo para firmar, porque el backend conoce el
   * dispositivo por ese identificador y por ninguno más.
   */
  async deviceId(): Promise<string | null> {
    return this.almacenamiento.getDeviceInstallId();
  }

  /**
   * El identificador, creándolo la primera vez.
   *
   * Solo lo llama el enrolamiento. La firma usa `deviceId()`, que no crea
   * nada: si creara uno al firmar, una operación en un teléfono sin enrolar
   * inventaría un dispositivo que el banco no conoce y el reto fallaría con un
   * error confuso en vez de con «registra este dispositivo».
   */
  async asegurarDeviceId(): Promise<string> {
    const guardado = await this.deviceId();
    if (guardado !== null && guardado !== '') return guardado;

    const descripcion = describirDispositivo();
    const generado = generarDeviceId(
      `${descripcion.nombre}-${descripcion.sistemaOperativo}`,
      Date.now(),
    );

    await this.almacenamiento.saveDeviceInstallId(generado);
    return generado;
  }

  /**
   * Estado del dispositivo respecto a la firma.
   *
   * Los tres «no» se distinguen porque llevan a sitios distintos: uno no tiene
   * arreglo en este teléfono, otro se arregla enrolando y el tercero
   * re-enrolando. Un único «no se puede firmar» dejaría al cliente sin saber
   * qué hacer.
   */
  async estado(): Promise<DeviceBindingState> {
    try {
      if (!(await DeviceKey.isSupported())) {
        return DeviceBindingState.Unsupported;
      }
    } catch {
      return DeviceBindingState.Unsupported;
    }

    const id = await this.deviceId();
    const enrolado = await this.almacenamiento.isDeviceEnrolled();
    if (id === null || id === '' || !enrolado) {
      return DeviceBindingState.NotEnrolled;
    }

    try {
      return (await DeviceKey.hasKey())
        ? DeviceBindingState.Ready
        : DeviceBindingState.KeyLost;
    } catch {
      return DeviceBindingState.KeyLost;
    }
  }

  /** Si tiene sentido intentar la firma sin molestar al cliente. */
  async puedeFirmar(): Promise<boolean> {
    return (await this.estado()) === DeviceBindingState.Ready;
  }

  /** Dónde vive la llave y con qué protecciones, para enseñárselo al cliente. */
  async seguridadDeLlave(): Promise<DeviceKeySecurity | null> {
    try {
      return await DeviceKey.describeKey();
    } catch {
      return null;
    }
  }

  // ─── Enrolamiento ─────────────────────────────────────────────────────────

  /**
   * Paso 1: registra el dispositivo. El banco manda un código y avisa al
   * cliente por todos sus canales.
   *
   * Las dos comprobaciones previas van en este orden y no en otro. La
   * integridad primero, porque **el enrolamiento es el momento en que el banco
   * entrega un secreto** y entregarlo a un teléfono comprometido es entregarlo
   * sin protección. El soporte de llave después, porque un teléfono que no
   * puede sostenerla no llegaría a completar el paso 2 y es mejor decírselo
   * ahora que después de que reciba un código.
   */
  async iniciarEnrolamiento(): Promise<ResultadoDeDispositivo> {
    const veredicto = await evaluarIntegridad();
    if (veredicto !== VEREDICTO_OK) {
      return {
        exito: false,
        codigoDeError: 'DEVICE_005',
        mensaje: mensajeDeVeredicto(veredicto),
        autorizacionId: null,
      };
    }

    let soportado = false;
    try {
      soportado = await DeviceKey.isSupported();
    } catch {
      soportado = false;
    }

    if (!soportado) {
      return {
        exito: false,
        codigoDeError: 'UNSUPPORTED',
        mensaje:
          'Este teléfono no puede proteger la llave de firma. Puedes seguir ' +
          'operando con el código de verificación.',
        autorizacionId: null,
      };
    }

    const descripcion = await describirDispositivoParaElBanco();

    /*
      El banco puede tener este dispositivo activo mientras el teléfono ya no
      tiene la llave: pasa al reinstalar la app y cada vez que cambia la
      biometría. Sin avisarlo, el registro respondería que el dispositivo ya
      está activo y el cliente se quedaría encerrado — su teléfono cree que no
      puede firmar y el banco cree que sí.
    */
    const perdioLaLlave = (await this.estado()) === DeviceBindingState.KeyLost;

    return this.repositorio.registrar({
      deviceId: await this.asegurarDeviceId(),
      nombre: descripcion.nombre,
      sistemaOperativo: descripcion.sistemaOperativo,
      versionDeLaApp: descripcion.versionDeLaApp,
      veredictoDeIntegridad: veredicto,
      reEnrolar: perdioLaLlave,
    });
  }

  /**
   * Paso 2: confirma con el código y registra la llave.
   *
   * **La llave se genera después de verificar el código, nunca antes.** Si se
   * generara primero, un enrolamiento abandonado dejaría una llave huérfana en
   * el teléfono que el banco no conoce, y la app creería estar protegida
   * cuando no lo está: `estado()` respondería `Ready` y toda operación
   * intentaría firmar con una llave que el servidor rechaza.
   */
  async completarEnrolamiento(codigo: string): Promise<ResultadoDeDispositivo> {
    const id = await this.asegurarDeviceId();

    const verificado = await this.repositorio.verificar(id, codigo);
    if (!verificado.exito) return verificado;

    try {
      const par = await DeviceKey.createKey();

      if (par.publicKey === null || par.publicKey === '') {
        await this.borrarLlave();
        return {
          exito: false,
          codigoDeError: 'KEY_MISSING_PUBLIC',
          mensaje: 'No pudimos crear la llave de seguridad en este teléfono.',
          autorizacionId: null,
        };
      }

      const registrada = await this.repositorio.registrarLlave({
        deviceId: id,
        llavePublica: par.publicKey,
        algoritmo: par.algorithm,
        // La atestación de la llave no se envía todavía: el backend la acepta
        // opcional y verificarla exige una cadena de certificados que el banco
        // aún no valida. Queda anotado en el traspaso.
        atestacion: undefined,
      });

      if (!registrada.exito) {
        // El banco no aceptó la llave, así que la del teléfono no sirve de
        // nada. Dejarla haría creer a la app que puede firmar.
        await this.borrarLlave();
        return registrada;
      }

      await this.almacenamiento.setDeviceEnrolled(true);

      return {
        exito: true,
        codigoDeError: null,
        mensaje: meetsBankingBar(par.security)
          ? 'Dispositivo registrado. Ya puedes autorizar con tu rostro o huella.'
          : 'Dispositivo registrado. Este teléfono ofrece una protección menor, ' +
            'así que algunas operaciones seguirán pidiendo código.',
        autorizacionId: null,
      };
    } catch (causa) {
      await this.borrarLlave();

      const codigo_ =
        causa instanceof DeviceKeyError ? `KEY_${causa.code}` : 'KEY_UNKNOWN';

      return {
        exito: false,
        codigoDeError: codigo_,
        mensaje: 'No pudimos crear la llave de seguridad en este teléfono.',
        autorizacionId: null,
      };
    }
  }

  // ─── Lista y revocación ───────────────────────────────────────────────────

  /** Los dispositivos autorizados del cliente. */
  async listarDispositivos(): Promise<DispositivoDeConfianza[]> {
    return this.repositorio.listar();
  }

  /**
   * Revoca este teléfono y borra su llave.
   *
   * **Las dos cosas, siempre.** Revocar en el banco y dejar la llave haría que
   * la app creyera que puede firmar cuando el servidor ya no la acepta: cada
   * operación gastaría un diálogo biométrico para terminar en un rechazo que el
   * cliente no sabría interpretar. Y borrar la llave sin revocar dejaría un
   * dispositivo activo en la cuenta que el cliente ve en la lista y no puede
   * usar.
   */
  async revocarEsteDispositivo(): Promise<ResultadoDeDispositivo> {
    const id = await this.deviceId();
    if (id === null || id === '') {
      // No hay nada que revocar en el banco, pero sí hay que dejar el teléfono
      // limpio: puede quedar una llave de un enrolamiento a medias.
      await this.limpiarEsteDispositivo();
      return {
        exito: true,
        codigoDeError: null,
        mensaje: 'Firma desactivada en este dispositivo.',
        autorizacionId: null,
      };
    }

    const resultado = await this.repositorio.revocar(id);
    await this.limpiarEsteDispositivo();
    return resultado;
  }

  /**
   * Revoca un dispositivo cualquiera de la lista.
   *
   * Si resulta ser este teléfono, hay que limpiar aquí también: es el caso del
   * cliente que revoca desde «Mis dispositivos» sin darse cuenta de que el que
   * está tocando es el suyo.
   */
  async revocarDispositivo(deviceId: string): Promise<ResultadoDeDispositivo> {
    const resultado = await this.repositorio.revocar(deviceId);

    if (resultado.exito && deviceId === (await this.deviceId())) {
      await this.limpiarEsteDispositivo();
    }

    return resultado;
  }

  /** Borra la llave y marca el teléfono como no enrolado. */
  private async limpiarEsteDispositivo(): Promise<void> {
    await this.borrarLlave();
    await this.almacenamiento.setDeviceEnrolled(false);
  }

  /**
   * Borra la llave sin propagar el fallo.
   *
   * Se llama en los caminos de limpieza, y ahí un error al borrar no debe
   * tapar el motivo por el que se estaba limpiando.
   */
  private async borrarLlave(): Promise<void> {
    try {
      await DeviceKey.deleteKey();
    } catch {
      // Sin llave que borrar, o el módulo no respondió. Nada que hacer.
    }
  }

  /**
   * Firma una operación y devuelve su autorización.
   *
   * `huellaDeOperacion` tiene que venir del cálculo sobre **el cuerpo que se va
   * a enviar**: es la misma huella que el backend recalcula al ejecutar, y si
   * no coincide la transacción no procede aunque la firma sea impecable.
   */
  async firmarOperacion(huellaDeOperacion: string): Promise<SigningOutcome> {
    const estado = await this.estado();
    const impedimento = outcomeForState(estado);
    if (impedimento !== null) return impedimento;

    const id = await this.deviceId();
    if (id === null || id === '') return outcomeForMissingChallenge();

    const reto = await this.repositorio.pedirReto(id, huellaDeOperacion);
    if (reto === null) return outcomeForMissingChallenge();

    let firma: string;
    try {
      firma = await DeviceKey.signChallenge(reto.nonce, huellaDeOperacion);
    } catch (causa) {
      if (causa instanceof DeviceKeyError) {
        return outcomeForSigningError(causa.code, causa.message);
      }
      return outcomeForSigningError('device_key_error');
    }

    const resultado = await this.repositorio.verificarFirma(
      reto.challengeId,
      id,
      firma,
    );

    if (resultado.exito && resultado.autorizacionId !== null) {
      return authorized(resultado.autorizacionId);
    }

    /*
      El servidor rechazó una firma que el hardware produjo. No se ofrece el
      código: puede ser que el reto caducara —y entonces reintentar es lo
      correcto— pero también que la huella no corresponda, y en ese caso un
      código tampoco autorizaría nada. Se dice lo que pasó y se deja decidir.
    */
    return failed(resultado.mensaje, true);
  }
}
