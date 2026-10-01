import {
  BscColors,
  BscModal,
  BscPrimaryButton,
  BscSpacing,
  BscTextField,
  BscTextStyles,
  BscTypography,
} from '@bsc/design-system';
import { EMAIL_MAX_LENGTH } from '@utils/helpers';
import { useState, forwardRef, useEffect } from 'react';
import { BscModalHandle } from '@bsc/design-system';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface LoginModalProps {
  username: string;
  password: string;
  onChangeUsername: (text: string) => void;
  onChangePassword: (text: string) => void;
  error: string | null;
  loading: boolean;
  onHandleContinue: () => Promise<void>;
  handleAccessRecoveryPress: () => void;
}

/**
 * Hoja de usuario y contraseña.
 *
 * A diferencia de `LoginScreen.tsx`, no intenta Passkey antes de mostrar la
 * contraseña: en el Figma, "Entrar con Passkey" ya es su propio botón en la
 * pantalla principal, así que acá alcanza con un formulario directo.
 */
export const LoginModal = forwardRef<BscModalHandle, LoginModalProps>((props, ref) => {
  const {
    username,
    password,
    onChangeUsername,
    onChangePassword,
    error,
    loading,
    onHandleContinue,
    handleAccessRecoveryPress,
  } = props;
  const { t } = useTranslation('auth');
  const [isDirty, setIsDirty] = useState(false);

  const canContinue = username.trim() !== '' && password !== '' && !loading;

  const handleContinue = () => {
    try {
      setIsDirty(true);
      onHandleContinue?.();
    } catch (e) {
      console.log('Error al continuar con el login:', e);
    }
  };

  useEffect(() => {
    setIsDirty(false);
  }, []);

  const usuarioVacio = isDirty && username.trim() === '';
  const contrasenaVacia = isDirty && password === '';

  return (
    <>
      <BscModal ref={ref} presentation="expanded">
        <Text style={styles.title}>{t('credentialsSheet.title')}</Text>
        <Text style={styles.subtitle}>{t('credentialsSheet.subtitle')}</Text>

        <View style={styles.marginFields}>
          <BscTextField
            label={t('credentialsSheet.username.label')}
            value={username}
            onChangeText={onChangeUsername}
            placeholder={t('credentialsSheet.username.placeholder')}
            maxLength={EMAIL_MAX_LENGTH}
            error={usuarioVacio ? t('credentialsSheet.username.required') : undefined}
            testID="campo-usuario"
          />
        </View>

        <View style={styles.marginFields}>
          <BscTextField
            label={t('credentialsSheet.password.label')}
            value={password}
            onChangeText={onChangePassword}
            placeholder={t('credentialsSheet.password.placeholder')}
            error={contrasenaVacia ? t('credentialsSheet.password.required') : undefined}
            secure
            testID="campo-contrasena"
          />
        </View>
        <Text onPress={handleAccessRecoveryPress} style={styles.recovery}>
          {t('credentialsSheet.accessRecovery')}
        </Text>
        {error !== null ? (
          <Text style={styles.error} testID="hoja-error">
            {error}
          </Text>
        ) : null}
        <BscPrimaryButton
          label={t('credentialsSheet.continue')}
          loading={loading}
          onPress={canContinue ? handleContinue : undefined}
          testID="hoja-entrar"
        />
      </BscModal>
    </>
  );
});

const styles = StyleSheet.create({
  marginFields: {
    marginVertical: BscSpacing.sm,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'center',
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    textAlign: 'center',
  },
  recovery: {
    ...BscTextStyles['Caption/12 Regular'],
  },
  error: {
    ...BscTypography.bodyMedium,
    color: BscColors.error,
    marginBottom: BscSpacing.xs,
  },
});
