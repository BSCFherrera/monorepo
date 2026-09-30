import { StyleSheet, Text, View } from 'react-native';

import { formatDOP } from '@bsc/shared';

import {
  BscCard,
  BscColors,
  BscIcon,
  BscIconTile,
  BscPill,
  BscRadius,
  BscSpacing,
  BscTypography,
  BscTextStyles,
} from '@bsc/design-system';
import type { ResumenDeBalance } from '../data/balanceSummary';

/**
 * «Tu balance»: la posición consolidada del cliente.
 *
 * Portada de `balance_summary_widget.dart`. Es la contraparte de la cabecera:
 * arriba se anuncia el dinero del que el cliente puede disponer hoy, y aquí lo
 * que tiene frente a lo que debe, ya convertido todo a pesos.
 *
 * Dos decisiones del original que conviene no perder:
 *
 *  - La barra partida es una sola línea de diez píxeles, no un gráfico. El
 *    original no carga ninguna librería de gráficos para esto y la app RN
 *    tampoco debería.
 *  - **Debajo se dice con qué tasa se consolidó**, y en naranja cuando la tasa
 *    del día no estuvo disponible. Un total en pesos que mezcla dólares sin
 *    explicar a cuánto los convirtió es un número que nadie puede verificar.
 */

export interface BalanceSummaryCardProps {
  resumen: ResumenDeBalance;
  saldosOcultos: boolean;
}

const OCULTO = '••••••';

export function BalanceSummaryCard({
  resumen,
  saldosOcultos,
}: BalanceSummaryCardProps): React.JSX.Element {
  const proporcionActivos = Math.min(
    Math.max(resumen.porcentajeActivos / 100, 0),
    1,
  );

  return (
    <BscCard testID="balance-consolidado">
      <View style={styles.encabezado}>
        <BscIconTile icon="donut" size={34} iconSize={17} />
        <Text style={styles.titulo}>Posición consolidada</Text>
        <BscPill
          label={`${Math.round(resumen.porcentajeActivos)}% activos`}
          color={BscColors.success}
        />
      </View>

      {/* Barra partida: activos contra el total consolidado. */}
      <View
        style={styles.barra}
        accessibilityRole="progressbar"
        accessibilityLabel={`${Math.round(
          resumen.porcentajeActivos,
        )} por ciento en activos`}
      >
        <View
          style={[
            styles.barraActivos,
            { flex: Math.max(proporcionActivos, 0.001) },
          ]}
        />
        <View
          style={[
            styles.barraResto,
            { flex: Math.max(1 - proporcionActivos, 0.001) },
          ]}
        />
      </View>

      <Text
        style={[styles.nota, !resumen.usaTasaDelDia && styles.notaAdvertencia]}
      >
        {resumen.usaTasaDelDia
          ? `Consolidado a ${formatDOP(
              resumen.tasaDolar,
            )} por US$ (venta de hoy)`
          : `Tasa del día no disponible; consolidado a ${formatDOP(
              resumen.tasaDolar,
            )} por US$`}
      </Text>

      <View style={styles.filaCifras}>
        <Cifra
          etiqueta="Lo que tengo"
          valor={
            saldosOcultos ? OCULTO : formatDOP(resumen.activosTotalesPesos)
          }
          color={BscColors.success}
          icono="arrow-up"
        />
        <Cifra
          etiqueta="Lo que debo"
          valor={
            saldosOcultos ? OCULTO : formatDOP(resumen.pasivosTotalesPesos)
          }
          color={BscColors.textPrimary}
          icono="arrow-down"
        />
      </View>
    </BscCard>
  );
}

function Cifra({
  etiqueta,
  valor,
  color,
  icono,
}: {
  etiqueta: string;
  valor: string;
  color: string;
  icono: 'arrow-up' | 'arrow-down';
}): React.JSX.Element {
  return (
    <View style={styles.cifra}>
      <View style={styles.filaEtiqueta}>
        <BscIcon name={icono} size={13} color={color} />
        <Text style={styles.etiquetaCifra}>{etiqueta}</Text>
      </View>
      {/* Una sola línea: con montos de siete dígitos el original encoge el
          texto antes que partirlo en dos. */}
      <Text
        style={[styles.valorCifra, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  titulo: {
    ...BscTypography.titleMedium,
    flex: 1,
  },
  barra: {
    flexDirection: 'row',
    height: 10,
    borderRadius: BscRadius.pill,
    overflow: 'hidden',
    marginTop: BscSpacing.md,
  },
  barraActivos: {
    backgroundColor: BscColors.secondary,
  },
  barraResto: {
    backgroundColor: BscColors.surfaceMuted,
  },
  nota: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
    marginTop: BscSpacing.xs,
  },
  notaAdvertencia: {
    color: BscColors.warning,
  },
  filaCifras: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
    marginTop: BscSpacing.sm,
  },
  cifra: {
    flex: 1,
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscRadius.sm,
    padding: BscSpacing.sm,
  },
  filaEtiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etiquetaCifra: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textSecondary,
  },
  valorCifra: {
    ...BscTextStyles['Body MD/16 Bold'],
    marginTop: 6,
  },
});
