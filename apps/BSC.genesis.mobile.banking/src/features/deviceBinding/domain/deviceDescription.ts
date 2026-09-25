import { Platform } from 'react-native';

import { appConfig } from '../../../app/config';
import NativeDeviceIntegrity from '../../../specs/NativeDeviceIntegrity';

/**
 * Cómo se describe este teléfono ante el banco.
 *
 * Portado de `_describeDevice()` de `device_binding_service.dart`. Aquella
 * versión usaba `device_info_plus` y `package_info_plus`; aquí sale todo del
 * núcleo de React Native, que en Android expone fabricante, modelo y versión
 * del sistema en `Platform.constants`. Dos dependencias menos en la ruta del
 * enrolamiento.
 */

export interface DescripcionLegible {
  nombre: string;
  sistemaOperativo: string;
}

/** Lo que se enseña cuando no se pudo leer nada del dispositivo. */
export const DESCRIPCION_GENERICA: DescripcionLegible = {
  nombre: 'Dispositivo móvil',
  sistemaOperativo: 'Desconocido',
};

/**
 * Compone el nombre a partir de fabricante y modelo.
 *
 * Es una función aparte y pura porque **el cliente lee este texto en el correo
 * de aviso de dispositivo nuevo**, y es con él con lo que decide si el
 * registro fue suyo. «Google Pixel 10a» sirve; «stallion», el nombre interno
 * del dispositivo, no le dice nada a nadie.
 */
export function nombreLegible(
  fabricante: string | undefined,
  modelo: string | undefined,
): string {
  const partes = [fabricante, modelo]
    .map(parte => (typeof parte === 'string' ? parte.trim() : ''))
    .filter(parte => parte !== '');

  if (partes.length === 0) return DESCRIPCION_GENERICA.nombre;

  // Muchos fabricantes ya incluyen su nombre en el modelo —«Pixel 10a» de
  // «Google»— pero otros no. Se evita repetirlo cuando ya está.
  if (
    partes.length === 2 &&
    partes[1]!.toLowerCase().startsWith(partes[0]!.toLowerCase())
  ) {
    return partes[1]!;
  }

  return partes.join(' ');
}

/** Cómo se nombra el sistema operativo. */
export function sistemaLegible(
  plataforma: string,
  version: string | number | undefined,
): string {
  const etiqueta = plataforma === 'ios' ? 'iOS' : 'Android';
  const numero =
    version === undefined || String(version).trim() === ''
      ? ''
      : ` ${String(version).trim()}`;

  return `${etiqueta}${numero}`;
}

/**
 * La versión que declara el paquete instalado.
 *
 * **Sale del manifiesto y no de `package.json`.** Las dos estuvieron
 * desalineadas —la aplicación decía «0.1.0» y el manifiesto «1.0»—, de modo que
 * la app se contradecía a sí misma y soporte no podía saber qué compilación
 * tenía delante al recibir un reporte. Hoy Gradle deriva el manifiesto de
 * `package.json`, así que hay una sola fuente; leer el manifiesto es lo que
 * garantiza que lo que se enseña es lo que se instaló de verdad.
 *
 * Si el módulo nativo no responde —en la vista previa del navegador y en las
 * pruebas no existe— cae al valor de la configuración, que es el mismo número.
 */
export async function versionDeLaApp(): Promise<string> {
  try {
    const nativa = await NativeDeviceIntegrity.getAppVersion();
    if (nativa !== '') return nativa;
  } catch {
    // Sin módulo nativo se usa el de la configuración.
  }
  return appConfig.version;
}

/**
 * La versión con su número de compilación: `0.1.0 (100)`.
 *
 * Es el formato del pie del perfil del original —`'${info.version}
 * (${info.buildNumber})'`—. El número entre paréntesis es lo que distingue dos
 * compilaciones de la misma versión, que es el dato que soporte necesita cuando
 * un cliente reporta algo que en otra instalación no ocurre.
 *
 * Sin el número, devuelve solo la versión en vez de escribir un paréntesis
 * vacío.
 */
export async function versionConCompilacion(): Promise<string> {
  const version = await versionDeLaApp();

  try {
    const compilacion = await NativeDeviceIntegrity.getAppBuild();
    if (compilacion !== '') return `${version} (${compilacion})`;
  } catch {
    // Se queda con la versión a secas.
  }

  return version;
}

/** Nombre y sistema operativo, sin tocar el puente nativo. */
export function describirDispositivo(): DescripcionLegible {
  try {
    const constantes = Platform.constants as
      | { Manufacturer?: string; Model?: string; Release?: string }
      | undefined;

    return {
      nombre: nombreLegible(constantes?.Manufacturer, constantes?.Model),
      sistemaOperativo: sistemaLegible(
        Platform.OS,
        constantes?.Release ?? Platform.Version,
      ),
    };
  } catch {
    return { ...DESCRIPCION_GENERICA };
  }
}

/**
 * Lo que viaja al banco al registrar el dispositivo.
 *
 * Nunca lanza: sin los datos del dispositivo se usan los genéricos. Abortar un
 * enrolamiento porque no se pudo leer el nombre del modelo sería cambiar una
 * molestia por una imposibilidad.
 */
export async function describirDispositivoParaElBanco(): Promise<
  DescripcionLegible & { versionDeLaApp: string }
> {
  return { ...describirDispositivo(), versionDeLaApp: await versionDeLaApp() };
}

/**
 * Identificador estable de esta instalación.
 *
 * Se genera una vez y se guarda en el almacenamiento seguro. **Si cambiara en
 * cada arranque, el cliente acumularía dispositivos fantasma** y agotaría el
 * límite de cinco que impone el banco, quedándose sin poder registrar el
 * teléfono que sí usa.
 *
 * No necesita ser impredecible, solo estable y distinto entre instalaciones: el
 * servidor no le concede ninguna autoridad —la autoridad está en la llave del
 * hardware y en el token de sesión—. Por eso no hace falta un generador
 * criptográfico ni la dependencia que lo traería.
 */
export function generarDeviceId(
  semilla: string,
  ahoraEnMilisegundos: number,
): string {
  const huella = hashDeTexto(`${ahoraEnMilisegundos}-${semilla}`)
    .toString(16)
    .padStart(8, '0');

  return `bsc-${huella}-${ahoraEnMilisegundos.toString(16)}`;
}

/**
 * El mismo hash de 32 bits que usa Dart en `String.hashCode`, en la forma en
 * que el original lo aplicaba. No es criptográfico y no pretende serlo.
 */
function hashDeTexto(texto: string): number {
  let acumulado = 0;

  for (let i = 0; i < texto.length; i += 1) {
    acumulado = (acumulado << 5) - acumulado + texto.charCodeAt(i);
    // Fuerza la aritmética de 32 bits con signo; el `>>> 0` de la salida la
    // devuelve a sin signo para que no aparezca un menos en el identificador.
    acumulado |= 0;
  }

  return acumulado >>> 0;
}
