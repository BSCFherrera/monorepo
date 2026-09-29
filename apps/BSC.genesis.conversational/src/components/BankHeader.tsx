import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {useAuthStore} from '@store/auth.store';
import {getUserInitials} from '@utils/helpers';

interface BankHeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  showMenu?: boolean;
  showProfile?: boolean;
  showNotification?: boolean;
  userInitials?: string;
  hasNotification?: boolean;
}

export const BankHeader: React.FC<BankHeaderProps> = ({
  title = 'Asistente',
  onMenuPress,
  onProfilePress,
  onNotificationPress,
  showMenu = true,
  showProfile = true,
  showNotification = true,
  userInitials,
  hasNotification = true,
}) => {
  const primerNombre = useAuthStore(state => state.user?.primerNombre);
  const primerApellido = useAuthStore(state => state.user?.primerApellido);
  const initials = userInitials ?? getUserInitials(primerNombre, primerApellido);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showMenu ? (
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress} activeOpacity={0.8}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
        <Image
          source={require('@assets/bsc-logo.png')}
          style={styles.brandImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {showNotification ? (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={onNotificationPress}
            activeOpacity={0.85}>
            <Text style={styles.bellIcon}>🔔</Text>
            {hasNotification ? <View style={styles.notificationDot} /> : null}
          </TouchableOpacity>
        ) : null}

        {showProfile ? (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            activeOpacity={0.85}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    width: 108,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  brandImage: {
    width: 28,
    height: 28,
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  menuIcon: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
  },
  title: {
    color: '#152540',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 17,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  profileInitials: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  notificationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF6242',
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
});
