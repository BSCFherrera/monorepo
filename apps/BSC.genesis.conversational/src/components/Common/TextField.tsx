import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, SPACING} from '@constants/theme';
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  DimensionValue,
  TextInputProps,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import Clipboard from '@react-native-clipboard/clipboard';

interface TextFieldProps extends TextInputProps {
  /** Texto a mostrar cuando no hay nada escrito */
  placeholder?: string;
  /** Alineación del texto. Por defecto: 'left' */
  align?: 'left' | 'center' | 'right';
  /** Si es true, el input no se puede editar pero mantiene su estilo normal */
  readOnly?: boolean;
  /** Si es true, el input se ve gris y no se puede usar */
  disabled?: boolean;
  /** Si es true, el borde se vuelve rojo */
  error?: boolean;
  /** Ancho del componente (ej. '100%', 200) */
  width?: DimensionValue;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
  /** Nombre del icono de feather (opcional) */
  iconName?: string;
  /** Posición del icono: 'left' o 'right'. Por defecto: 'left' */
  iconPosition?: 'left' | 'right';
  /** Color del icono. Por defecto: gris del borde (COLORS.border) */
  iconColor?: string;
  /** Color del texto. Por defecto: COLORS.textPrimary */
  textColor?: string;
  /** Si se define, el icono se vuelve presionable (ej. mostrar/ocultar contraseña) */
  onIconPress?: () => void;
  /** Elemento custom que reemplaza el icono derecho (ej. check + ojo juntos) */
  rightElement?: React.ReactNode;
  /** Muestra un botón para copiar el valor */
  copyable?: boolean;
  /** Callback opcional despues de copiar */
  onCopy?: (text: string) => void;
}

// Envuelve el icono en un botón cuando se recibe onPress; si no, queda decorativo
const IconSlot: React.FC<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}> = ({onPress, style, children}) => {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={style}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={style}>{children}</View>;
};

export const TextField: React.FC<TextFieldProps> = ({
  placeholder,
  align = 'left',
  readOnly = false,
  disabled = false,
  error = false,
  width = '100%',
  containerStyle,
  iconName,
  iconPosition = 'left',
  iconColor,
  textColor,
  onIconPress,
  rightElement,
  value,
  copyable,
  onCopy,
  onChangeText,
  ...textInputProps
}) => {
  // --- Estilos Dinámicos ---
  const dynamicContainerStyle: ViewStyle = {
    width,
    borderColor: error ? COLORS.error : COLORS.border,
    backgroundColor: disabled ? COLORS.backgroundDark : COLORS.backgroundLight,
  };

  const dynamicTextStyle = {
    textAlign: align,
    color: disabled ? COLORS.textDisabled : textColor || COLORS.textPrimary,
  };

  const dynamicIconColor = disabled ? COLORS.textDisabled : iconColor || COLORS.border;

  const isEditable = !readOnly && !disabled;

  const handleCopy = () => {
    if (!value) {
      return;
    }

    const text = String(value);
    Clipboard.setString(text);
    onCopy?.(text);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={[styles.container, dynamicContainerStyle]}>
        {iconName && iconPosition === 'left' && (
          <IconSlot onPress={onIconPress} style={styles.iconLeft}>
            <Icon name={iconName as any} size={DIMENSIONS.iconSize.sm} color={dynamicIconColor} />
          </IconSlot>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          style={[styles.input, dynamicTextStyle]}
          editable={isEditable}
          {...textInputProps}
        />
        {rightElement ? (
          <View style={styles.iconRight}>{rightElement}</View>
        ) : (
          iconName &&
          iconPosition === 'right' && (
            <IconSlot onPress={onIconPress} style={styles.iconRight}>
              <Icon name={iconName as any} size={DIMENSIONS.iconSize.sm} color={dynamicIconColor} />
            </IconSlot>
          )
        )}
        {copyable && (
          <IconSlot onPress={handleCopy} style={styles.iconRight}>
            <Icon name="copy" size={DIMENSIONS.iconSize.sm} color={dynamicIconColor} />
          </IconSlot>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Contenedor base
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: DIMENSIONS.inputHeight, // 48
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md, // 12
    paddingHorizontal: SPACING.md, // 16
    backgroundColor: COLORS.backgroundLight,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md, // 14
    paddingVertical: 0, // Eliminar padding vertical por defecto de TextInput
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});
