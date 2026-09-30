import { BscSpacing } from '@bsc/design-system';

/**
 * Las separaciones que el original escribe a mano dentro de las hojas del
 * detalle de tarjeta.
 *
 * Mismo método que `medidasDelComprobante.ts`, y por el mismo motivo: son
 * valores literales de `credit_card_sheets.dart` y de `_showPoints` en
 * `credit_card_detail_view.dart`, no tokens. Portar los tokens no basta.
 *
 * **Lo que esto descubrió.** El porte tenía un único estilo `bloque`, con
 * `marginTop: md` (16), haciendo de comodín para cuatro huecos que en el
 * original miden tres cosas distintas: `lg` (20) antes de un título de
 * sección, `sm` (12) antes del aviso de comisiones y `xxs` (4) entre el título
 * «Movimiento del mes» y sus filas. Un solo estilo reutilizado se ve razonable
 * al leerlo y desplaza la hoja entera cuatro puntos en cada tramo.
 */
export const MEDIDAS_DE_LAS_HOJAS_DE_TARJETA = {
  /** Antes de un título de sección que sigue a un aviso. `SizedBox(lg)`. */
  antesDelTituloDeSeccion: BscSpacing.lg,

  /** Entre el título de sección y lo que viene debajo. `SizedBox(xs)`. */
  trasElTituloDeSeccion: BscSpacing.xs,

  /** Entre «Movimiento del mes» y su primera fila. `SizedBox(xxs)`. */
  trasElTituloDelMovimiento: BscSpacing.xxs,

  /** Entre el selector de origen y el aviso de comisiones. `SizedBox(sm)`. */
  antesDelAvisoDeComisiones: BscSpacing.sm,

  /** Entre la caja de límites y el aviso de gestión. `SizedBox(lg)`. */
  antesDelAvisoDeGestion: BscSpacing.lg,

  /** Entre las filas de puntos y la nota de canje. `SizedBox(sm)`. */
  antesDeLaNotaDeCanje: BscSpacing.sm,

  /** Entre el plástico y el aviso de «número protegido». `SizedBox(md)`. */
  antesDelAvisoDeSeguridad: BscSpacing.md,
} as const;
