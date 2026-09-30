import React, { forwardRef } from 'react';
import { Text } from 'react-native';
import { BscColors } from '@bsc/ui-native';
import { ModalCommon } from './compatibility';
import { Confirm, Illustration, resolveCommonDialogProps } from './dialogParts';
import { styles } from './styles';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';

export const SuccessModal = forwardRef<ModalHandle, CommonDialogProps & { onContinue?: () => void }>(function SuccessModal(rawProps, ref) {
  const props = resolveCommonDialogProps({ ...rawProps, onConfirm: rawProps.onConfirm ?? rawProps.onContinue });
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} bottomInset={props.bottomInset} closeOnBackdropPress={props.canDismiss} actions={props.actions} ref={ref}>
    <Illustration {...props} name={props.iconName ?? 'check-circle'} color={props.iconColor ?? BscColors.secondary} size={props.iconSize} />
    <Text style={[styles.title, { marginBottom: 8 }]}>{props.title}</Text>
    {props.message != null && <Text style={[styles.body, styles.bodySpacing]}>{props.message}</Text>}
    {props.children}<Confirm props={props} pill />
  </ModalCommon>;
});
