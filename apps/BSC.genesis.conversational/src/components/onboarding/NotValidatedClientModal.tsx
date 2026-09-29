import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface NotValidatedClientModalProps {
  visible: boolean;
  onClose: () => void;
  onGoToPortal: () => void;
  onGoToHome: () => void;
}

export const NotValidatedClientModal: React.FC<NotValidatedClientModalProps> = ({
  visible,
  onClose,
  onGoToPortal,
  onGoToHome,
}) => {
  const {t} = useTranslation('onboarding');

  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <View style={styles.iconContainer}>
        <Image source={require('@assets/info-i.png')} style={styles.icon} />
      </View>

      <Text style={styles.title}>{t('notValidatedClientModal.title')}</Text>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{t('notValidatedClientModal.message')}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <ButtonPill
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}
          onPress={onGoToPortal}>
          {t('notValidatedClientModal.goToPortalButton')}
        </ButtonPill>
        <ButtonPill
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}
          onPress={onGoToHome}>
          {t('notValidatedClientModal.goHomeButton')}
        </ButtonPill>
      </View>
    </ModalCommon>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  icon: {
    width: DIMENSIONS.iconSize.xl,
    height: DIMENSIONS.iconSize.xl,
    resizeMode: 'contain',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  messageBox: {
    backgroundColor: '#F6FBFF',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});
