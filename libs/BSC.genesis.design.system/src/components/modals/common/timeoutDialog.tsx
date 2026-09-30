import React, { forwardRef } from 'react';
import { Text } from 'react-native';
import { BscColors } from '@bsc/ui-native';
import { ModalCommon } from './compatibility';
import { Confirm, Illustration, resolveCommonDialogProps } from './dialogParts';
import { styles } from './styles';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';

export const TimeoutErrorModal = forwardRef<ModalHandle, CommonDialogProps & { onGoToHome?: () => void }>(function TimeoutErrorModal(rawProps, ref) {
  const props = resolveCommonDialogProps({ ...rawProps, onConfirm: rawProps.onConfirm ?? rawProps.onGoToHome });
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} bottomInset={props.bottomInset} closeOnBackdropPress={props.canDismiss} actions={props.actions} ref={ref}>
    <Illustration {...props} size={props.iconSize ?? 64} name={props.iconName ?? 'alert-circle'} color={props.iconColor ?? BscColors.error} />
    <Text style={[styles.title, styles.insetTitle]}>{props.title}</Text>
    {props.message != null && <Text style={[styles.body, styles.bodySpacing]}>{props.message}</Text>}
    {props.children}<Confirm props={props} />
  </ModalCommon>;
});
