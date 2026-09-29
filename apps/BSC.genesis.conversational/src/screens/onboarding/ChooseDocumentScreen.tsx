import React, {useState} from 'react';
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {DOCUMENT_CATEGORY} from '@constants/documentCategory';
import {OnboardingApiError, OnboardingService} from '@services/index';
import {useOnboardingStore} from '@store/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {ClientInformationResponse, OnboardingErrorCode} from '@/types/index';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {DisclaimerModal} from '@components/onboarding/DisclaimerModal';
import {ClientVerifiedModal} from '@components/onboarding/ClientVerifiedModal';
import {ErrorGeneral} from '@components/onboarding/ErrorGeneral';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {NotValidatedClientModal} from '@components/onboarding/NotValidatedClientModal';
import {ErrorUserWithoutData} from '@components/onboarding/ErrorUserWithoutData';
import {TimoutErrorModal} from '@components/onboarding/TimoutErrorModal';
import {MaximumIntentsModal} from '@components/onboarding/MaximumIntentsModal';
import {TermsAndConditionsModal} from '@components/onboarding/TermsAndConditionsModal';
import {ErrorText} from '@components/Common/ErrorText';
import {Steps} from '@components/Common/Steps';
import {SelectPill} from '@components/Common/SelectPill';
import {TextField} from '@components/Common/TextField';
import {Checkbox} from '@components/Common/Checkbox';
import {ButtonPill} from '@components/Common/ButtonPill';
import {useLoader} from '@components/Common/Loader';

