import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatDate, softenDescription } from '@bsc/shared';

import {
  BscBorderRadius,
  BscColors,
  BscDateRangeSheet,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPlaceholder,
  BscRadius,
  BscRowDivider,
  BscSectionHeader,
  BscShadows,
  BscSpacing,
  BscSpinner,
  BscTextStyles,
} from '@bsc/ui-native';
import { type PresetDays, type DateRange } from '@bsc/contracts';
import type { Movimiento } from '../data/transactionContracts';

/**
 * Lista de movimientos, compartida por el detalle de cualquier producto.
 *
 * Portada de `transaction_list_section.dart`. Dos decisiones del original que
 * cambian mucho cómo se lee la lista:
 *
 *  - **Los movimientos se agrupan por día dentro de una sola tarjeta**, con una
 *    franja gris por fecha. Así la lista se lee como un estado de cuenta y no
 *    como una pila de bloques flotantes.
 *  - Cada fila lleva una flecha que entra o sale, verde para lo que entra:
 *    el color y la dirección se leen antes que el signo del monto.
 *
 * Los períodos son 30, 60 y 90 días **más uno personalizado**, que es el que
 * permite consultar más allá de noventa días: abre `BscDateRangeSheet`, con sus
 * seis atajos y su calendario, y llega hasta un año atrás. El backend no impone
 * ningún límite de rango —reenvía las fechas al core tal cual—, así que el tope
 * es del cliente y vive en el sistema de diseño, en un solo sitio.
 */

export type PeriodoDeMovimientos = PresetDays | 'personalizado';

export const PERIODOS: readonly {
  clave: PeriodoDeMovimientos;
  etiqueta: string;
}[] = [
  { clave: 30, etiqueta: '30 días' },
  { clave: 60, etiqueta: '60 días' },
  { clave: 90, etiqueta: '90 días' },
  { clave: 'personalizado', etiqueta: 'Personalizado' },
];

export interface TransactionListSectionProps {
  movimientos: Movimiento[];
  cargando: boolean;
  codigoMoneda: number;
  periodo: PeriodoDeMovimientos;
  /** Rango vigente. La hoja personalizada abre partiendo de él. */
  rango: DateRange;
  onPeriodo: (dias: PresetDays) => void;
  onRangoPersonalizado: (rango: DateRange) => void;
  titulo?: string;
  /** Reloj inyectable, para que las pruebas no dependan del día de hoy. */
  hoy?: Date;
}

export interface GrupoDelDia {
  etiqueta: string;
  movimientos: Movimiento[];
}

/**
 * Agrupa por fecha conservando el orden en que vino del core.
 *
 * Se usa un mapa que preserva inserción en vez de ordenar: el core ya devuelve
 * los movimientos en el orden en que el cliente espera verlos, y reordenarlos
 * por fecha formateada rompería el criterio cuando dos movimientos comparten
 * día.
 */
export function agruparPorDia(movimientos: Movimiento[]): GrupoDelDia[] {
  const grupos = new Map<string, Movimiento[]>();

  for (const movimiento of movimientos) {
    const clave = formatDate(movimiento.fecha);
    const existente = grupos.get(clave);
    if (existente === undefined) grupos.set(clave, [movimiento]);
    else existente.push(movimiento);
  }

  return [...grupos.entries()].map(([etiqueta, items]) => ({
    etiqueta,
    movimientos: items,
  }));
}

