import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

import {ModalCommon} from '@components/Common/ModalCommon';
import {Button} from '@components/Button';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ModalRef, RootStackParamList} from '@/types/index';

interface TimeoutErrorModalProps {
  onClose?: () => void;
  onGoToHome?: () => void;
}

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TimeoutErrorModal = forwardRef<ModalRef, TimeoutErrorModalProps>(
  ({onClose, onGoToHome}, ref) => {
    const {t} = useTranslation('general');
    const navigation = useNavigation<RootNavigationProp>();
    const [openTimeoutErrorModal, setOpenTimeoutErrorModal] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpenTimeoutErrorModal(true),
        close: () => setOpenTimeoutErrorModal(false),
      }),
      [],
    );

    const handleOnClose = () => {
      setOpenTimeoutErrorModal(false);
      onClose?.();
    };

    const handleGoToHome = () => {
      navigation.navigate('Login');
      onGoToHome?.();
    };

    return (
      <ModalCommon visible={openTimeoutErrorModal} onClose={handleOnClose}>
        <View style={styles.iconContainer}>
          <Image source={require('@assets/alert-red.png')} style={styles.icon} />
        </View>

        <Text style={styles.title}>{t('timeoutErrorModal.title')}</Text>

        <Text style={styles.subtitle}>{t('timeoutErrorModal.subtitle')}</Text>

        <Button title={t('timeoutErrorModal.goHomeButton')} fullWidth onPress={handleGoToHome} />
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
