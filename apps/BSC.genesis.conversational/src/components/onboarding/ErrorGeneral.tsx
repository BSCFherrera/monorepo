import React from 'react';
import {Image, Linking, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {ModalCommon} from '@components/Common/ModalCommon';
import {Button} from '@components/Button';
import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface ErrorGeneralProps {
  visible: boolean;
  onClose: () => void;
  onGoToHome: () => void;
}

export const ErrorGeneral: React.FC<ErrorGeneralProps> = ({visible, onClose, onGoToHome}) => {
  const {t} = useTranslation('onboarding');
  const contactPhone = t('errorGeneral.contactPhone');
  const contactWebsiteUrl = t('errorGeneral.contactWebsiteUrl');

  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <View style={styles.iconContainer}>
        <Image source={require('@assets/info-i.png')} style={styles.icon} />
      </View>

      <Text style={styles.title}>{t('errorGeneral.title')}</Text>

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>
          {t('errorGeneral.message.prefix')} <Text style={styles.bold}>{contactPhone}</Text>{' '}
          {t('errorGeneral.message.middle')}{' '}
          <Text style={styles.link} onPress={() => Linking.openURL(contactWebsiteUrl)}>
            {t('errorGeneral.message.linkText')}
          </Text>
          {t('errorGeneral.message.suffix')}
        </Text>
      </View>

      <Button title={t('errorGeneral.goHomeButton')} fullWidth onPress={onGoToHome} />
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
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  link: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
});
