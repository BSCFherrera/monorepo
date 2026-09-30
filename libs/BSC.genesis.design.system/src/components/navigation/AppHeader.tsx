import { Pressable, Text, View } from 'react-native';
import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { AppHeaderProps } from './types';

export function AppHeader({
  brand,
  logo,
  showBackButton = false,
  onBackPress,
  showBottomLine = false,
  actions,
  avatar,
}: AppHeaderProps) {
  return (
    <View style={styles.appHeaderWrapper}>
      <View style={styles.appHeaderContent}>
        <View style={styles.appHeaderSide}>
          {showBackButton && onBackPress && (
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBackPress} style={styles.appHeaderBack}>
              {renderFeatherIcon({ name: 'arrow-left', size: 24, color: tokens.colors.text }) ?? <Text>‹</Text>}
            </Pressable>
          )}
        </View>
        <View style={styles.appHeaderCenter}>
          <View style={{ width: 120, height: 60 }}>{brand ?? logo}</View>
        </View>
        <View style={styles.appHeaderSide}>
          {avatar ?? actions}
        </View>
      </View>
      {showBottomLine && <View style={styles.appHeaderLine} />}
    </View>
  );
}
