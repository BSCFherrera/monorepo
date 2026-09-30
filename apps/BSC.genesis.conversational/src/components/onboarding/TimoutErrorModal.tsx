import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {ModalCommon} from '@components/Common/ModalCommon';
import {Button} from '@components/Button';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface TimoutErrorModalProps {
  visible: boolean;
  onClose: () => void;
  onGoToHome: () => void;
}

export const TimoutErrorModal: React.FC<TimoutErrorModalProps> = ({visible, onClose, onGoToHome}) => {
  const {t} = useTranslation('onboarding');

  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <View style={styles.iconContainer}>
        <Image source={require('@assets/alert-red.png')} style={styles.icon} />
      </View>

      <Text style={styles.title}>{t('timeoutErrorModal.title')}</Text>

      <Text style={styles.subtitle}>{t('timeoutErrorModal.subtitle')}</Text>

      <Button title={t('timeoutErrorModal.goHomeButton')} fullWidth onPress={onGoToHome} />
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
    width: DIMENSIONS.iconSize.xl * 1.6,
    height: DIMENSIONS.iconSize.xl * 1.6,
    resizeMode: 'contain',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
