import { createHash } from 'node:crypto';

import { OPERATION_TYPE } from '@bsc/shared';

import { PaymentRepository } from '../paymentRepository';
import {
  huellaDePagoDePrestamo,
  huellaDePagoDeTarjeta,
  type CuerpoDePagoDePrestamo,
  type CuerpoDePagoDeTarjeta,
} from '../paymentFingerprint';

/**
 * Cómo calcula el backend la huella de un pago.
 *
 * Réplica literal de `OperationFingerprint.Canonicalize` y de los dos
 * controladores, con `node:crypto` como oráculo.
 */
function comoElBackend(
  tipo: number,
  customerCode: string,
  origen: string,
  destino: string,
  monto: number,
  moneda: number,
): string {
  const normalizar = (valor: string): string =>
    valor.trim() === '' ? '' : valor.trim().toUpperCase();

  const canonica = [
    'v1',
    String(tipo),
    normalizar(customerCode),
    normalizar(origen),
    normalizar(destino),
    monto.toFixed(2),
    String(moneda),
  ].join('|');

  return createHash('sha256').update(canonica, 'utf8').digest('hex');
}

const CLIENTE = '80191';

const tarjeta: CuerpoDePagoDeTarjeta = {
  debitAccountNumber: '11042010013953',
  cardNumber: '4539123456780668',
  paymentAmount: 12_527.25,
  transactionCurrency: 214,
};

const prestamo: CuerpoDePagoDePrestamo = {
  debitAccountNumber: '11042010013953',
  loanNumber: '293276',
  paymentAmount: 18_450.0,
  currencyCode: 214,
};

describe('huella del pago de tarjeta', () => {
  it('coincide con la del backend', () => {
    expect(huellaDePagoDeTarjeta(tarjeta, CLIENTE)).toBe(
      comoElBackend(
        OPERATION_TYPE.CREDIT_CARD_PAYMENT,
        CLIENTE,
        tarjeta.debitAccountNumber,
        tarjeta.cardNumber,
        tarjeta.paymentAmount,
        tarjeta.transactionCurrency,
      ),
    );
  });

  it('firma el número COMPLETO de la tarjeta, no el enmascarado', () => {
    /*
      Regresión del defecto de la app Flutter: su `payment_step_confirmation`
      firma `state.productNumber`, que es `maskedCardNumber`, mientras el
      backend recalcula con el `CardNumber` que la propia petición lleva. Basta
      eso para que NINGÚN pago de tarjeta coincida.
    */
    const conEnmascarado = huellaDePagoDeTarjeta(
      { ...tarjeta, cardNumber: '4539********0668' },
      CLIENTE,
    );

    expect(huellaDePagoDeTarjeta(tarjeta, CLIENTE)).not.toBe(conEnmascarado);
  });

  it('firma el monto que se debita, comisión e impuesto incluidos', () => {
    /*
      El otro defecto del original: firma `finalAmount` y envía `totalDebited`.
      Aquí los dos salen del mismo campo del cuerpo, así que no pueden separarse.
    */
    const sinComisiones = huellaDePagoDeTarjeta(
      { ...tarjeta, paymentAmount: 12_500 },
      CLIENTE,
    );

    expect(huellaDePagoDeTarjeta(tarjeta, CLIENTE)).not.toBe(sinComisiones);
  });

  it('cambiar la moneda del pago cambia la huella', () => {
    expect(huellaDePagoDeTarjeta(tarjeta, CLIENTE)).not.toBe(
      huellaDePagoDeTarjeta({ ...tarjeta, transactionCurrency: 840 }, CLIENTE),
    );
  });
});

describe('huella del pago de préstamo', () => {
  it('coincide con la del backend', () => {
    expect(huellaDePagoDePrestamo(prestamo, CLIENTE)).toBe(
      comoElBackend(
        OPERATION_TYPE.LOAN_PAYMENT,
        CLIENTE,
        prestamo.debitAccountNumber,
        prestamo.loanNumber,
        prestamo.paymentAmount,
        prestamo.currencyCode,
      ),
    );
  });

  it('usa otro tipo de operación que el pago de tarjeta', () => {
    // Si compartieran tipo, una autorización de una cuota serviría para pagar
    // una tarjeta del mismo monto.
    expect(OPERATION_TYPE.LOAN_PAYMENT).not.toBe(
      OPERATION_TYPE.CREDIT_CARD_PAYMENT,
    );

    const mismoTodo = {
      debitAccountNumber: prestamo.debitAccountNumber,
      cardNumber: prestamo.loanNumber,
      paymentAmount: prestamo.paymentAmount,
      transactionCurrency: prestamo.currencyCode,
    };

    expect(huellaDePagoDePrestamo(prestamo, CLIENTE)).not.toBe(
      huellaDePagoDeTarjeta(mismoTodo, CLIENTE),
    );
  });
});

