import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '@constants/theme';
import { useTranslation } from 'react-i18next';
import { TouchableCard } from '@components/Common';
import { RecoveryType } from '@/types/index';
import { APP_CONFIG } from '@constants/config';
import { BscColors, BscModal, BscModalHandle, BscSpacing, BscTextStyles } from '@bsc/design-system';

interface AccessRecoveryOptionsModalProps {
  handleTypeRecoveryPress: (type: RecoveryType) => void;
}

export const AccessRecoveryOptionsModal = forwardRef<
  BscModalHandle,
  AccessRecoveryOptionsModalProps
>((props, ref) => {
  const { handleTypeRecoveryPress } = props;
  const { t } = useTranslation('accessRecovery');

  return (
    <>
      <BscModal ref={ref} presentation="expanded" scrollable>
        <Text style={styles.title}>{t('recoveryOptions.title')}</Text>
        <Text style={styles.subtitle}>{t('recoveryOptions.description')}</Text>

        <TouchableCard
          title={t('recoveryOptions.userRecoverySubtitle')}
          subtitle={t('recoveryOptions.userRecoveryLabel')}
          iconName="user-plus"
          onPress={() => handleTypeRecoveryPress('USERNAME')}
        />

        <TouchableCard
          title={t('recoveryOptions.passwordRecoverySubtitle')}
          subtitle={t('recoveryOptions.passwordRecoveryLabel')}
          iconName="refresh-ccw"
          onPress={() => handleTypeRecoveryPress('PASSWORD')}
        />

        {APP_CONFIG.BOTH_RECOVERY && (
          <TouchableCard
            title={t('recoveryOptions.bothRecoverySubtitle')}
            subtitle={t('recoveryOptions.bothRecoveryLabel')}
            iconName="help-circle"
            onPress={() => handleTypeRecoveryPress('BOTH')}
          />
        )}
      </BscModal>
    </>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: BscSpacing.md + BscSpacing.sm,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'justify',
    marginBottom: BscSpacing.md,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    marginBottom: BscSpacing.xl,
  },
  label: {
    ...BscTextStyles['Caption/12 Regular'],
    marginBottom: BscSpacing.xs,
    paddingLeft: 10,
  },
});
