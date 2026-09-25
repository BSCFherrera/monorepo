import { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';

import logoBsc from '../assets/logoBsc';
import type { LogoProps } from '@bsc/contracts';

/**
 * Logotipo de Banco Santa Cruz.
 *
 * Portado de `BscLogo` en `bsc_ui.dart`, que carga `assets/images/logo-bsc.svg`
 * y lo tiñe de blanco sobre superficies oscuras.
 *
 * El archivo original trae los colores de marca —el azul del rombo y los
 * degradados— y sobre el gradiente de fondo esos colores desaparecen. Por eso
 * el original también lo tiñe: no es una simplificación, es lo que hace la app
 * Flutter.
 */
export type BscLogoProps = LogoProps;

/** Proporción del archivo original: 256.341 × 100.461. */
const RELACION = 256.341 / 100.461;

export function BscLogo({
  height = 44,
  onDark = true,
}: BscLogoProps): React.JSX.Element {
  const xml = useMemo(() => {
    if (!onDark) return logoBsc;

    // Se tiñe reemplazando los rellenos del archivo. `SvgXml` no expone un
    // filtro de color como `colorFilter` de Flutter, y envolver el SVG en una
    // máscara para lograrlo costaría más de lo que aporta.
    return logoBsc
      .replace(/fill="(?!none)[^"]*"/g, 'fill="#FFFFFF"')
      .replace(/stop-color="[^"]*"/g, 'stop-color="#FFFFFF"');
  }, [onDark]);

  return <SvgXml xml={xml} height={height} width={height * RELACION} />;
}
