import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {
  BORDER_RADIUS,
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ModalRef, RootStackParamList} from '@/types/index';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NotValidatedClientModalProps {
  onClose?: () => void;
  onGoToPortal: () => void;
  onGoToHome?: () => void;
}

export const NotValidatedClientModal = forwardRef<ModalRef, NotValidatedClientModalProps>(
  ({onClose, onGoToPortal, onGoToHome}, ref) => {
    const {t} = useTranslation('general');
    const navigation = useNavigation<RootNavigationProp>();
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

    const handleOnGoToHome = () => {
      handleOnClose();
      navigation.navigate('Login');
      onGoToHome?.();
    };

    return (
      <ModalCommon visible={visible} onClose={handleOnClose}>
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
            onPress={handleOnGoToHome}>
            {t('notValidatedClientModal.goHomeButton')}
          </ButtonPill>
        </View>
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
  buttonsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});
