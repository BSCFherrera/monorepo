import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {ModalCommon} from '@components/Common/ModalCommon';
import {ButtonPill} from '@components/Common/ButtonPill';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {
  BORDER_RADIUS,
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {ClientInformationResponse, RootStackParamList} from '@/types/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import Icon from '@react-native-vector-icons/feather';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ClientVerifiedModalProps {
  visible: boolean;
  onClose: () => void;
  clientInfo: ClientInformationResponse | null;
  // Registra la aceptación de T&C al confirmar los datos. Fire-and-forget: su fallo NO frena el flujo.
  onAcceptTerms?: () => void;
}

export const ClientVerifiedModal: React.FC<ClientVerifiedModalProps> = ({
  visible,
  onClose,
  clientInfo,
  onAcceptTerms,
}) => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const fullName = clientInfo?.nombreCompleto ?? '';

  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('ClientVerifiedModal');

  // Reporta al backend el paso de registro 'contact_data' antes de avanzar a la confirmación
  // de datos de contacto. Es un proceso aislado del cierre/navegación del modal.
  const registerContactDataStep = (): Promise<boolean> => {
    return updateRegistrationStep(REGISTRATION_STEPS.CONTACT_DATA);
  };

  const handleContinue = async () => {
    if (!clientInfo) {
      return;
    }

    // Aceptación de T&C: se dispara sin await para no bloquear el avance aunque el endpoint falle.
    onAcceptTerms?.();

    const stepRegistered = await registerContactDataStep();
    if (!stepRegistered) {
      return;
    }

    onClose();
    navigation.navigate('CustomerDataConfirmOtp');
  };

  return (
    <>
      <ModalCommon visible={visible} onClose={onClose}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.back}>
          <Icon name="arrow-left" size={DIMENSIONS.iconSize.md} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoGroup}>
          <Image source={require('@assets/bsc-logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>{t('clientVerifiedModal.title')}</Text>
        <Text style={styles.subtitle}>{t('clientVerifiedModal.subtitle')}</Text>

        <View style={styles.messageBox}>
          <Text style={styles.label}>{t('clientVerifiedModal.nameLabel')}</Text>
          <Text style={styles.fullName}>{fullName}</Text>
        </View>

        <ButtonPill
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}
          onPress={handleContinue}>
          {t('clientVerifiedModal.continueButton')}
        </ButtonPill>

        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.noSoyYoText}>{t('clientVerifiedModal.notMeButton')}</Text>
        </TouchableOpacity>
      </ModalCommon>

      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
    </>
  );
};

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  logoGroup: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  messageBox: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  fullName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  noSoyYoText: {
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
});
