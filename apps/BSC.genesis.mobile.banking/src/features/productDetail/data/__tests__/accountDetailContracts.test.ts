import {
  estaActiva,
  nombreDeLaCuenta,
  parseDetalleDeCuenta,
  tieneSobregiroOTransito,
} from '../accountDetailContracts';

/**
 * El core devuelve el detalle de la cuenta con los nombres en español y
 * mayúsculas, y el bus a veces los entrega ya traducidos al inglés. Quedarse
 * corto al leer un campo no rompe la pantalla: **imprime un cero donde hay
 * dinero**, que es peor, porque nadie lo nota.
 */

const CONTEXTO = {
  numeroDeCuenta: '11042010013953',
  codigoMoneda: 214,
  tipoDeCuenta: 'CA',
};

const parse = (crudo: unknown) => parseDetalleDeCuenta(crudo, CONTEXTO);

describe('nombres de campo del core', () => {
  it('lee los saldos con los nombres en español y mayúsculas', () => {
    const cuenta = parse({
      SAL_DISPONIBLE: 128_450.12,
      SAL_TOTAL: 130_000,
      SAL_CONGELADO: 1_549.88,
      SAL_EMBARGADO: 0,
      SAL_TRANSITO: 250,
    });

    expect({
      disponible: cuenta.saldoDisponible,
      total: cuenta.saldoTotal,
      retenido: cuenta.saldoRetenido,
      embargado: cuenta.saldoEmbargado,
      transito: cuenta.saldoEnTransito,
    }).toEqual({
      disponible: 128_450.12,
      total: 130_000,
      retenido: 1_549.88,
      embargado: 0,
      transito: 250,
    });
  });

  it('lee los mismos saldos cuando llegan traducidos al inglés', () => {
    const cuenta = parse({
      availableBalance: 128_450.12,
      totalBalance: 130_000,
      frozenBalance: 1_549.88,
    });

    expect(cuenta.saldoDisponible).toBe(128_450.12);
    expect(cuenta.saldoTotal).toBe(130_000);
    expect(cuenta.saldoRetenido).toBe(1_549.88);
  });

  it('el nombre en inglés gana cuando vienen los dos', () => {
    // Es el orden del original, y da igual salvo que el bus mande ambos.
    expect(
      parse({ availableBalance: 1, SAL_DISPONIBLE: 2 }).saldoDisponible,
    ).toBe(1);
  });

  it('acepta los montos que el core manda como texto', () => {
    // El bus los serializa como cadena según el endpoint.
    expect(parse({ SAL_DISPONIBLE: '128450.12' }).saldoDisponible).toBe(
      128_450.12,
    );
  });

  it('un saldo que no vino es cero, no un fallo', () => {
    expect(parse({}).saldoDisponible).toBe(0);
    expect(parse(null).saldoTotal).toBe(0);
    expect(parse('no es un objeto').saldoTotal).toBe(0);
  });

  it('lee el titular por sus tres nombres posibles', () => {
    expect(parse({ TITULARES: 'Titular Ejemplo' }).titular).toBe(
      'Titular Ejemplo',
    );
    expect(parse({ NOM_CLIENTE: 'Titular Ejemplo' }).titular).toBe(
      'Titular Ejemplo',
    );
    expect(parse({ accountHolderName: 'Titular Ejemplo' }).titular).toBe(
      'Titular Ejemplo',
    );
  });

  it('repara los acentos que el core estropea', () => {
    expect(parse({ SUCURSAL: 'Sucursal Naco - Atenci¿n' }).sucursal).toBe(
      'Sucursal Naco - Atención',
    );
  });

  it('lee el sobregiro por los tres nombres que usa el core', () => {
    expect(parse({ MON_SOBGRO_DISP: 5_000 }).sobregiroDisponible).toBe(5_000);
    expect(parse({ SOBREGIRO_DISPONIBLE: 5_000 }).sobregiroDisponible).toBe(
      5_000,
    );
    expect(parse({ overdraftAvailable: 5_000 }).sobregiroDisponible).toBe(
      5_000,
    );
  });
});

describe('campos que pueden faltar', () => {
  it('lo que no vino queda sin definir, no como cadena vacía', () => {
    // El original devuelve cadena vacía y la pantalla la compara contra nulo
    // para decidir si dibuja la fila: como la cadena vacía no es nula, imprime
    // una fila con la etiqueta y el valor en blanco.
    const cuenta = parse({});

    expect(cuenta.sucursal).toBeUndefined();
    expect(cuenta.fechaDeApertura).toBeUndefined();
    expect(cuenta.fechaDelUltimoMovimiento).toBeUndefined();
    expect(cuenta.numeroDeCuentaNacional).toBeUndefined();
  });

  it('un texto en blanco también cuenta como ausente', () => {
    expect(parse({ SUCURSAL: '   ' }).sucursal).toBeUndefined();
  });

  it('la tasa distingue entre cero y no haber venido', () => {
    // Un cero ahí se leería como una tasa real del 0 %, y hay cuentas que
    // simplemente no ganan intereses.
    expect(parse({}).tasaDeInteres).toBeUndefined();
    expect(parse({ TAE: 0 }).tasaDeInteres).toBe(0);
    expect(parse({ TAE: 1.25 }).tasaDeInteres).toBe(1.25);
  });
});

