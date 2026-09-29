import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface SessionExpiredModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Aviso de cierre de sesión automático por inactividad. A diferencia de los demás modales
 * comunes, no puede cerrarse tocando fuera de él: la única salida es el botón inferior, para
 * asegurar que el usuario reconoce que su sesión anterior ya no es válida.
 */
export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({visible, onClose}) => {
  const {t} = useTranslation('auth');

  return (
    <ModalCommon visible={visible} onClose={onClose} closeOnBackdropPress={false}>
      <View style={styles.iconCircle}>
        <Icon name="clock" size={DIMENSIONS.iconSize.lg} color={COLORS.accent} />
      </View>

      <Text style={styles.title}>{t('sessionExpiredModal.title')}</Text>

      <Text style={styles.subtitle}>{t('sessionExpiredModal.message')}</Text>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        onPress={onClose}>
        {t('sessionExpiredModal.closeButton')}
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
});
