import {
  computeOperationFingerprint,
  OPERATION_TYPE,
  type OperationDescriptor,
} from '@bsc/shared';

/**
 * La huella de un pago, derivada **del cuerpo que se va a enviar**.
 *
 * Mismo principio que en transferencias, y aquí el motivo es todavía más
 * urgente: **en pagos la app Flutter no coincide con el backend en ningún
 * caso**, no solo en los cruzados.
 *
 * Lo que recalcula el backend, en `CreditCardManagementController` y
 * `LoanManagementController`:
 *
 * | Pago | origen | destino | monto | moneda |
 * |---|---|---|---|---|
 * | Tarjeta propia | `DebitAccountNumber` | `CardNumber` | `PaymentAmount` | `TransactionCurrency` |
 * | Tarjeta de un beneficiario | `DebitAccountNumber` | `DestinationAccountNumber` | `PaymentAmount` | `TransactionCurrency` |
 * | Préstamo | `debitAccountNumber` | `loanNumber` | `paymentAmount` | `currencyCode` |
 *
 * Y lo que firma el original, en `payment_step_confirmation.dart`:
 *
 * - destino: `state.productNumber`, que es **el número enmascarado**
 *   —`maskedCardNumber` o `maskedNumber`—, mientras el backend recalcula con el
 *   número completo que la propia petición lleva.
 * - monto: `state.finalAmount`, mientras el cuerpo envía `state.totalDebited`,
 *   que suma comisión e impuesto.
 *
 * Cualquiera de las dos basta para que no coincidan, y se dan **en todos los
 * pagos**: cada pago de tarjeta y cada pago de cuota sería rechazado con «La
 * operación no coincide con la autorizada» en cuanto
 * `TransactionAuthorizationSettings.Enforce` se encienda. Hoy la aplicación
 * está apagada y el guardián los deja pasar dejándolos anotados, así que el
 * defecto no se ve.
 *
 * Aquí la huella sale del cuerpo, igual que en la oleada 5, y por eso no puede
 * volver a divergir.
 */

/** Campos que firman en el pago de una tarjeta propia. */
export interface CuerpoDePagoDeTarjeta {
  debitAccountNumber: string;
  cardNumber: string;
  paymentAmount: number;
  transactionCurrency: number;
}

/** Campos que firman en el pago de la cuota de un préstamo. */
export interface CuerpoDePagoDePrestamo {
  debitAccountNumber: string;
  loanNumber: string;
  paymentAmount: number;
  currencyCode: number;
}

export function descriptorDePagoDeTarjeta(
  cuerpo: CuerpoDePagoDeTarjeta,
  customerCode: string,
): OperationDescriptor {
  return {
    operationType: OPERATION_TYPE.CREDIT_CARD_PAYMENT,
    customerCode,
    sourceAccount: cuerpo.debitAccountNumber,
    destinationAccount: cuerpo.cardNumber,
    amount: cuerpo.paymentAmount,
    currencyCode: cuerpo.transactionCurrency,
  };
}

export function descriptorDePagoDePrestamo(
  cuerpo: CuerpoDePagoDePrestamo,
  customerCode: string,
): OperationDescriptor {
  return {
    operationType: OPERATION_TYPE.LOAN_PAYMENT,
    customerCode,
    sourceAccount: cuerpo.debitAccountNumber,
    destinationAccount: cuerpo.loanNumber,
    amount: cuerpo.paymentAmount,
    currencyCode: cuerpo.currencyCode,
  };
}

export function huellaDePagoDeTarjeta(
  cuerpo: CuerpoDePagoDeTarjeta,
  customerCode: string,
): string {
  return computeOperationFingerprint(
    descriptorDePagoDeTarjeta(cuerpo, customerCode),
  );
}

export function huellaDePagoDePrestamo(
  cuerpo: CuerpoDePagoDePrestamo,
  customerCode: string,
): string {
  return computeOperationFingerprint(
    descriptorDePagoDePrestamo(cuerpo, customerCode),
  );
}
