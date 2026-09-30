

import { StyleSheet } from 'react-native';

import { BscSpacing } from '@bsc/design-system';

import {
  estilosDelEsqueleto,
  MEDIDAS_DEL_ESQUELETO as M,
} from '../DashboardSkeleton';

describe('la hoja de estilos del porte usa esas medidas', () => {
  const plano = (e: unknown): Record<string, unknown> =>
    StyleSheet.flatten(e as never) as unknown as Record<string, unknown>;

  it('el contenedor lleva el margen lateral de pantalla', () => {
    // `gutter` (en Figma, `grid/mobile/margin`), no un número escrito a mano.
    expect(plano(estilosDelEsqueleto.contenedor)['paddingHorizontal']).toBe(BscSpacing.gutter);
  });

  it('las barras ocupan todo el ancho salvo las que lo declaran', () => {
    expect(plano(estilosDelEsqueleto.barra)['width']).toBe('100%');
  });

  it('las cuatro alturas son las del original y no coinciden entre sí', () => {
    const alturas = [M.primerRotulo.alto, M.primerBloque, M.segundoBloque];
    expect(new Set(alturas).size).toBe(3);
    expect(M.primerRotulo.ancho).not.toBe(M.segundoRotulo.ancho);
  });
});
