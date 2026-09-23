/**
 * Cómo termina una sesión, que no es una sola cosa.
 *
 * **Esto decide si el cliente puede volver a entrar con la huella.** La entrada
 * por biometría no obtiene credenciales nuevas del banco: lo único que puede
 * hacer es reanudar la sesión con el **token de refresco**, que el backend
 * emite con siete días de vida (treinta si el cliente marcó recordarme). Si ese
 * token se borra, la huella no tiene nada que reanudar, y da igual lo bien que
 * funcione el sensor.
 *
 * Por eso hay que separar dos finales que se parecen mucho y no son lo mismo:
 *
 * - **El cliente se fue** —cerró sesión a propósito, o cerró todas—. Se avisa
 *   al servidor para que invalide el token de refresco, y se borra todo.
 * - **La sesión caducó sola** —pasó el tiempo de inactividad, o el servidor
 *   rechazó un refresco—. Aquí el cliente no ha pedido salir: ha dejado el
 *   teléfono encima de la mesa. El original lo trata aparte y **no llama al
 *   servidor**: `session_guard.dart` dispara `SessionExpired`, que solo llama a
 *   `SessionManager.clearSession()`, mientras que cerrar sesión pasa por el
 *   repositorio y sí hace la petición.
 *
 * **Los dos defectos que esto corrige.** Los dos impedían entrar con la huella,
 * y hacían falta los dos para que dejara de funcionar del todo:
 *
 * 1. El porte llamaba a `auth.logout()` en los dos casos, así que al vencer la
 *    inactividad hacía `POST /auth/logout` y el backend invalidaba el token de
 *    refresco **en su base de datos**. A partir de ahí la reanudación era
 *    imposible aunque el teléfono hubiera conservado el token. El original no
 *    hace esa llamada.
 * 2. Y el borrado local se llevaba el token de refresco por delante — esto
 *    también en el original, cuyo `clearSession` borra los tres tokens pese a
 *    que su propio comentario dice que sirve para «keep device binding &
 *    biometric config». Conservar una configuración de biometría cuyo único
 *    mecanismo se acaba de borrar no sirve de nada: el botón quedaba prometido
 *    y vacío.
 *
 * Medido en el Pixel el 2026-09-18: al pulsar «Entrar con tu huella» la
 * pantalla respondía «Tu sesión expiró» **sin llegar a pedir el dedo**, que es
 * la comprobación previa diciendo que no hay token de refresco.
 */
export enum CausaDelFinDeSesion {
  /** El cliente pulsó «Cerrar sesión». */
  CierreDelCliente = 'cierre-del-cliente',

  /** El cliente pulsó «Cerrar todas las sesiones». */
  CierreDeTodas = 'cierre-de-todas',

  /** Pasó el tiempo de inactividad que publica el backend. */
  Inactividad = 'inactividad',

  /** El servidor rechazó el token de refresco. */
  RefrescoRechazado = 'refresco-rechazado',
}

export interface CierreDeSesion {
  /**
   * Si hay que avisar al servidor.
   *
   * Solo cuando el cliente se va a propósito: la petición invalida el token de
   * refresco en el backend, y hacerla por una inactividad le quita al cliente
   * la posibilidad de volver con la huella sin que él haya pedido nada.
   */
  avisarAlServidor: boolean;

  /**
   * Si hay que borrar el token de refresco del teléfono.
   *
   * **Decidido por el banco el 2026-09-18.** Una inactividad **bloquea** la
   * aplicación: se tira el token de acceso y se conserva el de refresco, para
   * que la huella tenga algo que desbloquear. Pasados los siete días que el
   * backend le da, o si el servidor lo rechaza, se piden credenciales.
   *
   * Los otros tres finales sí lo borran: en dos el cliente pidió salir, y en el
   * tercero el propio servidor acaba de decir que ese token ya no vale, así que
   * guardarlo solo sirve para volver a intentarlo y volver a fallar.
   */
  borrarTokenDeRefresco: boolean;
}

/** Qué hacer con cada final. */
export function cierrePara(causa: CausaDelFinDeSesion): CierreDeSesion {
  switch (causa) {
    case CausaDelFinDeSesion.CierreDelCliente:
    case CausaDelFinDeSesion.CierreDeTodas:
      return { avisarAlServidor: true, borrarTokenDeRefresco: true };

    case CausaDelFinDeSesion.Inactividad:
      return { avisarAlServidor: false, borrarTokenDeRefresco: false };

    case CausaDelFinDeSesion.RefrescoRechazado:
      return { avisarAlServidor: false, borrarTokenDeRefresco: true };
  }
}

/** Si ese final lo pidió el cliente o le ocurrió. */
export function loPidioElCliente(causa: CausaDelFinDeSesion): boolean {
  return (
    causa === CausaDelFinDeSesion.CierreDelCliente ||
    causa === CausaDelFinDeSesion.CierreDeTodas
  );
}
