import React, {useRef} from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputInstance,
  TextInputKeyPressEvent,
  View,
  ViewStyle,
} from 'react-native';
import {BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS} from '@constants/theme';

interface OtpInputProps {
  /** Cantidad de dígitos del código. Por defecto: 6 */
  length?: number;
  /** Valor actual del código (controlado por el componente padre) */
  value: string;
  /** Se ejecuta cada vez que el código cambia */
  onChangeCode: (code: string) => void;
  /** Se ejecuta cuando se completan todos los dígitos (al llenar la última casilla o al presionar Enter) */
  onComplete?: (code: string) => void;
  /** Marca todas las casillas en rojo (estado de error) */
  error?: boolean;
  /** Marca todas las casillas en verde (código verificado correctamente) */
  success?: boolean;
  /** Deshabilita la edición */
  disabled?: boolean;
  /** Enfoca automáticamente la primera casilla al montar */
  autoFocus?: boolean;
  /** Estilos adicionales para el contenedor */
  containerStyle?: StyleProp<ViewStyle>;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChangeCode,
  onComplete,
  error = false,
  success = false,
  disabled = false,
  autoFocus = false,
  containerStyle,
}) => {
  const inputRefs = useRef<Array<TextInputInstance | null>>([]);
  const digits = Array.from({length}, (_, index) => value[index] ?? '');

  const handleChangeDigit = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    const newCode = newDigits.join('');
    onChangeCode(newCode);

    if (!digit) {
      return;
    }

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      inputRefs.current[index]?.blur();
      onComplete?.(newCode);
    }
  };

  const handleKeyPress = (
    event: TextInputKeyPressEvent,
    index: number,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitEditing = () => {
    if (value.length === length) {
      onComplete?.(value);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={text => handleChangeDigit(text, index)}
          onKeyPress={event => handleKeyPress(event, index)}
          onSubmitEditing={handleSubmitEditing}
          keyboardType="numeric"
          maxLength={1}
          editable={!disabled}
          autoFocus={autoFocus && index === 0}
          returnKeyType="done"
          selectTextOnFocus
          style={[
            styles.box,
            error && styles.boxError,
            disabled && styles.boxDisabled,
            success && styles.boxSuccess,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 44,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.backgroundLight,
  },
  boxError: {
    borderColor: COLORS.error,
  },
  boxDisabled: {
    backgroundColor: COLORS.backgroundDark,
    color: COLORS.textDisabled,
  },
  boxSuccess: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.backgroundLight,
    color: COLORS.textPrimary,
  },
});
