import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscIcon } from './BscIcon';
import type { NavigationHeaderProps } from '@bsc/contracts';

export interface BscNavigationHeaderProps extends NavigationHeaderProps {}

/**
 * Header compacto para flujos de navegación sobre superficie clara.
 *
 * Es distinto de `BscScreenHeader`: no usa degradado ni portada; sirve para
 * pantallas o subflujos que necesitan volver, rotular el paso actual y exponer
 * acciones de soporte/cierre sin estar dentro de un modal.
 */
export function BscNavigationHeader({
  title,
  onBack,
  showSupportButton = false,
  onSupportPress,
  onClose,
  testID,
}: BscNavigationHeaderProps): React.JSX.Element {
  return (
    <View style={styles.header} testID={testID}>
      <View style={styles.titleLayer} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.leftActions}>
        {onBack !== undefined ? (
          <HeaderIconButton
            accessibilityLabel="Volver"
            icon="chevron-left"
            onPress={onBack}
            testID={testID === undefined ? undefined : `${testID}-back`}
          />
        ) : null}
      </View>

      <View style={styles.rightActions}>
        {showSupportButton ? (
          <HeaderIconButton
            accessibilityLabel="Soporte"
            icon="headset"
            onPress={onSupportPress}
            testID={testID === undefined ? undefined : `${testID}-support`}
          />
        ) : null}
        {onClose !== undefined ? (
          <HeaderIconButton
            accessibilityLabel="Cerrar"
            icon="close"
            onPress={onClose}
            testID={testID === undefined ? undefined : `${testID}-close`}
          />
        ) : null}
      </View>
    </View>
  );
}

interface HeaderIconButtonProps {
  accessibilityLabel: string;
  icon: 'chevron-left' | 'headset' | 'close';
  onPress?: (() => void) | undefined;
  testID?: string | undefined;
}

function HeaderIconButton({
  accessibilityLabel,
  icon,
  onPress,
  testID,
}: HeaderIconButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={BscSpacing.xs}
      onPress={onPress}
      style={styles.iconButton}
      testID={testID}
    >
      <BscIcon name={icon} size={20} color={BscColors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: BscSpacing.md,
    backgroundColor: BscColors.surface,
  },
  titleLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BscSpacing.xxl * 3,
  },
  title: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
    textAlign: 'center',
  },
  leftActions: {
    position: 'absolute',
    left: BscSpacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: BscSpacing.md,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  iconButton: {
    width: BscSpacing.xxl,
    height: BscSpacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BscColors.border,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.surface,
  },
});
