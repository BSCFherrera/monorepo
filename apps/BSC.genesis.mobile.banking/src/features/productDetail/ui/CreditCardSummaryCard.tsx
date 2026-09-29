import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@bsc/shared';

import {
  BscBanner,
  BscCard,
  BscColors,
  BscIcon,
  BscProgressRing,
  BscRowDivider,
  BscSpacing,
  BscTextStyles,
  fontFamily,
} from '@bsc/design-system';
import {
  avisoDePago,
  ultimosCuatroDigitos,
  usoDelLimite,
  type DetalleDeTarjeta,
  type MontosDeLaTarjeta,
} from '../data/creditCardDetailContracts';

/**
 * La tarjeta de resumen que flota dentro de la cabecera del detalle.
 *
 * Portada de `_buildSummaryCard` en `credit_card_detail_view.dart`. Es la pieza
 * que responde de un vistazo las tres preguntas con las que un cliente abre su
 * tarjeta: cuánto debe, cuánto le queda y cuándo tiene que pagar.
 *
 * Medidas literales del original: relleno de 16, nombre del producto a 12.5,
 * «Balance actual» a 12, el balance a 28 con interletraje de −0.8, el anillo de
 * 62 con trazo de 7, la línea divisoria de 1×30 entre las dos mini-cifras, y
 * estas a 11.5 la etiqueta y 14.5 el valor.
 *
 * **El color del anillo es un aviso, no decoración**: verde hasta el 75 % del
 * límite, naranja por encima y rojo por encima del 90 %. Es el único sitio de
 * la pantalla donde el cliente ve que se está quedando sin crédito antes de que
 * se lo rechacen en una caja.
 */

export interface CreditCardSummaryCardProps {
  tarjeta: DetalleDeTarjeta;
  montos: MontosDeLaTarjeta;
  codigoMoneda: number;
  /** Abre la hoja de pago. Es lo que hace el aviso al tocarlo. */
  onPagar: () => void;
}

/** Los dos umbrales del original, en tanto por uno. */
const UMBRAL_NARANJA = 0.75;
const UMBRAL_ROJO = 0.9;

function colorDelAnillo(uso: number): string {
  if (uso > UMBRAL_ROJO) return BscColors.error;
  if (uso > UMBRAL_NARANJA) return BscColors.warning;
  return BscColors.secondary;
}

/** Separa los centavos, como hace `BscHeroAmount` en el original. */
function partirMonto(formateado: string): { entero: string; centavos: string } {
  const punto = formateado.lastIndexOf('.');
  if (punto === -1) return { entero: formateado, centavos: '' };
  return {
    entero: formateado.slice(0, punto),
    centavos: formateado.slice(punto),
  };
}

function MiniCifra({
  etiqueta,
  valor,
  alFinal = false,
  testID,
}: {
  etiqueta: string;
  valor: string;
  alFinal?: boolean;
  testID?: string;
}): React.JSX.Element {
  return (
    <View style={[styles.miniCifra, alFinal ? styles.alFinal : null]}>
      <Text style={styles.miniEtiqueta}>{etiqueta}</Text>
      <Text style={styles.miniValor} numberOfLines={1} testID={testID}>
        {valor}
      </Text>
    </View>
  );
}

export function CreditCardSummaryCard({
  tarjeta,
  montos,
  codigoMoneda,
  onPagar,
}: CreditCardSummaryCardProps): React.JSX.Element {
  const uso = usoDelLimite(montos);
  const monto = (valor: number): string => formatCurrency(valor, codigoMoneda);
  const balance = partirMonto(monto(montos.balanceActual));

  // Una tarjeta que se cobra de contado no tiene pago mínimo: el core manda
  // cero y lo que hay que pagar es el total del ciclo. Anunciar «Pago mínimo
  // RD$ 0.00» le diría al cliente que este mes no debe nada.
  const aviso = avisoDePago(montos);

  const venceEl =
    tarjeta.fechaDePago === undefined || tarjeta.fechaDePago === ''
      ? 'Consulta tu estado de cuenta'
      : `Vence el ${tarjeta.fechaDePago}`;

  return (
    <BscCard style={styles.tarjeta} testID="tarjeta-resumen">
      <View style={styles.cuerpo}>
        <View style={styles.columnaDelBalance}>
          <Text style={styles.nombreDelProducto} numberOfLines={1}>
            {tarjeta.nombreDelProducto} •••• {ultimosCuatroDigitos(tarjeta)}
          </Text>
          <Text style={styles.etiquetaDelBalance}>Balance actual</Text>
          <View style={styles.filaDelMonto}>
            <Text
              style={styles.balanceEntero}
              numberOfLines={1}
              adjustsFontSizeToFit
              testID="tarjeta-balance"
            >
              {balance.entero}
            </Text>
            <Text style={styles.balanceCentavos}>{balance.centavos}</Text>
          </View>
        </View>

        <BscProgressRing
          value={uso}
          size={62}
          stroke={7}
          color={colorDelAnillo(uso)}
          testID="anillo-de-uso"
          center={
            <Text style={styles.porcentaje}>{Math.round(uso * 100)}%</Text>
          }
        />
      </View>

      <BscRowDivider />

      <View style={styles.filaDeCifras}>
        <MiniCifra
          etiqueta="Disponible"
          valor={monto(montos.disponibleParaCompras)}
          testID="tarjeta-disponible"
        />
        {/* La línea de 1×30 del original: sin ella las dos cifras se leen como
            una sola frase partida por el ancho de la pantalla. */}
        <View style={styles.lineaVertical} />
        <MiniCifra
          etiqueta="Ciclo actual"
          valor={monto(montos.pagoTotal)}
          alFinal
          testID="tarjeta-ciclo"
        />
      </View>

      <View style={styles.zonaDelAviso}>
        <BscBanner
          tone="info"
          icon="event-available"
          title={`${aviso.etiqueta} ${monto(aviso.monto)}`}
          subtitle={venceEl}
          onPress={onPagar}
          testID="aviso-de-pago"
          trailing={
            <BscIcon name="chevron-right" size={20} color={BscColors.primary} />
          }
        />
      </View>
    </BscCard>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: 0,
  },
  cuerpo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: BscSpacing.md,
    gap: BscSpacing.sm,
  },
  columnaDelBalance: {
    flex: 1,
  },
  nombreDelProducto: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textSecondary,
  },
  etiquetaDelBalance: {
    marginTop: BscSpacing.xs,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
  },
  filaDelMonto: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  balanceEntero: {
    ...BscTextStyles['Title S/30 Bold'],
    color: BscColors.textPrimary,
  },
  balanceCentavos: {
    fontFamily,
    fontSize: 28 * 0.62,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: BscColors.textPrimary,
  },
  porcentaje: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  filaDeCifras: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.sm,
  },
  miniCifra: {
    flex: 1,
    paddingHorizontal: BscSpacing.xs,
  },
  alFinal: {
    alignItems: 'flex-end',
  },
  miniEtiqueta: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
  },
  miniValor: {
    marginTop: 2,
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  lineaVertical: {
    width: 1,
    height: 30,
    backgroundColor: BscColors.divider,
  },
  zonaDelAviso: {
    paddingHorizontal: BscSpacing.sm,
    paddingBottom: BscSpacing.sm,
  },
});
