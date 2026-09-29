import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {RootStackParamList} from '@/types/index';
import Icon from '@react-native-vector-icons/feather';
import {AuthService} from '@services/index';
import {usePasskeyRegistration} from '@hooks/usePasskeyRegistration';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ConfigurePasskeyRouteProp = RouteProp<RootStackParamList, 'ConfigurePasskey'>;

const BenefitItem: React.FC<{text: string}> = ({text}) => (
  <View style={styles.benefitRow}>
    <View style={styles.benefitCheckCircle}>
      <Icon name="check" size={9} color={COLORS.backgroundLight} />
    </View>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

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
          <View style={styles.titleBadgeCircle}>
            <Icon name="key" size={DIMENSIONS.iconSize.md} color={COLORS.backgroundLight} />
          </View>

          <Text style={styles.title}>{t('configureAuthPasskey.title')}</Text>
          <Text style={styles.subtitle}>{t('configureAuthPasskey.subtitle')}</Text>

          <View style={styles.passkeyBox}>
            <View style={styles.keyCircle}>
              <Icon name="key" size={DIMENSIONS.iconSize.lg} color={COLORS.primary} />
            </View>

            <Text style={styles.boxTitle}>{t('configureAuthPasskey.boxTitle')}</Text>
            <Text style={styles.boxSubtitle}>{t('configureAuthPasskey.boxSubtitle')}</Text>

            <View style={styles.benefitsList}>
              <BenefitItem text={t('configureAuthPasskey.benefit1')} />
              <BenefitItem text={t('configureAuthPasskey.benefit2')} />
              <BenefitItem text={t('configureAuthPasskey.benefit3')} />
            </View>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            onPress={handleActivate}
            disabled={isActivateDisabled}
            style={[styles.activateButton, isActivateDisabled && styles.activateButtonDisabled]}>
            <Icon name="key" size={DIMENSIONS.iconSize.sm} color={COLORS.backgroundLight} />
            <Text style={styles.activateButtonText}>
              {isRegistering
                ? t('configureAuthPasskey.activatingButton')
                : t('configureAuthPasskey.activateButton')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            disabled={isNavigating}
            style={styles.skipButton}>
            <Text style={styles.skipButtonText}>{t('configureAuthPasskey.skipButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: SPACING.md,
  },
  titleBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  passkeyBox: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  keyCircle: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  boxTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  boxSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  benefitsList: {
    width: '100%',
    gap: SPACING.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  bottomButtons: {
    paddingTop: SPACING.md,
  },
  activateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  activateButtonDisabled: {
    opacity: 0.6,
  },
  activateButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.backgroundLight,
  },
  skipButton: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  skipButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: SPACING.sm,
  },
});
