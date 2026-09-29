import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, SHADOWS, SPACING} from '@constants/theme';
import React, {useState, useMemo, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  DimensionValue,
  Animated,
  Easing,
  ViewInstance,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';

// --- Tipos ---
export type SelectOption = {
  label: string;
  value: string | number;
};

interface SelectProps {
  /** Arreglo de opciones. Puede ser un arreglo de strings o de objetos {label, value} */
  data: (string | SelectOption)[];
  /** Valor actualmente seleccionado (vacio si no hay seleccion) */
  value?: string | number | null;
  /** Función que se ejecuta al seleccionar una opción */
  onSelect: (value: string | number) => void;
  /** Texto a mostrar cuando no hay nada seleccionado */
  placeholder?: string;
  /** Alineación del texto. Por defecto: 'left' */
  align?: 'left' | 'center' | 'right';
  /** Si es true, el selector no se puede abrir pero mantiene su estilo normal */
  readOnly?: boolean;
  /** Si es true, el selector se ve gris y no se puede usar */
  disabled?: boolean;
  /** Si es true, el borde se vuelve rojo */
  error?: boolean;
  /** Ancho del componente (ej. '100%', 200) */
  width?: DimensionValue;
  /** Estilos adicionales para el contenedor principal */
  containerStyle?: StyleProp<ViewStyle>;
}

export const Select: React.FC<SelectProps> = ({
  data,
  value,
  onSelect,
  placeholder = 'Seleccione una opción...',
  align = 'left',
  readOnly = false,
  disabled = false,
  error = false,
  width = '100%',
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0, width: 0});
  const selectorRef = useRef<ViewInstance>(null);

  // Animación para el dropdown
  const animatedScale = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Normalizamos la data para que internamente siempre trabajemos con un arreglo de objetos
  const normalizedData: SelectOption[] = useMemo(() => {
    return data.map(item => (typeof item === 'string' ? {label: item, value: item} : item));
  }, [data]);

  // Buscamos el label del valor actual para mostrarlo
  const selectedOption = normalizedData.find(opt => opt.value === value);

  // Animación de apertura
  const animateOpen = () => {
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animación de cierre
  const animateClose = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(animatedScale, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 100,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  // Maneja la apertura/cierre del dropdown
  const toggleDropdown = () => {
    if (disabled || readOnly) {
      return;
    }

    if (isOpen) {
      animateClose(() => setIsOpen(false));
    } else {
      selectorRef.current?.measureInWindow((x, y, measuredWidth, height) => {
        setDropdownPosition({
          top: y + height + 4,
          left: x,
          width: measuredWidth,
        });
        setIsOpen(true);
        // Reset animación y luego abrir
        animatedScale.setValue(0);
        animatedOpacity.setValue(0);
        setTimeout(animateOpen, 10);
      });
    }
  };

  const handleSelect = (item: SelectOption) => {
    onSelect(item.value);
    setIsOpen(false);
  };

  // --- Estilos Dinámicos ---
  const dynamicContainerStyle: ViewStyle = {
    borderColor: error ? COLORS.error : COLORS.border,
    backgroundColor: disabled ? COLORS.backgroundDark : COLORS.backgroundLight,
  };

  const dynamicTextStyle = {
    textAlign: align,
    color: selectedOption
      ? disabled
        ? COLORS.textDisabled
        : COLORS.textPrimary
      : COLORS.textSecondary, // Gris más oscuro para el placeholder
  };

  return (
    <View style={[styles.wrapper, {width}, containerStyle]}>
      <TouchableOpacity
        ref={selectorRef}
        activeOpacity={0.7}
        onPress={toggleDropdown}
        style={[styles.selector, dynamicContainerStyle]}>
        <Text style={[styles.text, dynamicTextStyle]} numberOfLines={1}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Icon
          name="chevron-down"
          size={DIMENSIONS.iconSize.sm}
          color={disabled ? COLORS.textDisabled : COLORS.textPrimary}
        />
      </TouchableOpacity>

      {/* Modal con dropdown superpuesto */}
      <Modal visible={isOpen} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => animateClose(() => setIsOpen(false))}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.dropdownContainer,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  opacity: animatedOpacity,
                  transform: [
                    {
                      scaleY: animatedScale,
                    },
                  ],
                },
              ]}>
              <FlatList
                data={normalizedData}
                keyExtractor={item => String(item.value)}
                bounces={false}
                style={styles.list}
                renderItem={({item}) => {
                  const isSelected = item.value === value;
                  return (
                    <TouchableOpacity
                      style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                      onPress={() => {
                        handleSelect(item);
                      }}>
                      <Text
                        style={[
                          styles.optionText,
                          {textAlign: align},
                          isSelected && styles.optionTextSelected,
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Contenedor base
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: DIMENSIONS.inputHeight, // 48
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md, // 12
    paddingHorizontal: SPACING.md, // 16
    backgroundColor: COLORS.backgroundLight,
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.md, // 14
    marginRight: SPACING.sm, // Espacio entre texto y flecha
  },
  modalOverlay: {
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: COLORS.backgroundLight, // #FFFFFF
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm, // 8
    ...SHADOWS.small, // Usa tu sombra para darle profundidad sobre los demás elementos
    overflow: 'hidden',
  },
  list: {
    flexGrow: 0,
  },
  optionItem: {
    paddingVertical: SPACING.md, // 16
    paddingHorizontal: SPACING.md, // 16
    backgroundColor: COLORS.backgroundLight,
  },
  optionItemSelected: {
    backgroundColor: COLORS.backgroundDark, // #E8EBF0 (sombrea la opción seleccionada)
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    // Sin cambios de estilo, solo el fondo cambia
  },
});
