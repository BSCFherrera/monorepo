/**
 * Medidas de los controles reutilizables.
 *
 * Los valores viven en `src/tokens` (capa de componentes); aquí solo se
 * reexportan con el nombre con el que los usan los componentes y las pantallas.
 * Cambiar una medida es cambiar el token, nunca este archivo.
 */
import {
  button,
  buttonSizes,
  receipt,
  separator,
  spinner,
  textField,
} from './tokens';

/** Botones: 54 de alto, 46 en un estado vacío, 48 en «Consultar». */
export const buttonTokens = button;

/** Tamaños de botón de la biblioteca de Figma (`size` de los botones). */
export const buttonSizeTokens = buttonSizes;

/** Separación entre filas (16) y entre bloques (0, los separa el borde). */
export const separatorTokens = separator;

/** Campo de texto: 50 de alto, relleno de 14. */
export const textFieldTokens = textField;

/** Diámetro del indicador de carga según dónde aparece. */
export const spinnerTokens = spinner;
export type SpinnerPlacement = keyof typeof spinner;

/** Comprobante de transferencia y de pago. */
export const receiptTokens = receipt;
/** Opacidad del cuadro tintado detrás del icono de una fila del comprobante. */
export const RECEIPT_ICON_BACKGROUND_OPACITY = receipt.iconBackgroundOpacity;
