import { Text, View } from 'react-native';
import { BscColors } from '@bsc/ui-native';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { InfoCardProps } from './types';

export function InfoCard({
  title,
  subtitle,
  icon,
  iconName,
  iconBackgroundColor,
  children,
  testID,
  style,
}: InfoCardProps) {
  const iconContent = icon ?? (iconName ? renderFeatherIcon({ name: iconName, size: 24, color: BscColors.primary }) : null);

  return (
    <View testID={testID} style={[styles.infoCard, style]}>
      {iconContent && (
        <View style={[styles.infoCardIconCircle, { backgroundColor: iconBackgroundColor ?? BscColors.surface }]}>
          {iconContent}
        </View>
      )}
      <View style={styles.infoCardTextContainer}>
        <Text style={styles.infoCardTitle}>{title}</Text>
        {subtitle && <Text style={styles.infoCardSubtitle}>{subtitle}</Text>}
        {children}
      </View>
    </View>
  );
}
