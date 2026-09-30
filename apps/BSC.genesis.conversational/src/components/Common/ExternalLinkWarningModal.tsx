import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

interface ExternalLinkWarningModalProps {
  visible: boolean;
  /** URL exacta a la que se navegará si el usuario confirma. */
  url: string;
  /** El usuario confirma que quiere salir de la app y abrir el sitio web. */
  onConfirm: () => void;
  /** El usuario cancela y permanece en la app. */
  onCancel: () => void;
}

/**
 * Aviso previo a abrir un enlace externo (sitio web) detectado dentro de un mensaje del chat.
 */
export const ExternalLinkWarningModal: React.FC<ExternalLinkWarningModalProps> = ({
  visible,
  url,
  onConfirm,
  onCancel,
}) => {
  const {t} = useTranslation('chat');

  return (
    <ModalCommon visible={visible} onClose={onCancel} closeOnBackdropPress={false}>
      <View style={styles.iconCircle}>
        <Icon name="alert-triangle" size={DIMENSIONS.iconSize.lg} color={COLORS.accent} />
      </View>

      <Text style={styles.title}>{t('externalLinkModal.title')}</Text>

      <Text style={styles.subtitle}>{t('externalLinkModal.message')}</Text>

      <Text style={styles.url} numberOfLines={2}>
        {url}
      </Text>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        onPress={onConfirm}>
        {t('externalLinkModal.confirmButton')}
      </ButtonPill>

      <ButtonPill
        width="100%"
        backgroundColor={COLORS.backgroundLight}
        textColor={COLORS.primary}
        containerStyle={styles.cancelButton}
        onPress={onCancel}>
        {t('externalLinkModal.cancelButton')}
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
  url: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
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
