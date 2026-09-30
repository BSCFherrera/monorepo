import React, { forwardRef, type ReactNode } from 'react';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';
import { BscColors } from '@bsc/ui-native';
import { renderFeatherIcon } from '../../icons';
import { ModalCommon } from './compatibility';
import { Confirm } from './dialogParts';
import { styles } from './styles';
import type { CommonDialogProps } from './types';
import type { ModalHandle } from '../surfaces';

export interface ClientVerifiedModalProps extends CommonDialogProps {
  logo?: ReactNode;
  logoSource?: ImageSourcePropType;
  details: readonly { label: string; value: string }[];
  secondaryLabel: string;
  onSecondary: () => void;
  backLabel?: string;
}

export const ClientVerifiedModal = forwardRef<ModalHandle, ClientVerifiedModalProps>(function ClientVerifiedModal({ logo, logoSource, details, secondaryLabel, onSecondary, backLabel = 'Back', ...props }, ref) {
  return <ModalCommon visible={props.visible} defaultVisible={props.defaultVisible} onOpenChange={props.onOpenChange} onClose={props.onClose} bottomInset={props.bottomInset} closeOnBackdropPress={props.canDismiss} actions={props.actions} ref={ref}>
    <Pressable accessibilityRole="button" accessibilityLabel={backLabel} accessibilityState={{ disabled: props.canDismiss === false }} disabled={props.canDismiss === false} onPress={props.canDismiss === false ? undefined : props.onClose} style={styles.back}>{renderFeatherIcon({ name: 'arrow-left', size: 24, color: BscColors.textPrimary })}</Pressable>
    <View style={styles.logo}>{logo ?? (logoSource && <Image source={logoSource} style={{ width: 120, height: 60 }} resizeMode="contain" />)}</View>
    <Text style={styles.clientTitle}>{props.title}</Text><Text style={[styles.body, { marginTop: 4, marginBottom: 24 }]}>{props.message}</Text>
    {details.length > 0 && <View style={styles.details}>{details.map((detail, index) => <View key={index}>
      <Text style={styles.detailLabel}>{detail.label}</Text><Text style={styles.detailValue}>{detail.value}</Text>
    </View>)}</View>}
    {props.children}
    <Confirm props={props} pill />
    {props.showSecondary !== false && <Pressable accessibilityRole="button" onPress={onSecondary}><Text style={styles.secondary}>{secondaryLabel}</Text></Pressable>}
  </ModalCommon>;
});
