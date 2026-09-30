import React, { forwardRef, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { BscColors, BscPrimaryButton, BscRadius, BscSpacing, BscTextStyles } from '@bsc/ui-native';
import { ClientVerifiedModal, ErrorServiceGeneral, ModalCommon, SuccessModal, TimeoutErrorModal, type ClientVerifiedModalProps, type CommonDialogProps } from '../common';
import type { ModalControlProps, ModalHandle } from '../surfaces';
import { renderFeatherIcon } from '../../icons';

export interface WelcomeModalProps extends Omit<CommonDialogProps, 'onConfirm'> {
  onAccessChat: () => void;
  closeLabel?: string;
}
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer composing ModalCommon or FeedbackModal for new flows.
 */
export const WelcomeModal = forwardRef<ModalHandle, WelcomeModalProps>(function WelcomeModal({ onAccessChat, closeLabel = 'Close', ...props }, ref) {
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} closeOnBackdropPress={props.canDismiss} bottomInset={props.bottomInset} actions={props.actions} ref={ref}>
    <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} accessibilityState={{ disabled: props.canDismiss === false }} disabled={props.canDismiss === false} onPress={props.canDismiss === false ? undefined : props.onClose} style={styles.welcomeClose}>
      {renderFeatherIcon({ name: 'x', size: 24, color: BscColors.textTertiary })}
    </Pressable>
    <View style={styles.welcomeIcon}>{props.illustration ?? renderFeatherIcon({ name: 'message-circle', size: 32, color: BscColors.primary })}</View>
    <Text style={styles.welcomeTitle}>{props.title}</Text>
    {props.message != null && <Text style={styles.dialogBody}>{props.message}</Text>}
    {props.children}
    {props.showConfirm !== false && <BscPrimaryButton label={props.confirmLabel ?? 'Continue'} loading={props.loading} onPress={onAccessChat} style={{ width: '100%' }} />}
  </ModalCommon>;
});

export type ModalErrorUserBlockedLoginProps = CommonDialogProps;
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer the blockedLogin FeedbackModal variant for new flows.
 */
export const ModalErrorUserBlockedLogin = forwardRef<ModalHandle, ModalErrorUserBlockedLoginProps>(function ModalErrorUserBlockedLogin(props, ref) {
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} closeOnBackdropPress={props.canDismiss} bottomInset={props.bottomInset} actions={props.actions} ref={ref}>
    <View style={styles.blockedCircle}>{props.illustration ?? renderFeatherIcon({ name: 'lock', size: 32, color: BscColors.error })}</View>
    <Text style={styles.blockedTitle}>{props.title}</Text>
    {props.message != null && <Text style={styles.dialogBody}>{props.message}</Text>}
    {props.children}
    {props.showConfirm !== false && <BscPrimaryButton label={props.confirmLabel ?? 'Continue'} loading={props.loading} onPress={props.onConfirm ?? props.onClose} style={{ width: '100%' }} />}
  </ModalCommon>;
});

export interface ProofOfLifeSuccessModalProps extends Omit<CommonDialogProps, 'onClose' | 'onConfirm'> {
  onContinue: () => void;
}
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer SuccessModal for the shared success layout.
 */
export const ProofOfLifeSuccessModal = forwardRef<ModalHandle, ProofOfLifeSuccessModalProps>(function ProofOfLifeSuccessModal({ onContinue, ...props }, ref) {
  return <SuccessModal {...props} onClose={onContinue} onConfirm={onContinue} ref={ref} />;
});

export interface OnboardingClientVerifiedModalProps extends ClientVerifiedModalProps {
  /** Host-controlled service result; never invokes a registration service itself. */
  serviceError?: CommonDialogProps;
}
/**
 * @deprecated Compatibility onboarding recipe kept for existing consumers. Prefer ClientVerifiedModal for new client-verification flows.
 */
export const OnboardingClientVerifiedModal = forwardRef<ModalHandle, OnboardingClientVerifiedModalProps>(function OnboardingClientVerifiedModal({ serviceError, ...props }, ref) {
  // One active surface avoids stacking two native Modal controllers on iOS.
  return serviceError?.visible ? <ErrorServiceGeneral {...serviceError} ref={ref} /> : <ClientVerifiedModal {...props} ref={ref} />;
});

/**
 * @deprecated Typo compatibility alias. Prefer TimeoutErrorModal for new code.
 */
export const TimoutErrorModal = TimeoutErrorModal;
/** @deprecated Typo compatibility alias. Prefer TimeoutErrorModalProps for new code. */
export type TimoutErrorModalProps = CommonDialogProps;

