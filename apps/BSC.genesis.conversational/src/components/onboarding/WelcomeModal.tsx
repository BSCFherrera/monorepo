import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
  BscColors,
  BscIconTile,
  BscModal,
  BscPrimaryButton,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';

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
    <BscModal visible={visible} onClose={onClose} presentation="dialog">
      <View style={styles.iconContainer}>
        <BscIconTile icon="headset" size={64} iconSize={32} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>
        {t('welcomeModal.description.prefix')}
        <Text style={styles.bold}>{t('welcomeModal.description.highlight')}</Text>
        {t('welcomeModal.description.suffix')}
      </Text>

      <BscPrimaryButton
        label={t('welcomeModal.accessButton')}
        onPress={onAccessChat}
        testID="acceder-chat-bienvenida"
      />
    </BscModal>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignSelf: 'center',
    marginBottom: BscSpacing.md,
  },
  title: {
    ...BscTextStyles['Title XS/24 Bold'],
    textAlign: 'center',
    marginBottom: BscSpacing.sm,
  },
  description: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    marginBottom: BscSpacing.lg,
  },
  bold: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
});