describe('fechas', () => {
  it('convierte la fecha del core a día, mes y año', () => {
    expect(parse({ FEC_APERTURA: '2026-01-08' }).fechaDeApertura).toBe(
      '08/01/2026',
    );
  });

  it('tolera la fecha con hora pegada', () => {
    expect(parse({ FEC_APERTURA: '2026-01-08 00:00:00' }).fechaDeApertura).toBe(
      '08/01/2026',
    );
  });

  it('no adelanta ni atrasa el día', () => {
    // `new Date('2026-01-08')` es medianoche UTC y en UTC-4 devuelve el 7.
    expect(parse({ FEC_APERTURA: '2026-01-08' }).fechaDeApertura).not.toBe(
      '07/01/2026',
    );
  });

  it('lo que no reconoce lo devuelve tal cual', () => {
    // Preferible a dejar la fila en blanco.
    expect(parse({ FEC_APERTURA: 'sin fecha' }).fechaDeApertura).toBe(
      'sin fecha',
    );
  });
});

describe('la tarjeta de sobregiro y tránsito', () => {
  it('se oculta entera cuando la cuenta no tiene ninguno', () => {
    // Casi ninguna cuenta de ahorros tiene sobregiro. Mostrar la tarjeta con
    // todo en cero se lee como una negativa del banco, no como una ausencia.
    expect(tieneSobregiroOTransito(parse({}))).toBe(false);
    expect(
      tieneSobregiroOTransito(
        parse({
          LIMITE_SOBREGIRO: 0,
          MON_SOBGRO_DISP: 0,
          LIM_LIN_TRANSITO: 0,
          LIN_TRANSITO_DISP: 0,
          SOBREG_TOTAL_TRANSITO: 0,
          INT_USO_SOB_NO_PAC: 0,
        }),
      ),
    ).toBe(false);
  });

  it('basta con que uno solo de los seis tenga valor', () => {
    const conCada = [
      { LIMITE_SOBREGIRO: 50_000 },
      { MON_SOBGRO_DISP: 12_000 },
      { LIM_LIN_TRANSITO: 30_000 },
      { LIN_TRANSITO_DISP: 30_000 },
      { SOBREG_TOTAL_TRANSITO: 42_000 },
      { INT_USO_SOB_NO_PAC: 318.42 },
    ];

    for (const crudo of conCada) {
      expect({ crudo, visible: tieneSobregiroOTransito(parse(crudo)) }).toEqual(
        {
          crudo,
          visible: true,
        },
      );
    }
  });

  it('un saldo en tránsito no basta para mostrarla', () => {
    // `SAL_TRANSITO` es dinero depositado sin acreditar y vive en el resumen de
    // balance; la línea de tránsito es un crédito y es otra cosa.
    expect(tieneSobregiroOTransito(parse({ SAL_TRANSITO: 5_000 }))).toBe(false);
  });
});

describe('estado de la cuenta', () => {
  it('reconoce las tres formas en que el core dice «activa»', () => {
    for (const estado of ['A', 'ACTIVA', 'ACTIVE', 'activa', ' a ']) {
      expect({ estado, activa: estaActiva(parse({ ESTADO: estado })) }).toEqual(
        {
          estado,
          activa: true,
        },
      );
    }
  });

  it('cualquier otro estado es inactiva', () => {
    expect(estaActiva(parse({ ESTADO: 'I' }))).toBe(false);
    expect(estaActiva(parse({ ESTADO: 'CANCELADA' }))).toBe(false);
  });

  it('sin estado se asume activa', () => {
    // Una cuenta que el core devuelve pero no califica es una cuenta en uso.
    expect(estaActiva(parse({}))).toBe(true);
  });
});

describe('nombre del producto', () => {
  it('distingue ahorros de corriente', () => {
    expect(nombreDeLaCuenta(parse({}))).toBe('Cuenta de Ahorros');
    expect(
      nombreDeLaCuenta(
        parseDetalleDeCuenta({}, { ...CONTEXTO, tipoDeCuenta: 'CC' }),
      ),
    ).toBe('Cuenta Corriente');
  });
});
