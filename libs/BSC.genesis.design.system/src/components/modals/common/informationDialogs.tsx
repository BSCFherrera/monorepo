import React, { forwardRef, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { BscPrimaryButton } from '@bsc/ui-native';
import type { CommonDialogProps } from './types';
import { ModalCommon } from './compatibility';
import { Confirm, Illustration, Panel, resolveCommonDialogProps } from './dialogParts';
import { styles } from './styles';
import type { ModalHandle } from '../surfaces';

const InformationDialog = forwardRef<ModalHandle, CommonDialogProps & { warningMessage?: ReactNode; secondaryLabel?: string; onSecondary?: () => void }>(function InformationDialog({ warningMessage, secondaryLabel, onSecondary, ...rawProps }, ref) {
  const props = resolveCommonDialogProps(rawProps);
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} bottomInset={props.bottomInset} closeOnBackdropPress={props.canDismiss} actions={props.actions} ref={ref}>
    <Illustration {...props} name={props.iconName} color={props.iconColor} size={props.iconSize} /><Text style={styles.title}>{props.title}</Text>
    {warningMessage != null && <Panel warning>{warningMessage}</Panel>}
    {props.message != null && <Panel>{props.message}</Panel>}
    {props.children}
    {onSecondary && props.showSecondary !== false ? <View style={{ gap: 8, marginBottom: 8 }}><Confirm props={props} pill />
      <BscPrimaryButton label={secondaryLabel ?? 'Go back'} onPress={onSecondary} style={{ width: '100%' }} />
    </View> : <Confirm props={props} pill={!!onSecondary} />}
  </ModalCommon>;
});

export const ErrorGeneric = forwardRef<ModalHandle, CommonDialogProps>(function ErrorGeneric(props, ref) { return <InformationDialog {...props} ref={ref} />; });
export const ErrorGeneral = forwardRef<ModalHandle, CommonDialogProps>(function ErrorGeneral(props, ref) { return <InformationDialog {...props} ref={ref} />; });
export const ErrorServiceGeneral = forwardRef<ModalHandle, CommonDialogProps>(function ErrorServiceGeneral(props, ref) { return <InformationDialog {...props} ref={ref} />; });
export const ErrorUserWithoutData = forwardRef<ModalHandle, CommonDialogProps>(function ErrorUserWithoutData(props, ref) { return <InformationDialog {...props} ref={ref} />; });

export interface MaximumIntentsModalProps extends CommonDialogProps { warningMessage: ReactNode }
export const MaximumIntentsModal = forwardRef<ModalHandle, MaximumIntentsModalProps>(function MaximumIntentsModal(props, ref) { return <InformationDialog {...props} ref={ref} />; });

export interface NotValidatedClientModalProps extends CommonDialogProps { secondaryLabel: string; onSecondary: () => void }
export const NotValidatedClientModal = forwardRef<ModalHandle, NotValidatedClientModalProps>(function NotValidatedClientModal(props, ref) { return <InformationDialog {...props} ref={ref} />; });
