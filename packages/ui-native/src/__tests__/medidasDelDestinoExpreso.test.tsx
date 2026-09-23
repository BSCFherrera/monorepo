

import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { BscTextField } from '../components/BscTextField';
import { textFieldTokens as CAMPO } from '../componentTokens';

// ─── 2. Lo que el porte dibuja de verdad ────────────────────────────────────

/** Todos los estilos aplanados del árbol que dibuja un elemento. */
const estilosDe = (elemento: React.JSX.Element): Record<string, unknown>[] => {
  let arbol: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    arbol = TestRenderer.create(elemento);
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

/**
 * Los hijos directos del nodo raíz que dibuja un elemento.
 *
 * ⚠️ Mirar los **textos** del árbol no sirve aquí y conviene dejarlo escrito:
 * `<Text>{''}</Text>` no deja ningún nodo de texto en `toJSON()`, así que una
 * prueba que busque la cadena vacía pasa aunque el elemento siga dibujándose y
 * siga reservando su línea. Lo que hay que contar son los elementos.
 */
const hijosDelaRaiz = (elemento: React.JSX.Element): string[] => {
  let arbol: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    arbol = TestRenderer.create(elemento);
  });

  const raiz = arbol?.toJSON();
  if (raiz === null || raiz === undefined || Array.isArray(raiz)) return [];

  const hijos = raiz.children ?? [];
  return hijos.map(h =>
    typeof h === 'string' ? 'texto' : (h as { type: string }).type,
  );
};

describe('BscTextField con la etiqueta vacía', () => {
  const conEtiquetaVacia = (
    <BscTextField label="" value="" onChangeText={() => {}} />
  );
  const conEtiqueta = (
    <BscTextField label="Usuario" value="" onChangeText={() => {}} />
  );

  it('empieza por la caja del campo, no por la etiqueta', () => {
    // El defecto: un `<Text>` vacío reserva su línea igual —18 dp de
    // `titleSmall` más 4 de margen— y empuja el campo 22 dp hacia abajo en las
    // seis pantallas que pasan `label=""`.
    //
    // El último hijo es la ranura de error, que sí reserva alto a propósito
    // para que el formulario no salte; por eso se mira el primero y no la
    // ausencia de `Text`.
    expect(hijosDelaRaiz(conEtiquetaVacia)[0]).toBe('View');
  });

  it('pero empieza por la etiqueta cuando sí la hay', () => {
    expect(hijosDelaRaiz(conEtiqueta)[0]).toBe('Text');
  });

  it('y por tanto no reserva el margen de la etiqueta', () => {
    const margenes = estilosDe(conEtiquetaVacia)
      .map(e => e.marginBottom)
      .filter(m => typeof m === 'number');

    expect(margenes).not.toContain(4);
  });
});

describe('BscTextField sin error', () => {
  const sinError = <BscTextField label="" value="" onChangeText={() => {}} />;
  const conError = (
    <BscTextField
      label=""
      value=""
      onChangeText={() => {}}
      error="Escribe tu usuario"
    />
  );

  it('no deja ningún elemento debajo de la caja', () => {
    // El porte reservaba 18 dp —2 de margen más 16 de alto mínimo— debajo de
    // **cada** campo, y el original no reserva ninguno: enseña los errores en
    // una banda al pie del formulario, que el porte también tiene. Medido en el
    // Pixel: del campo al rótulo siguiente el original deja 27,43 dp y el porte
    // dejaba 46,10.
    expect(hijosDelaRaiz(sinError)).toEqual(['View']);
  });

  it('pero lo dibuja en cuanto hay error', () => {
    expect(hijosDelaRaiz(conError)).toEqual(['View', 'Text']);
  });

  it('la caja mide lo que el original dibuja, no dos puntos más', () => {
    const cajas = estilosDe(sinError)
      .map(e => e.height)
      .filter(h => typeof h === 'number');

    expect(cajas).toContain(CAMPO.height);
    // El defecto era exactamente este: 52 y 50 se leen igual.
    expect(cajas).not.toContain(52);
  });
});
