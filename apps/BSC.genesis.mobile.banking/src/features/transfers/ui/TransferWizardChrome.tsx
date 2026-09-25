import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BscColors,
  BscGradientSurface,
  BscIcon,
  BscPrimaryButton,
  BscSecondaryButton,
  BscSpinner,
  BscTextStyles,
} from '@bsc/ui-native';
import { PIE_DEL_ASISTENTE } from './medidasDeLosAsistentes';

/**
 * La cabecera del asistente, con su indicador de pasos.
 *
 * Portada del `_header` y el `_stepper` de `transfer_wizard_body.dart`. Las
 * medidas son las literales del original: círculos de 26, línea de 2, márgenes
 * de 8 y 16, y el visto blanco en los pasos ya recorridos.
 *
 * **En el comprobante no hay flecha de volver.** El dinero ya se movió: dejar
 * un botón que parece deshacerlo sería peor que no tener ninguno.
 */

export const PASOS = ['Detalles', 'Confirmar', 'Comprobante'] as const;

export function TransferWizardChrome({
  titulo,
  paso,
  onAtras,
  children,
}: {
  titulo: string;
  /** 0 detalles, 1 confirmar, 2 comprobante. */
  paso: number;
  /** Sin esta función no se dibuja la flecha. */
  onAtras?: (() => void) | undefined;
  children: ReactNode;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.pantalla}>
      <BscGradientSurface
        style={[styles.cabecera, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.fila}>
          {onAtras !== undefined ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={onAtras}
              hitSlop={12}
              style={styles.volver}
              testID="transferencia-atras"
            >
              <BscIcon
                name="chevron-left"
                size={22}
                color={BscColors.textOnDark}
              />
            </Pressable>
          ) : (
            <View style={styles.hueco} />
          )}

          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
        </View>

        <View style={styles.pasos}>
          {PASOS.map((_, indice) => {
            const recorrido = indice < paso;
            const activo = indice <= paso;
            const ultimo = indice === PASOS.length - 1;

            return (
              <View key={indice} style={styles.tramo}>
                <View
                  style={[
                    styles.circulo,
                    {
                      backgroundColor: activo
                        ? '#FFFFFF'
                        : 'rgba(255,255,255,0.24)',
                    },
                  ]}
                >
                  {recorrido ? (
                    <BscIcon name="check" size={16} color={BscColors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.numero,
                        {
                          color: activo
                            ? BscColors.primary
                            : 'rgba(255,255,255,0.7)',
                        },
                      ]}
                    >
                      {indice + 1}
                    </Text>
                  )}
                </View>

                {!ultimo ? (
                  <View
                    style={[
                      styles.linea,
                      {
                        backgroundColor: recorrido
                          ? '#FFFFFF'
                          : 'rgba(255,255,255,0.24)',
                      },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </BscGradientSurface>

      <View style={styles.cuerpo}>{children}</View>
    </View>
  );
}

/**
 * La capa que cubre la pantalla mientras se cotiza o se procesa.
 *
 * Es deliberadamente bloqueante. Mientras una transferencia está en curso, un
 * segundo toque en «Confirmar» podría mandarla dos veces, y el cliente no
 * tendría forma de saber cuál de los dos débitos es el bueno.
 */
export function CapaDeProceso({
  mensaje,
}: {
  mensaje: string;
}): React.JSX.Element {
  return (
    <View style={styles.capa} testID="transferencia-procesando">
      <BscSpinner color="#FFFFFF" />
      <Text style={styles.textoCapa}>{mensaje}</Text>
    </View>
  );
}

/** Barra inferior fija: los botones del paso, sobre la superficie y elevados. */
export function BarraInferior({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.barra,
        { paddingBottom: PIE_DEL_ASISTENTE.abajo + insets.bottom },
      ]}
    >
      {children}
    </View>
  );
}

/**
 * El pie de un paso del asistente: volver a la izquierda, seguir a la derecha.
 *
 * Los cuatro pasos —el formulario y la confirmación de transferencia, y los dos
 * de pago— lo escribían por separado y los cuatro salían igual, así que una
 * medida mal puesta se repetía cuatro veces. Es lo que pasó con el alto: el
 * original escribe `height: 50` a mano en los cuatro `_bottomBar`, pisando el
 * 54 por defecto de `BscPrimaryButton`, y el porte no pasaba ninguno.
 *
 * Las proporciones también son del original: `Expanded` y `Expanded(flex: 2)`,
 * de modo que el botón de seguir es el doble de ancho que el de volver.
 */
export function PieDelAsistente({
  atras,
  adelante,
}: {
  atras: { etiqueta: string; onPress: () => void };
  adelante: {
    etiqueta: string;
    onPress?: (() => void) | undefined;
    leading?: ReactNode;
    /**
     * Elemento al final del botón, la flecha de avance.
     *
     * ⚠️ **Solo los dos pasos 1 la llevan.** El original pone
     * `trailingIcon: Icons.arrow_forward_rounded` en los formularios de
     * transferencia y de pago, y **no** en sus dos confirmaciones, aunque los
     * cuatro compartan este mismo pie. Por eso viaja como propiedad.
     */
    trailing?: ReactNode;
    testID?: string;
  };
}): React.JSX.Element {
  return (
    <BarraInferior>
      <View style={styles.pie}>
        <View style={styles.pieAtras}>
          <BscSecondaryButton
            label={atras.etiqueta}
            height={PIE_DEL_ASISTENTE.altoDelBoton}
            onPress={atras.onPress}
          />
        </View>
        <View style={styles.pieAdelante}>
          <BscPrimaryButton
            label={adelante.etiqueta}
            height={PIE_DEL_ASISTENTE.altoDelBoton}
            leading={adelante.leading}
            trailing={adelante.trailing}
            onPress={adelante.onPress}
            testID={adelante.testID}
          />
        </View>
      </View>
    </BarraInferior>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  cabecera: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingBottom: 16,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hueco: { width: 12 },
  titulo: {
    flex: 1,
    color: BscColors.textOnDark,
    ...BscTextStyles['Body L/18 Bold'],
  },
  pasos: {
    marginTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  tramo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circulo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    ...BscTextStyles['Body S/14 Bold'],
  },
  linea: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  cuerpo: {
    flex: 1,
  },
  capa: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCapa: {
    marginTop: 16,
    color: '#FFFFFF',
    ...BscTextStyles['Body MD/16 Regular'],
  },
  pie: {
    flexDirection: 'row',
    gap: PIE_DEL_ASISTENTE.separacion,
  },
  pieAtras: { flex: PIE_DEL_ASISTENTE.proporcionCancelar },
  pieAdelante: { flex: PIE_DEL_ASISTENTE.proporcionContinuar },
  barra: {
    paddingHorizontal: PIE_DEL_ASISTENTE.lateral,
    paddingTop: PIE_DEL_ASISTENTE.arriba,
    backgroundColor: BscColors.surface,
    // La sombra de la barra apunta hacia arriba; en Android `elevation` no
    // puede, así que se refuerza con un borde, como ya se anotó en el sistema
    // de diseño.
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BscColors.divider,
  },
});
