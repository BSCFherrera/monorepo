import React, {useState} from 'react';
import {Animated, Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  BscCheckbox,
  BscColors,
  BscErrorText,
  BscNavigationHeader,
  BscPrimaryButton,
  BscRadioGroup,
  BscSpacing,
  BscSteps,
  BscTextButton,
  BscTextField,
  BscTextStyles,
  useBscLoader,
} from '@bsc/design-system';
import {REGISTRATION_STEPS} from '@constants/registrationSteps';
import {DOCUMENT_CATEGORY} from '@constants/documentCategory';
import {OnboardingApiError, OnboardingService} from '@services/index';
import {useOnboardingStore} from '@store/index';
import {useRegistrationStepUpdate} from '@hooks/useRegistrationStepUpdate';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {ClientInformationResponse, OnboardingErrorCode} from '@/types/index';
import {formatDocumentNumber, sanitizeDocumentNumber} from '@utils/helpers';

// COMPONENTS
import {DisclaimerModal} from '@components/onboarding/DisclaimerModal';
import {ClientVerifiedModal} from '@components/onboarding/ClientVerifiedModal';
import {ErrorGeneral} from '@components/onboarding/ErrorGeneral';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {NotValidatedClientModal} from '@components/onboarding/NotValidatedClientModal';
import {ErrorUserWithoutData} from '@components/onboarding/ErrorUserWithoutData';
import {TimoutErrorModal} from '@components/onboarding/TimoutErrorModal';
import {MaximumIntentsModal} from '@components/onboarding/MaximumIntentsModal';
import {TermsAndConditionsModal} from '@components/onboarding/TermsAndConditionsModal';

export const ChooseDocumentScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation();
  const {showLoader, hideLoader} = useBscLoader();
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
    },
    {
      label: t('chooseDocument.documentTypeOptions.passport'),
      value: DOCUMENT_CATEGORY.PASSPORT,
    },
  ];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleDocumentNumberChange = (text: string) => {
    setDocumentNumberError('');
    setDocumentNumber(formatDocumentNumber(text, documentCategory));
  };

  const validateDocumentNumber = (): string => {
    const sanitized = sanitizeDocumentNumber(documentCategory, documentNumber);

    if (documentCategory === DOCUMENT_CATEGORY.CEDULA && sanitized.length < 11) {
      return t('chooseDocument.errors.cedulaLength');
    }

    if (!sanitized) {
      return t('chooseDocument.errors.passportRequired');
    }

    if (
      documentCategory === DOCUMENT_CATEGORY.PASSPORT &&
      (sanitized.length < 6 || sanitized.length > 12)
    ) {
      return t('chooseDocument.errors.passportLength');
    }

    return '';
  };

  const isDocumentNumberValid = !validateDocumentNumber();
  const isContinueDisabled = !isDocumentNumberValid || !termsAccepted;

  const handleOpenTermsModal = async () => {
    showLoader();
    let pendingModal: (() => void) | null = null;
    try {
      const content = await OnboardingService.getTermsAndConditions();
      setTermsContent(content);
      pendingModal = () => setIsTermsModalOpen(true);
    } catch {
      pendingModal = () => setIsErrorGeneralModalOpen(true);
    } finally {
      hideLoader();
      if (pendingModal) {
        openModalAfterFrame(pendingModal);
      }
    }
  };

  // Registra la aceptación de T&C con el documento verificado (hasheado en el servicio).
  // Proceso aislado: si el endpoint falla se loguea pero NO se interrumpe el avance del onboarding.
  const handleAcceptTermsAndConditions = () => {
    OnboardingService.acceptTermsAndConditions(sanitizeDocumentNumber(documentCategory, documentNumber))
      .then(() => console.log('[ChooseDocumentScreen] acceptTermsAndConditions OK'))
      .catch(error =>
        console.log('[ChooseDocumentScreen] acceptTermsAndConditions error (ignorado)', error),
      );
  };

  const handleOpenDataPolicyModal = async () => {
    showLoader();
    let pendingModal: (() => void) | null = null;
    try {
      const content = await OnboardingService.getPersonalDataPolicy();
      setDataPolicyContent(content);
      pendingModal = () => setIsDataPolicyModalOpen(true);
    } catch {
      pendingModal = () => setIsErrorGeneralModalOpen(true);
    } finally {
      hideLoader();
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
        sanitizeDocumentNumber(documentCategory, documentNumber),
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

    showLoader();
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
      hideLoader();
    }

    if (pendingModal) {
      openModalAfterFrame(pendingModal);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader
        onBack={handleBack}
        onClose={handleBack}
        showSupportButton
        title="Registro"
      />
      <BscSteps totalSteps={3} current={0} style={styles.steps} />
      <Animated.View style={[styles.mainContent, {paddingBottom: keyboardOffset}]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('chooseDocument.title')}</Text>
          <Text style={styles.subtitle}>{t('chooseDocument.subtitle')}</Text>

          <View style={styles.formSection}>
            <BscRadioGroup
              label={t('chooseDocument.documentTypeLabel')}
              options={documentOptions}
              value={documentCategory}
              onChange={value => {
                setDocumentCategory(value);
                setDocumentNumber('');
                setDocumentNumberError('');
              }}
              testID="campo-tipo-documento"
            />

            <BscTextField
              key={documentCategory}
              label={t('chooseDocument.documentNumberLabel')}
              value={documentNumber}
              onChangeText={handleDocumentNumberChange}
              placeholder={
                documentCategory === DOCUMENT_CATEGORY.PASSPORT
                  ? t('chooseDocument.documentNumberPlaceholder.passport')
                  : t('chooseDocument.documentNumberPlaceholder.cedula')
              }
              keyboardType={documentCategory === DOCUMENT_CATEGORY.CEDULA ? 'numeric' : 'default'}
              error={documentNumberError}
              testID="campo-numero-documento"
            />

            <View style={styles.checkboxContainer}>
              <BscCheckbox checked={termsAccepted} onChange={setTermsAccepted}>
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
              </BscCheckbox>
              <BscErrorText text={termsError} containerStyle={styles.termsErrorContainer} />
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomButtons}>
          <BscPrimaryButton
            label={t('chooseDocument.continueButton')}
            onPress={handleContinue}
            disabled={isContinueDisabled}
            testID="continuar-registro"
          />
          <BscTextButton
            label={t('chooseDocument.exitButton')}
            onPress={handleBack}
            style={styles.exitButton}
          />
        </View>
      </Animated.View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  steps: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: BscSpacing.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    marginBottom: BscSpacing.sm,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    marginBottom: BscSpacing.xl,
  },
  formSection: {
    width: '100%',
    gap: BscSpacing.lg,
  },
  checkboxContainer: {
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscSpacing.md,
    padding: BscSpacing.md,
    gap: BscSpacing.xs,
  },
  termsErrorContainer: {
    marginLeft: BscSpacing.md,
  },
  checkboxLabel: {
    ...BscTextStyles['Body S/14 Regular'],
    lineHeight: 18,
    textAlign: 'justify',
  },
  checkboxLabelBold: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.primary,
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.sm,
    gap: BscSpacing.sm,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
