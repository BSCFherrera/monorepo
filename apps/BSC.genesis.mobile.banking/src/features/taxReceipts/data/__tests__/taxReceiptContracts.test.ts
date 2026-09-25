import {
  esCredito,
  esPeriodoSinComprobantes,
  parseComprobantes,
  parseDetalleDeComprobante,
  parseMovimientoDelComprobante,
  simboloDelComprobante,
  totalDeComprobantes,
} from '../taxReceiptContracts';

/**
 * El contrato de `/customer-billing-procedure/*`.
 *
 * Los tres endpoints responden con el sobre `Result<T>`. El caso que más
 * importa aquí no es el bueno sino el vacío: **un período sin comprobantes no
 * es un fallo**, y tratarlo como tal convierte el caso corriente de un
 * trimestre tranquilo en una pantalla de error.
 */

describe('parseComprobantes', () => {
  it('lee la lista del sobre Result', () => {
    const lista = parseComprobantes({
      value: [
        {
          Ncf: 'B0200000123',
          Account: '11042010013953',
          Date: '2026-04-15',
          Currency: '214',
          Amount: 350.5,
          Description: 'Comisión por mantenimiento',
          Operation: 'D',
        },
      ],
      isSuccess: true,
    });

    expect(lista).toHaveLength(1);
    expect(lista[0]?.ncf).toBe('B0200000123');
    expect(lista[0]?.monto).toBe(350.5);
    expect(lista[0]?.descripcion).toBe('Comisión por mantenimiento');
  });

  it('lee también camelCase', () => {
    const lista = parseComprobantes({
      value: [
        { ncf: 'B0200000124', account: '1104', date: '2026-04-16', amount: 10 },
      ],
    });

    expect(lista[0]?.ncf).toBe('B0200000124');
  });

  it('sin moneda asume pesos, que es lo que el core omite', () => {
    const lista = parseComprobantes({ value: [{ Ncf: 'B02', Amount: 1 }] });

    expect(lista[0]?.moneda).toBe('214');
    expect(simboloDelComprobante(lista[0]!.moneda)).toBe('RD$');
  });

  it('una respuesta vacía da lista vacía, no una excepción', () => {
    expect(parseComprobantes({ value: [] })).toEqual([]);
    expect(parseComprobantes({ value: null })).toEqual([]);
    expect(parseComprobantes(null)).toEqual([]);
  });
});

describe('simboloDelComprobante', () => {
  it('distingue el dólar y trata todo lo demás como pesos', () => {
    // Es el criterio del original, y se conserva: este banco no emite
    // comprobantes en euros.
    expect(simboloDelComprobante('840')).toBe('US$');
    expect(simboloDelComprobante('214')).toBe('RD$');
    expect(simboloDelComprobante('')).toBe('RD$');
  });
});

describe('totalDeComprobantes', () => {
  it('suma lo que la cabecera enseña junto al conteo', () => {
    const lista = parseComprobantes({
      value: [
        { Ncf: 'A', Amount: 350.5 },
        { Ncf: 'B', Amount: 120.25 },
        { Ncf: 'C', Amount: 29.25 },
      ],
    });

    expect(totalDeComprobantes(lista)).toBeCloseTo(500, 2);
  });

  it('una lista vacía suma cero', () => {
    expect(totalDeComprobantes([])).toBe(0);
  });
});

describe('parseDetalleDeComprobante', () => {
  it('lee el detalle', () => {
    const detalle = parseDetalleDeComprobante({
      value: {
        Ncf: 'B0200000123',
        Number: '0000123',
        Description: 'Comisión por mantenimiento',
        Account: '11042010013953',
        AccountType: 'Ahorros',
        Currency: '214',
        Amount: 350.5,
      },
    });

    expect(detalle?.descripcion).toBe('Comisión por mantenimiento');
    expect(detalle?.tipoDeCuenta).toBe('Ahorros');
  });

  it('un objeto sin NCF no es un detalle', () => {
    /*
      El core responde con un objeto de campos vacíos cuando no tiene el
      detalle. Dibujarlo llenaría la hoja de filas en blanco, que al cliente le
      parece un fallo de la aplicación y no una ausencia de dato.
    */
    expect(parseDetalleDeComprobante({ value: {} })).toBeNull();
    expect(parseDetalleDeComprobante({ value: null })).toBeNull();
    expect(parseDetalleDeComprobante({ value: [] })).toBeNull();
  });
});

describe('parseMovimientoDelComprobante', () => {
  it('lee el movimiento y distingue crédito de débito', () => {
    const movimiento = parseMovimientoDelComprobante({
      value: {
        Sequence: '000001',
        Operation: 'CR',
        Description: 'Abono',
        TransactionDate: '2026-04-15',
        TransactionTypeName: 'Depósito',
        Amount: 1_000,
        Reference: 'REF-99',
      },
    });

    expect(movimiento?.tipo).toBe('Depósito');
    expect(esCredito(movimiento!)).toBe(true);
  });

  it('una operación de débito no se toma por crédito', () => {
    // El core codifica la operación con la letra inicial y no con un campo
    // propio, así que este es todo el criterio que hay.
    const movimiento = parseMovimientoDelComprobante({
      value: { Sequence: '2', Operation: 'DB', TransactionTypeName: 'Cargo' },
    });

    expect(esCredito(movimiento!)).toBe(false);
  });

  it('una respuesta sin secuencia ni operación es nula', () => {
    expect(parseMovimientoDelComprobante({ value: {} })).toBeNull();
    expect(parseMovimientoDelComprobante(null)).toBeNull();
  });
});

describe('esPeriodoSinComprobantes', () => {
  const error = (status: number, detail: string): unknown => ({
    response: { status, data: { detail } },
  });

  it('reconoce el 400 que significa «no hay comprobantes»', () => {
    /*
      Los NCF se emiten solo cuando el banco cobra una comisión, así que un
      trimestre vuelve vacío con frecuencia en una cuenta que sí tiene
      comprobantes. Tratar ese 400 como un fallo le enseñaría al cliente una
      pantalla de error en el caso más normal de todos.
    */
    expect(
      esPeriodoSinComprobantes(
        error(400, 'No se encontraron registros para: 80191'),
      ),
    ).toBe(true);

    // El core también responde con esta otra forma.
    expect(esPeriodoSinComprobantes(error(400, 'Sin registros'))).toBe(true);
  });

  it('no confunde un fallo de verdad con un período vacío', () => {
    expect(
      esPeriodoSinComprobantes(error(400, 'La cuenta no pertenece al cliente')),
    ).toBe(false);
    expect(
      esPeriodoSinComprobantes(error(500, 'No se encontraron registros')),
    ).toBe(false);
    expect(esPeriodoSinComprobantes(new Error('sin red'))).toBe(false);
    expect(esPeriodoSinComprobantes(null)).toBe(false);
  });

  it('lee el motivo del cuerpo escriba el backend Detail o detail', () => {
    expect(
      esPeriodoSinComprobantes({
        response: {
          status: 400,
          data: { Detail: 'No se encontraron registros' },
        },
      }),
    ).toBe(true);
  });
});
