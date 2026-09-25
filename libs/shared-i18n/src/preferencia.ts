import i18next from 'i18next';

import { IDIOMA_POR_DEFECTO, esIdioma, type Idioma } from './idiomas';

/**
 * Dónde se guarda el idioma elegido. Lo aporta la app: este paquete no sabe
 * nada del almacenamiento del teléfono.
 */
export interface AlmacenDeIdioma {
  leer(): Promise<string | null>;
  guardar(idioma: Idioma): Promise<void>;
}

/** El idioma en que está la app ahora. */
export function idiomaActual(): Idioma {
  const actual = i18next.resolvedLanguage ?? i18next.language;
  return esIdioma(actual) ? actual : IDIOMA_POR_DEFECTO;
}

/**
 * Aplica el idioma que el cliente eligió la última vez. Se llama al arrancar.
 *
 * Un valor guardado que ya no existe (un idioma retirado, un dato corrupto) se
 * ignora y queda el de por defecto: un idioma desconocido no debe dejar la app
 * sin textos.
 */
export async function restaurarIdioma(almacen: AlmacenDeIdioma): Promise<Idioma> {
  let guardado: string | null = null;
  try {
    guardado = await almacen.leer();
  } catch {
    // Sin preferencia legible, se queda el idioma por defecto.
  }
  const idioma = esIdioma(guardado) ? guardado : IDIOMA_POR_DEFECTO;
  await i18next.changeLanguage(idioma);
  return idioma;
}

/**
 * Cambia el idioma de toda la app al instante y lo recuerda. Es lo que llamará
 * el selector de idioma.
 */
export async function cambiarIdioma(idioma: Idioma, almacen: AlmacenDeIdioma): Promise<void> {
  await i18next.changeLanguage(idioma);
  await almacen.guardar(idioma);
}
