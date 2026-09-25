import {
  RiskTier,
  ROUTINE_LIMIT_DOP,
  COOLING_OFF_LIMIT_DOP,
  FALLBACK_USD_TO_DOP,
  classifyOperationRisk,
  explainRiskTier,
  type OperationRiskInput,
} from '../operationRisk';

const base: OperationRiskInput = {
  movesMoney: true,
  amount: 1000,
  isUsd: false,
};

const clasificar = (overrides: Partial<OperationRiskInput> = {}) =>
  classifyOperationRisk({ ...base, ...overrides });

describe('classifyOperationRisk — consultas', () => {
  it('una operación que no mueve dinero no exige firma', () => {
    expect(clasificar({ movesMoney: false })).toBe(RiskTier.Inquiry);
  });

  it('el monto no cambia nada si no mueve dinero', () => {
    expect(clasificar({ movesMoney: false, amount: 10_000_000 })).toBe(
      RiskTier.Inquiry,
    );
  });
});

describe('classifyOperationRisk — operaciones cotidianas', () => {
  it('un monto bajo a un destino conocido es cotidiano', () => {
    expect(clasificar({ amount: 1000 })).toBe(RiskTier.Routine);
  });

  it('justo en el umbral sigue siendo cotidiano', () => {
    // El umbral es «mayor que», no «mayor o igual»: una transferencia de
    // exactamente RD$ 50,000 no debe pedir código.
    expect(clasificar({ amount: ROUTINE_LIMIT_DOP })).toBe(RiskTier.Routine);
  });

  it('un peso por encima del umbral escala', () => {
    expect(clasificar({ amount: ROUTINE_LIMIT_DOP + 1 })).toBe(
      RiskTier.Elevated,
    );
  });
});

describe('classifyOperationRisk — entre cuentas propias', () => {
  it('el umbral no aplica: el dinero no sale del cliente', () => {
    expect(clasificar({ amount: 5_000_000, isOwnAccount: true })).toBe(
      RiskTier.Routine,
    );
  });

  it('pero un destino internacional escala aunque sea cuenta propia', () => {
    expect(
      clasificar({ amount: 100, isOwnAccount: true, isInternational: true }),
    ).toBe(RiskTier.Elevated);
  });
});

describe('classifyOperationRisk — señales que escalan sin importar el monto', () => {
  it('un beneficiario nuevo escala aunque el monto sea mínimo', () => {
    // Establecer un destino importa más que la primera cantidad que se le
    // envíe: es el patrón de la mayoría del fraude.
    expect(clasificar({ amount: 1, isNewBeneficiary: true })).toBe(
      RiskTier.Elevated,
    );
  });

  it('una operación internacional escala siempre', () => {
    expect(clasificar({ amount: 1, isInternational: true })).toBe(
      RiskTier.Elevated,
    );
  });
});

describe('classifyOperationRisk — moneda extranjera', () => {
  it('los dólares se evalúan convertidos a pesos', () => {
    // US$ 900 son unos RD$ 53,550: por encima del umbral, aunque el número
    // parezca bajo.
    expect(clasificar({ amount: 900, isUsd: true })).toBe(RiskTier.Elevated);
  });

  it('un monto pequeño en dólares sigue siendo cotidiano', () => {
    expect(clasificar({ amount: 100, isUsd: true })).toBe(RiskTier.Routine);
  });

  it('la tasa de respaldo es la misma que usa el resumen de balance', () => {
    expect(FALLBACK_USD_TO_DOP).toBe(59.5);
  });
});

describe('classifyOperationRisk — dispositivo en enfriamiento', () => {
  it('el límite baja mientras el dispositivo es nuevo', () => {
    // Es lo que impide que quien logre enrolar un dispositivo ajeno vacíe la
    // cuenta antes de que el cliente lea la notificación.
    expect(clasificar({ amount: 10_000, deviceInCoolingOff: true })).toBe(
      RiskTier.Elevated,
    );
  });

  it('por debajo del límite reducido sigue siendo cotidiano', () => {
    expect(
      clasificar({ amount: COOLING_OFF_LIMIT_DOP, deviceInCoolingOff: true }),
    ).toBe(RiskTier.Routine);
  });

  it('el mismo monto sin enfriamiento no escala', () => {
    expect(clasificar({ amount: 10_000, deviceInCoolingOff: false })).toBe(
      RiskTier.Routine,
    );
  });
});

describe('explainRiskTier', () => {
  it('una consulta no explica nada', () => {
    expect(explainRiskTier(RiskTier.Inquiry)).toBe('');
  });

  it('una operación cotidiana pide rostro o huella', () => {
    expect(explainRiskTier(RiskTier.Routine)).toBe(
      'Confirma con tu rostro o huella.',
    );
  });

  it('una operación de alto riesgo explica por qué pide más', () => {
    // Un cliente que entiende por qué se le pide un código lo tolera; uno que
    // no, aprende a desconfiar de la app.
    expect(explainRiskTier(RiskTier.Elevated)).toBe(
      'Por el tipo de operación pedimos también un código de verificación.',
    );
  });
});
