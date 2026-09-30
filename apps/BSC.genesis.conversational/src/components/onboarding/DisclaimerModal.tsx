import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {ModalCommon} from '@components/Common/ModalCommon';
import {
  BORDER_RADIUS,
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {ButtonPill} from '@components/Common/ButtonPill';
import Icon from '@react-native-vector-icons/feather';

interface DisclaimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const REQUIREMENTS = [
  {key: 'cedula', icon: 'credit-card'},
  {key: 'internet', icon: 'wifi'},
  {key: 'document', icon: 'smartphone'},
  {key: 'biometric', icon: 'maximize'},
] as const;

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({visible, onClose}) => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation();
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.back}>
        <Icon name="arrow-left" size={DIMENSIONS.iconSize.md} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <View style={styles.logoGroup}>
        <Image source={require('@assets/bsc-logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>{t('disclaimerModal.title')}</Text>
      <Text style={styles.subtitle}>{t('disclaimerModal.subtitle')}</Text>

      <View style={styles.listContainer}>
        {REQUIREMENTS.map(requirement => (
          <View key={requirement.key} style={styles.pillContainer}>
            <View style={styles.iconCircle}>
              <Icon
                name={requirement.icon as any}
                size={DIMENSIONS.iconSize.md}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.labelText} numberOfLines={1}>
              {t(`disclaimerModal.requirements.${requirement.key}`)}
            </Text>
          </View>
        ))}
      </View>

      <ButtonPill width={'100%'} backgroundColor={COLORS.primary} onPress={onClose}>
        {t('disclaimerModal.continueButton')}
      </ButtonPill>
      <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
        <Text style={styles.backText}> {t('disclaimerModal.exitButton')}</Text>
      </TouchableOpacity>
    </ModalCommon>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  logoGroup: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: SPACING.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  backText: {
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  // Pill component
  listContainer: {
    width: '100%',
    paddingVertical: SPACING.md,
    gap: 12,
  },
  pillContainer: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F6FBFF',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderStyle: 'solid',
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  labelText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'left',
  },
});
