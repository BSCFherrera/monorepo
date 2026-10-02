import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ViewStyle,
} from 'react-native';

import { BscColors } from '../theme/colors';
import { textFieldTokens } from '../componentTokens';
import { BscBorderRadius, BscSpacing } from '../theme/spacing';
import { BscTypography } from '../theme/typography';
import type { TextFieldProps } from '@bsc/contracts';

/**
 * Campo de texto del sistema de diseño BSC.
 *
 * Portado de `BscTextField` en `bsc_ui.dart`.
 *
 * **Ni la etiqueta vacía ni el error ausente ocupan sitio.** Las dos cosas lo
 * ocupaban, y entre las dos metían 40 puntos de aire muerto por campo que el
 * original no tiene. Las medidas y sus porqués están en `medidasDelCampo.ts`.
 */
export interface BscTextFieldProps extends TextFieldProps {
  keyboardType?: KeyboardTypeOptions;
  style?: ViewStyle;
  /** Se dispara al perder el foco (ej. validar confirmación de contraseña al salir del campo). */
  onBlur?: () => void;
}

export function BscTextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  keyboardType,
  autoCapitalize = 'none',
  editable = true,
  maxLength,
  onSubmitEditing,
  onBlur,
  style,
  testID,
}: BscTextFieldProps): React.JSX.Element {
  const [enfocado, setEnfocado] = useState(false);
  const [oculto, setOculto] = useState(secure);

  const hayError = error !== undefined && error.length > 0;

  return (
    <View style={style}>
      {/*
        Una etiqueta vacía no se dibuja.

        `<Text>{''}</Text>` **reserva su línea igual** —18 puntos de
        `titleSmall` más los 4 del margen, 22 en total— y las seis pantallas que
        pasan `label=""` lo hacen justamente porque dibujan su propio rótulo de
        sección encima. Medido en el Pixel: entre el rótulo «MONTO (DOP)» y su
        campo el original deja 9,9 dp y el porte dejaba 31,2.
      */}
      {label === '' ? null : <Text style={styles.etiqueta}>{label}</Text>}

      <View
        style={[
          styles.caja,
          enfocado && styles.cajaEnfocada,
          hayError && styles.cajaConError,
          !editable && styles.cajaInactiva,
        ]}
      >
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={BscColors.textTertiary}
          secureTextEntry={oculto}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setEnfocado(true)}
          onBlur={() => {
            setEnfocado(false);
            onBlur?.();
          }}
          style={styles.entrada}
          // El teclado no debe sugerir ni guardar lo que se escribe en un campo
          // de credenciales.
          {...(secure ? { textContentType: 'password' as const } : {})}
        />

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar' : 'Ocultar'}
            onPress={() => setOculto(previo => !previo)}
            hitSlop={8}
            testID={testID ? `${testID}-visibilidad` : undefined}
          >
            <Text style={styles.accion}>{oculto ? 'Mostrar' : 'Ocultar'}</Text>
          </Pressable>
        ) : null}
      </View>

      {/*
        El error solo se dibuja cuando lo hay.

        El porte reservaba el alto siempre —2 de margen más 16 de mínimo, 18 en
        total— «para que el formulario no salte». **El original no reserva
        nada**: su `InputDecoration` no declara `errorText` ni `helperText`, y
        Flutter solo deja sitio para esa línea cuando se le da una; los errores
        los enseña en una banda al pie del formulario, que el porte también
        tiene. Medido en el Pixel, del campo al rótulo siguiente el original
        deja 27,43 dp y el porte dejaba 46,10.
      */}
      {hayError ? (
        <Text style={styles.error} numberOfLines={1}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    ...BscTypography.titleSmall,
    marginBottom: BscSpacing.xxs,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
    // Los dos rellenos de 14 del decorador del original más la línea de texto.
    // Ver `medidasDelCampo.ts`: el porte escribía 52, y 52 y 50 se leen igual.
    height: textFieldTokens.height,
    paddingHorizontal: BscSpacing.sm,
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscBorderRadius.field,
    borderWidth: 1.5,
    borderColor: BscColors.border,
  },
  cajaEnfocada: {
    borderColor: BscColors.primary,
    backgroundColor: BscColors.surface,
  },
  cajaConError: {
    borderColor: BscColors.error,
    backgroundColor: BscColors.errorSoft,
  },
  cajaInactiva: {
    opacity: 0.6,
  },
  entrada: {
    flex: 1,
    ...BscTypography.bodyLarge,
    padding: 0,
  },
  accion: {
    ...BscTypography.labelMedium,
    color: BscColors.primary,
  },
  error: {
    ...BscTypography.bodySmall,
    color: BscColors.error,
    marginTop: 2,
  },
});
