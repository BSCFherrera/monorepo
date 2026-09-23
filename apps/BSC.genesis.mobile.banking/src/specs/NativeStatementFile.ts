import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Entrega al teléfono el PDF de un estado de cuenta.
 *
 * La app Flutter lo resuelve con `share_plus`: escribe el archivo en el
 * directorio temporal y abre la hoja de compartir del sistema, desde donde el
 * cliente lo guarda, lo abre en un lector o lo manda por correo. Aquí se hace
 * lo mismo **sin dependencia externa**, con el mismo patrón que los otros
 * cuatro módulos nativos de esta app —llave de dispositivo, almacenamiento
 * cifrado, biometría y pantalla segura—: un módulo propio, corto y auditable,
 * en vez de código nativo de terceros dentro de una aplicación bancaria.
 *
 * El método recibe el PDF **en base64**, que es como llega del backend, para no
 * convertirlo a un arreglo de bytes en JavaScript: un estado de cuenta de varias
 * páginas cruzaría el puente como cientos de miles de números.
 *
 * ⚠️ **Solo hay implementación de Android.** Igual que los otros cuatro módulos,
 * el lado de iOS queda pendiente del equipo macOS (P-13). En iOS la pieza
 * equivalente es `UIActivityViewController` sobre un archivo en el directorio
 * temporal de la aplicación.
 */
export interface Spec extends TurboModule {
  /**
   * Escribe el PDF y abre la hoja de compartir del sistema.
   *
   * Rechaza con `pdf_invalido` si el base64 no se puede decodificar, y con
   * `sin_actividad` si no hay una actividad a la que asociar la hoja.
   */
  guardarYCompartir(
    pdfEnBase64: string,
    nombreDeArchivo: string,
  ): Promise<void>;
}

/**
 * Se pide con `get` y no con `getEnforcing` **a propósito**.
 *
 * `getEnforcing` revienta en el momento de importar el módulo cuando la
 * plataforma no lo registra, y eso tumbaría la aplicación entera al arrancar en
 * iOS, donde todavía no existe (P-13) —no solo la descarga del estado de
 * cuenta—. Devolviendo nulo, la pantalla comprueba si puede descargar y lo dice
 * en vez de caerse.
 */
export default TurboModuleRegistry.get<Spec>('StatementFile');
