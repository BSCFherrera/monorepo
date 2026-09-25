/**
 * @bsc/i18n — el sistema de traducción de las apps de BSC.
 *
 * i18next por debajo, con tres decisiones de este proyecto encima:
 *
 *  - El **español es el idioma de origen** y el único que existe hoy. Los
 *    demás se añaden en `idiomas.ts` y `locales/`, sin tocar pantallas.
 *  - El idioma lo **elige el cliente** en la app (`cambiarIdioma`), no se toma
 *    del teléfono.
 *  - Las fechas usan nombres de mes traducidos y **no `Intl`**, que Hermes no
 *    trae completo.
 *
 * Las pantallas usan `useTranslation` y el código sin React, `t`.
 */
import i18next from 'i18next';

export { useTranslation, Trans } from 'react-i18next';
export { IDIOMAS, IDIOMA_POR_DEFECTO, esIdioma, type Idioma } from './idiomas';
export { iniciarTraducciones, type Recursos } from './instancia';
export {
  cambiarIdioma,
  idiomaActual,
  restaurarIdioma,
  type AlmacenDeIdioma,
} from './preferencia';
export { meridiano, nombreCortoDelMes, nombreDelMes } from './calendario';
export { clavesDe, compararTraducciones, textosVacios } from './claves';

/** Traducción fuera de React (almacenes, mensajes de error, formatos). */
export const t: typeof i18next.t = i18next.t.bind(i18next);

/** Los textos compartidos, para declarar los tipos en cada app. */
export { default as comunEs } from './locales/es/common.json';
