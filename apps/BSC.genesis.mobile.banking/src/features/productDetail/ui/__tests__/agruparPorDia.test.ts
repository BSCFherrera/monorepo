import { agruparPorDia } from '../TransactionListSection';
import { parseMovimiento } from '../../data/transactionContracts';

/**
 * Agrupación por día de la lista de movimientos.
 *
 * Es la regla que hace que la lista se lea como un estado de cuenta: una franja
 * de fecha y debajo lo que pasó ese día. Está probada aparte de la pantalla
 * porque el error que importa —perder movimientos o reordenarlos— no se ve en
 * una captura, se ve cuando el cliente cuadra su cuenta.
 */

const movimiento = (fecha: string, descripcion: string, monto: number) =>
  parseMovimiento({
    TransactionDate: fecha,
    Description: descripcion,
    Amount: monto,
    Operation: 'C',
  });

describe('agrupación por día', () => {
  it('junta en un solo grupo los movimientos del mismo día', () => {
    const grupos = agruparPorDia([
      movimiento('2026-05-27', 'COMPRA POS', 100),
      movimiento('2026-05-27', 'DEPOSITO', 200),
    ]);

    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.movimientos).toHaveLength(2);
  });

  it('conserva el orden en que vino del core', () => {
    // El core ya devuelve los movimientos en el orden en que el cliente espera
    // verlos; reordenarlos por la fecha formateada rompería ese criterio cuando
    // dos movimientos comparten día.
    const grupos = agruparPorDia([
      movimiento('2026-05-27', 'PRIMERO', 1),
      movimiento('2026-05-26', 'SEGUNDO', 2),
      movimiento('2026-05-27', 'TERCERO', 3),
    ]);

    expect(grupos).toHaveLength(2);
    expect(grupos[0]?.movimientos.map(m => m.descripcion)).toEqual([
      'PRIMERO',
      'TERCERO',
    ]);
    expect(grupos[1]?.movimientos.map(m => m.descripcion)).toEqual(['SEGUNDO']);
  });

  it('no pierde ningún movimiento', () => {
    const entrada = [
      movimiento('2026-05-27', 'A', 1),
      movimiento('2026-05-26', 'B', 2),
      movimiento('2026-05-25', 'C', 3),
      movimiento('2026-05-25', 'D', 4),
    ];

    const total = agruparPorDia(entrada).reduce(
      (suma, grupo) => suma + grupo.movimientos.length,
      0,
    );

    expect(total).toBe(entrada.length);
  });

  it('una lista vacía no produce grupos', () => {
    expect(agruparPorDia([])).toEqual([]);
  });
});
