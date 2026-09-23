import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer, { type ReactTestRendererJSON } from 'react-test-renderer';

import {
  parseDetalleDeTarjeta,
  montosEnMoneda,
} from '../../data/creditCardDetailContracts';
import { HojaDePago } from '../CreditCardSheets';

/**
 * La hoja «Pagar tarjeta» del detalle, que es donde el cliente elige **cuánto**
 * va a pagar.
 *
 * Aquí vive lógica de presentación que hasta ahora no vigilaba nadie y que
 * decide una cifra de dinero:
 *
 * - La opción «Mínimo» **desaparece** cuando el core manda cero. Ofrecer un
 *   «Mínimo RD$ 0.00» en una tarjeta que se cobra de contado es a la vez falso
 *   —sí hay que pagar— e impagable, porque el botón quedaría muerto.
 * - La cifra que se enseña arriba sigue a la opción elegida, no a la primera.
 * - El símbolo es el del **ciclo seleccionado**, no el de la tarjeta.
 *
 * Las cifras no son inventadas: salen de la respuesta real del ambiente para
 * la tarjeta ****7147, la misma que fijó D-26.
 */

const CRUDO = {
  NUM_TARJETA: '220818155480001032',
  PAGO_MINIMO_RD: 2311.41,
  PAGO_MINIMO_US: 174.04,
  PAGO_TOTAL_RD: 31242.3,
  PAGO_TOTAL_US: 2716.92,
  SALDO_ACTUAL_RD: 62052.31,
  SALDO_ACTUAL_US: 2838.49,
  LIMITE_CREDITO_RD: 300000,
  LIMITE_CREDITO_US: 5000,
  FECHA_VENCIMIENTO: '2025-12-04 00:00:00',
  ESTADO: 'Activa',
};

/** Una tarjeta de contado: el core manda el mínimo en cero. */
const SIN_MINIMO = { ...CRUDO, PAGO_MINIMO_RD: 0, PAGO_MINIMO_US: 0 };

const DOP = 214;
const USD = 840;

const tarjetaDe = (crudo: Record<string, unknown>) =>
  parseDetalleDeTarjeta(crudo, { numeroDeTarjeta: String(crudo.NUM_TARJETA) });

const montar = (
  crudo: Record<string, unknown>,
  codigoMoneda: number,
): { arbol: TestRenderer.ReactTestRenderer } => {
  const tarjeta = tarjetaDe(crudo);
  let arbol!: TestRenderer.ReactTestRenderer;

  TestRenderer.act(() => {
    arbol = TestRenderer.create(
      /*
        La hoja se apoya en los márgenes seguros del sistema, y en pruebas no
        hay pantalla que medir: se le dan fijos.
      */
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 800 },
          insets: { top: 24, left: 0, right: 0, bottom: 0 },
        }}
      >
        <HojaDePago
          visible
          tarjeta={tarjeta}
          montos={montosEnMoneda(tarjeta, codigoMoneda)}
          codigoMoneda={codigoMoneda}
          onClose={() => {}}
          onContinuar={() => {}}
        />
      </SafeAreaProvider>,
    );
  });

  return { arbol };
};

/** Todos los textos del árbol, en orden. */
const textos = (arbol: TestRenderer.ReactTestRenderer): string[] => {
  const recoger = (nodo: ReactTestRendererJSON | string): string[] =>
    typeof nodo === 'string'
      ? [nodo]
      : (nodo.children ?? []).flatMap(h =>
          recoger(h as ReactTestRendererJSON | string),
        );

  const json = arbol.toJSON();
  if (json === null) return [];
  return (Array.isArray(json) ? json : [json]).flatMap(recoger);
};

const existe = (arbol: TestRenderer.ReactTestRenderer, id: string): boolean =>
  arbol.root.findAll(n => n.props.testID === id, { deep: true }).length > 0;

describe('HojaDePago — la hoja de pagar tarjeta', () => {
  it('ofrece el mínimo cuando la tarjeta lo tiene', () => {
    const { arbol } = montar(CRUDO, DOP);

    expect(existe(arbol, 'opcion-minimo')).toBe(true);
  });

  it('no ofrece el mínimo en una tarjeta de contado', () => {
    const { arbol } = montar(SIN_MINIMO, DOP);

    expect(existe(arbol, 'opcion-minimo')).toBe(false);
    // Y entonces el aviso de arriba habla del pago de contado.
    expect(textos(arbol).join(' ')).toContain('Pago de contado');
  });

  it('el aviso anuncia el mínimo del ciclo seleccionado, no el de pesos', () => {
    const enDolares = montar(CRUDO, USD);

    // 174.04 es el mínimo en dólares del detalle; 2,311.41 es el de pesos.
    expect(textos(enDolares.arbol).join(' ')).toContain('174.04');
    expect(textos(enDolares.arbol).join(' ')).not.toContain('2,311.41');
  });

  it('el símbolo es el del ciclo, no el de la tarjeta', () => {
    expect(textos(montar(CRUDO, USD).arbol).join(' ')).toContain('US$');
    expect(textos(montar(CRUDO, DOP).arbol).join(' ')).toContain('RD$');
  });

  it('arranca con el monto del mínimo escrito en la caja', () => {
    const { arbol } = montar(CRUDO, DOP);

    // La caja grande enseña la cifra de la opción preseleccionada.
    expect(textos(arbol).join(' ')).toContain('2,311.41');
  });

  it('una tarjeta de contado arranca en el saldo al corte', () => {
    const { arbol } = montar(SIN_MINIMO, DOP);

    expect(textos(arbol).join(' ')).toContain('31,242.30');
  });
});
