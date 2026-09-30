

import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer, { act } from 'react-test-renderer';

import { PieDelAsistente } from '../TransferWizardChrome';
import { buttonTokens } from '@bsc/design-system';
import { PIE_DEL_ASISTENTE as F } from '../medidasDeLosAsistentes';

// ─── 2. Lo que el porte dibuja de verdad ────────────────────────────────────

/** Todos los estilos aplanados del árbol que dibuja un elemento. */
const estilosDe = (elemento: React.JSX.Element): Record<string, unknown>[] => {
  let arbol: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    arbol = TestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 800 },
          insets: { top: 24, left: 0, right: 0, bottom: 0 },
        }}
      >
        {elemento}
      </SafeAreaProvider>,
    );
  });

  const encontrados: Record<string, unknown>[] = [];
  const recorrer = (nodo: unknown): void => {
    if (nodo === null || typeof nodo !== 'object') return;
    if (Array.isArray(nodo)) {
      nodo.forEach(recorrer);
      return;
    }
    const n = nodo as { props?: { style?: unknown }; children?: unknown };
    if (n.props?.style !== undefined) {
      encontrados.push(
        (StyleSheet.flatten(n.props.style as never) ?? {}) as unknown as Record<
          string,
          unknown
        >,
      );
    }
    recorrer(n.children);
  };

  recorrer(arbol?.toJSON());
  return encontrados;
};

describe('el pie que dibuja el porte', () => {
  const pie = (): Record<string, unknown>[] =>
    estilosDe(
      <PieDelAsistente
        atras={{ etiqueta: 'Cancelar', onPress: () => {} }}
        adelante={{ etiqueta: 'Continuar', onPress: () => {} }}
      />,
    );

  it('dibuja sus dos botones a 50, no a 54', () => {
    const altos = pie()
      .map(e => e['height'])
      .filter(h => typeof h === 'number');

    expect(altos).toContain(F.altoDelBoton);
    // El defecto era exactamente este.
    expect(altos).not.toContain(buttonTokens.height);
  });

  it('la barra rellena los lados y la parte de arriba como el original', () => {
    const barra = pie().find(
      e =>
        e['paddingHorizontal'] === F.lateral && e['paddingTop'] !== undefined,
    );

    expect(barra).toBeDefined();
    expect(barra?.['paddingTop']).toBe(F.arriba);
  });

  it('separa los botones y da el doble de ancho al de seguir', () => {
    const fila = pie().find(e => e['gap'] === F.separacion);

    expect(fila).toBeDefined();
    const proporciones = pie()
      .map(e => e['flex'])
      .filter(f => typeof f === 'number');

    expect(proporciones).toContain(F.proporcionCancelar);
    expect(proporciones).toContain(F.proporcionContinuar);
  });
});
