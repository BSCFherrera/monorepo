import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/index';
import { BscInfoModal, type BscModalHandle } from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NotValidUserModalProps {
  onClose?: () => void;
  onGoTo?: () => void;
}

export const NotValidUserModal = forwardRef<BscModalHandle, NotValidUserModalProps>(
  ({ onClose, onGoTo }, ref) => {
    const { t } = useTranslation('general');
    const navigation = useNavigation<RootNavigationProp>();
    const modalRef = useRef<BscModalHandle>(null);

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
      toggle: nextVisible => modalRef.current?.toggle(nextVisible),
      isOpen: () => modalRef.current?.isOpen() ?? false,
    }));

    const handleClosePress = useCallback(() => {
      modalRef.current?.close();
      onClose?.();
    }, []);

    const handleOnGoToHome = useCallback(() => {
      modalRef.current?.close();
      navigation.navigate('Inicio');
      onGoTo?.();
    }, [navigation, onGoTo]);

    return (
      <BscInfoModal
        ref={modalRef}
        canDismiss={false}
        presentation="expanded"
        title={t('notValidUserModal.title')}
        description={t('notValidUserModal.message')}
        primaryButtonLabel={t('notValidUserModal.goRegisterButton')}
        secondaryButtonLabel={t('notValidUserModal.back')}
        onPrimaryPress={handleOnGoToHome}
        onSecondaryPress={handleClosePress}
      />
    );
  },
);
