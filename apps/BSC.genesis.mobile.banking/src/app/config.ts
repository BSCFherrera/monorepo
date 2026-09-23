import packageJson from '../../package.json';

import NativeDeviceIntegrity from '../specs/NativeDeviceIntegrity';

/**
 * Configuración por ambiente.
 *
 * La URL del backend **no tiene valor por defecto de producción**. La app
 * Flutter traía escrita en el código, como respaldo, una dirección interna del
 * banco en claro, y eso significaba que una compilación mal configurada
 * apuntaba en silencio a un servidor de desarrollo en vez de fallar (T-10).
 *
 * La dirección no se reproduce aquí a propósito: `scripts/escanear-secretos.mjs`
 * la encontró en este mismo comentario y en cuatro documentos de la migración.
 * Describir el defecto no exige repetirlo.
 *
 * Aquí el valor se inyecta en la compilación. En desarrollo se usa
 * `localhost:5000`, que funciona en el teléfono porque el túnel de `adb` lo
 * reenvía a la laptop:
 *
 *     adb reverse tcp:5000 tcp:5000
 *
 * El teléfono no alcanza la laptop por la red interna del banco —están en
 * subredes distintas y el teléfono levanta una VPN—, así que el cable es la
 * única vía que funciona.
 */

/** Ambiente de la compilación actual. */
export type Ambiente = 'desarrollo' | 'qa' | 'piloto' | 'produccion';

export interface AppConfig {
  ambiente: Ambiente;
  baseURL: string;

  /** Si se permiten pantallas de diagnóstico. Nunca en producción. */
  permiteDiagnostico: boolean;

  /**
   * Versión que el perfil escribe al pie.
   *
   * El original la lee del manifiesto con `PackageInfo.fromPlatform()`
   * —«para que el pie no pueda divergir de la compilación», dice su
   * comentario—, y eso exige o una dependencia nativa o un módulo propio.
   *
   * ⚠️ **Deuda anotada:** de momento sale de `package.json`, así que puede
   * divergir de `versionName` en `android/app/build.gradle`, que hoy dice
   * «1.0». Antes de publicar hay que unificarlas: o Gradle lee este mismo
   * archivo, o se escribe un módulo nativo corto que devuelva
   * `BuildConfig.VERSION_NAME`. Está registrado en el traspaso.
   */
  version: string;
}

/**
 * ⚠️ Provisional. Cuando existan variantes de compilación reales (P-08), esto
 * debe leerse de la configuración inyectada y no de `__DEV__`.
 */
const VERSION = (packageJson as { version?: string }).version ?? '';

/**
 * La URL que Gradle escribió en la compilación (D-18).
 *
 * Se lee de las constantes del módulo nativo, que las toma de
 * `BuildConfig.BSC_BASE_URL`. **Sigue vacía si nadie la inyectó**, y esa es la
 * mitad importante del mecanismo: lo que se resolvió aquí es *cómo* se pone la
 * URL, no *cuál* es la de producción, que sigue siendo decisión del banco.
 *
 * Un fallo al leerla —un teléfono viejo, un módulo que no cargó— se trata como
 * «no hay URL» y no como una excepción: la aplicación tiene que dar un error
 * claro de red, no morir en el arranque sin decir por qué.
 */
function urlInyectada(): string {
  try {
    return NativeDeviceIntegrity.getConstants().baseUrl;
  } catch {
    return '';
  }
}

export const appConfig: AppConfig = __DEV__
  ? {
      ambiente: 'desarrollo',
      /*
        En depuración, la URL inyectada si hay una y, si no, el backend local.

        Es lo que permite depurar contra QA sin tocar código:
        `BSC_BASE_URL=<url de QA> pnpm nx run BSC.genesis.mobile.banking:ios`.
        El respaldo existe **solo aquí**: en release una URL vacía sigue siendo
        un error (T-10), porque ahí sí apuntaría en silencio a donde no debe.
      */
      baseURL: urlInyectada() || 'http://localhost:5000',
      permiteDiagnostico: true,
      version: VERSION,
    }
  : {
      ambiente: 'produccion',
      /*
        Lo que Gradle inyectó, y **nada si no inyectó nada**.

        No hay respaldo escrito en el código a propósito: la app Flutter traía
        una dirección interna del banco como valor por defecto, de modo que una
        compilación mal configurada apuntaba en silencio a un servidor de
        desarrollo en vez de fallar (T-10). Aquí falla, y se nota.
      */
      baseURL: urlInyectada(),
      permiteDiagnostico: false,
      version: VERSION,
    };
