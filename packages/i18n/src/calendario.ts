import i18next from 'i18next';

import comunEs from './locales/es/common.json';

/**
 * Nombres de meses en el idioma actual.
 *
 * Es un punto de entrada propio (`@bsc/i18n/calendario`) y **no importa
 * React**: lo usan los formatos de `@bsc/shared`, que también consume el
 * portal web.
 *
 * Salen de las traducciones y **no de `Intl`**: Hermes no trae los datos de
 * internacionalización en todas las compilaciones, y `toLocaleDateString` puede
 * devolver el formato de inglés aunque se pida español (ver `formatters.ts`
 * de `@bsc/shared`).
 */
function lista(clave: 'mesesCortos' | 'meses'): readonly string[] {
  // Sin traducciones iniciadas (un consumidor que solo usa los formatos, como
  // el portal) se usan los nombres en español, no las claves.
  if (!i18next.isInitialized) return comunEs.calendario[clave];
  const valor = i18next.t(`calendario.${clave}`, { ns: 'common', returnObjects: true }) as unknown;
  return Array.isArray(valor) ? (valor as string[]) : comunEs.calendario[clave];
}

/** «ene», «feb»… El índice va de 0 a 11, como `Date.getMonth()`. */
export function nombreCortoDelMes(indice: number): string {
  return lista('mesesCortos')[indice] ?? '';
}

/** «Enero», «Febrero»… El índice va de 0 a 11, como `Date.getMonth()`. */
export function nombreDelMes(indice: number): string {
  return lista('meses')[indice] ?? '';
}

/** «a. m.» o «p. m.» según la hora (0 a 23), como se escribe en el idioma actual. */
export function meridiano(horas: number): string {
  const clave = horas < 12 ? 'am' : 'pm';
  if (!i18next.isInitialized) return comunEs.calendario.meridiano[clave];
  return i18next.t(`calendario.meridiano.${clave}`, { ns: 'common' });
}
