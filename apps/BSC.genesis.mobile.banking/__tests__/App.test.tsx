import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import App from '../App';
import { BscColors } from '@bsc/ui-native';

/**
 * `SafeAreaProvider` mide la pantalla antes de renderizar a sus hijos, y en un
 * entorno de pruebas no hay pantalla que medir: sin esto el árbol sale vacío y
 * cualquier aserción sobre el contenido pasa por vacuidad. El mock viene con la
 * propia librería y devuelve medidas fijas.
 */
jest.mock('react-native-safe-area-context', () => {
  // El mock se publica como módulo con `default`, así que hay que desenvolverlo:
  // devolverlo tal cual deja todos los componentes en `undefined` y el error que
  // se ve es «Element type is invalid», que no apunta a la causa.
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

/**
 * Prueba de humo de la raíz.
 *
 * No verifica el diseño —para eso están las pruebas de paridad en
 * `src/design-system/__tests__/parity.test.ts`— sino que la aplicación monta sin
 * romperse y que los tokens portados llegan efectivamente a la pantalla. Si un
 * token quedara sin exportar o con el nombre cambiado, falla aquí y no en el
 * teléfono.
 */
/**
 * Monta la app y devuelve el árbol ya renderizado.
 *
 * Tanto el montaje como el desmontaje van dentro de `act`: desmontar fuera
 * produce actualizaciones de React que nadie recoge, y React avisa de ello con
 * un error en consola que ensucia la salida sin señalar un defecto real.
 */
async function montarApp(): Promise<{
  arbol: ReactTestRenderer.ReactTestRenderer;
  desmontar: () => Promise<void>;
}> {
  let arbol: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    arbol = ReactTestRenderer.create(<App />);
  });

  if (!arbol) throw new Error('La aplicación no llegó a montarse');
  const montado = arbol;

  return {
    arbol: montado,
    desmontar: async () => {
      await ReactTestRenderer.act(() => {
        montado.unmount();
      });
    },
  };
}

/**
 * Montar la app entera carga el árbol completo de React Native, y bajo la carga
 * de la suite completa eso supera el límite de 5 segundos que Jest da por
 * defecto. No es lentitud del producto —en el teléfono el arranque es
 * inmediato—, sino el costo de resolver módulos en el entorno de pruebas. Una
 * prueba que falla una de cada tantas corridas es peor que no tenerla: enseña a
 * ignorar el rojo.
 */
jest.setTimeout(20_000);

describe('App', () => {
  it('monta sin lanzar', async () => {
    const { arbol, desmontar } = await montarApp();

    expect(arbol.toJSON()).not.toBeNull();
    await desmontar();
  });

  it('usa el fondo de la paleta BSC y no el del sistema', async () => {
    const { arbol, desmontar } = await montarApp();

    expect(JSON.stringify(arbol.toJSON())).toContain(BscColors.background);
    await desmontar();
  });
});