describe('el repositorio firma el cuerpo que envía', () => {
  const repositorio = new PaymentRepository({} as never);

  it('la huella de la tarjeta sale del cuerpo armado', () => {
    const orden = {
      numeroDeTarjeta: '4539123456780668',
      cuentaOrigen: '11042010013953',
      monto: 12_527.25,
      monedaDelPago: 214,
      customerCode: CLIENTE,
      tipoDeCuentaOrigen: 2,
      nombreDeCuentaOrigen: 'Cuenta de Ahorros',
      monedaDeCuentaOrigen: 214,
      nombreDeLaTarjeta: 'Visa Clásica',
      comision: 25,
      impuesto: 2.25,
    };

    expect(repositorio.huellaDeTarjeta(orden)).toBe(
      huellaDePagoDeTarjeta(repositorio.cuerpoDeTarjeta(orden), CLIENTE),
    );
  });

  it('el monto viaja con dos decimales exactos', () => {
    // Una fracción larga por el binario flotante cambiaría la huella respecto
    // de lo que el backend recibe como `decimal`.
    const orden = {
      numeroDePrestamo: '293276',
      cuentaOrigen: '11042010013953',
      monto: 18_450.005,
      moneda: 214,
      customerCode: CLIENTE,
      numeroDeCuota: 1,
      tipoDePago: 1,
    };

    expect(repositorio.cuerpoDePrestamo(orden).paymentAmount).toBe(18_450.01);
  });

  it('el canal es el de móvil, no el de la banca en línea', () => {
    // Con `BSCLWEB` las operaciones del teléfono quedarían registradas en el
    // core como si vinieran del portal, y no se podrían distinguir después.
    const orden = {
      numeroDePrestamo: '293276',
      cuentaOrigen: '11042010013953',
      monto: 100,
      moneda: 214,
      customerCode: CLIENTE,
      numeroDeCuota: 1,
      tipoDePago: 1,
    };

    expect(repositorio.cuerpoDePrestamo(orden).channel).toBe('BSCMOVIL');
  });
});

describe('las cadenas que el backend levantado escribió en su bitácora', () => {
  /*
    Estos dos vectores **no son réplicas**: son lo que el backend real produjo.

    `TransactionAuthorizationGuard` registra la cadena canónica cuando una
    operación llega sin autorización utilizable. Se enviaron un pago de tarjeta
    y un pago de cuota con cuentas inexistentes, de modo que el guardián
    calculara la huella y la operación fuera rechazada después sin mover un
    peso, y se copiaron aquí las cadenas que quedaron en la bitácora.

    Son las dos operaciones que, según el hallazgo de la oleada 6, **fallarían
    el 100 % de las veces** en cuanto se encienda `Enforce`: el canal original
    firma el número enmascarado y `finalAmount`, mientras el backend recalcula
    con el número completo y el monto que recibe. Esta prueba es la que
    demuestra que el porte ya no tiene ese defecto.

    Las cuentas son inexistentes a propósito y el cliente es el de pruebas.
  */
  const CLIENTE_REAL = '80191';

  it('el pago de tarjeta firma el número completo y el monto que se envía', () => {
    const CANONICA_DEL_BACKEND =
      'v1|7|80191|00000000000000|0000000000000000|987.65|214';

    const cuerpo: CuerpoDePagoDeTarjeta = {
      debitAccountNumber: '00000000000000',
      cardNumber: '0000000000000000',
      paymentAmount: 987.65,
      transactionCurrency: 214,
    };

    expect(huellaDePagoDeTarjeta(cuerpo, CLIENTE_REAL)).toBe(
      createHash('sha256').update(CANONICA_DEL_BACKEND, 'utf8').digest('hex'),
    );
  });

  it('el pago de cuota firma el número del préstamo y su monto', () => {
    const CANONICA_DEL_BACKEND =
      'v1|8|80191|00000000000000|00000000000009|543.21|214';

    const cuerpo: CuerpoDePagoDePrestamo = {
      debitAccountNumber: '00000000000000',
      loanNumber: '00000000000009',
      paymentAmount: 543.21,
      currencyCode: 214,
    };

    expect(huellaDePagoDePrestamo(cuerpo, CLIENTE_REAL)).toBe(
      createHash('sha256').update(CANONICA_DEL_BACKEND, 'utf8').digest('hex'),
    );
  });
});
