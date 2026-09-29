import React from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

const MAX_SCROLL_HEIGHT = Dimensions.get('window').height * 0.5;

interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onClose,
  title,
  content,
}) => {
  const {t} = useTranslation('onboarding');

  return (
    <ModalCommon visible={visible} onClose={onClose} contentStyle={styles.content}>
      <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeIcon}>
        <Icon name="x" size={DIMENSIONS.iconSize.md} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>{content}</Text>
      </ScrollView>

      <ButtonPill
        onPress={onClose}
        width="100%"
        backgroundColor={COLORS.primary}
        textColor={COLORS.backgroundLight}
        containerStyle={styles.acceptButton}>
        {t('termsAndConditionsModal.acceptButton')}
      </ButtonPill>
    </ModalCommon>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  scroll: {
    maxHeight: MAX_SCROLL_HEIGHT,
  },
  body: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
    textAlign: 'justify',
  },
  acceptButton: {
    marginTop: SPACING.lg,
  },
});
