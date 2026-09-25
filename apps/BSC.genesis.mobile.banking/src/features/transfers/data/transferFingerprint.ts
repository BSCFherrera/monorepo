import {
  computeOperationFingerprint,
  OPERATION_TYPE,
  type OperationDescriptor,
} from '@bsc/shared';

/**
 * La huella de una transferencia, derivada **del cuerpo que se va a enviar**.
 *
 * Esta es la decisión de diseño más importante de la oleada 5, y merece la
 * explicación entera.
 *
 * El backend no confía en la huella que le mandan: la **recalcula** a partir de
 * los campos de la petición, en `PaymentExecutionProcedureController`, y la
 * compara con la autorización que el canal consiguió al verificar el token. Si
 * no coinciden, la transferencia no procede aunque el código haya sido válido.
 * Eso es exactamente lo que debe pasar —es lo que impide que una autorización
 * de RD$ 100 sirva para mover RD$ 100.000—, y significa que el canal tiene una
 * sola obligación: **calcular la huella sobre los mismos valores que va a
 * enviar**.
 *
 * Los canales existentes no lo hacen así: leen el estado de la pantalla. Y por
 * eso los dos difieren del backend en el mismo campo.
 *
 * | Campo | Backend (la autoridad) | App Flutter | Portal |
 * |---|---|---|---|
 * | origen | `debitAccountNumber` | `sourceAccount.accountNumber` | `productId ?? numero` |
 * | destino | `creditAccountNumber ?? beneficiaryId ?? targetProduct.Number` | `destinationAccountNumber` | `beneficiario.accountNumber ?? targetProduct.number` |
 * | monto | `transactionAmount` | `amount` | `totalDebited` |
 *
 * **El monto ya no diverge.** El banco decidió que la app se debite como el
 * portal —monto convertido más comisión e impuesto—, así que `transactionAmount`
 * lleva el total debitado. Como la huella se deriva del cuerpo, la decisión se
 * aplicó cambiando un solo sitio, `ordenDeLaTransferencia`, y esta función no
 * tuvo que enterarse.
 * | **moneda** | **`sourceTransactionCurrency`** | **moneda del destino** | **moneda del destino** |
 *
 * **La moneda es una incompatibilidad real.** El backend firma con la moneda de
 * *origen* y los dos canales firman con la del *destino*. Coinciden solo cuando
 * las dos son iguales, que es el caso corriente; en una transferencia de una
 * cuenta en pesos a un beneficiario en dólares **no coinciden**, y la
 * transferencia se rechazará con «La operación no coincide con la autorizada»
 * en cuanto `TransactionAuthorizationSettings.Enforce` se encienda. Hoy no se
 * nota porque la aplicación está apagada y el guardián deja pasar la operación
 * dejándola anotada en la bitácora.
 *
 * Aquí se sigue **al backend**, porque es quien decide si el dinero se mueve, y
 * se deriva del cuerpo para que la divergencia no se pueda reintroducir: no hay
 * forma de firmar algo distinto de lo que se envía sin cambiar esta función.
 * La incompatibilidad queda escalada al banco (P-03: el backend no se toca), y
 * **el portal también hay que corregirlo** para que los tres coincidan.
 */

/** Los campos del cuerpo de `POST /payment-execution/transfer` que firman. */
export interface CuerpoDeTransferencia {
  debitAccountNumber: string;
  creditAccountNumber?: string | undefined;
  beneficiaryId?: string | undefined;
  targetProduct?: { number?: string | undefined } | undefined;
  transactionAmount: number;
  sourceTransactionCurrency: number;
}

/**
 * La cuenta de destino tal como la resuelve el backend.
 *
 * El orden importa y es el del controlador: primero la cuenta acreditada,
 * luego el identificador del beneficiario y por último el producto destino.
 * Invertirlo produce una huella que no coincide en los flujos con beneficiario,
 * que son la mayoría.
 */
export function destinoDeLaTransferencia(
  cuerpo: CuerpoDeTransferencia,
): string | null {
  const acreditada = vacioEsNulo(cuerpo.creditAccountNumber);
  if (acreditada !== null) return acreditada;

  const beneficiario = vacioEsNulo(cuerpo.beneficiaryId);
  if (beneficiario !== null) return beneficiario;

  return vacioEsNulo(cuerpo.targetProduct?.number);
}

function vacioEsNulo(valor: string | undefined): string | null {
  return valor === undefined || valor.trim() === '' ? null : valor;
}

/** El descriptor que se firma, para poder inspeccionarlo en una prueba. */
export function descriptorDeTransferencia(
  cuerpo: CuerpoDeTransferencia,
  customerCode: string,
): OperationDescriptor {
  return {
    operationType: OPERATION_TYPE.TRANSFER,
    customerCode,
    sourceAccount: cuerpo.debitAccountNumber,
    destinationAccount: destinoDeLaTransferencia(cuerpo),
    amount: cuerpo.transactionAmount,
    // La del **origen**, que es la que usa el backend. Ver la nota de arriba.
    currencyCode: cuerpo.sourceTransactionCurrency,
  };
}

export function huellaDeTransferencia(
  cuerpo: CuerpoDeTransferencia,
  customerCode: string,
): string {
  return computeOperationFingerprint(
    descriptorDeTransferencia(cuerpo, customerCode),
  );
}
