import { StyleSheet, Text, View } from 'react-native';

import {
  BscColors,
  BscPrimaryButton,
  BscSheet,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';

/**
 * El aviso de que la sesión está por cerrarse.
 *
 * Portado de `session_guard.dart`, que el porte **nunca tuvo**.
 *
 * `SessionManager` ya traía todo lo necesario —`onWarning`,
 * `onWarningResolved`, `timeRemainingMs` y un `extend()` cuyo propio comentario
 * dice «"Seguir conectado" en el aviso»— y **nadie lo llamaba fuera de las
 * pruebas**. La sesión se bloqueaba de golpe, sin los sesenta segundos de
 * gracia que el banco publica en `session.warning.before.timeout.seconds` y que
 * el porte sí le pide al backend desde la sesión anterior.
 *
 * Lo que el cliente perdía no es el aviso: es el formulario a medio llenar que
 * desaparecía con él.
 */

/**
 * La cuenta regresiva, en minutos y segundos.
 *
 * **Redondea hacia arriba** a propósito: con 500 ms de vida restante quedan
 * «un segundo», y enseñar `0:00` mientras la sesión sigue abierta haría dudar
 * de la cuenta entera.
 */
export function relojDelAviso(msRestantes: number): string {
  const segundos = Math.max(0, Math.ceil(msRestantes / 1000));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, '0')}`;
}

export function HojaDeAvisoDeSesion({
  visible,
  msRestantes,
  onSeguir,
  onCerrar,
}: {
  visible: boolean;
  msRestantes: number;
  /** «Seguir conectado»: extiende la sesión. */
  onSeguir: () => void;
  /** Cerrar la hoja sin extender; el temporizador sigue corriendo. */
  onCerrar: () => void;
}): React.JSX.Element {
  return (
    <BscSheet
      visible={visible}
      title="Tu sesión está por cerrarse"
      onClose={onCerrar}
      footnote="Cerramos la sesión por seguridad cuando no hay actividad."
      footer={
        <BscPrimaryButton
          label="Seguir conectado"
          onPress={onSeguir}
          testID="sesion-seguir"
        />
      }
      testID="hoja-aviso-de-sesion"
    >
      <View style={styles.centro}>
        <Text style={styles.reloj} testID="sesion-reloj">
          {relojDelAviso(msRestantes)}
        </Text>
      </View>
      <Text style={styles.explicacion}>
        Por tu seguridad cerraremos la sesión si no hay actividad. Toca «Seguir
        conectado» para continuar.
      </Text>
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center' },
  reloj: {
    ...BscTextStyles['Title L/48 Bold'],
    color: BscColors.primary,
    // El original pide `FontFeature.tabularFigures()`: sin cifras de ancho
    // fijo el contador cambia de ancho a cada segundo y el número «baila».
    fontVariant: ['tabular-nums'],
  },
  explicacion: {
    marginTop: BscSpacing.md,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
});
