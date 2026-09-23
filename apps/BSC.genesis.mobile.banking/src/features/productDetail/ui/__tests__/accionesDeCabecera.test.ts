import { ProductCategory } from '../../../dashboard/data/productContracts';
import { accionesDeCabecera } from '../accionesDeCabecera';

/**
 * Las acciones de la cabecera de cada producto.
 *
 * Esta suite existe por una omisión concreta: el porte no tenía ninguna de
 * estas acciones y se descubrió comparando el Pixel contra la app Flutter. La
 * lista se comprueba aquí para que una que falte vuelva a fallar sola.
 */

const etiquetas = (tipo: string, cuentaDeAbono?: string): string[] =>
  accionesDeCabecera({ tipoDeProducto: tipo, cuentaDeAbono }).map(
    accion => accion.etiqueta,
  );

describe('acciones de la cabecera', () => {
  it('una cuenta de ahorros lleva las cuatro del original', () => {
    expect(etiquetas(ProductCategory.Savings)).toEqual([
      'Transferir',
      'Pagar',
      'Estados',
      'Compartir',
    ]);
  });

  it('una cuenta corriente lleva las mismas que la de ahorros', () => {
    expect(etiquetas(ProductCategory.Checking)).toEqual(
      etiquetas(ProductCategory.Savings),
    );
  });

  it('un préstamo lleva tres, y no la de compartir', () => {
    expect(etiquetas(ProductCategory.Loan)).toEqual([
      'Pagar cuota',
      'Simulador',
      'Estados',
    ]);
  });

  it('un certificado con cuenta de abono lleva tres', () => {
    expect(etiquetas(ProductCategory.Certificate, '11042010013953')).toEqual([
      'Compartir',
      'Cuenta de abono',
      'Mi oficial',
    ]);
  });

  it('un certificado sin cuenta de abono se salta esa acción', () => {
    // Dibujarla copiaría una cadena vacía y el aviso diría que se copió algo.
    expect(etiquetas(ProductCategory.Certificate)).toEqual([
      'Compartir',
      'Mi oficial',
    ]);
    expect(etiquetas(ProductCategory.Certificate, '')).toEqual([
      'Compartir',
      'Mi oficial',
    ]);
  });

  it('la tarjeta no usa esta lista: tiene su propia pantalla', () => {
    expect(
      accionesDeCabecera({ tipoDeProducto: ProductCategory.CreditCard }),
    ).toEqual([]);
  });

  it('una categoría desconocida abre sin acciones, no con las de una cuenta', () => {
    expect(accionesDeCabecera({ tipoDeProducto: 'ZZ' })).toEqual([]);
  });

  it('cada acción trae un icono', () => {
    for (const tipo of [
      ProductCategory.Savings,
      ProductCategory.Loan,
      ProductCategory.Certificate,
    ]) {
      for (const accion of accionesDeCabecera({
        tipoDeProducto: tipo,
        cuentaDeAbono: '123',
      })) {
        expect(accion.icono).toBeTruthy();
      }
    }
  });
});
