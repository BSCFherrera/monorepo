

import { parametrosDePagoDeTarjeta } from '../parametrosDePago';

describe('el porte lleva los mismos tres datos', () => {
  it('conserva la tarjeta que el cliente tocó', () => {
    expect(
      parametrosDePagoDeTarjeta({
        numeroDeTarjeta: '220818155480001032',
        codigoMoneda: 214,
      }).producto,
    ).toBe('220818155480001032');
  });

  it('conserva el ciclo en dólares', () => {
    expect(
      parametrosDePagoDeTarjeta({
        numeroDeTarjeta: '220818155480001032',
        codigoMoneda: 840,
      }),
    ).toEqual({
      tipo: 'tarjeta',
      producto: '220818155480001032',
      moneda: 'USD',
    });
  });

  it('el ciclo en pesos es el de cualquier otro código de moneda', () => {
    expect(
      parametrosDePagoDeTarjeta({
        numeroDeTarjeta: '220818155480001032',
        codigoMoneda: 214,
      }).moneda,
    ).toBe('DOP');
  });
});
