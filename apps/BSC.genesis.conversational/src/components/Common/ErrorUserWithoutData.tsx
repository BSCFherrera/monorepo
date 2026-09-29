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

interface ErrorUserWithoutDataProps {
  onClose?: () => void;
  onGoToHome?: () => void;
}

export const ErrorUserWithoutData = forwardRef<ModalRef, ErrorUserWithoutDataProps>(
  ({onClose, onGoToHome}, ref) => {
    const navigation = useNavigation<RootNavigationProp>();
    const {t} = useTranslation('general');
    const contactPhone = t('errorUserWithoutData.contactPhone');
    const contactWebsiteUrl = t('errorUserWithoutData.contactWebsiteUrl');
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
      navigation.navigate('Login');
      onGoToHome?.();
    };

    return (
      <ModalCommon visible={visible} onClose={handleOnClose}>
        <View style={styles.iconContainer}>
          <Image source={require('@assets/info-i.png')} style={styles.icon} />
        </View>

        <Text style={styles.title}>{t('errorUserWithoutData.title')}</Text>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {t('errorUserWithoutData.message.prefix')}{' '}
            <Text style={styles.bold}>{contactPhone}</Text>{' '}
            {t('errorUserWithoutData.message.middle')}{' '}
            <Text style={styles.link} onPress={() => Linking.openURL(contactWebsiteUrl)}>
              {t('errorUserWithoutData.message.linkText')}
            </Text>
            {t('errorUserWithoutData.message.suffix')}
          </Text>
        </View>

        <Button
          title={t('errorUserWithoutData.goHomeButton')}
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
