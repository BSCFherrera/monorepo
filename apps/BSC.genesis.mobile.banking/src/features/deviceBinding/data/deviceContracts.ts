import {
  comoLista,
  comoObjeto,
  esVerdadero,
  textoOpcional,
} from '../../../core/network/envelopes';

/**
 * Lo que `/devices/*` devuelve, traducido.
 *
 * Portado de `trusted_device.dart`. El gateway responde en PascalCase y
 * TokenBSC en camelCase, así que se aceptan las dos formas: un cambio de
 * serialización en cualquiera de los dos lados dejaría la pantalla en blanco
 * sin un solo error, que es el defecto que más veces ha aparecido en esta
 * migración.
 */

/** Un dispositivo que el cliente autorizó para operar. */
export interface DispositivoDeConfianza {
  deviceId: string;
  nombre: string;
  sistemaOperativo: string | null;
  /** `PendingVerification`, `Active`, `Suspended` o `Revoked`. */
  estado: string;
  verificado: boolean;
  ultimoUso: Date | null;
  /** Cuándo se registró. Ver la nota de `parseDispositivo`. */
  registradoEn: Date | null;
}

/** Resultado de una operación sobre el dispositivo. */
export interface ResultadoDeDispositivo {
  exito: boolean;
  codigoDeError: string | null;
  /**
   * El mensaje del servidor, tal cual.
   *
   * Se conserva porque **cada rechazo pide una acción distinta del cliente**:
   * volver a intentar, ir a una sucursal, o llamar al banco. Sustituirlo por
   * un «no se pudo» genérico le quita al cliente la única pista que tiene.
   */
  mensaje: string;
  /** Autorización emitida al verificar una firma. */
  autorizacionId: string | null;
}

/** El dispositivo puede firmar ahora mismo. */
export function estaActivo(dispositivo: DispositivoDeConfianza): boolean {
  return dispositivo.estado === 'Active' && dispositivo.verificado;
}

/** Se registró pero todavía no se confirmó con el código. */
export function estaPendiente(dispositivo: DispositivoDeConfianza): boolean {
  return dispositivo.estado === 'PendingVerification';
}

/** Cómo se le dice al cliente en qué estado está su teléfono. */
export function etiquetaDeEstado(dispositivo: DispositivoDeConfianza): string {
  switch (dispositivo.estado) {
    case 'Active':
      return dispositivo.verificado ? 'Activo' : 'Sin verificar';
    case 'PendingVerification':
      return 'Pendiente de verificación';
    case 'Suspended':
      return 'Suspendido';
    case 'Revoked':
      return 'Revocado';
    default:
      return dispositivo.estado;
  }
}

/**
 * El primer dispositivo de un cliente necesita verificación presencial.
 *
 * No es un error del cliente y la interfaz no debe presentarlo como tal: quien
 * llega aquí hizo todo bien y lo que le falta es pasar por una sucursal.
 */
export function exigeVerificacionPresencial(
  resultado: ResultadoDeDispositivo,
): boolean {
  return resultado.codigoDeError === 'DEVICE_009';
}

/** El dispositivo no cumple los requisitos de seguridad. */
export function falloDeIntegridad(resultado: ResultadoDeDispositivo): boolean {
  return resultado.codigoDeError === 'DEVICE_005';
}

// ─── Lectura ────────────────────────────────────────────────────────────────

function fecha(
  cuerpo: Record<string, unknown>,
  ...claves: string[]
): Date | null {
  for (const clave of claves) {
    const crudo = textoOpcional(cuerpo, clave);
    if (crudo === undefined) continue;

    const valor = new Date(crudo);
    if (!Number.isNaN(valor.getTime())) return valor;
  }
  return null;
}

export function parseDispositivo(
  crudo: Record<string, unknown>,
): DispositivoDeConfianza {
  return {
    deviceId: textoOpcional(crudo, 'DeviceId', 'deviceId') ?? '',
    nombre:
      textoOpcional(crudo, 'DeviceName', 'deviceName') ?? 'Dispositivo móvil',
    sistemaOperativo: textoOpcional(crudo, 'DeviceOS', 'deviceOS') ?? null,
    estado: textoOpcional(crudo, 'Status', 'status') ?? 'Unknown',
    verificado: esVerdadero(crudo.IsVerified ?? crudo.isVerified),
    ultimoUso: fecha(crudo, 'LastUsedAt', 'lastUsedAt'),
    /*
      El listado del banco llama `RegisteredAt` a esta fecha. La app Flutter
      leía `CreatedAt`, así que llegaba siempre nula — y como la fila
      «Registrado» solo se dibuja cuando el dato existe, el fallo no se veía
      como un error sino como una pantalla más corta. Se aceptan los dos
      nombres, empezando por el que el backend manda de verdad.
    */
    registradoEn: fecha(
      crudo,
      'RegisteredAt',
      'registeredAt',
      'CreatedAt',
      'createdAt',
    ),
  };
}

/**
 * La lista de dispositivos.
 *
 * Una respuesta que no traiga la lista devuelve el arreglo vacío y no lanza: la
 * pantalla enseña «sin dispositivos registrados», que es exactamente lo que el
 * cliente necesita ver mientras no haya enrolado ninguno.
 */
export function parseDispositivos(cuerpo: unknown): DispositivoDeConfianza[] {
  const objeto = comoObjeto(cuerpo);
  const filas = objeto.Devices ?? objeto.devices;
  return comoLista(filas).map(parseDispositivo);
}

/**
 * El resultado de una acción sobre el dispositivo.
 *
 * Sirve tanto para la respuesta buena como para el cuerpo de un 400 o un 409:
 * el gateway pone ahí el motivo, y perderlo convertiría cualquier rechazo en un
 * error genérico.
 */
export function parseResultadoDeDispositivo(
  cuerpo: unknown,
  respaldo = 'No pudimos completar la operación.',
): ResultadoDeDispositivo {
  const objeto = comoObjeto(cuerpo);

  return {
    exito: esVerdadero(objeto.Success ?? objeto.success),
    codigoDeError: textoOpcional(objeto, 'ErrorCode', 'errorCode') ?? null,
    mensaje: textoOpcional(objeto, 'Message', 'message') ?? respaldo,
    autorizacionId:
      textoOpcional(objeto, 'AuthorizationId', 'authorizationId') ?? null,
  };
}
