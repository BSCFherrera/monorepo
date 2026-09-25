import { StyleSheet, View, type ViewStyle } from 'react-native';
import TestRenderer, { type ReactTestRendererJSON } from 'react-test-renderer';

import { BscBanner } from '../components/BscBanner';

/**
 * La banda de aviso, y por qué no puede encogerse.
 *
 * **Esta prueba nace de V-05, el defecto que más tiempo llevaba abierto.** Al
 * cancelar la biometría en la pantalla del token, la banda «No pudimos
 * verificarte» no aparecía. Se sospechaba un remontaje que limpiaba el estado,
 * y se instrumentó la pantalla para averiguarlo; el teléfono respondió que no
 * había tal remontaje —un solo montaje, la promesa resuelta y el aviso
 * escrito—, y que el nodo **sí se dibujaba**: medía 152 píxeles de ancho y
 * dentro solo llevaba el icono.
 *
 * La causa era de composición, no de estado. La banda vivía dentro de un
 * contenedor con `alignItems: 'center'`, que encoge a sus hijos al tamaño de
 * su contenido; la columna de textos de la banda usa `flex: 1`, así que sin
 * ancho disponible se quedaba en cero y el texto desaparecía. El icono, que
 * tiene tamaño propio, seguía viéndose. De ahí que la pantalla pareciera no
 * responder cuando en realidad estaba avisando.
 *
 * Se arregla en el sistema de diseño y no en la pantalla porque **otras once
 * pantallas usan esta misma banda** y cualquiera podría colocarla dentro de un
 * contenedor centrado sin saber que eso la vacía. Un aviso que no se lee es
 * peor que no tener aviso: el cliente cree que la aplicación no hizo nada.
 */

/*
  React 19 exige que el montaje ocurra dentro de `act`, o el renderizador queda
  desmontado antes de poder inspeccionarlo. Se envuelve aquí una sola vez para
  que las pruebas de abajo se lean por lo que comprueban.

  Se trabaja sobre `toJSON()` —el árbol de nodos nativos ya resueltos— en lugar
  de buscar por tipo en el árbol de React: es lo que el sistema recibe de
  verdad, y es donde vive el estilo que decide si la banda se encoge.
*/
const montar = (elemento: React.JSX.Element): ReactTestRendererJSON => {
  let arbol!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    arbol = TestRenderer.create(elemento);
  });

  const json = arbol.toJSON();
  if (json === null || Array.isArray(json)) {
    throw new Error('Se esperaba un único nodo raíz.');
  }
  return json;
};

const estiloDe = (nodo: ReactTestRendererJSON): ViewStyle =>
  StyleSheet.flatten((nodo.props as { style?: ViewStyle }).style) ?? {};

/** Todos los textos del árbol, en orden. */
const textosDe = (nodo: ReactTestRendererJSON): string[] => {
  const hijos = nodo.children ?? [];
  return hijos.flatMap(h =>
    typeof h === 'string' ? [h] : textosDe(h as ReactTestRendererJSON),
  );
};

describe('BscBanner', () => {
  it('no se encoge: pide el ancho de su contenedor aunque el padre centre', () => {
    const banda = montar(<BscBanner title="Aviso" subtitle="Detalle" />);

    expect(estiloDe(banda).alignSelf).toBe('stretch');
  });

  it('dibuja el título y el subtítulo, no solo el icono', () => {
    const banda = montar(
      <BscBanner
        tone="danger"
        icon="error"
        title="No se pudo mostrar"
        subtitle="No pudimos verificarte."
      />,
    );

    const textos = textosDe(banda);

    expect(textos).toContain('No se pudo mostrar');
    expect(textos).toContain('No pudimos verificarte.');
  });

  it('sigue sin encogerse cuando es pulsable', () => {
    const banda = montar(<BscBanner title="Aviso" onPress={() => {}} />);

    expect(estiloDe(banda).alignSelf).toBe('stretch');
  });

  /*
    La reproducción del escenario de V-05, para que quede escrito qué se
    rompió: la banda dentro de un contenedor centrado. `react-test-renderer` no
    calcula la disposición, así que no puede medir los 152 píxeles; lo que sí
    comprueba es que la banda lleva consigo la instrucción que impide ese
    encogimiento, esté donde esté.
  */
  it('conserva su ancho dentro de un contenedor centrado, que es donde falló', () => {
    const contenedor = montar(
      <View style={{ alignItems: 'center' }}>
        <BscBanner
          title="No se pudo mostrar"
          subtitle="No pudimos verificarte."
        />
      </View>,
    );

    const banda = (contenedor.children ?? [])[0] as ReactTestRendererJSON;

    expect(estiloDe(banda).alignSelf).toBe('stretch');
    expect(textosDe(banda)).toContain('No pudimos verificarte.');
  });
});
