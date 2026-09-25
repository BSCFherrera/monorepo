import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscBorderRadius, BscRadius, BscSpacing, withAlpha } from '../theme/spacing';

import { BscIcon } from './BscIcon';
import { BscRowDivider } from './BscRow';
import { BscSheet } from './BscSheet';
import type { SelectProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Selector de una opción entre varias.
 *
 * ⚠️ **Divergencia deliberada con el original, y la única de la oleada 4.** La
 * app Flutter usa `DropdownButtonFormField`, un widget de Material que
 * despliega un menú flotante sobre el campo. React Native no trae nada
 * equivalente en su núcleo: las opciones son agregar una dependencia nativa de
 * selector o resolverlo con lo que ya hay.
 *
 * Se resuelve con una hoja, que es lo que esta app ya usa para elegir —el
 * selector de período, las acciones de la tarjeta, la lista de meses del estado
 * de cuenta—, así que no introduce un gesto nuevo. **El campo cerrado sí copia
 * al original**: mismo borde, mismo radio, misma altura y el mismo signo de
 * desplegar a la derecha, de modo que la diferencia solo se ve mientras está
 * abierto. Queda anotada para que el banco decida si la acepta.
 */
export type BscSelectProps<T> = SelectProps<T>;

export function BscSelect<T>({
  title,
  placeholder,
  options: opciones,
  selectedKey: seleccion,
  onSelect,
  enabled = true,
  error,
  testID,
}: BscSelectProps<T>): React.JSX.Element {
  const [abierta, setAbierta] = useState(false);

  const elegida = opciones.find(o => o.key === seleccion) ?? null;
  const inactivo = !enabled || opciones.length === 0;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={elegida?.label ?? placeholder}
        accessibilityState={{ disabled: inactivo, expanded: abierta }}
        onPress={inactivo ? undefined : () => setAbierta(true)}
        style={({ pressed }) => [
          styles.campo,
          error !== undefined && styles.campoConError,
          pressed && !inactivo && styles.campoPresionado,
          inactivo && styles.campoInactivo,
        ]}
        testID={testID}
      >
        <Text
          style={[styles.valor, elegida === null && styles.marcador]}
          numberOfLines={1}
        >
          {elegida?.label ?? placeholder}
        </Text>
        <BscIcon
          name="chevron-down"
          size={20}
          color={inactivo ? BscColors.textTertiary : BscColors.textSecondary}
        />
      </Pressable>

      {error !== undefined ? <Text style={styles.error}>{error}</Text> : null}

      <BscSheet
        visible={abierta}
        title={title}
        onClose={() => setAbierta(false)}
        maxHeightFactor={0.7}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {opciones.map((opcion, indice) => {
            const activa = opcion.key === seleccion;

            return (
              <View key={opcion.key}>
                {indice > 0 ? <BscRowDivider indent={0} /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  onPress={() => {
                    setAbierta(false);
                    onSelect(opcion);
                  }}
                  style={({ pressed }) => [
                    styles.opcion,
                    pressed && styles.opcionPresionada,
                  ]}
                  testID={`opcion-${opcion.key}`}
                >
                  <View style={styles.textoOpcion}>
                    <Text
                      style={[styles.etiqueta, activa && styles.etiquetaActiva]}
                    >
                      {opcion.label}
                    </Text>
                    {opcion.detail !== undefined ? (
                      <Text style={styles.detalle}>{opcion.detail}</Text>
                    ) : null}
                  </View>

                  {activa ? (
                    <BscIcon name="check" size={20} color={BscColors.primary} />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </BscSheet>
    </>
  );
}

const styles = StyleSheet.create({
  // Mismo alto y mismo borde que `BscTextField`, para que un formulario con
  // campos y selectores se lea como una sola columna.
  campo: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
    paddingHorizontal: BscSpacing.md,
    borderRadius: BscBorderRadius.field,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surface,
  },
  campoPresionado: {
    backgroundColor: BscColors.surfaceVariant,
  },
  campoConError: {
    borderColor: BscColors.error,
  },
  campoInactivo: {
    backgroundColor: BscColors.surfaceMuted,
  },
  valor: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  marcador: {
    color: BscColors.textTertiary,
  },
  error: {
    marginTop: 6,
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.error,
  },

  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
    paddingVertical: 14,
    paddingHorizontal: BscSpacing.xxs,
    borderRadius: BscRadius.sm,
  },
  opcionPresionada: {
    backgroundColor: withAlpha(BscColors.primary, 0.06),
  },
  textoOpcion: {
    flex: 1,
  },
  etiqueta: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  etiquetaActiva: {
    fontWeight: '600',
    color: BscColors.primary,
  },
  detalle: {
    marginTop: 2,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
});
