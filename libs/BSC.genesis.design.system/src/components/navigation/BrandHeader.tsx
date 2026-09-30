import { Pressable, Text, View } from 'react-native';
import { tokens } from '../../tokens';
import { renderFeatherIcon } from '../icons';
import { styles } from './styles';
import type { BrandHeaderProps } from './types';

export function BrandHeader({
  brand,
  title = 'Asistente',
  showMenu = true,
  onMenuPress,
  showProfile = true,
  onProfilePress,
  showNotification = true,
  onNotificationPress,
  userInitials = '',
  hasNotification = true,
  topInset = 0,
}: BrandHeaderProps) {
  return (
    <View style={[styles.brandHeaderContainer, { paddingTop: 8 + topInset }]}>
      <View style={styles.brandLeftSection}>
        {showMenu ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Menu" style={styles.brandIconButton} onPress={onMenuPress}>
            {renderFeatherIcon({ name: 'menu', size: 22, color: tokens.colors.primary }) ?? <Text style={styles.brandMenuIcon}>☰</Text>}
          </Pressable>
        ) : (
          <View style={styles.brandIconButton} />
        )}
        {brand && <View style={{ width: 28, height: 28, marginLeft: 4, marginRight: 8 }}>{brand}</View>}
        <Text style={styles.brandTitle}>{title}</Text>
      </View>
      <View style={styles.brandRightSection}>
        {showNotification ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.brandBellButton} onPress={onNotificationPress}>
            {renderFeatherIcon({ name: 'bell', size: 17, color: tokens.colors.text }) ?? <Text style={styles.brandBellIcon}>🔔</Text>}
            {hasNotification && <View style={styles.brandNotificationDot} />}
          </Pressable>
        ) : null}
        {showProfile ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" style={styles.brandProfileButton} onPress={onProfilePress}>
            <Text style={styles.brandProfileInitials}>{userInitials}</Text>
          </Pressable>
        ) : (
          <View style={styles.brandIconButton} />
        )}
      </View>
    </View>
  );
}
