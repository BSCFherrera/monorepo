import React, { forwardRef, type ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  ErrorGeneric, ErrorGeneral, ErrorServiceGeneral, ErrorUserWithoutData,
  MaximumIntentsModal, NotValidatedClientModal, TimeoutErrorModal,
  SuccessModal, SessionExpiredModal, WarningSessionModal,
  type CommonDialogProps, type ClientVerifiedModalProps,
} from '../common';
import {
  DisclaimerModal, TermsAndConditionsModal, WelcomeModal, ModalErrorUserBlockedLogin,
  OnboardingClientVerifiedModal, type DisclaimerModalProps,
} from '../onboarding';

import type { ModalControlProps, ModalHandle } from '../surfaces';

export { CenteredModal, BottomSheetModal, type CenteredModalProps, type BottomSheetModalProps, type ModalControlProps, type ModalHandle } from '../surfaces';

export interface ContentModalProps extends Omit<ModalControlProps, 'visible'> {
  visible?: boolean;
  onDismiss?: () => void;
  canDismiss?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
  title?: string;
  variant?: 'terms' | 'disclaimer';
  closeLabel?: string;
  acceptLabel?: string;
  onAccept?: () => void;
  bottomInset?: number;
  subtitle?: string;
  requirements?: DisclaimerModalProps['requirements'];
  logo?: ReactNode;
  logoSource?: ImageSourcePropType;
  onExit?: () => void;
  exitLabel?: string;
}

/**
 * @deprecated Compatibility adapter. Prefer TermsAndConditionsModal or DisclaimerModal for named content flows.
 */
export const ContentModal = forwardRef<ModalHandle, ContentModalProps>(function ContentModal({ visible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, children, actions, title = '', variant = 'terms', closeLabel = 'Close', acceptLabel = 'Accept', onAccept, bottomInset, subtitle = '', requirements = [], logo, logoSource, onExit, exitLabel }, ref) {
  const dismiss = onDismiss ?? (() => {});
  const guardedDismiss = () => { if (canDismiss) dismiss(); };
  if (variant === 'disclaimer') {
    return <DisclaimerModal visible={visible} defaultVisible={defaultVisible} onOpenChange={onOpenChange} onClose={dismiss} canDismiss={canDismiss} onBack={onExit ?? guardedDismiss} onContinue={onAccept ?? (() => {})} title={title} subtitle={subtitle}
      requirements={requirements} logo={logo} logoSource={logoSource} continueLabel={acceptLabel} exitLabel={exitLabel} bottomInset={bottomInset} actions={actions} showContinue={!!onAccept} ref={ref}>
      {children}
    </DisclaimerModal>;
  }
  return <TermsAndConditionsModal visible={visible} defaultVisible={defaultVisible} onOpenChange={onOpenChange} onClose={dismiss} canDismiss={canDismiss} onAccept={onAccept ?? (() => {})} title={title} content={children} ref={ref}
    closeLabel={closeLabel} acceptLabel={acceptLabel} bottomInset={bottomInset} actions={actions} showAccept={!!onAccept} />;
});

export type FeedbackVariant =
  | 'info' | 'service' | 'contact' | 'userData'
  | 'maxAttempts' | 'unvalidatedClient' | 'timeout' | 'success'
  | 'sessionExpired' | 'sessionWarning' | 'blockedLogin' | 'welcome' | 'clientVerified';

export interface FeedbackModalProps extends Omit<ModalControlProps, 'visible'> {
  visible?: boolean;
  onDismiss?: () => void;
  canDismiss?: boolean;
  title: string;
  variant?: FeedbackVariant;
  message?: ReactNode;
  icon?: ReactNode;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  children?: ReactNode;
  actions?: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirming?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  warningMessage?: ReactNode;
  subtitle?: string;
  bottomInset?: number;
  illustrationSource?: ImageSourcePropType;
  logo?: ReactNode;
  logoSource?: ImageSourcePropType;
  details?: ClientVerifiedModalProps['details'];
  detailLabel?: string;
  serviceError?: CommonDialogProps;
  closeLabel?: string;
}

/** Preserve generic callbacks and slots without keeping a second visual implementation. */
export const FeedbackModal = forwardRef<ModalHandle, FeedbackModalProps>(function FeedbackModal({ variant = 'info', visible, defaultVisible, onOpenChange, onDismiss, canDismiss = true, title, message, icon, iconName, iconColor, iconSize, children, actions, confirmLabel = 'Continue', onConfirm, confirming, secondaryLabel, onSecondary, warningMessage, subtitle, bottomInset, illustrationSource, logo, logoSource, details, detailLabel = '', serviceError, closeLabel }, ref) {
  const props: CommonDialogProps = {
    visible, defaultVisible, onOpenChange, onClose: onDismiss ?? (() => {}), canDismiss, title, message, illustration: icon, iconName, iconColor, iconSize,
    illustrationSource, children, actions, confirmLabel, onConfirm, loading: confirming,
    bottomInset, showConfirm: !!onConfirm, showSecondary: !!(onSecondary && secondaryLabel),
  };
  switch (variant) {
    case 'service': return <ErrorServiceGeneral {...props} ref={ref} />;
    case 'contact': return <ErrorGeneral {...props} ref={ref} />;
    case 'userData': return <ErrorUserWithoutData {...props} ref={ref} />;
    case 'maxAttempts': return <MaximumIntentsModal {...props} warningMessage={warningMessage} ref={ref} />;
    case 'unvalidatedClient': return <NotValidatedClientModal {...props} secondaryLabel={secondaryLabel ?? ''} onSecondary={onSecondary ?? (() => {})} ref={ref} />;
    case 'timeout': return <TimeoutErrorModal {...props} ref={ref} />;
    case 'success': return <SuccessModal {...props} ref={ref} />;
    case 'sessionExpired': return <SessionExpiredModal {...props} ref={ref} />;
    case 'sessionWarning': return <WarningSessionModal {...props} secondaryLabel={secondaryLabel ?? ''} onSecondary={onSecondary ?? (() => {})} ref={ref} />;
    case 'blockedLogin': return <ModalErrorUserBlockedLogin {...props} ref={ref} />;
    case 'welcome': return <WelcomeModal {...props} onAccessChat={onConfirm ?? (() => {})} closeLabel={closeLabel} ref={ref} />;
    case 'clientVerified': return <OnboardingClientVerifiedModal {...props} message={subtitle} logo={logo} logoSource={logoSource}
      details={details ?? (typeof message === 'string' && message ? [{ label: detailLabel, value: message }] : [])}
      secondaryLabel={secondaryLabel ?? ''} onSecondary={onSecondary ?? (() => {})} serviceError={serviceError} ref={ref}>
      {typeof message !== 'string' && message}
      {children}
    </OnboardingClientVerifiedModal>;
    default: return <ErrorGeneric {...props} ref={ref} />;
  }
});
