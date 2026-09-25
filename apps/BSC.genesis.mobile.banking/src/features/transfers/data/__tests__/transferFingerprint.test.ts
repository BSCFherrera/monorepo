import { createHash } from 'node:crypto';

import { canonicalizeOperation, OPERATION_TYPE } from '@bsc/shared';

import {
  descriptorDeTransferencia,
  destinoDeLaTransferencia,
  huellaDeTransferencia,
  type CuerpoDeTransferencia,
} from '../transferFingerprint';

/**
 * Cómo calcula el backend la huella de una transferencia.
 *
 * Réplica literal de `PaymentExecutionProcedureController.PostProcessBankTransfer`
 * y de `OperationFingerprint.Canonicalize`, escrita aquí a mano y con
 * `node:crypto` como oráculo: si el porte y esta réplica coinciden, coinciden
 * con C#. Es el mismo método con el que la oleada 0 verificó el SHA-256 propio.
 */
function comoElBackend(
  cuerpo: CuerpoDeTransferencia,
  customerCode: string,
): string {
  const destino =
    cuerpo.creditAccountNumber !== undefined &&
    cuerpo.creditAccountNumber !== ''
      ? cuerpo.creditAccountNumber
      : cuerpo.beneficiaryId !== undefined && cuerpo.beneficiaryId !== ''
      ? cuerpo.beneficiaryId
      : cuerpo.targetProduct?.number ?? null;

  const normalizar = (valor: string | null): string =>
    valor === null || valor.trim() === '' ? '' : valor.trim().toUpperCase();

  const canonica = [
    'v1',
    String(OPERATION_TYPE.TRANSFER),
    normalizar(customerCode),
    normalizar(cuerpo.debitAccountNumber),
    normalizar(destino),
    cuerpo.transactionAmount.toFixed(2),
    String(cuerpo.sourceTransactionCurrency),
  ].join('|');

  return createHash('sha256').update(canonica, 'utf8').digest('hex');
}

const CLIENTE = '80191';

const entreCuentasPropias: CuerpoDeTransferencia = {
  debitAccountNumber: '11042010013953',
  creditAccountNumber: '11042010099887',
  transactionAmount: 1500,
  sourceTransactionCurrency: 214,
};

const aBeneficiario: CuerpoDeTransferencia = {
  debitAccountNumber: '11042010013953',
  beneficiaryId: 'b-001',
  transactionAmount: 2500.5,
  sourceTransactionCurrency: 214,
};

describe('destinoDeLaTransferencia', () => {
  it('la cuenta acreditada manda sobre todo lo demás', () => {
    // Es el primer término del `??` del controlador. Invertirlo produciría una
    // huella que no coincide en los flujos con beneficiario, que son la mayoría.
    expect(
      destinoDeLaTransferencia({
        ...aBeneficiario,
        creditAccountNumber: '11042010099887',
      }),
    ).toBe('11042010099887');
  });

  it('sin cuenta acreditada manda el identificador del beneficiario', () => {
    expect(destinoDeLaTransferencia(aBeneficiario)).toBe('b-001');
  });

  it('y en último lugar el número del producto destino', () => {
    expect(
      destinoDeLaTransferencia({
        debitAccountNumber: '1104',
        targetProduct: { number: '11042010055512' },
        transactionAmount: 10,
        sourceTransactionCurrency: 214,
      }),
    ).toBe('11042010055512');
  });

  it('una cadena vacía cuenta como ausente, no como destino', () => {
    // El backend usa `??`, que no descarta la cadena vacía; el canal nunca debe
    // enviarla, y aquí se trata como ausente para que la huella no dependa de
    // si alguien mandó `''` o no mandó nada.
    expect(
      destinoDeLaTransferencia({
        ...aBeneficiario,
        creditAccountNumber: '',
      }),
    ).toBe('b-001');

    expect(
      destinoDeLaTransferencia({
        debitAccountNumber: '1104',
        transactionAmount: 10,
        sourceTransactionCurrency: 214,
      }),
    ).toBeNull();
  });
});

