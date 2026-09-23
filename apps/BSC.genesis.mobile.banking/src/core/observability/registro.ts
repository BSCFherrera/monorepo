import { appConfig } from '../../app/config';

import { redactar } from './redaccion';

/**
 * El registro de la aplicación (T-14).
 *
 * **La única forma de registrar algo.** No existe una función que escriba sin
 * pasar por la redacción, y es deliberado: si existiera, alguien la usaría con
 * prisa un martes por la tarde y un número de cuenta acabaría en `logcat`.
 *
 * `scripts/babel-quitar-console.js` borra las llamadas a `console.*` del
 * paquete de producción precisamente para que este sea el único camino. Lo que
 * queda aquí sí puede salir del teléfono, así que todo pasa por `redactar`.
 *
 * **En producción no se escribe nada por consola.** El registro se entrega al
 * destino que se configure —hoy ninguno— y se queda en memoria para que la
 * pantalla de diagnóstico pueda enseñarlo. Escribir en `logcat` en release
 * sería tirar por tierra el trabajo de quitar `console`.
 */

export type NivelDeRegistro = 'debug' | 'info' | 'warn' | 'error';

export interface EntradaDeRegistro {
  nivel: NivelDeRegistro;
  mensaje: string;
  /** Datos de contexto, ya redactados. */
  datos: unknown;
  momento: string;
}

/** A dónde van las entradas además de la memoria. */
export type DestinoDeRegistro = (entrada: EntradaDeRegistro) => void;

/**
 * Cuántas entradas se conservan.
 *
 * Es un anillo y no una lista que crece: un registro sin límite es una fuga de
 * memoria en una aplicación que puede pasar horas abierta, y las entradas
 * viejas no sirven para diagnosticar lo que acaba de pasar.
 */
const CAPACIDAD = 200;

const entradas: EntradaDeRegistro[] = [];
let destino: DestinoDeRegistro | null = null;

function escribir(
  nivel: NivelDeRegistro,
  mensaje: string,
  datos?: unknown,
): void {
  const entrada: EntradaDeRegistro = {
    nivel,
    mensaje,
    // La redacción ocurre **aquí**, no en quien llama: confiar en que cada
    // punto de llamada redacte es confiar en que nadie tenga prisa nunca.
    datos: datos === undefined ? undefined : redactar(datos),
    momento: new Date().toISOString(),
  };

  entradas.push(entrada);
  if (entradas.length > CAPACIDAD) entradas.shift();

  destino?.(entrada);

  /*
    Por consola solo en desarrollo. En release estas líneas no existen —Babel
    las quita— pero la condición está igualmente escrita: leerla explica la
    intención a quien abra el archivo, y no depende de que el paso de
    compilación esté bien configurado.
  */
  if (appConfig.permiteDiagnostico) {
    const texto = `[${nivel}] ${mensaje}`;
    if (nivel === 'error') console.error(texto, entrada.datos);
    else console.log(texto, entrada.datos);
  }
}

export const Registro = {
  debug: (mensaje: string, datos?: unknown): void =>
    escribir('debug', mensaje, datos),
  info: (mensaje: string, datos?: unknown): void =>
    escribir('info', mensaje, datos),
  warn: (mensaje: string, datos?: unknown): void =>
    escribir('warn', mensaje, datos),

  /**
   * Un fallo.
   *
   * La causa se reduce a su mensaje y su nombre: una excepción entera lleva
   * dentro la petición que la produjo, con sus cabeceras y su cuerpo, y eso es
   * justo lo que no debe quedar registrado.
   */
  error: (mensaje: string, causa?: unknown, datos?: unknown): void => {
    escribir('error', mensaje, {
      ...(typeof datos === 'object' && datos !== null ? datos : { datos }),
      causa: describirCausa(causa),
    });
  },

  /** Las entradas conservadas, ya redactadas. Para la pantalla de diagnóstico. */
  historial: (): readonly EntradaDeRegistro[] => [...entradas],

  /** Conecta un destino —un servicio de observabilidad— cuando el banco elija uno. */
  enviarA: (siguiente: DestinoDeRegistro | null): void => {
    destino = siguiente;
  },

  limpiar: (): void => {
    entradas.length = 0;
  },
};

function describirCausa(causa: unknown): string {
  if (causa === undefined || causa === null) return '';
  if (causa instanceof Error) return `${causa.name}: ${causa.message}`;
  if (typeof causa === 'string') return causa;
  return 'error no identificado';
}
