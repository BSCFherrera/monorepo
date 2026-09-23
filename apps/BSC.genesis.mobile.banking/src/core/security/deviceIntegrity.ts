import NativeDeviceIntegrity from '../../specs/NativeDeviceIntegrity';

/**
 * Veredicto de integridad del dispositivo, en la forma que el backend espera.
 *
 * Portado de `device_integrity.dart`. En la app Flutter, `RootDetection` y
 * `AppIntegrity` estaban escritas y **nadie las llamaba**: el resultado nunca
 * salía de la aplicación. Esto las reúne en un único veredicto que viaja al
 * enrolar el dispositivo, que es el momento en que importa —es cuando el banco
 * entrega un secreto, y entregarlo a un teléfono con root es entregarlo sin
 * protección.
 *
 * ⚠️ El veredicto lo produce el cliente, así que el backend no puede confiarse
 * de él. Ver `NativeDeviceIntegrity.ts` para qué protege de verdad y qué no.
 */

/** Valor que el backend interpreta como «sin objeciones». */
export const VEREDICTO_OK = 'ok';

/** Motivos, en el orden en que se reportan si coinciden varios. */
export const VEREDICTO_ROOT = 'root';
export const VEREDICTO_ALTERADA = 'tampered';
export const VEREDICTO_DEPURADOR = 'debugger';

/**
 * Identificadores de paquete válidos.
 *
 * `com.bsc.mobile` es el de este proyecto. Se conservan los dos de la app
 * Flutter porque conviven en el mismo teléfono durante la migración y porque
 * **una lista que no incluye el paquete verdadero bloquea a todo el mundo**:
 * es exactamente lo que pasaba en el original, donde la comprobación miraba
 * `com.bsc.mobileapp` mientras el `applicationId` real era
 * `com.example.bsc_mobile_app`.
 */
export const PAQUETES_VALIDOS: readonly string[] = [
  'com.bsc.mobile',
  'com.example.bsc_mobile_app',
  'com.bsc.mobileapp',
];

/** Las tres sondas, ya resueltas. Separarlo hace comprobable la precedencia. */
export interface SondasDeIntegridad {
  comprometido: boolean;
  paqueteEsperado: boolean;
  conDepurador: boolean;
}

/**
 * El veredicto a partir de las sondas.
 *
 * Es una función pura y el orden de las tres comprobaciones es el del original:
 * si un teléfono con root además tiene el paquete cambiado, se reporta `root`,
 * que es el motivo más grave.
 */
export function veredictoDe(sondas: SondasDeIntegridad): string {
  if (sondas.comprometido) return VEREDICTO_ROOT;
  if (!sondas.paqueteEsperado) return VEREDICTO_ALTERADA;
  if (sondas.conDepurador) return VEREDICTO_DEPURADOR;
  return VEREDICTO_OK;
}

/**
 * Mensaje para el cliente.
 *
 * **No detalla el motivo a propósito**: decirle a un atacante exactamente qué
 * control lo detectó le ahorra el trabajo de averiguarlo.
 */
export function mensajeDeVeredicto(veredicto: string): string {
  if (veredicto === VEREDICTO_OK) return '';
  return (
    'Este dispositivo no cumple los requisitos de seguridad para registrarse. ' +
    'Si crees que es un error, contáctanos.'
  );
}

/**
 * Evalúa el dispositivo.
 *
 * **En depuración devuelve siempre `ok`.** La app de desarrollo corre con el
 * depurador conectado y sin firmar, así que evaluar de verdad haría imposible
 * trabajar —y probar el enrolamiento en el Pixel, que es justo lo que hay que
 * hacer—. La consecuencia es aceptable porque una compilación de depuración no
 * llega a un cliente; conviene recordarlo al verificar en dispositivo: **el
 * veredicto que se ve en el Pixel es `ok` por esta razón, no porque las sondas
 * hayan corrido.**
 */
export async function evaluarIntegridad(): Promise<string> {
  if (__DEV__) return VEREDICTO_OK;

  try {
    const [comprometido, conDepurador, paquete] = await Promise.all([
      NativeDeviceIntegrity.isDeviceCompromised(),
      NativeDeviceIntegrity.isDebuggerAttached(),
      NativeDeviceIntegrity.getPackageName(),
    ]);

    return veredictoDe({
      comprometido,
      // Sin poder leer el nombre del paquete no se acusa al dispositivo de
      // estar alterado: el módulo rechaza, y la ausencia de dato no es prueba.
      paqueteEsperado: PAQUETES_VALIDOS.includes(paquete),
      conDepurador,
    });
  } catch {
    /*
      El módulo nativo no respondió. Se reporta `ok` en vez de bloquear, por la
      misma razón que cada sonda individual: la comprobación existe para
      proteger al cliente honesto, y un fallo suyo no debe dejarlo sin poder
      registrar su teléfono. El banco recibe el veredicto y decide.
    */
    return VEREDICTO_OK;
  }
}
