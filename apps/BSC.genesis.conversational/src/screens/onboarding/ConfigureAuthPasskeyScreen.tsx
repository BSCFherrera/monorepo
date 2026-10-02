import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {AuthService} from '@services/index';
import {usePasskeyRegistration} from '@hooks/usePasskeyRegistration';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {
  BscCard,
  BscColors,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPrimaryButton,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ConfigurePasskeyRouteProp = RouteProp<RootStackParamList, 'ConfigurePasskey'>;

/**
 * Ofrece registrar un Passkey justo después de un login exitoso con usuario/contraseña (ver
 * `LoginScreen.handlePasswordLogin`), en el mismo punto del flujo donde `ConfigureAuthBiometricScreen`
 * ofrece activar la biometría: "Crear passkey"/"Ahora no" siempre continúan hacia esa pantalla a
 * continuación, así que ambos accesos rápidos quedan disponibles para configurarse en la misma
 * sesión de login. Es esta pantalla (no `ConfigureAuthBiometricScreen`) la que queda como
 * responsable de decidir a dónde ir tras marcar la sesión: eso lo sigue haciendo
 * `ConfigureAuthBiometricScreen` según `accessOrigin`, sin duplicar esa lógica acá.
 *
 * Por ahora solo se ofrece desde el login con contraseña; todavía no está enganchada al flujo de
 * registro de cuenta nueva (`CreateUserOnboardingScreen`) ni a una pantalla de configuración
 * post-login independiente.
 */
export const ConfigureAuthPasskeyScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const {
    params: {email},
  } = useRoute<ConfigurePasskeyRouteProp>();
  const {isRegistering, registerPasskey} = usePasskeyRegistration();

  const [isNavigating, setIsNavigating] = useState(false);
  const isPasskeySupported = AuthService.isPasskeySupported();

  const navigateNext = () => {
    navigation.navigate('ConfigureAuthBiometric');
  };

  const handleActivate = async () => {
    if (isRegistering || isNavigating) {
      return;
    }

    if (!isPasskeySupported) {
      Alert.alert(
        t('configureAuthPasskey.unavailableTitle'),
        t('configureAuthPasskey.unavailableMessage'),
      );
      return;
    }

    const outcome = await registerPasskey(email);

    if (outcome.status === 'cancelled') {
      Alert.alert(
        t('configureAuthPasskey.enableCancelledTitle'),
        t('configureAuthPasskey.enableCancelledMessage'),
      );
      return;
    }

    if (outcome.status === 'error') {
      console.log('[ConfigureAuthPasskeyScreen] registerPasskey error', outcome.error);
      Alert.alert(
        t('configureAuthPasskey.enableErrorTitle'),
        outcome.error.message || t('configureAuthPasskey.enableErrorMessage'),
      );
      return;
    }

    setIsNavigating(true);
    navigateNext();
  };

  const handleSkip = () => {
    if (isNavigating) {
      return;
    }
    setIsNavigating(true);
    navigateNext();
  };

  const isActivateDisabled = isRegistering || isNavigating;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding />

      <View style={styles.mainContent}>
        <View style={styles.content}>
          <BscIconTile
            icon="lock"
            size={44}
            iconSize={20}
            color={BscColors.textOnPrimary}
            background={BscColors.primary}
          />

          <Text style={styles.title}>{t('configureAuthPasskey.title')}</Text>
          <Text style={styles.subtitle}>{t('configureAuthPasskey.subtitle')}</Text>

          <BscCard style={styles.passkeyBox}>
            <BscIconTile icon="lock" size={64} iconSize={32} />

            <Text style={styles.boxTitle}>{t('configureAuthPasskey.boxTitle')}</Text>
            <Text style={styles.boxSubtitle}>{t('configureAuthPasskey.boxSubtitle')}</Text>

            <View style={styles.benefitsList}>
              {[
                t('configureAuthPasskey.benefit1'),
                t('configureAuthPasskey.benefit2'),
                t('configureAuthPasskey.benefit3'),
              ].map(benefit => (
                <BscListRow
                  key={benefit}
                  leading={
                    <BscIconTile
                      icon="check"
                      size={24}
                      iconSize={14}
                      color={BscColors.textOnPrimary}
                      background={BscColors.primary}
                    />
                  }
                  title={benefit}
                />
              ))}
            </View>
          </BscCard>
        </View>

        <View style={styles.bottomButtons}>
          <BscPrimaryButton
            label={
              isRegistering
                ? t('configureAuthPasskey.activatingButton')
                : t('configureAuthPasskey.activateButton')
            }
            onPress={handleActivate}
            disabled={isActivateDisabled}
            loading={isRegistering}
            leading={<BscIcon name="lock" size={18} color={BscColors.textOnPrimary} />}
            testID="activar-passkey"
          />
          <BscTextButton
            label={t('configureAuthPasskey.skipButton')}
            onPress={handleSkip}
            disabled={isNavigating}
            style={styles.skipButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: BscSpacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: BscSpacing.md,
    alignItems: 'center',
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'center',
    marginTop: BscSpacing.lg,
    marginBottom: BscSpacing.sm,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    marginBottom: BscSpacing.xl,
  },
  passkeyBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: BscSpacing.lg,
  },
  boxTitle: {
    ...BscTextStyles['Body S/14 SemiBold'],
    textAlign: 'center',
    marginTop: BscSpacing.md,
    marginBottom: BscSpacing.xs,
  },
  boxSubtitle: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    marginBottom: BscSpacing.md,
  },
  benefitsList: {
    width: '100%',
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.sm,
    gap: BscSpacing.sm,
  },
  skipButton: {
    alignSelf: 'center',
  },
});
