

import { StyleSheet } from 'react-native';

import { estilosDeLasHojasDeTarjeta } from '../CreditCardSheets';
import { MEDIDAS_DE_LAS_HOJAS_DE_TARJETA as M } from '../medidasDeLasHojasDeTarjeta';

describe('la hoja de estilos usa esas separaciones', () => {
  const plano = (e: unknown): Record<string, unknown> =>
    StyleSheet.flatten(e as never) as unknown as Record<string, unknown>;

  it('el hueco antes de un título de sección es lg', () => {
    expect(plano(estilosDeLasHojasDeTarjeta.antesDelTitulo).marginTop).toBe(
      M.antesDelTituloDeSeccion,
    );
  });

  it('el hueco antes del aviso de comisiones es sm', () => {
    expect(plano(estilosDeLasHojasDeTarjeta.antesDelAviso).marginTop).toBe(
      M.antesDelAvisoDeComisiones,
    );
  });

  it('el hueco antes del aviso de gestión de la hoja de límites es lg', () => {
    expect(
      plano(estilosDeLasHojasDeTarjeta.antesDelAvisoDeGestion).marginTop,
    ).toBe(M.antesDelAvisoDeGestion);
  });

  it('las filas del movimiento del mes arrancan a xxs de su título', () => {
    expect(
      plano(estilosDeLasHojasDeTarjeta.trasElTituloDelMovimiento).marginTop,
    ).toBe(M.trasElTituloDelMovimiento);
  });

  it('la nota de canje va a sm', () => {
    expect(plano(estilosDeLasHojasDeTarjeta.nota).marginTop).toBe(
      M.antesDeLaNotaDeCanje,
    );
  });

  it('los tres huecos son de verdad distintos', () => {
    // El defecto era exactamente este: un solo estilo para tres medidas.
    const valores = new Set([
      M.antesDelTituloDeSeccion,
      M.antesDelAvisoDeComisiones,
      M.trasElTituloDelMovimiento,
    ]);
    expect(valores.size).toBe(3);
  });
});
