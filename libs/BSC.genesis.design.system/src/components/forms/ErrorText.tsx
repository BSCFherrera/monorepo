import { Text, View } from 'react-native';

import { BscColors } from '@bsc/ui-native';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { ErrorTextProps } from './types';

export function ErrorText({ children, text, color = BscColors.error, iconName = 'info', containerStyle }: ErrorTextProps) {
  const content = children ?? text;
  if (!content) return null;
  return (
    <View accessible accessibilityRole="alert" style={[styles.errorContainer, containerStyle]}>
      {renderFeatherIcon({ name: iconName, size: 12, color })}
      <Text style={[styles.errorText, { color }]}>{content}</Text>
    </View>
  );
}
