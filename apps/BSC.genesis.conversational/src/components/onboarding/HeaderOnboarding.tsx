import React from 'react';
import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import {COLORS, DIMENSIONS, SPACING} from '@constants/theme';

import Icon from '@react-native-vector-icons/feather';

interface HeaderOnboardingProps {
  /** Muestra u oculta el botón de regresar. Por defecto: false */
  showBackButton?: boolean;
  /** Función que se ejecuta al presionar el botón de regresar */
  onBackPress?: () => void;
  /** Muestra una línea divisoria fina en la parte inferior. Por defecto: false */
  showBottomLine?: boolean;
}

export const HeaderOnboarding: React.FC<HeaderOnboardingProps> = ({
  showBackButton = false,
  onBackPress,
  showBottomLine = false,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* Contenedor de la Fila (Botón, Logo, Espacio vacío) */}
      <View style={styles.headerContent}>
        <View style={styles.sideColumn}>
          {showBackButton && onBackPress && (
            <TouchableOpacity onPress={onBackPress} activeOpacity={0.7} style={styles.back}>
              <Icon name="arrow-left" size={DIMENSIONS.iconSize.md} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerColumn}>
          <Image
            source={require('@assets/bsc-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.sideColumn} />
      </View>

      {/* Línea inferior en el flujo normal (90% width) */}
      {showBottomLine && <View style={styles.bottomLine} />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.backgroundLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    // Quitamos la altura fija (DIMENSIONS.headerHeight era de 60)
    // y usamos un padding vertical para que el contenedor crezca con el logo de 80px
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  sideColumn: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerColumn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  },
  bottomLine: {
    width: '90%',
    height: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
});
