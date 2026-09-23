

import {
  CausaDelFinDeSesion,
  cierrePara,
  loPidioElCliente,
} from '../finDeSesion';

describe('el porte decide lo mismo', () => {
  it('un cierre que pide el cliente avisa al servidor', () => {
    expect(
      cierrePara(CausaDelFinDeSesion.CierreDelCliente).avisarAlServidor,
    ).toBe(true);
    expect(cierrePara(CausaDelFinDeSesion.CierreDeTodas).avisarAlServidor).toBe(
      true,
    );
  });

  it('una sesión que caduca sola NO avisa al servidor', () => {
    // El defecto era exactamente este: avisar invalidaba el token de refresco
    // en el backend, y con él la única forma de volver a entrar con la huella.
    expect(cierrePara(CausaDelFinDeSesion.Inactividad).avisarAlServidor).toBe(
      false,
    );
    expect(
      cierrePara(CausaDelFinDeSesion.RefrescoRechazado).avisarAlServidor,
    ).toBe(false);
  });

  it('y los dos grupos no se confunden', () => {
    expect(loPidioElCliente(CausaDelFinDeSesion.CierreDelCliente)).toBe(true);
    expect(loPidioElCliente(CausaDelFinDeSesion.CierreDeTodas)).toBe(true);
    expect(loPidioElCliente(CausaDelFinDeSesion.Inactividad)).toBe(false);
    expect(loPidioElCliente(CausaDelFinDeSesion.RefrescoRechazado)).toBe(false);
  });
});

// ─── El bloqueo por inactividad conserva la llave de la huella ───────────────

describe('una inactividad bloquea, no cierra', () => {
  it('conserva el token de refresco, que es lo que la huella desbloquea', () => {
    // El defecto era exactamente este: la inactividad borraba el token de
    // refresco, así que «Entrar con tu huella» no tenía nada que reanudar y
    // respondía «Tu sesión expiró» sin llegar a pedir el dedo.
    expect(
      cierrePara(CausaDelFinDeSesion.Inactividad).borrarTokenDeRefresco,
    ).toBe(false);
  });

  it('un cierre que pide el cliente sí se lo lleva', () => {
    expect(
      cierrePara(CausaDelFinDeSesion.CierreDelCliente).borrarTokenDeRefresco,
    ).toBe(true);
    expect(
      cierrePara(CausaDelFinDeSesion.CierreDeTodas).borrarTokenDeRefresco,
    ).toBe(true);
  });

  it('y un refresco que el servidor rechaza también', () => {
    // Guardar un token que el servidor acaba de rechazar solo sirve para
    // volver a intentarlo y volver a fallar.
    expect(
      cierrePara(CausaDelFinDeSesion.RefrescoRechazado).borrarTokenDeRefresco,
    ).toBe(true);
  });

  it('la inactividad es el único final que lo conserva', () => {
    const conservan = Object.values(CausaDelFinDeSesion).filter(
      causa => !cierrePara(causa).borrarTokenDeRefresco,
    );
    expect(conservan).toEqual([CausaDelFinDeSesion.Inactividad]);
  });
});
