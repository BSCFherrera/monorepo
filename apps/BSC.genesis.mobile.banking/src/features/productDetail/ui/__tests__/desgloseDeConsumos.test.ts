import type { Movimiento } from '../../data/transactionContracts';
import { desgloseDeConsumos } from '../desgloseDeConsumos';

/**
 * El desglose de consumos de la tarjeta, portado de `_SpendBreakdown.from` en
 * `credit_card_detail_view.dart`.
 */

function movimiento(parcial: Partial<Movimiento>): Movimiento {
  return {
    descripcion: 'CONSUMO',
    fecha: '2026-07-10',
    fechaAplicacion: undefined,
    monto: 100,
    saldoCorrido: undefined,
    tipo: 'D',
    referencia: undefined,
    tipoDeTransaccion: undefined,
    comercio: undefined,
    numeroDeAprobacion: undefined,
    ...parcial,
  };
}

describe('desglose de consumos', () => {
  it('agrupa por el tipo de transacción que ya devuelve el core', () => {
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: 'Compras', monto: 1000 }),
      movimiento({ tipoDeTransaccion: 'Compras', monto: 500 }),
      movimiento({ tipoDeTransaccion: 'Avances', monto: 250 }),
    ]);

    expect(desglose.total).toBe(1750);
    expect(desglose.entradas).toEqual([
      { etiqueta: 'Compras', monto: 1500 },
      { etiqueta: 'Avances', monto: 250 },
    ]);
  });

  it('deja fuera los créditos: un pago recibido no es un consumo', () => {
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: 'Compras', monto: 1000 }),
      movimiento({ tipoDeTransaccion: 'Pagos', monto: 5000, tipo: 'C' }),
    ]);

    expect(desglose.total).toBe(1000);
    expect(desglose.entradas).toHaveLength(1);
  });

  it('ordena de mayor a menor', () => {
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: 'Restaurantes', monto: 300 }),
      movimiento({ tipoDeTransaccion: 'Supermercados', monto: 900 }),
      movimiento({ tipoDeTransaccion: 'Combustible', monto: 600 }),
    ]);

    expect(desglose.entradas.map(entrada => entrada.etiqueta)).toEqual([
      'Supermercados',
      'Combustible',
      'Restaurantes',
    ]);
  });

  it('enseña como mucho cuatro categorías, pero el total las cuenta todas', () => {
    // El original recorta la lista y no el total, y así se queda: el número
    // grande es lo que el cliente gastó, no lo que cabe en cuatro barras.
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: 'A', monto: 500 }),
      movimiento({ tipoDeTransaccion: 'B', monto: 400 }),
      movimiento({ tipoDeTransaccion: 'C', monto: 300 }),
      movimiento({ tipoDeTransaccion: 'D', monto: 200 }),
      movimiento({ tipoDeTransaccion: 'E', monto: 100 }),
    ]);

    expect(desglose.entradas).toHaveLength(4);
    expect(desglose.total).toBe(1500);
  });

  it('un movimiento sin tipo cae en «Otros consumos»', () => {
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: undefined, monto: 120 }),
      movimiento({ tipoDeTransaccion: '   ', monto: 80 }),
    ]);

    expect(desglose.entradas).toEqual([
      { etiqueta: 'Otros consumos', monto: 200 },
    ]);
  });

  it('recorta los espacios del nombre para no partir una categoría en dos', () => {
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: 'Compras', monto: 100 }),
      movimiento({ tipoDeTransaccion: ' Compras ', monto: 100 }),
    ]);

    expect(desglose.entradas).toHaveLength(1);
    expect(desglose.entradas[0]?.monto).toBe(200);
  });

  it('sin movimientos el total es cero y no hay nada que dibujar', () => {
    const desglose = desgloseDeConsumos([]);

    expect(desglose.total).toBe(0);
    expect(desglose.entradas).toEqual([]);
  });

  it('un período solo de pagos deja el desglose vacío sin dividir por cero', () => {
    const desglose = desgloseDeConsumos([
      movimiento({ tipoDeTransaccion: 'Pagos', monto: 5000, tipo: 'C' }),
    ]);

    expect(desglose.total).toBe(0);
    expect(desglose.entradas).toEqual([]);
  });
});
