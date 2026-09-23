import {
  determinarTipo,
  determinarMonto,
  parseMovimiento,
  extraerMovimientos,
  esPeriodoSinMovimientos,
} from '../transactionContracts';

/**
 * El core devuelve los movimientos de cuatro formas distintas según el
 * endpoint, y cada una nombra los campos a su manera. Equivocarse al decidir si
 * un movimiento suma o resta muestra un cargo como un depósito, así que cada
 * camino de esa decisión se prueba por separado.
 */

describe('si el movimiento suma o resta', () => {
  it('1 — respeta lo que el core dice explícitamente', () => {
    expect(determinarTipo({ Operation: 'C' })).toBe('C');
    expect(determinarTipo({ Operation: 'D' })).toBe('D');
    expect(determinarTipo({ operation: 'credito' })).toBe('C');
  });

  it('lo explícito gana sobre cualquier deducción', () => {
    // Aunque los montos digan otra cosa.
    expect(determinarTipo({ Operation: 'C', DebitAmount: 500 })).toBe('C');
  });

  it('2 — interpreta isDebit, donde «S» significa sí', () => {
    expect(determinarTipo({ isDebit: 'S' })).toBe('D');
    expect(determinarTipo({ isDebit: 'N' })).toBe('C');
  });

  it('3 — deduce del monto que venga con valor', () => {
    expect(determinarTipo({ CreditAmount: 500, DebitAmount: 0 })).toBe('C');
    expect(determinarTipo({ CreditAmount: 0, DebitAmount: 500 })).toBe('D');
  });

  it('4 — como último recurso, del signo del monto único', () => {
    expect(determinarTipo({ Amount: 500 })).toBe('C');
    expect(determinarTipo({ Amount: -500 })).toBe('D');
  });

  it('un movimiento sin ningún dato se asume crédito, igual que en Flutter', () => {
    // Cero es «>= 0», así que cae del lado del crédito. Se conserva el
    // comportamiento aunque sea discutible: cambiarlo sería un cambio funcional.
    expect(determinarTipo({})).toBe('C');
  });
});

describe('monto del movimiento', () => {
  it('usa el monto único cuando viene', () => {
    expect(determinarMonto({ Amount: 1234.56 })).toBe(1234.56);
  });

  it('siempre es positivo: el signo lo lleva el tipo', () => {
    expect(determinarMonto({ Amount: -1234.56 })).toBe(1234.56);
  });

  it('si el monto único es cero, usa el específico', () => {
    // Hay endpoints que mandan Amount en cero y el valor real aparte.
    expect(determinarMonto({ Amount: 0, CreditAmount: 800 })).toBe(800);
    expect(determinarMonto({ Amount: 0, DebitAmount: 300 })).toBe(300);
  });

  it('acepta montos como cadena', () => {
    expect(determinarMonto({ Amount: '1,234.56' })).toBe(1234.56);
  });

  it('sin ningún monto devuelve cero', () => {
    expect(determinarMonto({})).toBe(0);
  });
});

describe('parseMovimiento', () => {
  it('lee los campos principales', () => {
    const movimiento = parseMovimiento({
      Description: 'COMPRA POS',
      TransactionDate: '2026-05-27',
      Amount: 1500,
      Operation: 'D',
      Reference: 'REF-1',
    });

    expect(movimiento.descripcion).toBe('COMPRA POS');
    expect(movimiento.fecha).toBe('2026-05-27');
    expect(movimiento.monto).toBe(1500);
    expect(movimiento.tipo).toBe('D');
    expect(movimiento.referencia).toBe('REF-1');
  });

  it('repara los acentos que el core estropea', () => {
    // Se hace aquí una sola vez, no en cada pantalla.
    expect(
      parseMovimiento({ Description: 'PRESTAMO 120 D¿AS' }).descripcion,
    ).toBe('PRESTAMO 120 DíAS');
  });

  it('cae al nombre del tipo cuando no hay descripción', () => {
    expect(
      parseMovimiento({ TransactionTypeName: 'Depósito' }).descripcion,
    ).toBe('Depósito');
  });

  it('el saldo corrido ausente queda indefinido, no en cero', () => {
    // Un cero haría creer al cliente que se quedó sin fondos.
    expect(parseMovimiento({ Amount: 100 }).saldoCorrido).toBeUndefined();
    expect(parseMovimiento({ Balance: 0 }).saldoCorrido).toBe(0);
  });

  it('acepta los nombres alternativos del saldo', () => {
    expect(parseMovimiento({ RunningBalance: 5000 }).saldoCorrido).toBe(5000);
    expect(parseMovimiento({ balance: 5000 }).saldoCorrido).toBe(5000);
  });

  it('tolera una fila corrupta sin reventar la lista entera', () => {
    const movimiento = parseMovimiento('basura');
    expect(movimiento.monto).toBe(0);
    expect(movimiento.descripcion).toBe('');
  });
});

describe('extracción de la lista', () => {
  const fila = { Description: 'X', Amount: 100 };

  it('acepta un arreglo directo', () => {
    expect(extraerMovimientos([fila, fila])).toHaveLength(2);
  });

  it('acepta la envoltura Value', () => {
    expect(extraerMovimientos({ Value: [fila] })).toHaveLength(1);
  });

  it('acepta el anidado de dos niveles de tarjetas de crédito', () => {
    // { Value: { CreditCardTransactions: { transactions: [...] } } }
    expect(
      extraerMovimientos({
        Value: { CreditCardTransactions: { transactions: [fila, fila, fila] } },
      }),
    ).toHaveLength(3);
  });

  it('acepta la lista al nivel superior', () => {
    expect(extraerMovimientos({ Movements: [fila] })).toHaveLength(1);
  });

  it('acepta la respuesta como cadena JSON', () => {
    expect(extraerMovimientos(JSON.stringify({ Value: [fila] }))).toHaveLength(
      1,
    );
  });

  it('una forma que no reconoce produce lista vacía, no una excepción', () => {
    // Una pantalla sin movimientos es mejor que una pantalla rota.
    expect(extraerMovimientos({ algo: 'raro' })).toEqual([]);
    expect(extraerMovimientos(null)).toEqual([]);
    expect(extraerMovimientos(42)).toEqual([]);
  });
});

describe('período sin movimientos', () => {
  it('reconoce el error que el core usa para «no hubo nada»', () => {
    // El core responde con error en vez de con lista vacía. Tratarlo como
    // error mostraría una pantalla roja a un cliente que simplemente no usó la
    // cuenta ese mes.
    expect(
      esPeriodoSinMovimientos({
        response: {
          status: 400,
          data: { message: 'No se encontraron movimientos' },
        },
      }),
    ).toBe(true);

    expect(
      esPeriodoSinMovimientos({
        response: { status: 404, data: 'No records found' },
      }),
    ).toBe(true);
  });

  it('un error real sí es un error', () => {
    expect(
      esPeriodoSinMovimientos({
        response: { status: 500, data: 'Internal error' },
      }),
    ).toBe(false);

    expect(
      esPeriodoSinMovimientos({
        response: { status: 400, data: 'Cuenta inválida' },
      }),
    ).toBe(false);
  });

  it('tolera cualquier cosa como causa', () => {
    for (const causa of [null, undefined, 'texto', {}]) {
      expect(esPeriodoSinMovimientos(causa)).toBe(false);
    }
  });
});
