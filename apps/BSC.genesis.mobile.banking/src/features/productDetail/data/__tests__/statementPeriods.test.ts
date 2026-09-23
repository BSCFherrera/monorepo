import {
  cicloDelCorte,
  mesesConEstadoDeCuenta,
  nombreDelMes,
} from '../statementPeriods';

/**
 * Los meses que el cliente puede descargar.
 *
 * Portadas de `StatementPeriod.generate` en `account_statement.dart`. La regla
 * que más se nota si se rompe es que **el mes en curso no se lista**: su ciclo
 * no ha cerrado, el core devuelve un PDF vacío, y el cliente se queda mirando
 * un archivo en blanco sin saber por qué.
 */

// Un martes cualquiera de septiembre, para que las pruebas no dependan de hoy.
const HOY = new Date(2026, 8, 16);

describe('meses con estado de cuenta', () => {
  it('empieza en el mes anterior, nunca en el que corre', () => {
    const meses = mesesConEstadoDeCuenta({ hoy: HOY });

    expect(meses[0]?.etiqueta).toBe('Agosto 2026');
    expect(meses.some(mes => mes.etiqueta === 'Septiembre 2026')).toBe(false);
  });

  it('ofrece seis meses por defecto y cruza el cambio de año', () => {
    const meses = mesesConEstadoDeCuenta({ hoy: new Date(2026, 1, 10) });

    expect(meses).toHaveLength(6);
    expect(meses.map(mes => mes.etiqueta)).toEqual([
      'Enero 2026',
      'Diciembre 2025',
      'Noviembre 2025',
      'Octubre 2025',
      'Septiembre 2025',
      'Agosto 2025',
    ]);
  });

  it('escribe el rango del primero al último día, con ceros a la izquierda', () => {
    const [agosto] = mesesConEstadoDeCuenta({ hoy: HOY });

    expect(agosto?.rango).toBe('01/08/2026 - 31/08/2026');
  });

  it('conoce los meses de 30 días y los febreros bisiestos', () => {
    const meses = mesesConEstadoDeCuenta({ hoy: new Date(2024, 4, 1) });
    const porEtiqueta = new Map(meses.map(mes => [mes.etiqueta, mes.rango]));

    expect(porEtiqueta.get('Abril 2024')).toBe('01/04/2024 - 30/04/2024');
    expect(porEtiqueta.get('Febrero 2024')).toBe('01/02/2024 - 29/02/2024');
  });

  it('no lista meses anteriores a la apertura del producto', () => {
    // El core devuelve un PDF vacío para un mes en que el producto no existía.
    const meses = mesesConEstadoDeCuenta({
      hoy: HOY,
      apertura: new Date(2026, 6, 1),
    });

    expect(meses.map(mes => mes.etiqueta)).toEqual([
      'Agosto 2026',
      'Julio 2026',
    ]);
  });

  it('cuando el producto se abrió a mitad de mes, el rango arranca ese día', () => {
    const meses = mesesConEstadoDeCuenta({
      hoy: HOY,
      apertura: new Date(2026, 6, 14),
    });

    expect(meses[1]?.rango).toBe('14/07/2026 - 31/07/2026');
  });

  it('un producto abierto el último día del mes no dice que el ciclo empezó el primero', () => {
    // El original compara con `isBefore(lastDay)` y deja fuera este caso: el
    // rango declararía treinta días que el cliente no tuvo el producto.
    const meses = mesesConEstadoDeCuenta({
      hoy: HOY,
      apertura: new Date(2026, 6, 31),
    });

    expect(meses[1]?.rango).toBe('31/07/2026 - 31/07/2026');
  });

  it('respeta cuántos meses se le piden', () => {
    expect(mesesConEstadoDeCuenta({ hoy: HOY, cuantos: 12 })).toHaveLength(12);
  });

  it('guarda mes y año como números, que es lo que pide el core', () => {
    const [agosto] = mesesConEstadoDeCuenta({ hoy: HOY });

    expect(agosto?.mes).toBe(8);
    expect(agosto?.anio).toBe(2026);
  });
});

describe('ciclo con el que abre la hoja de estado', () => {
  it('usa la fecha de corte de la tarjeta cuando el core la manda', () => {
    expect(cicloDelCorte('15/07/2026', HOY)).toEqual({ mes: 7, anio: 2026 });
  });

  it('sin fecha de corte cae en el mes anterior, no en el que corre', () => {
    expect(cicloDelCorte(undefined, HOY)).toEqual({ mes: 8, anio: 2026 });
  });

  it('sin fecha de corte en enero retrocede a diciembre del año pasado', () => {
    expect(cicloDelCorte(undefined, new Date(2026, 0, 9))).toEqual({
      mes: 12,
      anio: 2025,
    });
  });

  it('una fecha de corte que no se entiende no rompe la hoja', () => {
    expect(cicloDelCorte('no es una fecha', HOY)).toEqual({
      mes: 8,
      anio: 2026,
    });
  });
});

describe('nombre del mes', () => {
  it('escribe los doce en español y con mayúscula inicial', () => {
    expect(nombreDelMes(1)).toBe('Enero');
    expect(nombreDelMes(12)).toBe('Diciembre');
  });
});
