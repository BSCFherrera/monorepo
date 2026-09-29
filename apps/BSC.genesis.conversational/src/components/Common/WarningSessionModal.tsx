import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface WarningSessionModalProps {
  visible: boolean;
  /** El usuario elige extender la sesión activa (refresca el token). */
  onConfirm: () => void;
  /** El usuario elige cerrar la sesión de inmediato. */
  onCancel: () => void;
}

/**
 * Aviso previo al cierre de sesión por inactividad (app en primer plano). A diferencia de
 * `SessionExpiredModal`, acá la sesión todavía es válida: el usuario decide si la extiende o la
 * cierra ya mismo, por lo que -igual que ese modal- no puede descartarse tocando fuera de él.
 */
export const WarningSessionModal: React.FC<WarningSessionModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const {t} = useTranslation('auth');

  return (
    <ModalCommon visible={visible} onClose={onCancel} closeOnBackdropPress={false}>
      <View style={styles.iconCircle}>
        <Icon name="alert-triangle" size={DIMENSIONS.iconSize.lg} color={COLORS.accent} />
      </View>

      <Text style={styles.title}>{t('sessionInactivityWarningModal.title')}</Text>

      <Text style={styles.subtitle}>{t('sessionInactivityWarningModal.message')}</Text>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        onPress={onConfirm}>
        {t('sessionInactivityWarningModal.confirmButton')}
      </ButtonPill>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.backgroundLight}
        textColor={COLORS.primary}
        containerStyle={styles.cancelButton}
        onPress={onCancel}>
        {t('sessionInactivityWarningModal.cancelButton')}
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
    backgroundColor: '#FFF3E0',
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
  cancelButton: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});
