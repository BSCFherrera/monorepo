import React, { useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderOnboarding } from '@components/onboarding/HeaderOnboarding';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@constants/theme';
import { Steps } from '@components/Common/Steps';
import { SelectPill } from '@components/Common/SelectPill';
import { DOCUMENT_CATEGORY } from '@constants/documentCategory';
import { TextField } from '@components/Common/TextField';
import { ErrorText } from '@components/Common/ErrorText';
import { ButtonPill } from '@components/Common/ButtonPill';
import { AccessRecoveryApiError, AccessRecoveryService } from '@services/index';
import {
  AccessRecoveryErrorCode,
  ClientInformationResponse,
  ModalRef,
  RootStackParamList,
} from '@/types/index';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { useLoader } from '@components/Common/Loader';
import {
  ErrorUserWithoutData,
  NotValidatedClientModal,
  TimeoutErrorModal,
  ClientVerifiedModal,
  ErrorGeneral,
  MaximumIntentsModal,
} from '@components/Common';
import { formatDocumentNumber, sanitizeDocumentNumber } from '@utils/helpers';
import { AccessOrigin, useOnboardingStore } from '@store/onboarding.store';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AccountIdentificationScreen = () => {
  const { t } = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const { showLoader, hideLoader } = useLoader();
  const setVerifiedClient = useAccesRecoveryStore(state => state.setVerifiedClient);
  const setAccessOrigin = useOnboardingStore(state => state.setAccessOrigin);
  const setDocumentCategoryInStore = useAccesRecoveryStore(state => state.setDocumentCategory);
  const setUserEmail = useAccesRecoveryStore(state => state.setUserEmail);
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);

  // States
  const [documentCategory, setDocumentCategory] = useState<string>(DOCUMENT_CATEGORY.CEDULA);
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentNumberError, setDocumentNumberError] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInformationResponse | null>(null);

  // refs
  const timeoutRef = useRef<ModalRef>(null);
  const clientVerifiedRef = useRef<ModalRef>(null);
  const errorUserWithoutDataRef = useRef<ModalRef>(null);
  const notValidatedClientRef = useRef<ModalRef>(null);
  const maximumIntentsModalRef = useRef<ModalRef>(null);
  const errorGeneralRef = useRef<ModalRef>(null);

  const openModalAfterFrame = (openModal: () => void) => {
    requestAnimationFrame(openModal);
  };

  // Abre el modal específico del código de error recibido. Devuelve `true` cuando el
  // código fue reconocido, para que el caller sepa que no debe mostrar el error genérico.
  const openErrorModal = (code: AccessRecoveryErrorCode): boolean => {
    switch (code) {
      case 'CLIENT_NOT_VALIDATED':
        notValidatedClientRef.current?.open();
        return true;

      case 'TIMEOUT':
        timeoutRef.current?.open();
        return true;

      case 'MAX_ATTEMPTS_EXCEEDED':
        maximumIntentsModalRef.current?.open();
        return true;

      case 'CLIENT_WITHOUT_DATA':
        errorUserWithoutDataRef.current?.open();
        return true;

      default:
        return false;
    }
  };

  const handleGoToPortal = () => {
    notValidatedClientRef.current?.close();
    Linking.openURL(t('notValidatedClientModal.portalUrl'));
  };

  // Verifica el documento y muestra el modal correspondiente al código de error de negocio.
  const verifyClient = async (): Promise<ClientInformationResponse | null> => {
    try {
      const response = await AccessRecoveryService.verifyClientDocument(
        sanitizeDocumentNumber(documentCategory, documentNumber),
        documentCategory,
      );

      setClientInfo(response);
      setVerifiedClient(response);
      setDocumentCategoryInStore(documentCategory);
      return response;
    } catch (error) {
      console.log('[AccountIdentificationScreen] verifyClientDocument error', error);
      throw error;
    }
  };

  const handleDocumentNumberChange = (text: string) => {
    setDocumentNumberError('');
    setDocumentNumber(formatDocumentNumber(text, documentCategory));
  };

  const validateDocumentNumber = (): string => {
    const sanitized = sanitizeDocumentNumber(documentCategory, documentNumber);

    if (!sanitized) {
      return t('accountIdentification.errors.documentRequired');
    }

    switch (documentCategory) {
      case DOCUMENT_CATEGORY.CEDULA:
        if (sanitized.length !== 11) {
          return t('accountIdentification.errors.cedulaLength');
        }

        break;

      case DOCUMENT_CATEGORY.PASSPORT:
        if (sanitized.length < 6 || sanitized.length > 12) {
          return t('accountIdentification.errors.passportLength');
        }

        break;
    }

    return '';
  };

  const handleDocumentNumberBlur = () => {
    setDocumentNumberError(validateDocumentNumber());
  };

  const isContinueDisabled = Boolean(validateDocumentNumber());

  const documentOptions = useMemo(
    () => [
      {
        label: t('accountIdentification.documentTypeOptions.cedula'),
        value: DOCUMENT_CATEGORY.CEDULA,
        iconName: 'credit-card' as const,
      },
      {
        label: t('accountIdentification.documentTypeOptions.passport'),
        value: DOCUMENT_CATEGORY.PASSPORT,
        iconName: 'send' as const,
      },
    ],
    [t],
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const isContinueFormValid = (): boolean => {
    const documentError = validateDocumentNumber();
    setDocumentNumberError(documentError);

    return !documentError;
  };

  const handleContinue = async () => {
    if (!isContinueFormValid()) {
      return;
    }

    const loaderToken = showLoader();
    let pendingModal: (() => void) | null = null;

    try {
      const client = await verifyClient();
      if (!client) {
        return;
      }

      if (!client.redirectToLogin) {
        setAccessOrigin(AccessOrigin.REGISTER);
        navigation.navigate('ChooseDocument');
        return;
      }

      if (client.emails.length === 1) {
        setUserEmail(client.emails[0].email);
      } else {
        const email = client.emails.find(email => email.emailPorDefecto === 'S');
        setUserEmail(email?.email || client.emails[0].email);
      }

      pendingModal = () => clientVerifiedRef.current?.open();
    } catch (error) {
      const errorCode = error instanceof AccessRecoveryApiError ? error.code : null;
      pendingModal = () => {
        if (errorCode && openErrorModal(errorCode)) {
          return;
        }

        errorGeneralRef.current?.open();
      };
    } finally {
      hideLoader(loaderToken);
    }

    if (pendingModal) {
      openModalAfterFrame(pendingModal);
    }
  };

  const handleConfirmClientData = () => {
    const requiresProofOfLife = documentCategory === DOCUMENT_CATEGORY.CEDULA;
    if (requiresProofOfLife) {
      navigation.navigate('FacialVerification');
      return;
    }
    navigation.navigate('ConfirmOtp');
    return;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />
      <Steps
        totalSteps={recoveryType === 'BOTH' ? 4 : 3}
        currentStep={1}
        containerStyle={styles.steps}
      />
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('accountIdentification.title')}</Text>
          <Text style={styles.subtitle}>{t('accountIdentification.subtitle')}</Text>

          <View>
            <Text style={styles.label}>{t('accountIdentification.documentTypeLabel')}</Text>
            <SelectPill
              options={documentOptions}
              value={documentCategory}
              onSelect={value => {
                setDocumentCategory(value);
                setDocumentNumber('');
                setDocumentNumberError('');
              }}
            />
            <Text style={[styles.label, styles.labelSpacing]}>
              {t('accountIdentification.documentNumberLabel')}
            </Text>
            <TextField
              key={documentCategory}
              width="100%"
              value={documentNumber}
              onChangeText={handleDocumentNumberChange}
              placeholder={
                documentCategory === DOCUMENT_CATEGORY.PASSPORT
                  ? t('accountIdentification.documentNumberPlaceholder.passport')
                  : t('accountIdentification.documentNumberPlaceholder.cedula')
              }
              keyboardType={documentCategory === DOCUMENT_CATEGORY.CEDULA ? 'numeric' : 'default'}
              iconName="credit-card"
              iconPosition="left"
              autoCapitalize="characters"
              autoCorrect={false}
              error={!!documentNumberError}
              onBlur={handleDocumentNumberBlur}
            />
            {documentNumberError ? (
              <ErrorText text={documentNumberError} iconName="info" color={COLORS.error} />
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.bottomButtons}>
          <View style={styles.continueButtonContainer}>
            <ButtonPill
              onPress={handleContinue}
              width="100%"
              backgroundColor={COLORS.primary}
              textColor={COLORS.backgroundLight}
              disabled={isContinueDisabled}
            >
              {t('accountIdentification.continueButton')}
            </ButtonPill>
          </View>
          <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>{t('accountIdentification.exitButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <NotValidatedClientModal ref={notValidatedClientRef} onGoToPortal={handleGoToPortal} />
      <TimeoutErrorModal ref={timeoutRef} />
      <ClientVerifiedModal
        ref={clientVerifiedRef}
        clientInfo={clientInfo}
        onContinue={handleConfirmClientData}
      />
      <ErrorUserWithoutData ref={errorUserWithoutDataRef} />
      <ErrorGeneral ref={errorGeneralRef} />
      <MaximumIntentsModal ref={maximumIntentsModalRef} />
      {/* <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'justify',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  steps: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  labelSpacing: {
    marginTop: SPACING.lg,
  },
  bottomButtons: {
    // paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
    paddingTop: SPACING.md,
  },
  continueButtonContainer: {
    marginBottom: SPACING.sm,
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
