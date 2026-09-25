

import { StyleSheet } from 'react-native';

import { estilosDeMisDispositivos } from '../../features/deviceBinding/ui/MyDevicesScreen';
import { estilosDeSeguridad } from '../../features/deviceBinding/ui/SecurityScreen';
import { estilosDeTasaDeCambio } from '../../features/exchangeRates/ui/ExchangeRatesScreen';
import { estilosDeComprobantesFiscales } from '../../features/taxReceipts/ui/TaxReceiptsScreen';
import {
  ENCABEZADO_DE_SECCION as E,
  ERROR_DE_TASA_DE_CAMBIO as X,
  TEXTO_DE_LA_HOJA as T,
} from '../medidasDeLasOchoPantallas';

const plano = (e: unknown): Record<string, unknown> =>
  StyleSheet.flatten(e as never) as unknown as Record<string, unknown>;

describe('el encabezado de Comprobantes no sale pegado al borde', () => {
  it('lleva el relleno lateral y el hueco de arriba del original', () => {
    // El defecto era exactamente este: el encabezado se dibujaba sin estilo,
    // así que el título quedaba a 0 de la izquierda y la tarjeta de debajo a 16.
    const estilo = plano(estilosDeComprobantesFiscales.encabezado);
    expect(estilo['paddingHorizontal']).toBe(E.lateral);
    expect(estilo['marginTop']).toBe(E.arriba);
  });
});

describe('el porte lo dibuja a todo el ancho', () => {
  it('Seguridad no sangra el separador de la tarjeta', () => {
    const estilo = plano(estilosDeSeguridad.separadorDeBloque);
    expect(estilo['marginHorizontal'] ?? 0).toBe(0);
    expect(estilo['height']).toBe(1);
  });

  it('Mis dispositivos tampoco', () => {
    const estilo = plano(estilosDeMisDispositivos.separadorDeBloque);
    expect(estilo['marginHorizontal'] ?? 0).toBe(0);
    expect(estilo['height']).toBe(1);
  });
});

describe('el texto de la hoja usa el estilo del tema, no un tamaño escrito a mano', () => {
  it.each([
    ['Seguridad', estilosDeSeguridad.textoHoja],
    ['Mis dispositivos', estilosDeMisDispositivos.textoHoja],
  ])('en %s', (_nombre, estilo) => {
    const aplicado = plano(estilo);
    expect(aplicado['fontSize']).toBe(T.tamano);
    expect(aplicado['lineHeight']).toBe(T.interlinea);
  });
});

describe('el porte dibuja esa vista y no el estado vacío genérico', () => {
  it('con el relleno, el icono y el botón del original', () => {
    expect(plano(estilosDeTasaDeCambio.zonaDeError)['padding']).toBe(X.relleno);
    expect(plano(estilosDeTasaDeCambio.botonDeError)['width']).toBe(
      X.anchoDelBoton,
    );
    expect(plano(estilosDeTasaDeCambio.botonDeError)['marginTop']).toBe(
      X.separacion,
    );
    expect(plano(estilosDeTasaDeCambio.mensajeDeError)['marginTop']).toBe(
      X.separacion,
    );
  });
});
