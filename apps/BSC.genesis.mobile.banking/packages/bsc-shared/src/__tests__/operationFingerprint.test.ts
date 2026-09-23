import {
  FINGERPRINT_VERSION,
  OPERATION_TYPE,
  canonicalizeOperation,
  computeOperationFingerprint,
  computeFingerprintFrom,
  type OperationDescriptor,
} from '../operationFingerprint';

/**
 * Vectores compartidos por los tres canales.
 *
 * El backend (C#), el portal (TypeScript) y la app móvil calculan la misma
 * huella con implementaciones distintas. Si una se desvía, la transacción se
 * rechaza con «La operación no coincide con la autorizada». Estos vectores son
 * el contrato, y están copiados literalmente de
 * `BSC.MobileApp/test/core/operation_fingerprint_test.dart`: los mismos casos
 * existen en C# y en Dart, y los tres deben dar exactamente estos resultados.
 */
const vectors: ReadonlyArray<{
  name: string;
  op: OperationDescriptor;
  canonical: string;
}> = [
  {
    name: 'transferencia simple',
    op: {
      operationType: 2,
      customerCode: '80191',
      sourceAccount: '11042010013953',
      destinationAccount: '52672576257265',
      amount: 25000.0,
      currencyCode: 214,
    },
    canonical: 'v1|2|80191|11042010013953|52672576257265|25000.00|214',
  },
  {
    name: 'monto con centavos',
    op: {
      operationType: 2,
      customerCode: '80191',
      sourceAccount: '11042010013953',
      destinationAccount: '52672576257265',
      amount: 1234.56,
      currencyCode: 214,
    },
    canonical: 'v1|2|80191|11042010013953|52672576257265|1234.56|214',
  },
  {
    name: 'destino ausente',
    op: {
      operationType: 7,
      customerCode: '80191',
      sourceAccount: '11042010013953',
      destinationAccount: null,
      amount: 500.0,
      currencyCode: 840,
    },
    canonical: 'v1|7|80191|11042010013953||500.00|840',
  },
  {
    name: 'con espacios y minusculas',
    op: {
      operationType: 8,
      customerCode: ' 80191 ',
      sourceAccount: ' ca-11042010013953 ',
      destinationAccount: '293276',
      amount: 0.01,
      currencyCode: 214,
    },
    canonical: 'v1|8|80191|CA-11042010013953|293276|0.01|214',
  },
];

describe('operationFingerprint — forma canónica', () => {
  it.each(vectors)('$name', ({ op, canonical }) => {
    expect(canonicalizeOperation(op)).toBe(canonical);
  });

  it('el prefijo de versión es v1', () => {
    expect(FINGERPRINT_VERSION).toBe('v1');
  });

  it('los tipos de operación coinciden con TokenBscOperationType del backend', () => {
    expect(OPERATION_TYPE.TRANSFER).toBe(2);
    expect(OPERATION_TYPE.CREDIT_CARD_PAYMENT).toBe(7);
    expect(OPERATION_TYPE.LOAN_PAYMENT).toBe(8);
  });
});

describe('operationFingerprint — huella', () => {
  const transferencia: OperationDescriptor = {
    operationType: 2,
    customerCode: '80191',
    sourceAccount: '11042010013953',
    destinationAccount: '52672576257265',
    amount: 25000,
    currencyCode: 214,
  };

  it('es SHA-256 en hexadecimal minúscula de 64 caracteres', () => {
    const hash = computeOperationFingerprint(transferencia);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produce el mismo valor que la app Flutter y el backend', () => {
    // Valor fijo tomado de `operation_fingerprint_test.dart`. Si cambia, los
    // tres canales dejaron de coincidir y las transacciones se rechazarán.
    expect(computeOperationFingerprint(transferencia)).toBe(
      'a455a04b5aff0450635bef222eac23bd7932b4add72a55e5452e00352eed01ea',
    );
  });

  it('un monto distinto produce una huella distinta', () => {
    const forAmount = (amount: number) =>
      computeOperationFingerprint({ ...transferencia, amount });

    // Esto es lo que impide que una autorización de RD$ 25,000 sirva para una
    // de RD$ 500,000.
    expect(forAmount(25000)).not.toBe(forAmount(500000));
    expect(forAmount(25000)).not.toBe(forAmount(25000.01));
  });

  it('un destino distinto produce una huella distinta', () => {
    const forDestination = (destinationAccount: string) =>
      computeOperationFingerprint({ ...transferencia, destinationAccount });

    expect(forDestination('52672576257265')).not.toBe(
      forDestination('52672576257266'),
    );
  });

  it('el mismo dato con distinto formato da la misma huella', () => {
    const conEspacios = computeOperationFingerprint({
      operationType: 2,
      customerCode: ' 80191 ',
      sourceAccount: 'ca-123',
      destinationAccount: null,
      amount: 100,
      currencyCode: 214,
    });
    const limpio = computeOperationFingerprint({
      operationType: 2,
      customerCode: '80191',
      sourceAccount: 'CA-123',
      destinationAccount: '',
      amount: 100.0,
      currencyCode: 214,
    });

    expect(conEspacios).toBe(limpio);
  });
});

describe('operationFingerprint — formato del monto', () => {
  const conMonto = (amount: number) =>
    canonicalizeOperation({
      operationType: 2,
      customerCode: 'C',
      sourceAccount: 'A',
      destinationAccount: 'B',
      amount,
      currencyCode: 214,
    }).split('|')[5];

  it('siempre lleva dos decimales', () => {
    expect(conMonto(100)).toBe('100.00');
    expect(conMonto(100.5)).toBe('100.50');
    expect(conMonto(0)).toBe('0.00');
  });

  it('redondea igual que decimal.ToString("F2") de C#', () => {
    // `toFixed` de JavaScript redondea a la par en algunos bordes por el binario
    // flotante. Estos son los casos donde se nota.
    expect(conMonto(1.005)).toBe('1.01');
    expect(conMonto(2.675)).toBe('2.68');
    expect(conMonto(8.165)).toBe('8.17');
  });

  it('conserva el signo negativo', () => {
    expect(conMonto(-1234.56)).toBe('-1234.56');
  });

  it('soporta montos grandes sin notación científica', () => {
    expect(conMonto(1234567890.12)).toBe('1234567890.12');
  });
});

describe('computeFingerprintFrom', () => {
  it('acepta una cadena canónica ya construida', () => {
    expect(
      computeFingerprintFrom(
        'v1|2|80191|11042010013953|52672576257265|25000.00|214',
      ),
    ).toBe('a455a04b5aff0450635bef222eac23bd7932b4add72a55e5452e00352eed01ea');
  });
});
