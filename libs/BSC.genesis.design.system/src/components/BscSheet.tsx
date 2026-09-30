import React, { type ReactNode } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  sheetMaxHeight,
  keyboardOverlap,
  SHEET_MAX_HEIGHT_FACTOR,
} from '../sheetHeight';
import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTypography, BscTextStyles } from '../theme/typography';

import { BscIcon } from './BscIcon';
import { overlay } from '../tokens';
import type { SheetProps } from '@bsc/contracts';

/**
 * Hoja modal inferior.
 *
 * Portada de `BscSheet` y `showBscSheet` en `bsc_ui.dart`, donde son una sola
 * pieza compartida por «Ver todos», «¿Qué deseas hacer?» y las notificaciones.
 * Aquí también es una sola: tres hojas escritas por separado terminan con tres
 * asas de distinto grosor y tres velos de distinta opacidad, que es exactamente
 * la clase de diferencia que hace que una app se vea armada a pedazos.
 *
 * Detalles del original que llevan intención:
 *
 *  - El velo es el azul oscuro de la marca al 45 %, no un negro genérico.
 *  - Lleva **asa y botón de cerrar a la vez**: el asa invita a arrastrar y la
 *    equis da una salida a quien no descubre el gesto.
 *  - Toca fuera y se cierra, y el botón atrás de Android también la cierra en
 *    vez de salir de la aplicación.
 *  - Ocupa como mucho el 92 % de la pantalla, de modo que siempre se vea un
 *    borde de lo que hay detrás y se entienda que es una capa, no otra pantalla.
 */

export interface BscSheetHandle {
  open(): void;
  close(): void;
  toggle(nextVisible?: boolean): void;
  isOpen(): boolean;
}

export interface BscSheetProps extends Omit<SheetProps, 'visible' | 'onClose'> {
  visible?: boolean;
  defaultVisible?: boolean;
  onOpenChange?: (visible: boolean) => void;
  onClose?: () => void;
  canDismiss?: boolean;
  children: ReactNode;
  /** Barra fija al pie, separada por una línea: botones de acción. */
  footer?: ReactNode;
}

/**
 * El estilo de la nota al pie de una hoja.
 *
 * Se exporta porque **la hoja de acceso está hecha a mano** y no usa
 * `BscSheet`: sin esto tendría que repetir los números y los dos acabarían
 * divergiendo, que es como el porte perdió el pie del acceso en primer lugar.
 */
export const FOOTNOTE_TEXT_STYLE = {
  ...BscTextStyles['Caption/12 Regular'],
  color: BscColors.textTertiary,
  textAlign: 'center',
  marginTop: BscSpacing.xs,
} as const;

