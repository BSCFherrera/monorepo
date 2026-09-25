import type { BscIconName } from '@bsc/ui-native';
import { ProductCategory } from '../../dashboard/data/productContracts';

/**
 * Las acciones que cada producto pone sobre el degradado de su cabecera.
 *
 * Portadas de `_AccountQuickActions` en `account_detail_view.dart`,
 * `_LoanQuickActions` en `loan_detail_view.dart` y `_CertificateQuickActions`
 * en `certificate_detail_view.dart`.
 *
 * **Faltaban enteras en el porte.** Se detectaron comparando el Pixel contra la
 * app Flutter: la cuenta abría con cuatro acciones bajo el saldo y aquí no
 * había ninguna.
 *
 * Cada tipo tiene las suyas, y no son intercambiables: una cuenta se comparte y
 * se transfiere desde ella, un préstamo se paga, y un certificado no se toca
 * —solo se consulta y se copia—. Viven en una función pura para que la lista se
 * pueda comprobar sin montar la pantalla, que es donde se coló la omisión.
 */

export type ClaveDeAccion =
  | 'transferir'
  | 'pagar'
  | 'estados'
  | 'compartir'
  | 'pagarCuota'
  | 'simulador'
  | 'cuentaDeAbono'
  | 'miOficial';

export interface AccionDeCabecera {
  clave: ClaveDeAccion;
  icono: BscIconName;
  etiqueta: string;
}

export function accionesDeCabecera(opciones: {
  tipoDeProducto: string;
  /** Del certificado. Sin ella, esa acción no se dibuja. */
  cuentaDeAbono?: string | undefined;
}): AccionDeCabecera[] {
  const { tipoDeProducto, cuentaDeAbono } = opciones;

  if (
    tipoDeProducto === ProductCategory.Savings ||
    tipoDeProducto === ProductCategory.Checking
  ) {
    return [
      { clave: 'transferir', icono: 'transfer', etiqueta: 'Transferir' },
      { clave: 'pagar', icono: 'receipt', etiqueta: 'Pagar' },
      { clave: 'estados', icono: 'document', etiqueta: 'Estados' },
      { clave: 'compartir', icono: 'share', etiqueta: 'Compartir' },
    ];
  }

  if (tipoDeProducto === ProductCategory.Loan) {
    return [
      { clave: 'pagarCuota', icono: 'payments', etiqueta: 'Pagar cuota' },
      { clave: 'simulador', icono: 'calculator', etiqueta: 'Simulador' },
      { clave: 'estados', icono: 'document', etiqueta: 'Estados' },
    ];
  }

  if (tipoDeProducto === ProductCategory.Certificate) {
    return [
      { clave: 'compartir', icono: 'share', etiqueta: 'Compartir' },
      // La cuenta de abono solo cuando el core la manda: sin ella la acción
      // copiaría una cadena vacía y el aviso mentiría.
      ...(cuentaDeAbono === undefined || cuentaDeAbono === ''
        ? []
        : ([
            {
              clave: 'cuentaDeAbono',
              icono: 'wallet',
              etiqueta: 'Cuenta de abono',
            },
          ] as const)),
      { clave: 'miOficial', icono: 'headset', etiqueta: 'Mi oficial' },
    ];
  }

  // La tarjeta de crédito tiene las suyas en su propia pantalla, y cualquier
  // otra categoría del core abre sin acciones en vez de con las de una cuenta.
  return [];
}
