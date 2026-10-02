import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BscCard, BscColors, BscIcon, BscIconName, BscSpacing, BscTextStyles} from '@bsc/design-system';

export interface VerificationStep {
  title: string;
  subtitle: string;
  done: boolean;
  /** Ícono mostrado mientras el paso está pendiente (una vez `done`, siempre se usa "check"). */
  icon: BscIconName;
}

interface VerificationStepperProps {
  steps: readonly VerificationStep[];
}

/**
 * Checklist de progreso de registro (ver Figma "IdentityVerifiedScreen"/"Registro finalizado"):
 * un círculo de ícono por paso — verde con check si ya está hecho, gris con su propio ícono si
 * está pendiente — conectados por una línea vertical entre pasos.
 */
export const VerificationStepper: React.FC<VerificationStepperProps> = ({steps}) => {
  return (
    <BscCard style={styles.card}>
      {steps.map((step, index) => (
        <View key={step.title} style={styles.row}>
          <View style={styles.indicatorColumn}>
            <View
              style={[
                styles.iconCircle,
                step.done ? styles.iconCircleDone : styles.iconCirclePending,
              ]}>
              <BscIcon
                name={step.done ? 'check' : step.icon}
                size={20}
                color={step.done ? BscColors.textOnPrimary : BscColors.textSecondary}
              />
            </View>
            {index < steps.length - 1 && <View style={styles.connector} />}
          </View>

          <View style={styles.textColumn}>
            <Text style={[styles.title, step.done ? styles.titleDone : styles.titlePending]}>
              {step.title}
            </Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          </View>
        </View>
      ))}
    </BscCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: BscSpacing.md,
  },
  indicatorColumn: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleDone: {
    backgroundColor: BscColors.success,
  },
  iconCirclePending: {
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  connector: {
    flex: 1,
    width: 2,
    minHeight: 20,
    backgroundColor: BscColors.border,
  },
  textColumn: {
    flex: 1,
    paddingBottom: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Body MD/16 Medium'],
    marginBottom: BscSpacing.xxs,
  },
  titleDone: {
    color: BscColors.success,
  },
  titlePending: {
    color: BscColors.textPrimary,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
});
