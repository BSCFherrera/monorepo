import React from 'react';
import {Alert, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {
  BORDER_RADIUS,
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '@constants/theme';
import {RootStackParamList} from '@/types/index';
import {AccessOrigin, useOnboardingStore} from '@store/onboarding.store';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {ButtonPill} from '@components/Common/ButtonPill';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Normaliza el nombre: primera letra mayúscula, el resto minúsculas
const formatUserName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

export const RegisterSecureDeviceScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const accessOrigin = useOnboardingStore(state => state.accessOrigin);

  const title = verifiedClient?.primerNombre
    ? t('registerSecureDevice.title', {name: formatUserName(verifiedClient.primerNombre)})
    : t('registerSecureDevice.titleDefault');

  const handleContinue = () => {
    Alert.alert('', t('registerSecureDevice.livenessAlertMessage'));
  };

  const handleSkip = () => {
    switch (accessOrigin) {
      case AccessOrigin.REGISTER:
        navigation.navigate('WelcomeOnboarding');
        break;
      case AccessOrigin.LOGIN:
        navigation.navigate('CustomerDataConfirmOtp');
        break;
      case AccessOrigin.CONFIGURATION:
        // TODO: definir navegación para el flujo de configuración
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <View style={styles.content}>
        <View style={styles.shieldIconCircle}>
          <Icon name="shield" size={DIMENSIONS.iconSize.lg} color={COLORS.secondary} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{t('registerSecureDevice.subtitle')}</Text>

        <Image
          source={require('@assets/biometric-face-color.png')}
          style={styles.biometricImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomButtons}>
        <ButtonPill
          onPress={handleContinue}
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}>
          {t('registerSecureDevice.continueButton')}
        </ButtonPill>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>{t('registerSecureDevice.skipButton')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  shieldIconCircle: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
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
  },
  biometricImage: {
    width: 120,
    height: 120,
    marginTop: SPACING.xl,
  },
  bottomButtons: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: SPACING.sm,
  },
});
