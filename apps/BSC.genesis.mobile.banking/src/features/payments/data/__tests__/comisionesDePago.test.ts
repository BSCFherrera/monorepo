import {
  parseComisionesDePago,
  SIN_COMISIONES_DE_PAGO,
} from '../paymentContracts';

/**
 * Comisión e impuesto de un pago: cero no es lo mismo que «no lo sé».
 *
 * **Nace de un pago real en el Pixel.** La pantalla de confirmación anunciaba
 * «Comisión RD$ 0.00» e «Impuesto 0.15%: RD$ 0.00», y el core debitó RD$ 0.08
 * de impuesto. No era que el pago estuviera exento: era que la llamada al
 * servicio de comisiones **había fallado con 400** y el repositorio devolvía
 * ceros en el `catch`, así que la aplicación presentaba como confirmado algo
 * que nunca llegó a preguntar.
 *
 * La causa del 400 es que los pagos envían `idDocumentNumber` vacío y el
 * contrato del BFF lo declara obligatorio; las transferencias sí lo mandan,
 * sacándolo del beneficiario, y por eso a ellas sí les responde. Eso se
 * escala (D-24): el cliente no expone su propio documento.
 *
 * Lo que se arregla aquí es lo que sí es nuestro y es lo que engaña: **una
 * cifra que no se pudo consultar no se enseña como si fuera cero.** El banco
 * fue explícito en que este servicio se consulta siempre, porque es él quien
 * dice si corresponde cobrar impuesto y si hay comisión.
 */

describe('las comisiones de un pago', () => {
  it('sabe que no las conoce cuando el servicio no respondió', () => {
    expect(SIN_COMISIONES_DE_PAGO.conocidas).toBe(false);
    expect(SIN_COMISIONES_DE_PAGO.comision).toBe(0);
    expect(SIN_COMISIONES_DE_PAGO.impuesto).toBe(0);
  });

  it('un cero que sí viene del servicio es un cero de verdad', () => {
    const comisiones = parseComisionesDePago({
      Value: { commissionAmount: 0, taxAmount: 0 },
    });

    expect(comisiones.conocidas).toBe(true);
    expect(comisiones.comision).toBe(0);
    expect(comisiones.impuesto).toBe(0);
  });

  it('lee la comisión y el impuesto que el servicio manda', () => {
    const comisiones = parseComisionesDePago({
      Value: { commissionAmount: 25, taxAmount: 2.25 },
    });

    expect(comisiones).toEqual({
      comision: 25,
      impuesto: 2.25,
      conocidas: true,
    });
  });

  /*
    La distinción tiene que sobrevivir a la comparación más obvia que alguien
    escribirá: «si la comisión es cero, no hay nada que enseñar». Con esa
    lectura vuelve el defecto.
  */
  it('no se puede distinguir por el valor, solo por la bandera', () => {
    const delServicio = parseComisionesDePago({
      Value: { commissionAmount: 0, taxAmount: 0 },
    });

    expect(delServicio.comision).toBe(SIN_COMISIONES_DE_PAGO.comision);
    expect(delServicio.impuesto).toBe(SIN_COMISIONES_DE_PAGO.impuesto);
    expect(delServicio.conocidas).not.toBe(SIN_COMISIONES_DE_PAGO.conocidas);
  });
});
