import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {ModalCommon} from '@components/Common/ModalCommon';
import {Button} from '@components/Button';
import {
  BORDER_RADIUS,
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {ModalRef} from '@/types/index';

interface ErrorServiceGeneralProps {
  onClose?: () => void;
}

export const ErrorServiceGeneral = forwardRef<ModalRef, ErrorServiceGeneralProps>(
  ({onClose}, ref) => {
    const {t} = useTranslation('onboarding');
    const [visible, setVisible] = useState(false);
    useImperativeHandle(
      ref,
      () => ({
        open: () => setVisible(true),
        close: () => setVisible(false),
      }),
      [],
    );

    const handleOnClose = () => {
      setVisible(false);
      onClose?.();
    };

    return (
      <ModalCommon visible={visible} onClose={handleOnClose}>
        <View style={styles.iconContainer}>
          <Image source={require('@assets/info-i.png')} style={styles.icon} />
        </View>

        <Text style={styles.title}>{t('errorServiceGeneral.title')}</Text>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{t('errorServiceGeneral.message')}</Text>
        </View>

        <Button title={t('errorServiceGeneral.closeButton')} fullWidth onPress={onClose} />
      </ModalCommon>
    );
  },
);

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
});
