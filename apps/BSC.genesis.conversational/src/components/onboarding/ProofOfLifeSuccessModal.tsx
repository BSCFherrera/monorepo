import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface ProofOfLifeSuccessModalProps {
  visible: boolean;
  /** Se dispara al cerrar el modal, sea por el botón o tocando fuera de él */
  onContinue: () => void;
}

/**
 * Confirmación de que la prueba de vida (cédula + rostro) de Autentikar se completó con éxito.
 * Genérico a propósito -sin lógica de navegación propia- para poder reutilizarse en cualquier
 * flujo que use `useAutentikarVerification`; quien lo use decide a dónde ir en `onContinue`.
 */
export const ProofOfLifeSuccessModal: React.FC<ProofOfLifeSuccessModalProps> = ({
  visible,
  onContinue,
}) => {
  const {t} = useTranslation('onboarding');

  return (
    <ModalCommon visible={visible} onClose={onContinue}>
      <View style={styles.iconCircle}>
        <Icon name="check-circle" size={DIMENSIONS.iconSize.xl} color={COLORS.secondary} />
      </View>

      <Text style={styles.title}>{t('proofOfLife.successTitle')}</Text>
      <Text style={styles.subtitle}>{t('proofOfLife.successMessage')}</Text>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        onPress={onContinue}>
        {t('proofOfLife.successContinueButton')}
      </ButtonPill>
    </ModalCommon>
  );
};

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
