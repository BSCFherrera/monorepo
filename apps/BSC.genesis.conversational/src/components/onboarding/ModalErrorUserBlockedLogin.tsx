import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
  BscColors,
  BscIcon,
  BscModal,
  BscPrimaryButton,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';

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
    <BscModal visible={visible} onClose={onClose} presentation="dialog">
      <View style={styles.iconCircle}>
        <BscIcon name="lock" size={32} color={BscColors.error} />
      </View>

      <Text style={styles.title}>{t('userBlockedModal.title')}</Text>

      <Text style={styles.subtitle}>
        {t('userBlockedModal.message.prefix')} <Text style={styles.bold}>{contactPhone}</Text>{' '}
        {t('userBlockedModal.message.suffix')}
      </Text>

      <BscPrimaryButton
        label={t('userBlockedModal.confirmButton')}
        onPress={onClose}
        testID="confirmar-usuario-bloqueado"
      />
    </BscModal>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BscColors.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Title XS/24 Bold'],
    textAlign: 'center',
    marginBottom: BscSpacing.lg,
    paddingHorizontal: BscSpacing.xl,
  },
  subtitle: {
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