describe('huellaDeTransferencia', () => {
  it('coincide con la del backend entre cuentas propias', () => {
    expect(huellaDeTransferencia(entreCuentasPropias, CLIENTE)).toBe(
      comoElBackend(entreCuentasPropias, CLIENTE),
    );
  });

  it('coincide con la del backend hacia un beneficiario', () => {
    expect(huellaDeTransferencia(aBeneficiario, CLIENTE)).toBe(
      comoElBackend(aBeneficiario, CLIENTE),
    );
  });

  it('firma la moneda de ORIGEN, que es la que recalcula el backend', () => {
    /*
      Regresión de la incompatibilidad encontrada en la oleada 5: la app Flutter
      y el portal firman con la moneda del **destino**, y el backend con la del
      **origen**. Coinciden solo cuando las dos son iguales; en una
      transferencia de una cuenta en pesos a un beneficiario en dólares no
      coinciden, y la operación se rechaza en cuanto la aplicación se encienda.
    */
    const cruzada: CuerpoDeTransferencia = {
      debitAccountNumber: '11042010013953',
      beneficiaryId: 'b-002',
      transactionAmount: 100,
      sourceTransactionCurrency: 214, // peso en origen…
    };

    const descriptor = descriptorDeTransferencia(cruzada, CLIENTE);
    expect(descriptor.currencyCode).toBe(214);

    // …y con la del destino —840— la huella sería otra.
    const comoLoHaciaFlutter = canonicalizeOperation({
      ...descriptor,
      currencyCode: 840,
    });

    expect(canonicalizeOperation(descriptor)).not.toBe(comoLoHaciaFlutter);
    expect(huellaDeTransferencia(cruzada, CLIENTE)).toBe(
      comoElBackend(cruzada, CLIENTE),
    );
  });

  it('firma el monto que se envía, no el que se muestra', () => {
    // El portal firma `totalDebited` —monto más comisión e impuesto— y envía
    // ese mismo valor, de modo que es coherente consigo mismo; la app móvil
    // firma y envía el monto tecleado. Lo que no puede pasar nunca es firmar
    // uno y enviar el otro, y por eso la huella sale del cuerpo.
    const conFees = { ...entreCuentasPropias, transactionAmount: 1_537.25 };

    expect(huellaDeTransferencia(conFees, CLIENTE)).toBe(
      comoElBackend(conFees, CLIENTE),
    );
    expect(huellaDeTransferencia(conFees, CLIENTE)).not.toBe(
      huellaDeTransferencia(entreCuentasPropias, CLIENTE),
    );
  });

  it('un céntimo de diferencia cambia la huella entera', () => {
    expect(huellaDeTransferencia(entreCuentasPropias, CLIENTE)).not.toBe(
      huellaDeTransferencia(
        { ...entreCuentasPropias, transactionAmount: 1500.01 },
        CLIENTE,
      ),
    );
  });

  it('cambiar el destino cambia la huella', () => {
    expect(huellaDeTransferencia(aBeneficiario, CLIENTE)).not.toBe(
      huellaDeTransferencia(
        { ...aBeneficiario, beneficiaryId: 'b-999' },
        CLIENTE,
      ),
    );
  });

  it('el mismo cuerpo de otro cliente produce otra huella', () => {
    // Impide que una autorización de un cliente sirva para la operación de otro.
    expect(huellaDeTransferencia(entreCuentasPropias, CLIENTE)).not.toBe(
      huellaDeTransferencia(entreCuentasPropias, '80192'),
    );
  });

  it('los espacios y las minúsculas no cambian la huella', () => {
    // Normalizar es lo que evita que dos canales calculen distinto sobre el
    // mismo dato: el backend hace `Trim().ToUpperInvariant()`.
    expect(
      huellaDeTransferencia(
        { ...aBeneficiario, beneficiaryId: '  b-001  ' },
        CLIENTE,
      ),
    ).toBe(huellaDeTransferencia(aBeneficiario, CLIENTE));
  });

  it('coincide con la cadena que el backend levantado escribió en su bitácora', () => {
    /*
      Este vector **no es una réplica**: es lo que el backend real produjo.

      `TransactionAuthorizationGuard` registra la cadena canónica cuando una
      transacción llega sin autorización utilizable —«sin verla, una huella que
      no coincide es imposible de depurar», dice su propio comentario—. Se envió
      una transferencia con una cuenta de origen inexistente, de modo que el
      guardián calculara la huella y el manejador rechazara la operación sin
      mover un peso, y se copió aquí la cadena que quedó en la bitácora.

      Vale más que las demás pruebas de este archivo porque cierra el último
      hueco: hasta ahora se comparaba el porte contra una reimplementación del
      cálculo de C#, y una reimplementación puede estar mal de la misma forma
      que el original. Esto es el servidor hablando.

      Las cuentas son inexistentes a propósito y el cliente es el de pruebas.
    */
    const CANONICA_DEL_BACKEND =
      'v1|2|80191|00000000000000|00000000000001|1234.56|214';

    const cuerpo: CuerpoDeTransferencia = {
      debitAccountNumber: '00000000000000',
      creditAccountNumber: '00000000000001',
      transactionAmount: 1234.56,
      sourceTransactionCurrency: 214,
    };

    expect(huellaDeTransferencia(cuerpo, CLIENTE)).toBe(
      createHash('sha256').update(CANONICA_DEL_BACKEND, 'utf8').digest('hex'),
    );
  });
});
