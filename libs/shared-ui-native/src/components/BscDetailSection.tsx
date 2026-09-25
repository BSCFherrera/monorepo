import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscSpacing } from '../theme/spacing';
import { BscTypography, BscTextStyles } from '../theme/typography';

import { BscCard } from './BscCard';
import { BscIconTile } from './BscRow';
import type { DetailRowProps, DetailSectionProps } from '@bsc/contracts';

/**
 * Tarjeta con título e icono, y fila de etiqueta y valor.
 *
 * Portadas de `DetailSection` y `DetailInfoRow` en `shared_widgets.dart`, que a
 * su vez envuelven `BscInfoRow` de `bsc_ui.dart`. Las cuatro pantallas de
 * detalle —cuenta, tarjeta, préstamo y certificado— están hechas casi por
 * entero de estas dos piezas, así que tenerlas repetidas en cada pantalla sería
 * la vía segura a que cada una acabara con su propio interlineado.
 *
 * Medidas literales del original: el mosaico del icono mide 32 con el icono a
 * 16, el título va a 15 en seminegrita, cada fila respira 7 puntos arriba y
 * abajo, la etiqueta va a 13 y el valor a 13.5 alineado a la derecha.
 */

export interface BscDetailSectionProps extends DetailSectionProps {
  children: ReactNode;
  /** Acción a la derecha del título, como «Ver todos». */
  action?: ReactNode;
}

export function BscDetailSection({
  title,
  icon,
  children,
  action,
  testID,
}: BscDetailSectionProps): React.JSX.Element {
  return (
    <View style={styles.contenedor} testID={testID}>
      <BscCard>
        {title === undefined ? null : (
          <>
            <View style={styles.filaTitulo}>
              {icon === undefined ? null : (
                <BscIconTile icon={icon} size={32} iconSize={16} />
              )}
              <Text style={styles.titulo}>{title}</Text>
              {action}
            </View>
            <View style={styles.separador} />
          </>
        )}
        {children}
      </BscCard>
    </View>
  );
}

export type BscDetailRowProps = DetailRowProps;

export function BscDetailRow({
  label,
  value,
  valueColor,
  emphasized = false,
  testID,
}: BscDetailRowProps): React.JSX.Element {
  return (
    <View style={styles.fila} testID={testID}>
      <Text style={styles.etiqueta}>{label}</Text>
      <Text
        style={[
          styles.valor,
          emphasized ? styles.valorDestacado : null,
          valueColor === undefined ? null : { color: valueColor },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.sm,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  titulo: {
    ...BscTypography.titleMedium,
    flex: 1,
  },
  separador: {
    height: 1,
    backgroundColor: BscColors.divider,
    marginTop: BscSpacing.sm,
    marginBottom: BscSpacing.xs,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    gap: BscSpacing.sm,
  },
  etiqueta: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
  valor: {
    // Sin `flexShrink` un valor largo empuja la etiqueta fuera de la tarjeta en
    // vez de romper línea, y los montos de seis cifras con símbolo llegan.
    flexShrink: 1,
    textAlign: 'right',
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  valorDestacado: {
    fontWeight: '700',
  },
});
