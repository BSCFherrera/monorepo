import {
  clasificarRiesgo,
  explicarRiesgo,
  LIMITE_COTIDIANO_DOP,
  LIMITE_EN_ENFRIAMIENTO_DOP,
  NivelDeRiesgo,
  TASA_DE_RESPALDO_USD,
} from '../operationRisk';

describe('clasificarRiesgo', () => {
  it('lo que no mueve dinero es una consulta', () => {
    expect(
      clasificarRiesgo({
        mueveDinero: false,
        monto: 1_000_000,
        enDolares: false,
      }),
    ).toBe(NivelDeRiesgo.Consulta);
  });

  it('un monto pequeño en pesos es cotidiano', () => {
    expect(
      clasificarRiesgo({ mueveDinero: true, monto: 1_000, enDolares: false }),
    ).toBe(NivelDeRiesgo.Cotidiana);
  });

  it('el umbral es exclusivo: justo en el límite sigue siendo cotidiano', () => {
    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: LIMITE_COTIDIANO_DOP,
        enDolares: false,
      }),
    ).toBe(NivelDeRiesgo.Cotidiana);

    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: LIMITE_COTIDIANO_DOP + 0.01,
        enDolares: false,
      }),
    ).toBe(NivelDeRiesgo.Elevado);
  });

  it('los dólares se evalúan convertidos', () => {
    // US$ 400 no es una operación pequeña aunque el número parezca bajo:
    // convertido pasa de veintitrés mil pesos… y sigue por debajo del umbral.
    expect(
      clasificarRiesgo({ mueveDinero: true, monto: 400, enDolares: true }),
    ).toBe(NivelDeRiesgo.Cotidiana);

    // Mil dólares sí lo pasan.
    const justoEncima = LIMITE_COTIDIANO_DOP / TASA_DE_RESPALDO_USD + 1;
    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: justoEncima,
        enDolares: true,
      }),
    ).toBe(NivelDeRiesgo.Elevado);
  });

  it('una internacional siempre escala, por pequeña que sea', () => {
    // El dinero sale del país y revertirlo es mucho más difícil.
    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: 1,
        enDolares: true,
        internacional: true,
      }),
    ).toBe(NivelDeRiesgo.Elevado);
  });

  it('un beneficiario nuevo escala aunque el monto sea bajo', () => {
    // Es el momento en que se establece un destino, y establecerlo importa más
    // que la primera cantidad que se le envíe.
    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: 100,
        enDolares: false,
        beneficiarioNuevo: true,
      }),
    ).toBe(NivelDeRiesgo.Elevado);
  });

  it('entre cuentas propias el umbral no aplica', () => {
    // El dinero no sale del cliente.
    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: 5_000_000,
        enDolares: false,
        entreCuentasPropias: true,
      }),
    ).toBe(NivelDeRiesgo.Cotidiana);
  });

  it('pero una internacional entre cuentas propias sigue escalando', () => {
    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto: 100,
        enDolares: true,
        entreCuentasPropias: true,
        internacional: true,
      }),
    ).toBe(NivelDeRiesgo.Elevado);
  });

  it('un dispositivo en enfriamiento baja el umbral', () => {
    /*
      Es lo que impide que quien logre enrolar un dispositivo ajeno vacíe la
      cuenta antes de que el cliente lea la notificación.
    */
    const monto = LIMITE_EN_ENFRIAMIENTO_DOP + 1;

    expect(
      clasificarRiesgo({ mueveDinero: true, monto, enDolares: false }),
    ).toBe(NivelDeRiesgo.Cotidiana);

    expect(
      clasificarRiesgo({
        mueveDinero: true,
        monto,
        enDolares: false,
        dispositivoEnEnfriamiento: true,
      }),
    ).toBe(NivelDeRiesgo.Elevado);
  });
});

describe('explicarRiesgo', () => {
  it('le dice al cliente por qué se le pide más', () => {
    // Un cliente que entiende por qué se le pide un código lo tolera; uno que
    // no, aprende a desconfiar de la aplicación.
    expect(explicarRiesgo(NivelDeRiesgo.Consulta)).toBe('');
    expect(explicarRiesgo(NivelDeRiesgo.Cotidiana)).toContain(
      'rostro o huella',
    );
    expect(explicarRiesgo(NivelDeRiesgo.Elevado)).toContain('código');
  });
});
