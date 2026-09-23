

import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer, { act } from 'react-test-renderer';

import {
  HojaDeAvisoDeSesion,
  relojDelAviso,
} from '../HojaDeAvisoDeSesion';

describe('el reloj de la cuenta regresiva', () => {
  it('escribe minutos y segundos con dos cifras', () => {
    expect(relojDelAviso(60_000)).toBe('1:00');
    expect(relojDelAviso(59_000)).toBe('0:59');
    expect(relojDelAviso(9_000)).toBe('0:09');
  });

  it('no baja de cero aunque el plazo ya haya pasado', () => {
    expect(relojDelAviso(0)).toBe('0:00');
    expect(relojDelAviso(-5_000)).toBe('0:00');
  });

  it('redondea hacia arriba, para no enseñar 0:00 con tiempo vivo', () => {
    // Con 500 ms restantes quedan «un segundo», no cero: enseñar 0:00 mientras
    // la sesión sigue viva haría dudar de la cuenta.
    expect(relojDelAviso(500)).toBe('0:01');
  });
});

describe('la hoja del aviso', () => {
  const textosDe = (elemento: React.JSX.Element): string[] => {
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

    const encontrados: string[] = [];
    const recorrer = (nodo: unknown): void => {
      if (typeof nodo === 'string') {
        encontrados.push(nodo);
        return;
      }
      if (nodo === null || typeof nodo !== 'object') return;
      if (Array.isArray(nodo)) {
        nodo.forEach(recorrer);
        return;
      }
      recorrer((nodo as { children?: unknown }).children);
    };
    recorrer(arbol?.toJSON());
    return encontrados;
  };

  it('dice lo mismo que el original, palabra por palabra', () => {
    const textos = textosDe(
      <HojaDeAvisoDeSesion
        visible
        msRestantes={45_000}
        onSeguir={() => {}}
        onCerrar={() => {}}
      />,
    );

    expect(textos).toContain('Tu sesión está por cerrarse');
    expect(textos).toContain('Seguir conectado');
    expect(textos).toContain(
      'Cerramos la sesión por seguridad cuando no hay actividad.',
    );
    expect(textos).toContain('0:45');
  });

  it('no dibuja nada mientras no toca avisar', () => {
    const textos = textosDe(
      <HojaDeAvisoDeSesion
        visible={false}
        msRestantes={45_000}
        onSeguir={() => {}}
        onCerrar={() => {}}
      />,
    );

    expect(textos).not.toContain('Tu sesión está por cerrarse');
  });
});
