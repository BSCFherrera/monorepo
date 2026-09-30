import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS} from '@constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({title, subtitle, rightComponent, leftComponent}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>{leftComponent}</View>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark,
  },
  leftContainer: {
    minWidth: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textLight,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.8,
    marginTop: 2,
  },
});
