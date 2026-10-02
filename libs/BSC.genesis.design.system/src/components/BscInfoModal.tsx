import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

import { BscPrimaryButton, BscTextButton } from './BscButton';
import { BscModal, type BscModalHandle, type BscModalProps } from './BscModal';
import type { InfoModalProps } from '@bsc/contracts';

export interface BscInfoModalProps extends InfoModalProps, Omit<BscModalProps, keyof InfoModalProps | 'children' | 'content' | 'footer'> {
  children?: ReactNode;
  /** Optional visual slot above the title, usually an icon or illustration. */
  illustration?: ReactNode;
}

export const BscInfoModal = React.forwardRef<BscModalHandle, BscInfoModalProps>(function BscInfoModalComponent({
  title,
  description,
  primaryButtonLabel,
  onPrimaryPress,
  secondaryButtonLabel,
  onSecondaryPress,
  primaryButtonLoading = false,
  primaryButtonDisabled = false,
  secondaryButtonDisabled = false,
  children,
  illustration,
  testID,
  ...modalProps
}: BscInfoModalProps, ref): React.JSX.Element {
  const hasSecondaryAction = secondaryButtonLabel !== undefined && secondaryButtonLabel.length > 0;
  const showHeaderTitle = modalProps.onBack !== undefined || (modalProps.showCloseButton ?? false);

  return (
    <BscModal
      ref={ref}
      testID={testID}
      title={showHeaderTitle ? title : undefined}
      showCloseButton={modalProps.showCloseButton ?? false}
      scrollable={modalProps.scrollable ?? false}
      footer={
        <View style={styles.actions}>
          <BscPrimaryButton
            label={primaryButtonLabel}
            onPress={onPrimaryPress}
            loading={primaryButtonLoading}
            disabled={primaryButtonDisabled}
            size="md"
            testID={testID === undefined ? undefined : `${testID}-primary`}
          />
          {hasSecondaryAction ? (
            <BscTextButton
              label={secondaryButtonLabel}
              onPress={onSecondaryPress}
              disabled={secondaryButtonDisabled}
              size="sm"
              testID={testID === undefined ? undefined : `${testID}-secondary`}
            />
          ) : null}
        </View>
      }
      {...modalProps}
    >
      <View style={styles.content}>
        {illustration}
        {showHeaderTitle ? null : <Text style={styles.title}>{title}</Text>}
        <Text style={styles.description}>{description}</Text>
        {children}
      </View>
    </BscModal>
  );
});

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingTop: BscSpacing.lg,
    paddingBottom: BscSpacing.xl,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    color: BscColors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...BscTextStyles['Body S/14 Regular'],
    marginTop: BscSpacing.xs,
    textAlign: 'center',
  },
  actions: {
    gap: BscSpacing.sm,
  },
});