export function TransactionListSection({
  movimientos,
  cargando,
  codigoMoneda,
  periodo,
  rango,
  onPeriodo,
  onRangoPersonalizado,
  titulo = 'Movimientos',
  hoy = new Date(),
}: TransactionListSectionProps): React.JSX.Element {
  const grupos = agruparPorDia(movimientos);
  const [hojaAbierta, setHojaAbierta] = useState(false);

  return (
    <View>
      <BscSectionHeader title={titulo} style={styles.encabezado} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
      >
        {PERIODOS.map(({ clave, etiqueta }) => {
          const activo = clave === periodo;
          const esPersonalizado = clave === 'personalizado';
          return (
            <Pressable
              key={clave}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() =>
                esPersonalizado ? setHojaAbierta(true) : onPeriodo(clave)
              }
              style={[styles.pildora, activo && styles.pildoraActiva]}
              testID={`periodo-${clave}`}
            >
              {esPersonalizado ? (
                <BscIcon
                  name="calendar"
                  size={15}
                  color={activo ? BscColors.textOnDark : BscColors.primary}
                />
              ) : null}
              <Text
                style={[
                  styles.textoPildora,
                  activo && styles.textoPildoraActiva,
                ]}
              >
                {etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <BscDateRangeSheet
        visible={hojaAbierta}
        initialRange={rango}
        today={hoy}
        title="Período de movimientos"
        onClose={() => setHojaAbierta(false)}
        onApply={elegido => {
          setHojaAbierta(false);
          onRangoPersonalizado(elegido);
        }}
        testID="rango-movimientos"
      />

      <View style={styles.tarjeta}>
        {cargando ? (
          <View style={styles.centrado} testID="movimientos-cargando">
            <BscSpinner tamano="transactionList" />
          </View>
        ) : movimientos.length === 0 ? (
          <BscPlaceholder
            title="Sin movimientos"
            message="No hay movimientos en el período seleccionado."
            testID="movimientos-vacio"
          />
        ) : (
          grupos.map((grupo, indiceGrupo) => (
            <View key={grupo.etiqueta}>
              <View
                style={[
                  styles.franjaDia,
                  indiceGrupo === 0 && styles.franjaDiaPrimera,
                ]}
              >
                <Text style={styles.textoDia}>{grupo.etiqueta}</Text>
              </View>

              {grupo.movimientos.map((movimiento, indice) => (
                <View
                  key={`${movimiento.fecha}-${movimiento.referencia ?? indice}`}
                >
                  {indice > 0 ? <BscRowDivider /> : null}
                  <FilaDeMovimiento
                    movimiento={movimiento}
                    codigoMoneda={codigoMoneda}
                  />
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function FilaDeMovimiento({
  movimiento,
  codigoMoneda,
}: {
  movimiento: Movimiento;
  codigoMoneda: number;
}): React.JSX.Element {
  const entra = movimiento.tipo === 'C';

  const titulo =
    movimiento.comercio !== undefined && movimiento.comercio.trim() !== ''
      ? movimiento.comercio
      : movimiento.descripcion;

  return (
    <BscListRow
      leading={
        <BscIconTile
          icon={entra ? 'arrow-in' : 'arrow-out'}
          color={entra ? BscColors.success : BscColors.textSecondary}
          background={entra ? BscColors.successSoft : BscColors.surfaceVariant}
        />
      }
      title={softenDescription(titulo) || 'Movimiento'}
      subtitle={movimiento.tipoDeTransaccion ?? movimiento.referencia}
      // El signo lo pone la interfaz; el monto siempre viene positivo del core.
      trailingLabel={`${entra ? '+' : '-'}${formatCurrency(
        movimiento.monto,
        codigoMoneda,
      )}`}
      trailingColor={entra ? BscColors.income : BscColors.textPrimary}
      trailingSubLabel={
        movimiento.saldoCorrido === undefined
          ? undefined
          : formatCurrency(Math.abs(movimiento.saldoCorrido), codigoMoneda)
      }
      testID={`movimiento-${movimiento.referencia ?? ''}`}
    />
  );
}

const styles = StyleSheet.create({
  encabezado: {
    paddingHorizontal: BscSpacing.gutter,
  },
  filtros: {
    paddingHorizontal: BscSpacing.gutter,
    gap: BscSpacing.xs,
    paddingBottom: BscSpacing.sm,
  },
  pildora: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // El original separa el icono del texto con cinco puntos exactos.
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: BscRadius.pill,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surface,
  },
  pildoraActiva: {
    backgroundColor: BscColors.primary,
    borderColor: BscColors.primary,
  },
  textoPildora: {
    ...BscTextStyles['Caption/12 SemiBold'],
    color: BscColors.textSecondary,
  },
  textoPildoraActiva: {
    color: BscColors.textOnDark,
  },
  tarjeta: {
    marginHorizontal: BscSpacing.gutter,
    backgroundColor: BscColors.surface,
    borderRadius: BscBorderRadius.card,
    overflow: 'hidden',
    ...BscShadows.card,
  },
  centrado: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  franjaDia: {
    backgroundColor: BscColors.surfaceVariant,
    paddingHorizontal: BscSpacing.md,
    paddingTop: 12,
    paddingBottom: 10,
  },
  franjaDiaPrimera: {
    paddingTop: 10,
  },
  textoDia: {
    ...BscTextStyles['Caption/12 SemiBold'],
    color: BscColors.textSecondary,
  },
});
