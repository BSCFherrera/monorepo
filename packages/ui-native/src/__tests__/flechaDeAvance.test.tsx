

import TestRenderer, { act } from 'react-test-renderer';

import { BscPrimaryButton } from '../components/BscButton';
import { BscIcon } from '../components/BscIcon';

// ─── Lo que el porte dibuja ─────────────────────────────────────────────────

/** Los nombres de icono que aparecen en el árbol que dibuja un elemento. */
const iconosDe = (elemento: React.JSX.Element): string[] => {
  let arbol: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    arbol = TestRenderer.create(elemento);
  });

  const encontrados: string[] = [];
  const recorrer = (nodo: unknown): void => {
    if (nodo === null || typeof nodo !== 'object') return;
    if (Array.isArray(nodo)) {
      nodo.forEach(recorrer);
      return;
    }
    const n = nodo as {
      type?: string;
      props?: { d?: unknown };
      children?: unknown;
    };
    // `BscIcon` dibuja su trazo como un `Path`, y el trazo identifica al icono.
    if (typeof n.props?.d === 'string') encontrados.push(n.props.d);
    recorrer(n.children);
  };

  recorrer(arbol?.toJSON());
  return encontrados;
};

describe('el botón primario del porte', () => {
  const flecha = <BscIcon name="arrow-forward" size={18} />;

  it('acepta un elemento al final y lo dibuja', () => {
    const conFlecha = iconosDe(
      <BscPrimaryButton
        label="Continuar"
        onPress={() => {}}
        trailing={flecha}
      />,
    );
    const sinFlecha = iconosDe(
      <BscPrimaryButton label="Continuar" onPress={() => {}} />,
    );

    expect(conFlecha.length).toBeGreaterThan(0);
    expect(sinFlecha).toEqual([]);
  });

  it('lo dibuja después del texto, no antes', () => {
    let arbol: TestRenderer.ReactTestRenderer | undefined;
    act(() => {
      arbol = TestRenderer.create(
        <BscPrimaryButton
          label="Continuar"
          onPress={() => {}}
          leading={<BscIcon name="arrow-up" size={18} />}
          trailing={flecha}
        />,
      );
    });

    const tipos: string[] = [];
    const recorrer = (nodo: unknown): void => {
      if (nodo === null || typeof nodo !== 'object') return;
      if (Array.isArray(nodo)) {
        nodo.forEach(recorrer);
        return;
      }
      const n = nodo as { type?: string; children?: unknown };
      if (n.type === 'Text' || n.type === 'RNSVGSvgView' || n.type === 'Svg') {
        tipos.push(n.type === 'Text' ? 'texto' : 'icono');
      }
      recorrer(n.children);
    };
    recorrer(arbol?.toJSON());

    // Icono, texto, icono: el de `leading` delante y el de `trailing` detrás.
    expect(tipos).toEqual(['icono', 'texto', 'icono']);
  });
});
