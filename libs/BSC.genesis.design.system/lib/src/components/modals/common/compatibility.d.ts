import { type ActionCardProps, type LoadingOverlayProps } from '../../display';
import { type BottomSheetModalProps, type ModalHandle } from '../surfaces';
export interface ModalCommonProps extends Omit<BottomSheetModalProps, 'onDismiss' | 'canDismiss'> {
    onClose?: () => void;
    closeOnBackdropPress?: boolean;
}
/**
 * @deprecated Compatibility wrapper kept for existing consumers. Prefer BottomSheetModal for new bottom-aligned surfaces.
 */
export declare const ModalCommon: import("react").ForwardRefExoticComponent<ModalCommonProps & import("react").RefAttributes<ModalHandle>>;
/**
 * @deprecated Compatibility wrapper kept for existing consumers. Prefer CenteredModal for new centered surfaces.
 */
export declare const ModalCentered: import("react").ForwardRefExoticComponent<ModalCommonProps & import("react").RefAttributes<ModalHandle>>;
export declare function TouchableCard(props: Omit<ActionCardProps, 'variant'>): import("react").JSX.Element;
export declare function RegisterPromptCard(props: Omit<ActionCardProps, 'variant'>): import("react").JSX.Element;
export declare function Loader(props: LoadingOverlayProps): import("react").JSX.Element;
export type TouchableCardProps = Omit<ActionCardProps, 'variant'>;
export type RegisterPromptCardProps = Omit<ActionCardProps, 'variant'>;
export type LoaderProps = LoadingOverlayProps;
/** @deprecated Compatibility props alias for ModalCentered. Prefer CenteredModalProps for new code. */
export type ModalCenteredProps = ModalCommonProps;
