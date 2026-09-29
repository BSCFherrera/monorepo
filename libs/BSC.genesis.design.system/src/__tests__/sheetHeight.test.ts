

import {
  sheetMaxHeight,
  keyboardOverlap,
  SHEET_MAX_HEIGHT_FACTOR,
} from '../sheetHeight';

describe('el tope que calcula el porte', () => {
  const VENTANA = 2400;

  it('sin teclado es el 92 % de la pantalla', () => {
    expect(sheetMaxHeight({ windowHeight: VENTANA })).toBeCloseTo(
      VENTANA * SHEET_MAX_HEIGHT_FACTOR,
    );
  });

  it('con el teclado abierto nunca supera lo que queda', () => {
    // El defecto era exactamente este: con un teclado de 1000 sobre una
    // pantalla de 2400 quedan 1400, y la hoja seguía pudiendo medir 2208.
    const tope = sheetMaxHeight({
      windowHeight: VENTANA,
      keyboardHeight: 1000,
    });

    expect(tope).toBe(1400);
    expect(tope).toBeLessThan(VENTANA * SHEET_MAX_HEIGHT_FACTOR);
  });

  it('con un teclado pequeño sigue mandando el 92 %', () => {
    // Un teclado que ocupa menos del 8 % no debe agrandar la hoja.
    expect(
      sheetMaxHeight({ windowHeight: VENTANA, keyboardHeight: 100 }),
    ).toBeCloseTo(VENTANA * SHEET_MAX_HEIGHT_FACTOR);
  });

  it('un teclado más alto que la pantalla no da un tope negativo', () => {
    expect(
      sheetMaxHeight({ windowHeight: VENTANA, keyboardHeight: 9999 }),
    ).toBe(0);
  });

  it('antes de medir la ventana no impone tope', () => {
    // Un tope de cero en el primer fotograma dejaría la hoja invisible.
    expect(sheetMaxHeight({ windowHeight: 0 })).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it('respeta un factor propio cuando quien la usa lo pide', () => {
    expect(sheetMaxHeight({ windowHeight: VENTANA, factor: 0.5 })).toBe(
      1200,
    );
  });
});

/**
 * El hueco de la barra de navegación, medido en el Pixel 10a.
 *
 * **Por qué existe esta prueba.** Descontar el teclado no bastó. Verificando
 * V-19 en el teléfono, con la hoja de alta de beneficiario abierta y el teclado
 * numérico desplegado, el botón «Validar cuenta» seguía quedando **21 píxeles
 * por debajo del borde del teclado**, y el relleno inferior del pie no se veía
 * en absoluto. El número copiado era correcto y el resultado seguía mal, que es
 * la misma clase de trampa que la del 0,92.
 *
 * La causa está en dos sistemas de coordenadas distintos:
 *
 *  - `keyboardDidShow` mide el teclado contra la **ventana de la aplicación**,
 *    que no incluye la barra de navegación.
 *  - El `Modal` con `statusBarTranslucent` se dibuja sobre la **pantalla
 *    entera**, barra de navegación incluida.
 *
 * Así que reservar lo que React Native reporta deja sin cubrir exactamente el
 * alto de esa barra, y ahí es donde cae el final de la hoja.
 *
 * Las medidas son de `dumpsys window displays` en el Pixel 10a, y por eso se
 * escriben en píxeles: son lo que el sistema respondió, no un número elegido.
 */
describe('el hueco de la barra de navegación (V-19, Pixel 10a)', () => {
  /** `adb shell wm density` → 420, es decir 2,625 píxeles por punto. */
  const DENSIDAD = 420 / 160;

  /** `adb shell wm size` → 1080x2424. */
  const PANTALLA_PX = 2424;

  /** `InsetsSourceControl mType=ime` → `Insets{… bottom=965}`. */
  const TECLADO_REAL_PX = 965;

  /** `InsetsSource type=navigationBars frame=[0,2361][1080,2424]`. */
  const BARRA_DE_NAVEGACION_PX = 63;

  const enPuntos = (px: number): number => px / DENSIDAD;

  /**
   * Lo que `evento.endCoordinates.height` entregó: el teclado medido contra la
   * ventana, sin la barra de navegación.
   */
  const alturaReportada = enPuntos(TECLADO_REAL_PX - BARRA_DE_NAVEGACION_PX);

  it('reserva el teclado entero, no solo lo que React Native reporta', () => {
    expect(
      keyboardOverlap({
        reportedHeight: alturaReportada,
        bottomInset: enPuntos(BARRA_DE_NAVEGACION_PX),
      }),
    ).toBeCloseTo(enPuntos(TECLADO_REAL_PX));
  });

  it('el borde inferior de la hoja no queda por debajo del teclado', () => {
    const reservado = keyboardOverlap({
      reportedHeight: alturaReportada,
      bottomInset: enPuntos(BARRA_DE_NAVEGACION_PX),
    });

    const bordeInferiorDeLaHoja = enPuntos(PANTALLA_PX) - reservado;
    const bordeSuperiorDelTeclado =
      enPuntos(PANTALLA_PX) - enPuntos(TECLADO_REAL_PX);

    expect(bordeInferiorDeLaHoja).toBeLessThanOrEqual(
      bordeSuperiorDelTeclado + 0.001,
    );
  });

  it('reservar solo lo reportado deja fuera la barra de navegación', () => {
    // El defecto, escrito como medida: 63 píxeles sin cubrir, que son los 16
    // puntos de relleno del pie más los 8 últimos del botón de 54.
    const sinCorregir = enPuntos(PANTALLA_PX) - alturaReportada;
    const bordeSuperiorDelTeclado =
      enPuntos(PANTALLA_PX) - enPuntos(TECLADO_REAL_PX);

    expect((sinCorregir - bordeSuperiorDelTeclado) * DENSIDAD).toBeCloseTo(
      BARRA_DE_NAVEGACION_PX,
    );
  });

  it('con el teclado cerrado no reserva nada', () => {
    // Sin teclado, el hueco de la barra lo pone el pie con `insets.bottom`;
    // sumarlo aquí además dejaría un vacío del doble.
    expect(
      keyboardOverlap({ reportedHeight: 0, bottomInset: 24 }),
    ).toBe(0);
  });

  it('un inset negativo no encoge la reserva', () => {
    expect(
      keyboardOverlap({ reportedHeight: 300, bottomInset: -10 }),
    ).toBe(300);
  });
});
