

import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { BscPrimaryButton, BscSecondaryButton } from '../components/BscButton';
import {
  buttonTokens as B,
  separatorTokens as S,
} from '../componentTokens';

// ─── Lo que el porte dibuja de verdad ───────────────────────────────────────

/** El estilo que el botón acaba aplicando a su superficie. */
const estiloDelBoton = (
  elemento: React.JSX.Element,
): Record<string, unknown> => {
  let arbol: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    arbol = TestRenderer.create(elemento);
  });

  const json = arbol?.toJSON() as { props?: { style?: unknown } } | null;
  return (StyleSheet.flatten(json?.props?.style as never) ??
    {}) as unknown as Record<string, unknown>;
};

describe('el botón del porte mide lo declarado', () => {
  it('el primario mide 54 de alto', () => {
    const estilo = estiloDelBoton(
      <BscPrimaryButton label="Aceptar" onPress={() => {}} />,
    );
    expect(estilo['height']).toBe(B.height);
    // El defecto era exactamente este.
    expect(estilo['height']).not.toBe(52);
  });

  it('el secundario también', () => {
    const estilo = estiloDelBoton(
      <BscSecondaryButton label="Cancelar" onPress={() => {}} />,
    );
    expect(estilo['height']).toBe(B.height);
  });

  it('su relleno lateral es el 20 del original, no el token md', () => {
    const estilo = estiloDelBoton(
      <BscPrimaryButton label="Aceptar" onPress={() => {}} />,
    );
    expect(estilo['paddingHorizontal']).toBe(B.paddingXExpanded);
  });

  it('acepta el alto que le pide quien lo usa, para los 46 y los 48', () => {
    // Sin esto, «Consultar» y el botón del estado vacío solo podrían cambiar
    // de alto colando un estilo suelto, que es como se pierden las medidas.
    expect(
      estiloDelBoton(
        <BscPrimaryButton
          label="Consultar"
          height={B.heightQuery}
          onPress={() => {}}
        />,
      )['height'],
    ).toBe(B.heightQuery);

    expect(
      estiloDelBoton(
        <BscPrimaryButton
          label="Reintentar"
          height={B.heightCompact}
          onPress={() => {}}
        />,
      )['height'],
    ).toBe(B.heightCompact);
  });
});

describe('los dos separadores son de verdad distintos', () => {
  it('el de filas sangra y el de bloques no', () => {
    // El defecto era usar el de filas donde el original pone el de bloques.
    expect(S.betweenRows).not.toBe(S.betweenBlocks);
    expect(S.betweenBlocks).toBe(0);
  });
});
