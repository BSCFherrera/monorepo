import {
  AccessRecoveryErrorCode,
  ClientInformationResponse,
  RootStackParamList,
} from '@/types/index';
import {
  BscInfoModal,
  BscModal,
  BscModalHandle,
  BscPrimaryButton,
  BscRadioGroup,
  BscSpacing,
  BscSteps,
  BscTextField,
  BscTextStyles,
  useBscLoader,
} from '@bsc/design-system';
import { ClientVerifiedModal } from '@components/Common';
import { NotValidUserModal } from '@components/Common/NotValidUserModal';
import { DOCUMENT_CATEGORY } from '@constants/documentCategory';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccessRecoveryApiError, AccessRecoveryService } from '@services/index';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { formatDocumentNumber, sanitizeDocumentNumber, validateEmail } from '@utils/helpers';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AccountIdentificationModalProps {
  goToRegister: () => void;
}

export const AccountIdentificationModal = forwardRef<
  BscModalHandle,
  AccountIdentificationModalProps
>((props, ref) => {
  const { goToRegister } = props;
  const { t } = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const { showLoader, hideLoader } = useBscLoader();

  // Stores
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const setVerifiedClient = useAccesRecoveryStore(state => state.setVerifiedClient);
  const setDocumentCategoryInStore = useAccesRecoveryStore(state => state.setDocumentCategory);
  const setUserEmail = useAccesRecoveryStore(state => state.setUserEmail);

  // States
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentCategory, setDocumentCategory] = useState<string>(DOCUMENT_CATEGORY.CEDULA);
  const [documentNumberError, setDocumentNumberError] = useState('');
  const [userEmailError, setUserEmailError] = useState('');
  const [emailValidate, setEmailValidate] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInformationResponse | null>(null);

  // Refs
  const timeoutRef = useRef<BscModalHandle>(null);
  const clientVerifiedRef = useRef<BscModalHandle>(null);
  const errorUserWithoutDataRef = useRef<BscModalHandle>(null);
  const notValidatedClientRef = useRef<BscModalHandle>(null);
  const maximumIntentsModalRef = useRef<BscModalHandle>(null);
  const notValidUserRef = useRef<BscModalHandle>(null);
  const errorGeneralRef = useRef<BscModalHandle>(null);
  const mismatchRef = useRef<BscModalHandle>(null);

  const modalRef = useRef<BscModalHandle>(null);

  const resetForm = () => {
    setDocumentNumber('');
    setDocumentCategory(DOCUMENT_CATEGORY.CEDULA);
    setDocumentNumberError('');
    setClientInfo(null);
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        resetForm();
        modalRef.current?.open();
      },
      close: () => modalRef.current?.close(),
      toggle: nextVisible => modalRef.current?.toggle(nextVisible),
      isOpen: () => modalRef.current?.isOpen() ?? false,
    }),
    [],
  );

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

  const isContinueDisabled = Boolean(validateDocumentNumber());

  const handleDocumentNumberChange = (text: string) => {
    setDocumentNumberError('');
    setDocumentNumber(formatDocumentNumber(text, documentCategory));
  };

  const handleUserEmailChange = (text: string) => {
    setUserEmailError('');
    setEmailValidate(text);
  };

  const isContinueFormValid = (): boolean => {
    const documentError = validateDocumentNumber();
    setDocumentNumberError(documentError);

    // const emailError = validateEmail(emailValidate);
    // setUserEmailError(emailError ? t('accountIdentification.emailError') : '');

    return !documentError;
  };

  console.log('emailError', userEmailError);

  const handleOnGoToBack = useCallback(() => {
    mismatchRef.current?.close();
  }, []);

  const handleContinue = async () => {
    if (!isContinueFormValid()) {
      return;
    }

    showLoader('Validando...');
    let pendingModal: (() => void) | null = null;

    try {
      const client = await verifyClient();
      if (!client) {
        return;
      }

      if (!client.redirectToLogin) {
        pendingModal = () => notValidUserRef.current?.open();
        openModalAfterFrame(pendingModal);
        return;
      }

      let userEmailVerified = '';

      if (client.emails.length === 1) {
        userEmailVerified = client.emails[0].email;
      } else {
        const email = client.emails.find(email => email.emailPorDefecto === 'S');
        userEmailVerified = email?.email || client.emails[0].email;
      }

      if (recoveryType === 'PASSWORD' && userEmailVerified !== emailValidate) {
        mismatchRef.current?.open();
        return;
      }

      setUserEmail(userEmailVerified);
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
      hideLoader();
    }

    if (pendingModal) {
      openModalAfterFrame(pendingModal);
    }
  };

  const onDocumentCategoryChange = (value: string) => {
    setDocumentCategory(value);
    setDocumentNumber('');
    setDocumentNumberError('');
  };

  const documentOptions = useMemo(
    () => [
      {
        label: t('accountIdentification.documentTypeOptions.cedula'),
        value: DOCUMENT_CATEGORY.CEDULA,
      },
      {
        label: t('accountIdentification.documentTypeOptions.passport'),
        value: DOCUMENT_CATEGORY.PASSPORT,
      },
    ],
    [t],
  );

  const handleConfirmClientData = () => {
    const requiresProofOfLife = documentCategory === DOCUMENT_CATEGORY.CEDULA;
    if (requiresProofOfLife) {
      navigation.navigate('FacialVerification');
      return;
    }
    navigation.navigate('ConfirmOtp');
    return;
  };

  const onClose = () => {
    goToRegister();
    modalRef.current?.close();
  };

  const onGoTo = () => {
    modalRef.current?.close();
  };

  return (
    <>
      <BscModal ref={modalRef} presentation="expanded" scrollable>
        <BscSteps totalSteps={recoveryType === 'BOTH' ? 4 : 3} current={0} />
        <Text style={styles.title}>{t('accountIdentification.title')}</Text>
        <Text style={styles.subtitle}>{t('accountIdentification.subtitle')}</Text>

        <View style={styles.container}>
          <View style={styles.content}>
            {recoveryType === 'PASSWORD' ? (
              <BscTextField
                label={t('accountIdentification.userLabel')}
                value={emailValidate}
                onChangeText={handleUserEmailChange}
                placeholder={t('accountIdentification.userLabel')}
                error={userEmailError !== '' ? userEmailError : ''}
                testID="campo-usuario"
              />
            ) : null}
            <BscRadioGroup
              label="Tipo de documento"
              options={documentOptions}
              value={documentCategory}
              onChange={onDocumentCategoryChange}
              testID="campo-tipo-documento"
            />
            <BscTextField
              label={t('accountIdentification.documentNumberLabel')}
              value={documentNumber}
              onChangeText={handleDocumentNumberChange}
              placeholder={
                documentCategory === DOCUMENT_CATEGORY.PASSPORT
                  ? t('accountIdentification.documentNumberPlaceholder.passport')
                  : t('accountIdentification.documentNumberPlaceholder.cedula')
              }
              error={documentNumberError !== '' ? documentNumberError : ''}
              keyboardType={documentCategory === DOCUMENT_CATEGORY.CEDULA ? 'numeric' : 'default'}
              testID="campo-numero-documento"
            />
          </View>

          <BscPrimaryButton
            label={t('accountIdentification.continueButton')}
            disabled={isContinueDisabled}
            onPress={handleContinue}
            testID="validar-identificacion"
          />
        </View>
      </BscModal>
      <NotValidUserModal ref={notValidUserRef} onClose={onClose} onGoTo={onGoTo} />
      <ClientVerifiedModal
        ref={clientVerifiedRef}
        clientInfo={clientInfo}
        onContinue={handleConfirmClientData}
      />
      <BscInfoModal
        presentation="expanded"
        title={t('accountIdentification.errors.mismatchDataTitle')}
        description={t('accountIdentification.errors.mismatchDataDescription')}
        ref={mismatchRef}
        primaryButtonLabel={t('accountIdentification.goBackButton')}
        onPrimaryPress={handleOnGoToBack}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    gap: 20,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'center',
    marginTop: BscSpacing.md,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    textAlign: 'center',
    marginBottom: BscSpacing.xl,
  },
  label: {
    ...BscTextStyles['Caption/12 Regular'],
    marginBottom: BscSpacing.xs,
    paddingLeft: 10,
  },
});
