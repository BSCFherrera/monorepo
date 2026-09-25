import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import TestRenderer, { act } from 'react-test-renderer';

import { BscSpinner } from '../components/BscSpinner';
import { spinnerTokens as D } from '../componentTokens';

// ─── 2. Lo que el porte entrega ─────────────────────────────────────────────

/** El `size` que el componente del porte le pasa a React Native. */
const tamanoEntregado = (elemento: React.JSX.Element): unknown => {
  let arbol: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    arbol = TestRenderer.create(elemento);
  });

  const json = arbol?.toJSON() as { props?: { size?: unknown } } | null;
  return json?.props?.size;
};

describe('el indicador del porte pide el diámetro declarado', () => {
  it.each([
    ['fullScreen', D.fullScreen],
    ['screenList', D.screenList],
    ['transactionList', D.transactionList],
    ['inRow', D.inRow],
    ['besideField', D.besideField],
    ['inButton', D.inButton],
  ] as const)('%s pide %i', (nombre, esperado) => {
    expect(tamanoEntregado(<BscSpinner tamano={nombre} />)).toBe(esperado);
  });

  it('sin decirle nada pide el de pantalla completa, no el de React Native', () => {
    // El defecto era exactamente este: sin decir nada, React Native dibuja 20.
    expect(tamanoEntregado(<BscSpinner />)).toBe(D.fullScreen);
    expect(tamanoEntregado(<BscSpinner />)).not.toBe(20);
  });
});

// ─── 3. Lo que React Native hace con ese número ─────────────────────────────

describe('React Native convierte ese número en la caja del indicador', () => {
  const fuente = join(
    __dirname,
    '..',
    '..',
    'node_modules/react-native/Libraries/Components/ActivityIndicator/ActivityIndicator.js',
  );

  const itSiEstaRN = existsSync(fuente) ? it : it.skip;

  itSiEstaRN(
    'un tamaño numérico se convierte en un cuadrado de ese lado',
    () => {
      const codigo = readFileSync(fuente, 'utf8');
      expect(codigo).toContain('sizeStyle = {height: size, width: size}');
    },
  );

  itSiEstaRN(
    'y sin tamaño se queda en 20, que es de donde venía el defecto',
    () => {
      const codigo = readFileSync(fuente, 'utf8');
      expect(codigo).toContain("size = 'small'");
      expect(
        /sizeSmall:\s*\{\s*width:\s*20,\s*height:\s*20,/u.test(codigo),
      ).toBe(true);
    },
  );
});
