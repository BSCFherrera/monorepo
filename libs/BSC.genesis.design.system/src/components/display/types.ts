import type { ReactNode } from 'react';

export interface InfoCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconName?: string;
  iconBackgroundColor?: string;
  children?: ReactNode;
  testID?: string;
  style?: object;
}

export interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconName?: string;
  variant?: 'standard' | 'registration';
  onPress: () => void;
  disabled?: boolean;
  actionLabel?: string;
}

export interface StepsProps {
  labels?: readonly string[];
  current: number;
  totalSteps?: number;
}

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
  animated?: boolean;
}
