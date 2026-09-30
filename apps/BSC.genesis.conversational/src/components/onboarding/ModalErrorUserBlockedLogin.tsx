import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface ModalErrorUserBlockedLoginProps {
  visible: boolean;
  onClose: () => void;
}

export const ModalErrorUserBlockedLogin: React.FC<ModalErrorUserBlockedLoginProps> = ({
  visible,
  onClose,
}) => {
  const {t} = useTranslation('auth');
  const contactPhone = t('userBlockedModal.contactPhone');

  return (
    <ModalCommon visible={visible} onClose={onClose}>
      <View style={styles.iconCircle}>
        <Icon name="lock" size={DIMENSIONS.iconSize.lg} color={COLORS.error} />
      </View>

      <Text style={styles.title}>{t('userBlockedModal.title')}</Text>

      <Text style={styles.subtitle}>
        {t('userBlockedModal.message.prefix')} <Text style={styles.bold}>{contactPhone}</Text>{' '}
        {t('userBlockedModal.message.suffix')}
      </Text>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        onPress={onClose}>
        {t('userBlockedModal.confirmButton')}
      </ButtonPill>
    </ModalCommon>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    alignSelf: 'center',
    width: DIMENSIONS.iconSize.xl * 1.6,
    height: DIMENSIONS.iconSize.xl * 1.6,
    borderRadius: (DIMENSIONS.iconSize.xl * 1.6) / 2,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
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
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
});
