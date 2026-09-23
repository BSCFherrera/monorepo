import {
  applyDayTap,
  matchingPreset,
  daysInMonth,
  leadingBlankDays,
  earliestSelectableDate,
  isSameRange,
  presetRange,
  monthGrid,
  subtractDays,
  startOfDay,
} from './dateRange';
import type { DateRange } from '@bsc/contracts';

/**
 * La app Flutter permite consultar movimientos de **hasta un año atrás**, no de
 * noventa días: la píldora «Personalizado» abre una hoja con seis atajos y un
 * calendario. El porte había perdido esa capacidad. Estas pruebas fijan la
 * aritmética de los rangos, que es la parte que se equivoca en silencio —un
 * rango mal calculado no rompe nada, solo trae los movimientos de otro período.
 */

/** Miércoles 27 de mayo de 2026, en hora local. */
const HOY = new Date(2026, 4, 27);

const comoTexto = (f: Date): string =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(
    f.getDate(),
  ).padStart(2, '0')}`;

const rangoComoTexto = (r: DateRange): string =>
  `${comoTexto(r.from)}..${comoTexto(r.to)}`;

describe('atajos de período', () => {
  it('«30 días» son treinta contando hoy, no treinta y uno', () => {
    // Del 28 de abril al 27 de mayo, ambos incluidos, son treinta días.
    expect(rangoComoTexto(presetRange('last30Days', HOY))).toBe(
      '2026-04-28..2026-05-27',
    );
  });

  it('«60 días» y «90 días» siguen el mismo criterio', () => {
    expect(rangoComoTexto(presetRange('last60Days', HOY))).toBe(
      '2026-03-29..2026-05-27',
    );
    expect(rangoComoTexto(presetRange('last90Days', HOY))).toBe(
      '2026-02-27..2026-05-27',
    );
  });

  it('«Este mes» empieza el día uno del mes en curso', () => {
    expect(rangoComoTexto(presetRange('thisMonth', HOY))).toBe(
      '2026-05-01..2026-05-27',
    );
  });

  it('«Mes pasado» es el mes anterior completo, de punta a punta', () => {
    expect(rangoComoTexto(presetRange('lastMonth', HOY))).toBe(
      '2026-04-01..2026-04-30',
    );
  });

  it('«Este año» arranca el primero de enero', () => {
    // Y es el atajo por el que se puede consultar mucho más de 90 días.
    expect(rangoComoTexto(presetRange('thisYear', HOY))).toBe(
      '2026-01-01..2026-05-27',
    );
  });

  it('«Este año» en diciembre supera con holgura los noventa días', () => {
    const rango = presetRange('thisYear', new Date(2026, 11, 31));
    const dias =
      (rango.to.getTime() - rango.from.getTime()) / 86_400_000 + 1;
    expect(dias).toBe(365);
  });
});

describe('el atajo no se rompe en los bordes del calendario', () => {
  it('«Mes pasado» en marzo devuelve febrero completo', () => {
    expect(
      rangoComoTexto(presetRange('lastMonth', new Date(2026, 2, 15))),
    ).toBe('2026-02-01..2026-02-28');
  });

  it('«Mes pasado» en marzo de un año bisiesto incluye el 29', () => {
    expect(
      rangoComoTexto(presetRange('lastMonth', new Date(2024, 2, 15))),
    ).toBe('2024-02-01..2024-02-29');
  });

  it('«Mes pasado» en enero retrocede al diciembre anterior', () => {
    expect(
      rangoComoTexto(presetRange('lastMonth', new Date(2026, 0, 10))),
    ).toBe('2025-12-01..2025-12-31');
  });

  it('«90 días» cruza el cambio de año sin descolocarse', () => {
    // Del 13 de noviembre al 10 de febrero hay noventa días contando ambos:
    // 18 de noviembre + 31 de diciembre + 31 de enero + 10 de febrero.
    expect(rangoComoTexto(presetRange('last90Days', new Date(2026, 1, 10)))).toBe(
      '2025-11-13..2026-02-10',
    );
  });
});

describe('las fechas se construyen en hora local', () => {
  it('restar días no adelanta ni atrasa la fecha', () => {
    // El defecto que ya nos costó una corrección: `new Date('2026-05-27')` es
    // medianoche UTC y en UTC-4 devuelve el 26.
    expect(comoTexto(subtractDays(HOY, 1))).toBe('2026-05-26');
    expect(comoTexto(subtractDays(HOY, 0))).toBe('2026-05-27');
  });

  it('soloElDia descarta la hora y conserva el día', () => {
    const conHora = new Date(2026, 4, 27, 23, 59, 59);
    expect(comoTexto(startOfDay(conHora))).toBe('2026-05-27');
    expect(startOfDay(conHora).getHours()).toBe(0);
  });

  it('el rango de un atajo nunca arrastra la hora del reloj', () => {
    const rango = presetRange('last30Days', new Date(2026, 4, 27, 16, 45));
    expect(rango.from.getHours()).toBe(0);
    expect(rango.to.getHours()).toBe(0);
  });
});

describe('techo de consulta', () => {
  it('se puede retroceder un año, que es el tope del original', () => {
    expect(comoTexto(earliestSelectableDate(HOY))).toBe('2025-05-27');
  });
});

describe('reconocer el atajo de un rango', () => {
  it('reconoce un rango que coincide con un atajo', () => {
    expect(matchingPreset(presetRange('last60Days', HOY), HOY)).toBe('last60Days');
    expect(matchingPreset(presetRange('lastMonth', HOY), HOY)).toBe(
      'lastMonth',
    );
  });

  it('un rango elegido a mano no coincide con ninguno', () => {
    const aMano = { from: new Date(2026, 3, 3), to: new Date(2026, 3, 17) };
    expect(matchingPreset(aMano, HOY)).toBeNull();
  });

  it('un rango que difiere en un solo día ya no coincide', () => {
    const casi = { from: new Date(2026, 3, 27), to: new Date(2026, 4, 27) };
    expect(matchingPreset(casi, HOY)).toBeNull();
  });

  it('compara al día, ignorando la hora', () => {
    expect(
      isSameRange(
        { from: new Date(2026, 4, 1, 9), to: new Date(2026, 4, 27, 22) },
        { from: new Date(2026, 4, 1), to: new Date(2026, 4, 27) },
      ),
    ).toBe(true);
  });
});

describe('rejilla del calendario', () => {
  it('mayo de 2026 empieza en viernes: cuatro huecos antes del uno', () => {
    // Lunes, martes, miércoles y jueves quedan vacíos.
    expect(leadingBlankDays(2026, 4)).toBe(4);
  });

  it('un mes que empieza en lunes no lleva huecos', () => {
    // Junio de 2026 empieza lunes.
    expect(leadingBlankDays(2026, 5)).toBe(0);
  });

  it('un mes que empieza en domingo lleva seis, no cero', () => {
    // Noviembre de 2026 empieza domingo; con la semana en lunes el domingo es
    // el último día, no el primero.
    expect(leadingBlankDays(2026, 10)).toBe(6);
  });

  it('cuenta bien los días de cada mes, incluido febrero bisiesto', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2026, 3)).toBe(30);
    expect(daysInMonth(2026, 4)).toBe(31);
  });

  it('la rejilla cubre todos los días del mes y nada más', () => {
    const rejilla = monthGrid(2026, 4);
    const numeros = rejilla.flat().filter((d): d is number => d !== null);
    expect(numeros).toHaveLength(31);
    expect(numeros[0]).toBe(1);
    expect(numeros[numeros.length - 1]).toBe(31);
    expect(rejilla.every(fila => fila.length === 7)).toBe(true);
  });

  it('el día uno cae en la columna que le toca', () => {
    // Mayo de 2026 empieza viernes: quinta columna, índice cuatro.
    expect(monthGrid(2026, 4)[0]?.[4]).toBe(1);
    expect(monthGrid(2026, 4)[0]?.[3]).toBeNull();
  });
});

describe('componer un rango tocando días', () => {
  const abierto = { from: new Date(2026, 4, 10), to: null };

  it('el segundo toque cierra el rango', () => {
    const resultado = applyDayTap(abierto, new Date(2026, 4, 20));
    expect(comoTexto(resultado.from)).toBe('2026-05-10');
    expect(resultado.to && comoTexto(resultado.to)).toBe('2026-05-20');
  });

  it('tocar un día anterior reabre en vez de invertir el rango', () => {
    // Un rango al revés se enviaría al core como desde > hasta.
    const resultado = applyDayTap(abierto, new Date(2026, 4, 3));
    expect(comoTexto(resultado.from)).toBe('2026-05-03');
    expect(resultado.to).toBeNull();
  });

  it('con el rango ya cerrado, un toque nuevo vuelve a empezar', () => {
    const cerrado = {
      from: new Date(2026, 4, 10),
      to: new Date(2026, 4, 20),
    };
    const resultado = applyDayTap(cerrado, new Date(2026, 4, 25));
    expect(comoTexto(resultado.from)).toBe('2026-05-25');
    expect(resultado.to).toBeNull();
  });

  it('tocar el mismo día dos veces deja un rango de un solo día', () => {
    const resultado = applyDayTap(abierto, new Date(2026, 4, 10));
    expect(resultado.to && comoTexto(resultado.to)).toBe('2026-05-10');
  });
});
