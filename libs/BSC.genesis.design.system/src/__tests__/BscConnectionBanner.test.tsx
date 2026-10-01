import { StyleSheet, Text, type ViewStyle } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { BscConnectionBanner } from '../components/BscConnectionBanner';
import { BscColors } from '../theme/colors';

/**
 * El aviso de conexión: qué muestra en cada estado y cuándo ofrece reintentar.
 *
 * Lo que importa comprobar es que los dos estados no se confundan: mientras la
 * app reconecta sola no debe haber ninguna acción para el cliente (solo el
 * indicador girando), y cuando ya dejó de intentarlo el aviso tiene que decirlo
 * en tono de peligro y ofrecer la salida.
 */

const montar = (
  elemento: React.JSX.Element,
): TestRenderer.ReactTestRenderer => {
  let arbol!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    arbol = TestRenderer.create(elemento);
  });
  return arbol;
};

/** Nodos nativos (host) con ese `testID`; ignora los componentes que lo reenvían. */
const porTestID = (arbol: TestRenderer.ReactTestRenderer, testID: string) =>
  arbol.root.findAll(
    nodo => typeof nodo.type === 'string' && nodo.props.testID === testID,
  );

const textosDe = (arbol: TestRenderer.ReactTestRenderer): string[] =>
  arbol.root
    .findAllByType(Text)
    .map(nodo => nodo.props.children)
    .filter((hijo): hijo is string => typeof hijo === 'string');

const fondoDe = (arbol: TestRenderer.ReactTestRenderer, testID: string) => {
  const [banda] = porTestID(arbol, testID);
  return (StyleSheet.flatten(banda?.props.style) as ViewStyle | undefined)
    ?.backgroundColor;
};

describe('BscConnectionBanner', () => {
  it('mientras reconecta muestra el indicador de carga y ninguna acción', () => {
    const arbol = montar(
      <BscConnectionBanner
        state="reconnecting"
        title="Reconectando…"
        subtitle="Estamos recuperando la conexión."
        onRetry={jest.fn()}
        retryLabel="Reintentar"
        testID="conexion"
      />,
    );

    expect(textosDe(arbol)).toEqual([
      'Reconectando…',
      'Estamos recuperando la conexión.',
    ]);
    expect(porTestID(arbol, 'conexion-spinner')).toHaveLength(1);
    expect(porTestID(arbol, 'conexion-retry')).toHaveLength(0);
    expect(fondoDe(arbol, 'conexion')).toBe(BscColors.primarySoft);
  });

  it('sin conexión usa el tono de peligro y reintenta al tocar la acción', () => {
    const alReintentar = jest.fn();
    const arbol = montar(
      <BscConnectionBanner
        state="offline"
        title="No pudimos conectarte"
        onRetry={alReintentar}
        retryLabel="Reintentar"
        testID="conexion"
      />,
    );

    expect(porTestID(arbol, 'conexion-spinner')).toHaveLength(0);
    expect(fondoDe(arbol, 'conexion')).toBe(BscColors.errorSoft);
    expect(textosDe(arbol)).toContain('Reintentar');

    // El nodo nativo no expone `onPress`; lo tiene el `Pressable` que lo envuelve.
    const [reintentar] = arbol.root.findAll(
      nodo =>
        nodo.props.testID === 'conexion-retry' &&
        typeof nodo.props.onPress === 'function',
    );
    TestRenderer.act(() => {
      reintentar?.props.onPress();
    });

    expect(alReintentar).toHaveBeenCalledTimes(1);
  });

  it('sin conexión y sin `onRetry` no ofrece una acción que no hace nada', () => {
    const arbol = montar(
      <BscConnectionBanner
        state="offline"
        title="No pudimos conectarte"
        retryLabel="Reintentar"
        testID="conexion"
      />,
    );

    expect(porTestID(arbol, 'conexion-retry')).toHaveLength(0);
    expect(textosDe(arbol)).not.toContain('Reintentar');
  });
});
