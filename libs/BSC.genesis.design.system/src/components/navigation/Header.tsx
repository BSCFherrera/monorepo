import { Pressable, Text, View } from 'react-native';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { HeaderProps } from './types';

export function Header({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  onBack,
  backLabel = 'Back',
  actions,
  topInset = 0,
}: HeaderProps) {
  const left = leftComponent ?? (onBack ? (
    <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} style={styles.headerBack}>
      {renderFeatherIcon({ name: 'arrow-left', size: 24, color: '#FFFFFF' }) ?? <Text style={styles.headerBackText}>‹</Text>}
    </Pressable>
  ) : null);

  return (
    <View style={[styles.headerContainer, { paddingTop: topInset, height: 60 + topInset }]}>
      <View style={styles.headerSide}>{left}</View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.headerSide, styles.headerRightSide]}>
        {rightComponent ?? actions}
      </View>
    </View>
  );
}
