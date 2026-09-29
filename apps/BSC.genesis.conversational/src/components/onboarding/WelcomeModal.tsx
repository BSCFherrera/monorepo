import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  onAccessChat: () => void;
  userName?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  visible,
  onClose,
  onAccessChat,
  userName,
}) => {
  const {t} = useTranslation('onboarding');
  const title = userName
    ? t('welcomeModal.title', {name: userName})
    : t('welcomeModal.titleDefault');

  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeIcon}>
        <Icon name="x" size={DIMENSIONS.iconSize.md} color={COLORS.textDisabled} />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <Icon name="message-circle" size={DIMENSIONS.iconSize.lg} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>
        {t('welcomeModal.description.prefix')}
        <Text style={styles.bold}>{t('welcomeModal.description.highlight')}</Text>
        {t('welcomeModal.description.suffix')}
      </Text>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        onPress={onAccessChat}>
        {t('welcomeModal.accessButton')}
      </ButtonPill>
    </ModalCommon>
  );
};

const styles = StyleSheet.create({
  closeIcon: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#EAF0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
});
