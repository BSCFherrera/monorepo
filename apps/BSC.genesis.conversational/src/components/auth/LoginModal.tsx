import { BscColors, BscSheet, BscTextField, BscTextStyles } from '@bsc/design-system';
import { EMAIL_MAX_LENGTH } from '@utils/helpers';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export const LoginModal = forwardRef<>((_, ref) => {
  const { t } = useTranslation('auth');
  return (
    <>
      <div></div>
    </>
  );
});

const styles = StyleSheet.create({
  titulo: {
    ...BscTextStyles['Title L/48 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  subtitle: {
    ...BscTextStyles['Subtitle/20 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
});
