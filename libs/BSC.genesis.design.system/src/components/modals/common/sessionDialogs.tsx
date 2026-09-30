import React, { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { BscColors, BscSecondaryButton } from '@bsc/ui-native';
import { renderFeatherIcon } from '../../icons';
import { ModalCommon } from './compatibility';
import { Confirm, resolveCommonDialogProps } from './dialogParts';
import { styles } from './styles';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';

const SessionDialog = forwardRef<ModalHandle, CommonDialogProps & { warning?: boolean; secondaryLabel?: string; onSecondary?: () => void }>(function SessionDialog({ warning = false, secondaryLabel, onSecondary, ...rawProps }, ref) {
  const props = resolveCommonDialogProps(rawProps);
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} closeOnBackdropPress={false} bottomInset={props.bottomInset} actions={props.actions} ref={ref}>
    <View style={[styles.illustration, styles.sessionCircle]}>{props.illustration ?? renderFeatherIcon({ name: props.iconName ?? (warning ? 'alert-triangle' : 'clock'), size: props.iconSize ?? 32, color: props.iconColor ?? BscColors.warning })}</View>
    <Text style={[styles.title, styles.insetTitle]}>{props.title}</Text>
    {props.message != null && <Text style={[styles.body, styles.bodySpacing]}>{props.message}</Text>}
    {props.children}<Confirm props={props} pill />
    {warning && props.showSecondary !== false && <BscSecondaryButton label={secondaryLabel ?? 'End session'} onPress={onSecondary ?? props.onClose} style={{ ...styles.cancel, width: '100%' }} />}
  </ModalCommon>;
});

export const SessionExpiredModal = forwardRef<ModalHandle, CommonDialogProps>(function SessionExpiredModal(props, ref) { return <SessionDialog {...props} ref={ref} />; });

export interface WarningSessionModalProps extends CommonDialogProps { secondaryLabel: string; onSecondary: () => void }
export const WarningSessionModal = forwardRef<ModalHandle, WarningSessionModalProps>(function WarningSessionModal(props, ref) { return <SessionDialog {...props} warning ref={ref} />; });
