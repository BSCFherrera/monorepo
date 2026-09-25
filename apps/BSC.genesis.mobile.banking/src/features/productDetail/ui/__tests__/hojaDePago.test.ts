import type { MontosDeLaTarjeta } from '../../data/creditCardDetailContracts';
import { opcionInicial, tarjetaActiva } from '../CreditCardSheets';

/**
 * Las dos reglas de las hojas de la tarjeta que no son de dibujo, portadas de
 * `credit_card_sheets.dart`.
 */

function montos(parcial: Partial<MontosDeLaTarjeta>): MontosDeLaTarjeta {
  return {
    balanceActual: 0,
    limiteDeCredito: 0,
    disponibleParaCompras: 0,
    disponibleParaRetiros: 0,
    pagoMinimo: 0,
    pagoTotal: 0,
    pagoVencido: 0,
    saldoAlCorte: 0,
    pagoMaximo: 0,
    debitosDespuesDelCorte: 0,
    creditosDespuesDelCorte: 0,
    enTransito: 0,
    ...parcial,
  };
}

describe('con qué opción abre la hoja de pago', () => {
  it('con el mínimo cuando la tarjeta lo tiene', () => {
    expect(
      opcionInicial(montos({ pagoMinimo: 5938.77, pagoTotal: 118775.3 })),
    ).toBe('minimo');
  });

  it('con el saldo al corte cuando el mínimo llega en cero', () => {
    // El banco cobra algunas tarjetas de contado: `PAGO_MINIMO` viene en cero
    // aun con saldo pendiente. Preseleccionarlo dejaría el botón de continuar
    // muerto nada más abrir la hoja.
    expect(opcionInicial(montos({ pagoMinimo: 0, pagoTotal: 118775.3 }))).toBe(
      'alCorte',
    );
  });

  it('con «Otro» cuando no hay ninguna de las dos cifras', () => {
    expect(opcionInicial(montos({}))).toBe('otro');
  });
});

describe('estado de la tarjeta', () => {
  it('reconoce las tres formas en que el core dice «activa»', () => {
    expect(tarjetaActiva('A')).toBe(true);
    expect(tarjetaActiva('ACTIVA')).toBe(true);
    expect(tarjetaActiva('Active')).toBe(true);
  });

  it('tolera espacios y minúsculas, que el core mezcla', () => {
    expect(tarjetaActiva('  a  ')).toBe(true);
  });

  it('cualquier otro estado no es activa', () => {
    expect(tarjetaActiva('B')).toBe(false);
    expect(tarjetaActiva('BLOQUEADA')).toBe(false);
    expect(tarjetaActiva('')).toBe(false);
  });
});
