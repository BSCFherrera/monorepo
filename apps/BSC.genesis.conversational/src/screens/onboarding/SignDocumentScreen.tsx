import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {RootStackParamList} from '@/types/index';
import {useOnboardingStore} from '@store/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {PdfPreviewCard} from '@components/onboarding/PdfPreviewCard';
import {PdfFullScreenViewer} from '@components/onboarding/PdfFullScreenViewer';
import {SignDocumentOtpModal} from '@components/onboarding/SignDocumentOtpModal';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {ButtonPill} from '@components/Common/ButtonPill';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SignDocumentRouteProp = RouteProp<RootStackParamList, 'SignDocument'>;

export const SignDocumentScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const {params} = useRoute<SignDocumentRouteProp>();
  const {documentUri, cedula} = params;
  // Teléfono verificado en la pantalla de OTP de contacto: es el que se usa para el OTP de firma
  const verifiedPhone = useOnboardingStore(state => state.verifiedPhone);
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('SignDocumentScreen');

  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);

  // Altura fija capturada al montar: esta pantalla no tiene inputs propios, así que no
  // necesita reacomodarse cuando se abre el teclado del OTP dentro del modal. Evita que
  // Android (adjustResize) achique este layout y el contenedor de "Enviar código"/"Salir"
  // se monte sobre el modal mientras el usuario escribe el código.
  const [screenHeight] = useState(() => Dimensions.get('window').height);

  useEffect(() => {
    if (!verifiedPhone && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [verifiedPhone, navigation]);

  const handleExit = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Reporta al backend el paso de registro 'liveness_and_ocr' al iniciar la firma del
  // documento. Es un proceso aislado de la apertura del modal de OTP: su fallo se maneja de
  // forma independiente y no debe impedir que el usuario reciba el código de firma.
  const registerLivenessAndOcrStep = (): Promise<boolean> => {
    return updateRegistrationStep(REGISTRATION_STEPS.LIVENESS_AND_OCR);
  };

  const handleSendCode = async () => {
    const stepRegistered = await registerLivenessAndOcrStep();
    if (!stepRegistered) {
      return;
    }

    setIsOtpModalVisible(true);
  };

  if (!verifiedPhone) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, {height: screenHeight}]}
      edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <View style={styles.content}>
        <Text style={styles.title}>{t('signDocument.title')}</Text>

        <PdfPreviewCard uri={documentUri} onPress={() => setIsViewerVisible(true)} />

        <Text style={styles.subtitle}>{t('signDocument.subtitle')}</Text>
      </View>

      <View style={styles.bottomButtons}>
        <ButtonPill
          onPress={handleSendCode}
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}>
          {t('signDocument.sendCodeButton')}
        </ButtonPill>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>{t('signDocument.exitButton')}</Text>
        </TouchableOpacity>
      </View>

      <SignDocumentOtpModal
        visible={isOtpModalVisible}
        phone={verifiedPhone}
        cedula={cedula}
        onClose={() => setIsOtpModalVisible(false)}
      />

      <PdfFullScreenViewer
        visible={isViewerVisible}
        uri={documentUri}
        onClose={() => setIsViewerVisible(false)}
      />

      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SPACING.xl,
  },
  bottomButtons: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  exitButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  exitButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: SPACING.sm,
  },
});
