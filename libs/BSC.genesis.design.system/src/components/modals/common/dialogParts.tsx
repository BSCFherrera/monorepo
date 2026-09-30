import { type ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import { BscColors, BscPrimaryButton } from '@bsc/ui-native';
import { renderFeatherIcon } from '../../icons';
import type { CommonDialogProps } from './types';
import { styles } from './styles';

export function Illustration({ illustration, illustrationSource, size = 40, name = 'info', color = BscColors.primary }: Pick<CommonDialogProps, 'illustration' | 'illustrationSource'> & { size?: number; name?: string; color?: string }) {
  return <View style={styles.illustration}><View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {illustration ?? (illustrationSource ? <Image source={illustrationSource} style={{ width: size, height: size }} resizeMode="contain" /> : renderFeatherIcon({ name, size, color }))}
  </View></View>;
}

export function resolveCommonDialogProps(props: CommonDialogProps): CommonDialogProps {
  return {
    ...props,
    message: props.message ?? props.description,
    illustration: props.illustration ?? props.icon,
    confirmLabel: props.confirmLabel ?? props.closeButtonLabel,
  };
}

export function Panel({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <View style={[styles.panel, warning && styles.warning]}><Text style={styles.body}>{children}</Text></View>;
}

export function Confirm({ props, pill = false }: { props: CommonDialogProps; pill?: boolean }) {
  void pill;
  if (props.showConfirm === false) return null;
  const action = props.onConfirm ?? props.onClose;
  return <BscPrimaryButton label={props.confirmLabel ?? 'Continue'} onPress={action} loading={props.loading} style={{ width: '100%' }} />;
}
