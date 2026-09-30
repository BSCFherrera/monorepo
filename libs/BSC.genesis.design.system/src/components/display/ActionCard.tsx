import { Pressable, Text, View } from 'react-native';
import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { ActionCardProps } from './types';

export function ActionCard({
  title,
  subtitle,
  icon,
  iconName,
  variant = 'standard',
  onPress,
  disabled = false,
  actionLabel,
}: ActionCardProps) {
  const isRegistration = variant === 'registration';
  const iconColor = isRegistration ? tokens.colors.secondary : tokens.colors.primaryLight;
  const chevronColor = isRegistration ? tokens.colors.secondary : tokens.colors.primaryLight;
  const bg = isRegistration ? tokens.colors.registrationCard : tokens.colors.cardBg;

  const iconContent =
    icon ?? (iconName ? renderFeatherIcon({ name: iconName, size: 24, color: iconColor }) : null);
  const chevron = renderFeatherIcon({ name: 'chevron-right', size: 24, color: chevronColor });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={actionLabel ?? title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.actionCard,
        { backgroundColor: bg },
        isRegistration ? styles.actionCardRegistration : styles.actionCardStandard,
        pressed && !disabled && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
      ]}
    >
      {iconContent && (
        <View style={styles.actionCardIconCircle}>
          {iconContent}
        </View>
      )}
      <View style={styles.actionCardTextContainer}>
        <Text style={styles.actionCardTitle}>{title}</Text>
        {subtitle && <Text style={styles.actionCardSubtitle}>{subtitle}</Text>}
      </View>
      {chevron ?? <Text style={{ fontSize: 24, color: chevronColor }}>›</Text>}
    </Pressable>
  );
}
