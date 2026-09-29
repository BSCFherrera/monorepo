import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {ModalRef} from '@/types/index';

interface SuccessModalProps {
  /** Se dispara al cerrar el modal, sea por el botón o tocando fuera de él */
  onContinue?: () => void;
  /** Nombre utilizado para la internacionalización*/
  nameTranslation?: string;
}

/**
 * Modal de confirmación de que se realizo el proceso correctamente
 */
export const SuccessModal = forwardRef<ModalRef, SuccessModalProps>(
  ({onContinue, nameTranslation = 'onboarding'}, ref) => {
    const {t} = useTranslation(nameTranslation);
    const [visible, setVisible] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        open: () => setVisible(true),
        close: () => setVisible(false),
      }),
      [],
    );

    const handleContinue = () => {
      setVisible(false);
      onContinue?.();
    };

    return (
      <ModalCommon visible={visible} onClose={handleContinue}>
        <View style={styles.iconCircle}>
          <Icon name="check-circle" size={DIMENSIONS.iconSize.xl} color={COLORS.secondary} />
        </View>

        <Text style={styles.title}>{t('modals.successTitle')}</Text>
        <Text style={styles.subtitle}>{t('modals.successMessage')}</Text>

        <ButtonPill
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}
          onPress={handleContinue}>
          {t('modals.successContinueButton')}
        </ButtonPill>
      </ModalCommon>
    );
  },
);

const styles = StyleSheet.create({
  iconCircle: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
});