export const ChooseDocumentScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation();
  const {showLoader, hideLoader} = useLoader();
  const setVerifiedClient = useOnboardingStore(state => state.setVerifiedClient);
  const setDocumentCategoryInStore = useOnboardingStore(state => state.setDocumentCategory);
  const setRegistrationSession = useOnboardingStore(state => state.setRegistrationSession);
  const setRegistrationDevice = useOnboardingStore(state => state.setRegistrationDevice);
  const {isServiceErrorModalOpen, closeServiceErrorModal, updateRegistrationStep} =
    useRegistrationStepUpdate('ChooseDocumentScreen');
  const keyboardOffset = useKeyboardOffset();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isNotValidatedClientModalOpen, setIsNotValidatedClientModalOpen] = useState(false);
  const [isClientVerifiedModalOpen, setIsClientVerifiedModalOpen] = useState(false);
  const [isErrorGeneralModalOpen, setIsErrorGeneralModalOpen] = useState(false);
  const [isTimoutErrorModalOpen, setIsTimoutErrorModalOpen] = useState(false);
  const [isMaximumIntentsModalOpen, setIsMaximumIntentsModalOpen] = useState(false);
  const [isErrorUserWithoutDataModalOpen, setIsErrorUserWithoutDataModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isDataPolicyModalOpen, setIsDataPolicyModalOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInformationResponse | null>(null);
  const [termsContent, setTermsContent] = useState('');
  const [dataPolicyContent, setDataPolicyContent] = useState('');

  const openModalAfterFrame = (openModal: () => void) => {
    requestAnimationFrame(openModal);
  };

  // Form states
  const [documentCategory, setDocumentCategory] = useState<string>(DOCUMENT_CATEGORY.CEDULA);
  const [documentNumber, setDocumentNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documentNumberError, setDocumentNumberError] = useState('');
  const [termsError, setTermsError] = useState('');

  const documentOptions = [
    {
      label: t('chooseDocument.documentTypeOptions.cedula'),
      value: DOCUMENT_CATEGORY.CEDULA,
      iconName: 'credit-card' as const,
    },
    {
      label: t('chooseDocument.documentTypeOptions.passport'),
      value: DOCUMENT_CATEGORY.PASSPORT,
      iconName: 'send' as const,
    },
  ];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleDocumentNumberChange = (text: string) => {
    setDocumentNumberError('');
    if (documentCategory === DOCUMENT_CATEGORY.CEDULA) {
      const cleaned = text.replace(/[^0-9]/g, '');
      const limited = cleaned.substring(0, 11);
      let formatted = '';
      if (limited.length > 0) {
        formatted = limited.substring(0, 3);
        if (limited.length > 3) {
          formatted += '-' + limited.substring(3, 10);
          if (limited.length > 10) {
            formatted += '-' + limited.substring(10, 11);
          }
        }
      }
      setDocumentNumber(formatted);
    }
    if (documentCategory === DOCUMENT_CATEGORY.PASSPORT) {
      // Para pasaporte extranjero, limpiar caracteres no alfanuméricos y convertir a mayúsculas
      let cleaned = text.replace(/[^a-zA-Z0-9]/g, '');
      if (cleaned.length > 12) {
        cleaned = cleaned.slice(0, 12);
      }
      setDocumentNumber(cleaned);
    }
  };

  const sanitizeDocumentNumber = () => {
    return documentCategory === DOCUMENT_CATEGORY.PASSPORT
      ? documentNumber.toUpperCase()
      : documentNumber.replace(/[^0-9]/g, '');
  };

  const validateDocumentNumber = (): string => {
    if (documentCategory === DOCUMENT_CATEGORY.CEDULA && sanitizeDocumentNumber().length < 11) {
      return t('chooseDocument.errors.cedulaLength');
    }

    if (!documentNumber) {
      return t('chooseDocument.errors.passportRequired');
    }

    if (
      documentCategory === DOCUMENT_CATEGORY.PASSPORT &&
      (documentNumber.length < 6 || documentNumber.length > 12)
    ) {
      return t('chooseDocument.errors.passportLength');
    }

    return '';
  };

  const handleDocumentNumberBlur = () => {
    setDocumentNumberError(validateDocumentNumber());
  };

  const isDocumentNumberValid = !validateDocumentNumber();
  const isContinueDisabled = !isDocumentNumberValid || !termsAccepted;

  const handleOpenTermsModal = async () => {
    const loaderToken = showLoader();
    let pendingModal: (() => void) | null = null;
    try {
      const content = await OnboardingService.getTermsAndConditions();
      setTermsContent(content);
      pendingModal = () => setIsTermsModalOpen(true);
    } catch {
      pendingModal = () => setIsErrorGeneralModalOpen(true);
    } finally {
      hideLoader(loaderToken);
      if (pendingModal) {
        openModalAfterFrame(pendingModal);
      }
    }
  };

  // Registra la aceptación de T&C con el documento verificado (hasheado en el servicio).
  // Proceso aislado: si el endpoint falla se loguea pero NO se interrumpe el avance del onboarding.
  const handleAcceptTermsAndConditions = () => {
    OnboardingService.acceptTermsAndConditions(sanitizeDocumentNumber())
      .then(() => console.log('[ChooseDocumentScreen] acceptTermsAndConditions OK'))
      .catch(error =>
        console.log('[ChooseDocumentScreen] acceptTermsAndConditions error (ignorado)', error),
      );
  };

  const handleOpenDataPolicyModal = async () => {
    const loaderToken = showLoader();
    let pendingModal: (() => void) | null = null;
    try {
      const content = await OnboardingService.getPersonalDataPolicy();
      setDataPolicyContent(content);
      pendingModal = () => setIsDataPolicyModalOpen(true);
    } catch {
      pendingModal = () => setIsErrorGeneralModalOpen(true);
    } finally {
      hideLoader(loaderToken);
      if (pendingModal) {
        openModalAfterFrame(pendingModal);
      }
    }
  };

  // Abre el modal específico del código de error recibido. Devuelve `true` cuando el
  // código fue reconocido, para que el caller sepa que no debe mostrar el error genérico.
  const openOnboardingErrorModal = (code: OnboardingErrorCode): boolean => {
    const isNotValidated = code === 'CLIENT_NOT_VALIDATED';
    const isTimeout = code === 'TIMEOUT';
    const isMaximumIntents = code === 'MAX_ATTEMPTS_EXCEEDED';
    const isClientWithoutData = code === 'CLIENT_WITHOUT_DATA';

    setIsNotValidatedClientModalOpen(isNotValidated);
    setIsTimoutErrorModalOpen(isTimeout);
    setIsMaximumIntentsModalOpen(isMaximumIntents);
    setIsErrorUserWithoutDataModalOpen(isClientWithoutData);

    return isNotValidated || isTimeout || isMaximumIntents || isClientWithoutData;
  };

  const handleGoToPortal = () => {
    setIsNotValidatedClientModalOpen(false);
    Linking.openURL(t('notValidatedClientModal.portalUrl'));
  };

  const isContinueFormValid = (): boolean => {
    const documentError = validateDocumentNumber();
    setDocumentNumberError(documentError);
    setTermsError(!termsAccepted ? t('chooseDocument.errors.termsRequired') : '');

    return !documentError && termsAccepted;
  };

  // Verifica el documento y muestra el modal correspondiente al código de error de negocio.
  const verifyClient = async (): Promise<ClientInformationResponse | null> => {
    try {
      const response = await OnboardingService.verifyClientDocument(
        sanitizeDocumentNumber(),
        documentCategory,
      );

      setClientInfo(response);
      setVerifiedClient(response);
      setDocumentCategoryInStore(documentCategory);
      return response;
    } catch (error) {
      console.log('[ChooseDocumentScreen] verifyClientDocument error', error);
      throw error;
    }
  };

  // Crea la sesión de registro para un cliente ya verificado. Un fallo aquí es un
  // problema de disponibilidad del backend, no de negocio, por lo que se trata como timeout.
  const createSession = async (client: ClientInformationResponse): Promise<boolean> => {
    try {
      const session = await OnboardingService.createRegistrationSession(
        client.numeroIdentificacion,
      );

      setRegistrationSession(session);
      // Se guardan aparte `deviceId` y `documentNumberHash` para reutilizarlos más adelante
      // (ej. registro de dispositivo seguro) desde otros flujos.
      setRegistrationDevice({
        deviceId: session.deviceId,
        documentNumberHash: session.documentNumberHash,
      });
      return true;
    } catch (error) {
      console.log('[ChooseDocumentScreen] createRegistrationSession error', error);
      throw error;
    }
  };

  // Reporta al backend el primer paso del flujo de registro ('identity_terms_and_name_confirmation')
  // ya con la sesión creada. Es un proceso aislado de `createSession`: su fallo se maneja de forma
  // independiente y no debe impedir que se muestre el modal de cliente verificado.
  const registerIdentityTermsAndNameConfirmationStep = (): Promise<boolean> => {
    return updateRegistrationStep(REGISTRATION_STEPS.IDENTITY_TERMS_AND_NAME_CONFIRMATION);
  };

  const handleContinue = async () => {
    if (!isContinueFormValid()) {
      return;
    }

    const loaderToken = showLoader();
    let pendingModal: (() => void) | null = null;
    let currentStep: 'verify' | 'session' | 'registrationStep' = 'verify';

    try {
      currentStep = 'verify';
      const client = await verifyClient();
      if (!client) {
        return;
      }

      currentStep = 'session';
      const sessionCreated = await createSession(client);
      if (!sessionCreated) {
        return;
      }

      currentStep = 'registrationStep';
      const stepRegistered = await registerIdentityTermsAndNameConfirmationStep();
      if (stepRegistered) {
        pendingModal = () => setIsClientVerifiedModalOpen(true);
      }
    } catch (error) {
      if (currentStep === 'verify') {
        const errorCode = error instanceof OnboardingApiError ? error.code : null;
        pendingModal = () => {
          if (errorCode && openOnboardingErrorModal(errorCode)) {
            return;
          }

          setIsErrorGeneralModalOpen(true);
        };
      } else {
        pendingModal = () => setIsTimoutErrorModalOpen(true);
      }
    } finally {
      hideLoader(loaderToken);
    }

    if (pendingModal) {
      openModalAfterFrame(pendingModal);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <HeaderOnboarding showBackButton={true} onBackPress={handleBack} />
      <Steps totalSteps={3} currentStep={1} containerStyle={styles.steps} />
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('chooseDocument.title')}</Text>
          <Text style={styles.subtitle}>{t('chooseDocument.subtitle')}</Text>

          <View style={styles.formSection}>
            <Text style={styles.label}>{t('chooseDocument.documentTypeLabel')}</Text>
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
              {t('chooseDocument.documentNumberLabel')}
            </Text>
            <TextField
              key={documentCategory}
              width="100%"
              value={documentNumber}
              onChangeText={handleDocumentNumberChange}
              placeholder={
                documentCategory === DOCUMENT_CATEGORY.PASSPORT
                  ? t('chooseDocument.documentNumberPlaceholder.passport')
                  : t('chooseDocument.documentNumberPlaceholder.cedula')
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

            <View style={styles.checkboxContainer}>
              <Checkbox
                value={termsAccepted}
                onValueChange={value => {
                  setTermsAccepted(value);
                  if (value) {
                    setTermsError('');
                  }
                }}>
                <Text style={styles.checkboxLabel}>
                  {t('chooseDocument.terms.prefix')}{' '}
                  <Text
                    style={styles.checkboxLabelBold}
                    onPress={handleOpenTermsModal}
                    suppressHighlighting>
                    {t('chooseDocument.terms.appTerms')}
                  </Text>{' '}
                  {t('chooseDocument.terms.and')}{' '}
                  <Text
                    style={styles.checkboxLabelBold}
                    onPress={handleOpenDataPolicyModal}
                    suppressHighlighting>
                    {t('chooseDocument.terms.dataTerms')}
                  </Text>
                  {t('chooseDocument.terms.suffix')}
                </Text>
              </Checkbox>
              {termsError ? (
                <ErrorText
                  text={termsError}
                  iconName="info"
                  color={COLORS.error}
                  containerStyle={styles.termsErrorContainer}
                />
              ) : null}
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomButtons}>
          <View style={styles.continueButtonContainer}>
            <ButtonPill
              onPress={handleContinue}
              width="100%"
              backgroundColor={COLORS.primary}
              textColor={COLORS.backgroundLight}
              disabled={isContinueDisabled}>
              {t('chooseDocument.continueButton')}
            </ButtonPill>
          </View>
          <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>{t('chooseDocument.exitButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <DisclaimerModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <NotValidatedClientModal
        visible={isNotValidatedClientModalOpen}
        onClose={() => setIsNotValidatedClientModalOpen(false)}
        onGoToPortal={handleGoToPortal}
        onGoToHome={() => {
          setIsNotValidatedClientModalOpen(false);
          handleBack();
        }}
      />
      <ClientVerifiedModal
        visible={isClientVerifiedModalOpen}
        onClose={() => setIsClientVerifiedModalOpen(false)}
        clientInfo={clientInfo}
        onAcceptTerms={handleAcceptTermsAndConditions}
      />
      <ErrorGeneral
        visible={isErrorGeneralModalOpen}
        onClose={() => setIsErrorGeneralModalOpen(false)}
        onGoToHome={() => {
          setIsErrorGeneralModalOpen(false);
          handleBack();
        }}
      />
      <ErrorServiceGeneral visible={isServiceErrorModalOpen} onClose={closeServiceErrorModal} />
      <TimoutErrorModal
        visible={isTimoutErrorModalOpen}
        onClose={() => setIsTimoutErrorModalOpen(false)}
        onGoToHome={() => {
          setIsTimoutErrorModalOpen(false);
          handleBack();
        }}
      />
      <TermsAndConditionsModal
        visible={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title={t('termsAndConditionsModal.title')}
        content={termsContent}
      />
      <TermsAndConditionsModal
        visible={isDataPolicyModalOpen}
        onClose={() => setIsDataPolicyModalOpen(false)}
        title={t('personalDataPolicyModal.title')}
        content={dataPolicyContent}
      />
      <MaximumIntentsModal
        visible={isMaximumIntentsModalOpen}
        onClose={() => {}}
        onGoToHome={() => {
          setIsMaximumIntentsModalOpen(false);
          handleBack();
        }}
      />
      <ErrorUserWithoutData
        visible={isErrorUserWithoutDataModalOpen}
        onClose={() => setIsErrorUserWithoutDataModalOpen(false)}
        onGoToHome={() => {
          setIsErrorUserWithoutDataModalOpen(false);
          handleBack();
        }}
      />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  keyboardContainer: {
    flex: 1,
  },
  steps: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  formSection: {
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  labelSpacing: {
    marginTop: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: 4,
  },
  checkboxContainer: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  termsErrorContainer: {
    marginLeft: SPACING.md,
  },
  checkboxLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 18,
    textAlign: 'justify',
  },
  checkboxLabelBold: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
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