export interface TermsAndConditionsModalProps extends Omit<ModalControlProps, 'visible'> {
  visible?: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  acceptLabel?: string;
  onAccept: () => void;
  closeLabel?: string;
  bottomInset?: number;
  canDismiss?: boolean;
  actions?: ReactNode;
  showAccept?: boolean;
}
export const TermsAndConditionsModal = forwardRef<ModalHandle, TermsAndConditionsModalProps>(function TermsAndConditionsModal({ visible, defaultVisible, onOpenChange, onClose, title, content, acceptLabel = 'Accept', onAccept, closeLabel = 'Close', bottomInset, canDismiss = true, actions, showAccept = true }, ref) {
  const { height } = useWindowDimensions();
  return <ModalCommon visible={visible} defaultVisible={defaultVisible} onOpenChange={onOpenChange} onClose={onClose} bottomInset={bottomInset} closeOnBackdropPress={canDismiss} actions={actions} ref={ref}>
    <Pressable accessibilityRole="button" accessibilityLabel={closeLabel} accessibilityState={{ disabled: !canDismiss }} disabled={!canDismiss} onPress={canDismiss ? onClose : undefined} style={styles.close}>{renderFeatherIcon({ name: 'x', size: 24, color: BscColors.textPrimary })}</Pressable>
    <Text style={styles.termsTitle}>{title}</Text>
    <ScrollView style={{ maxHeight: height * 0.5 }} showsVerticalScrollIndicator={false}><Text style={styles.termsBody}>{content}</Text></ScrollView>
    {showAccept && <BscPrimaryButton label={acceptLabel} onPress={onAccept} style={{ width: '100%', marginTop: 24 }} />}
  </ModalCommon>;
});
export interface DisclaimerModalProps extends Omit<ModalControlProps, 'visible'> {
  visible?: boolean;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  title: string;
  subtitle: string;
  logo?: ReactNode;
  logoSource?: ImageSourcePropType;
  requirements: readonly { label: string; icon?: ReactNode; iconName?: string }[];
  continueLabel?: string;
  exitLabel?: string;
  backLabel?: string;
  bottomInset?: number;
  canDismiss?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
  showContinue?: boolean;
}
export const DisclaimerModal = forwardRef<ModalHandle, DisclaimerModalProps>(function DisclaimerModal({ visible, defaultVisible, onOpenChange, onClose, onBack, onContinue, title, subtitle, logo, logoSource, requirements, continueLabel = 'Continue', exitLabel = 'Exit', backLabel = 'Back', bottomInset, canDismiss = true, children, actions, showContinue = true }, ref) {
  return <ModalCommon visible={visible} defaultVisible={defaultVisible} onOpenChange={onOpenChange} onClose={onClose} bottomInset={bottomInset} closeOnBackdropPress={canDismiss} actions={actions} ref={ref}>
    <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} style={styles.back}>{renderFeatherIcon({ name: 'arrow-left', size: 24, color: BscColors.textPrimary })}</Pressable>
    <View style={styles.logo}>{logo ?? (logoSource && <Image source={logoSource} style={{ width: 120, height: 60 }} resizeMode="contain" />)}</View>
    <Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>
    <View style={styles.list}>{requirements.map((item, index) => <View key={index} style={styles.requirement}>
      <View style={styles.icon}>{item.icon ?? renderFeatherIcon({ name: item.iconName ?? 'info', size: 24, color: BscColors.primary })}</View>
      <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
    </View>)}</View>
    {children}
    {showContinue && <BscPrimaryButton label={continueLabel} onPress={onContinue} style={{ width: '100%' }} />}
    <Pressable accessibilityRole="button" onPress={onBack}><Text style={styles.exit}>{exitLabel}</Text></Pressable>
  </ModalCommon>;
});
const styles = StyleSheet.create({
  welcomeClose: { alignSelf: 'flex-end', marginTop: BscSpacing.xs },
  welcomeIcon: { alignSelf: 'center', width: 64, height: 64, borderRadius: BscRadius.md, backgroundColor: '#EAF0FE', justifyContent: 'center', alignItems: 'center', marginBottom: BscSpacing.md },
  welcomeTitle: { ...BscTextStyles['Body L/18 Bold'], color: BscColors.textPrimary, textAlign: 'center', marginBottom: BscSpacing.xs },
  dialogBody: { ...BscTextStyles['Body S/14 Regular'], color: BscColors.textSecondary, textAlign: 'center', marginBottom: BscSpacing.xl },
  blockedCircle: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDECEC', justifyContent: 'center', alignItems: 'center', marginTop: BscSpacing.md, marginBottom: BscSpacing.xl },
  blockedTitle: { ...BscTextStyles['Body L/18 Bold'], color: BscColors.textPrimary, textAlign: 'center', marginBottom: BscSpacing.xl, paddingHorizontal: 48 },
  close: { width: 32, height: 32, borderRadius: BscRadius.md, backgroundColor: BscColors.surfaceMuted, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
  termsTitle: { ...BscTextStyles['Body M/16 Bold'], color: BscColors.textPrimary, marginVertical: BscSpacing.xs },
  termsBody: { ...BscTextStyles['Caption/12 Regular'], color: BscColors.textPrimary, textAlign: 'justify' },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: BscColors.surfaceMuted, justifyContent: 'center', alignItems: 'center', marginTop: BscSpacing.xs },
  logo: { width: 120, height: 60, alignSelf: 'center', marginBottom: BscSpacing.md },
  title: { ...BscTextStyles['Heading M/24 Bold'], color: BscColors.textPrimary },
  subtitle: { ...BscTextStyles['Body S/14 Regular'], color: BscColors.textSecondary, marginTop: BscSpacing.xxs, marginBottom: BscSpacing.md },
  list: { width: '100%', paddingVertical: BscSpacing.md, gap: BscSpacing.sm },
  requirement: { width: '100%', backgroundColor: '#F6FBFF', borderWidth: 1, borderColor: '#dbeafe', borderRadius: BscRadius.md, flexDirection: 'row', alignItems: 'center', paddingVertical: BscSpacing.xl, paddingHorizontal: BscSpacing.sm },
  icon: { width: 32, height: 32, borderRadius: BscRadius.md, backgroundColor: BscColors.surface, justifyContent: 'center', alignItems: 'center', marginRight: BscSpacing.sm },
  label: { ...BscTextStyles['Body M/16 Bold'], flex: 1, color: BscColors.textPrimary, textAlign: 'left' },
  exit: { ...BscTextStyles['Body M/16 Bold'], color: BscColors.textSecondary, textAlign: 'center', paddingVertical: BscSpacing.md },
});
