import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscIcon, type BscIconName } from './BscIcon';

export interface BscErrorTextProps {
  children?: React.ReactNode;
  text?: React.ReactNode;
  color?: string;
  iconName?: BscIconName;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BscErrorText({
  children,
  text,
  color = BscColors.error,
  iconName = 'error',
  containerStyle,
  testID,
}: BscErrorTextProps): React.JSX.Element | null {
  const content = text ?? children;
  if (content === undefined || content === null || content === '') return null;

  return (
    <View accessibilityRole="alert" style={[styles.container, containerStyle]} testID={testID}>
      <BscIcon name={iconName} size={16} color={color} />
      <Text style={[styles.text, { color }]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  text: {
    ...BscTextStyles['Caption/12 Medium'],
    flex: 1,
  },
});
