import React, { forwardRef } from 'react';
import { ActionCard, LoadingOverlay, type ActionCardProps, type LoadingOverlayProps } from '../../display';
import { BottomSheetModal, CenteredModal, type BottomSheetModalProps, type ModalHandle } from '../surfaces';

export interface ModalCommonProps extends Omit<BottomSheetModalProps, 'onDismiss' | 'canDismiss'> {
  onClose?: () => void;
  closeOnBackdropPress?: boolean;
}

/**
 * @deprecated Compatibility wrapper kept for existing consumers. Prefer BottomSheetModal for new bottom-aligned surfaces.
 */
export const ModalCommon = forwardRef<ModalHandle, ModalCommonProps>(function ModalCommon({ onClose, closeOnBackdropPress = true, ...props }, ref) {
  return <BottomSheetModal {...props} onDismiss={onClose} canDismiss={closeOnBackdropPress} ref={ref} />;
});

/**
 * @deprecated Compatibility wrapper kept for existing consumers. Prefer CenteredModal for new centered surfaces.
 */
export const ModalCentered = forwardRef<ModalHandle, ModalCommonProps>(function ModalCentered({ onClose, closeOnBackdropPress = true, ...props }, ref) {
  return <CenteredModal {...props} onDismiss={onClose} canDismiss={closeOnBackdropPress} ref={ref} />;
});

export function TouchableCard(props: Omit<ActionCardProps, 'variant'>) { return <ActionCard {...props} variant="standard" />; }
export function RegisterPromptCard(props: Omit<ActionCardProps, 'variant'>) { return <ActionCard iconName="person" {...props} variant="registration" />; }
export function Loader(props: LoadingOverlayProps) { return <LoadingOverlay {...props} />; }

export type TouchableCardProps = Omit<ActionCardProps, 'variant'>;
export type RegisterPromptCardProps = Omit<ActionCardProps, 'variant'>;
export type LoaderProps = LoadingOverlayProps;
/** @deprecated Compatibility props alias for ModalCentered. Prefer CenteredModalProps for new code. */
export type ModalCenteredProps = ModalCommonProps;
