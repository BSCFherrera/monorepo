import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {Image, Linking, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';

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
import {ModalRef, RootStackParamList} from '@/types/index';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
interface MaximumIntentsModalProps {
  onClose?: () => void;
  onGoToHome?: () => void;
}

export const MaximumIntentsModal = forwardRef<ModalRef, MaximumIntentsModalProps>(
  ({onClose, onGoToHome}, ref) => {
    const {t} = useTranslation('general');
    const navigation = useNavigation<RootNavigationProp>();
    const contactPhone = t('maximumIntentsModal.contactPhone');
    const contactWebsiteUrl = t('maximumIntentsModal.contactWebsiteUrl');
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
      setVisible(false);
      if (onGoToHome) {
        onGoToHome();
        return;
      }

      navigation.navigate('Login');
    };

    return (
      <ModalCommon visible={visible} onClose={handleOnClose}>
        <View style={styles.iconContainer}>
          <Image source={require('@assets/info-i.png')} style={styles.icon} />
        </View>

        <Text style={styles.title}>{t('maximumIntentsModal.title')}</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{t('maximumIntentsModal.warningMessage')}</Text>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {t('maximumIntentsModal.message.prefix')}{' '}
            <Text style={styles.bold}>{contactPhone}</Text>{' '}
            {t('maximumIntentsModal.message.middle')}{' '}
            <Text style={styles.link} onPress={() => Linking.openURL(contactWebsiteUrl)}>
              {t('maximumIntentsModal.message.linkText')}
            </Text>
            {t('maximumIntentsModal.message.suffix')}
          </Text>
        </View>

        <Button
          title={t('maximumIntentsModal.goHomeButton')}
          fullWidth
          onPress={handleOnGoToHome}
        />
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
  warningBox: {
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#f8caca',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  warningText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
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
