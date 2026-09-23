import {
  avanceDelPlazo,
  estaVigente,
  interesesPendientes,
  parseDetalleDeCertificado,
} from '../certificateDetailContracts';

const CONTEXTO = { numeroDeCertificado: '900123', codigoMoneda: 214 };
const parse = (crudo: unknown) => parseDetalleDeCertificado(crudo, CONTEXTO);

describe('nombres de campo del core', () => {
  it('lee los montos y las tasas', () => {
    const certificado = parse({
      BALANCE_ACTUAL: 512_400,
      MONTO_INICIAL: 500_000,
      TASA: 9.75,
      INTERESES_GANADOS: 12_400,
      INTERESES_PAGADOS: 8_000,
      FORMA_PAGO: 'MENSUAL',
    });

    expect({
      saldo: certificado.saldoActual,
      inicial: certificado.montoInicial,
      tasa: certificado.tasaDeInteres,
      ganados: certificado.interesesGanados,
      pagados: certificado.interesesPagados,
      forma: certificado.formaDePago,
    }).toEqual({
      saldo: 512_400,
      inicial: 500_000,
      tasa: 9.75,
      ganados: 12_400,
      pagados: 8_000,
      forma: 'MENSUAL',
    });
  });

  it('sin forma de pago asume al vencimiento, como el original', () => {
    expect(parse({}).formaDePago).toBe('VENCIMIENTO');
  });
});

describe('el plazo se guarda dos veces, y por un motivo', () => {
  it('conserva el texto del core y extrae el número', () => {
    // El core lo redacta —«150 días»— y volver a escribirlo arriesga cambiar lo
    // que el banco quiso decir; el número hace falta para la cuenta atrás.
    const certificado = parse({ PLAZO: '150 días' });

    expect(certificado.plazoRedactado).toBe('150 días');
    expect(certificado.plazoEnDias).toBe(150);
  });

  it('repara los acentos estropeados del plazo', () => {
    expect(parse({ PLAZO: '120 d¿as' }).plazoRedactado).toBe('120 días');
  });

  it('funciona igual cuando el plazo llega como número', () => {
    expect(parse({ PLAZO: 90 }).plazoEnDias).toBe(90);
  });
});

describe('intereses pendientes', () => {
  it('son los ganados menos los pagados', () => {
    expect(
      interesesPendientes(
        parse({ INTERESES_GANADOS: 12_400, INTERESES_PAGADOS: 8_000 }),
      ),
    ).toBe(4_400);
  });

  it('nunca son negativos', () => {
    // Tras una renovación el core puede reportar más pagado que ganado, y
    // «Intereses pendientes: -RD$ 40.00» no significa nada para el cliente.
    expect(
      interesesPendientes(
        parse({ INTERESES_GANADOS: 100, INTERESES_PAGADOS: 140 }),
      ),
    ).toBe(0);
  });
});

describe('avance del plazo', () => {
  const VIGENTE = {
    FEC_INICIO: '2026-01-01',
    FEC_VENCIMIENTO: '2026-12-31',
  };

  it('calcula lo transcurrido y los días que faltan', () => {
    // A mitad de año, con un plazo de 364 días entre extremos.
    const { avance, diasRestantes } = avanceDelPlazo(
      parse(VIGENTE),
      new Date(2026, 6, 1),
    );

    expect(avance).toBeGreaterThan(0.45);
    expect(avance).toBeLessThan(0.55);
    expect(diasRestantes).toBe(183);
  });

  it('el día de inicio no ha avanzado nada', () => {
    const { avance } = avanceDelPlazo(parse(VIGENTE), new Date(2026, 0, 1));
    expect(avance).toBe(0);
  });

  it('pasado el vencimiento se queda en completo y sin días', () => {
    const { avance, diasRestantes } = avanceDelPlazo(
      parse(VIGENTE),
      new Date(2027, 2, 1),
    );

    expect(avance).toBe(1);
    expect(diasRestantes).toBe(0);
  });

  it('antes del inicio no produce un avance negativo', () => {
    const { avance } = avanceDelPlazo(parse(VIGENTE), new Date(2025, 10, 1));
    expect(avance).toBe(0);
  });

  it('sin fechas devuelve cero en vez de fallar', () => {
    // Se calcula con las fechas y no con el plazo en días porque un certificado
    // renovado conserva el plazo original y las fechas se mueven.
    expect(avanceDelPlazo(parse({}), new Date(2026, 6, 1))).toEqual({
      avance: 0,
      diasRestantes: 0,
    });
    expect(
      avanceDelPlazo(parse({ FEC_INICIO: '2026-01-01' }), new Date(2026, 6, 1)),
    ).toEqual({ avance: 0, diasRestantes: 0 });
  });

  it('un rango invertido o de un solo día no divide entre cero', () => {
    const mismoDia = parse({
      FEC_INICIO: '2026-05-27',
      FEC_VENCIMIENTO: '2026-05-27',
    });

    expect(avanceDelPlazo(mismoDia, new Date(2026, 4, 27))).toEqual({
      avance: 0,
      diasRestantes: 0,
    });
  });
});

describe('estado', () => {
  it('«A» es vigente y cualquier otra cosa no', () => {
    expect(estaVigente(parse({ ESTADO: 'A' }))).toBe(true);
    expect(estaVigente(parse({ ESTADO: 'V' }))).toBe(false);
  });

  it('sin estado se asume vigente', () => {
    expect(estaVigente(parse({}))).toBe(true);
  });
});
