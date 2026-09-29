

import { StyleSheet } from 'react-native';

import { receiptRowStyles } from '../components/BscReceiptRow';
import {
  receiptTokens as M,
  RECEIPT_ICON_BACKGROUND_OPACITY,
} from '../componentTokens';

/**
 * La segunda mitad del circuito.
 *
 * Arriba se comprueba que las medidas son las del original; aquí, que la hoja
 * de estilos **las usa**. Sin esto, alguien podría volver a escribir un 12 a
 * mano en el `StyleSheet` y las pruebas de arriba seguirían en verde: se
 * estaría comprobando una copia, no la pantalla.
 */
describe('la hoja de estilos usa esas medidas', () => {
  const plano = (e: unknown): Record<string, unknown> =>
    StyleSheet.flatten(e as never) as unknown as Record<string, unknown>;

  it('la fila con icono conserva su caja', () => {
    expect(plano(receiptRowStyles.cajaDelIcono).width).toBe(M.row.iconBox);
    expect(plano(receiptRowStyles.cajaDelIcono).height).toBe(
      M.row.iconBox,
    );
    expect(plano(receiptRowStyles.titulo).fontSize).toBe(M.row.titleFontSize);
  });

  it('la opacidad del fondo del icono es la del original', () => {
    expect(RECEIPT_ICON_BACKGROUND_OPACITY).toBe(0.12);
  });
});