export const BscSheet = forwardRef<BscSheetHandle, BscSheetProps>(function BscSheetComponent({
  visible,
  defaultVisible = false,
  title,
  onClose,
  onOpenChange,
  canDismiss = true,
  children,
  footer,
  footnote,
  maxHeightFactor = SHEET_MAX_HEIGHT_FACTOR,
  testID,
}: BscSheetProps, ref): React.JSX.Element {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isControlled = visible !== undefined;
  const currentVisible = isControlled ? visible : internalVisible;
  const insets = useSafeAreaInsets();
  const { height: altoDeLaVentana } = useWindowDimensions();
  const altoDelTeclado = useAltoDelTeclado(currentVisible);
  const conPie = footer !== undefined || footnote !== undefined;

  const setSheetVisible = useCallback(
    (nextVisible: boolean, notifyClose = false) => {
      if (!isControlled) setInternalVisible(nextVisible);
      if (currentVisible !== nextVisible) onOpenChange?.(nextVisible);
      if (notifyClose && currentVisible) onClose?.();
    },
    [currentVisible, isControlled, onClose, onOpenChange],
  );

  const close = useCallback(() => {
    setSheetVisible(false, true);
  }, [setSheetVisible]);

  const dismiss = useCallback(() => {
    if (canDismiss) close();
  }, [canDismiss, close]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setSheetVisible(true),
      close,
      toggle: nextVisible =>
        setSheetVisible(
          nextVisible ?? !currentVisible,
          nextVisible === false || (nextVisible === undefined && currentVisible),
        ),
      isOpen: () => currentVisible,
    }),
    [close, currentVisible, setSheetVisible],
  );

  // Lo que de verdad tapa el teclado, que es más de lo que React Native
  // reporta: ver `altoDeLaHoja.ts`.
  const tapadoPorElTeclado = keyboardOverlap({
    reportedHeight: altoDelTeclado,
    bottomInset: insets.bottom,
  });

  const alto = sheetMaxHeight({
    windowHeight: altoDeLaVentana,
    keyboardHeight: tapadoPorElTeclado,
    factor: maxHeightFactor,
  });

  return (
    <Modal
      visible={currentVisible}
      transparent
      animationType="slide"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.velo}>
        <Pressable
          testID="modal-backdrop"
          style={styles.zonaCierre}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={dismiss}
        />

        {/*
          El hueco del teclado se reserva fuera de la hoja, como hace
          `showBscSheet` del original con `viewInsets.bottom`. El tope de alto
          se calcula en `altoDeLaHoja.ts`, porque un porcentaje de la pantalla
          no basta: React Native no recorta el `maxHeight` del hijo con el
          espacio que le queda al padre, y lo que se salía por abajo era el pie
          de la hoja, donde está el botón.

          Y el hueco es el teclado **más la barra de navegación**: el modal se
          dibuja sobre la pantalla entera y `keyboardDidShow` mide contra la
          ventana, que no la incluye. Medido en el Pixel.
        */}
        <View style={{ paddingBottom: tapadoPorElTeclado }}>
          <View
            style={[
              styles.hoja,
              Number.isFinite(alto) ? { maxHeight: alto } : null,
            ]}
            testID={testID}
          >
            <View style={styles.asa} />

            <View style={styles.filaTitulo}>
              <Text style={styles.titulo} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={dismiss}
                hitSlop={10}
                testID={testID === undefined ? undefined : `${testID}-cerrar`}
              >
                <BscIcon
                  name="close"
                  size={22}
                  color={BscColors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.cuerpo}
              contentContainerStyle={[
                styles.contenido,
                // Sin pie, el respiro inferior lo pone el propio contenido para
                // que no quede pegado al borde del teléfono.
                conPie
                  ? null
                  : {
                      paddingBottom:
                        BscSpacing.md +
                        (altoDelTeclado > 0 ? 0 : insets.bottom),
                    },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>

            {conPie ? (
              <View
                style={[
                  styles.pie,
                  // Con el teclado abierto el hueco de la barra de navegación ya
                  // lo ocupa el propio teclado; sumarlo dejaría un vacío.
                  {
                    paddingBottom:
                      BscSpacing.md + (altoDelTeclado > 0 ? 0 : insets.bottom),
                  },
                ]}
              >
                {footer}
                {footnote !== undefined ? (
                  <Text style={styles.notaAlPie}>{footnote}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
});

/**
 * El alto del teclado, medido.
 *
 * `KeyboardAvoidingView` **no sirve dentro de un `Modal` transparente en
 * Android**: el modal crea su propia ventana y esa ventana no recibe los
 * márgenes del teclado aunque el manifiesto declare `adjustResize`. Se
 * descubrió en la hoja de acceso, probando en el Pixel, y vale para todas.
 */
function useAltoDelTeclado(enabled: boolean): number {
  const [alto, setAlto] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setAlto(0);
      return undefined;
    }

    const alAbrir = Keyboard.addListener('keyboardDidShow', evento => {
      setAlto(evento.endCoordinates.height);
    });
    const alCerrar = Keyboard.addListener('keyboardDidHide', () => {
      setAlto(0);
    });

    return () => {
      alAbrir.remove();
      alCerrar.remove();
    };
  }, [enabled]);

  return alto;
}

const styles = StyleSheet.create({
  velo: {
    flex: 1,
    justifyContent: 'flex-end',
    // La tinta de la marca al 45 %, no un negro genérico.
    backgroundColor: overlay.scrim,
  },
  zonaCierre: {
    flex: 1,
  },
  hoja: {
    backgroundColor: BscColors.surface,
    borderTopLeftRadius: BscRadius.sheet,
    borderTopRightRadius: BscRadius.sheet,
    paddingTop: BscSpacing.sm,
  },
  asa: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.border,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
    paddingLeft: BscSpacing.lg,
    paddingRight: BscSpacing.sm,
    paddingTop: BscSpacing.lg,
    paddingBottom: BscSpacing.xs,
  },
  titulo: {
    ...BscTypography.headlineSmall,
    flex: 1,
  },
  cuerpo: {
    flexGrow: 0,
  },
  contenido: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.xs,
    paddingBottom: BscSpacing.md,
  },
  pie: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: BscColors.divider,
  },
  notaAlPie: FOOTNOTE_TEXT_STYLE,
});
