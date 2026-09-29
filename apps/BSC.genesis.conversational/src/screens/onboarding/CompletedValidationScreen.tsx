import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

// import {APP_CONFIG} from '@constants/config';
import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {RootStackParamList} from '@/types/index';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {ButtonPill} from '@components/Common/ButtonPill';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CompletedValidationScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();

  const handleExit = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // El dispositivo seguro ya quedó registrado en el paso previo (prueba de vida de Autentikar);
  // desde aquí solo se avanza a la bienvenida del onboarding.
  const handleContinue = () => {
    navigation.replace('WelcomeOnboarding');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <View style={styles.content}>
        <Image
          source={require('@assets/verified.png')}
          style={styles.verifiedIcon}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('completedValidation.title')}</Text>
        <Text style={styles.subtitle}>{t('completedValidation.subtitle')}</Text>
      </View>

      <View style={styles.bottomButtons}>
        <ButtonPill
          onPress={handleContinue}
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}>
          {t('completedValidation.continueButton')}
        </ButtonPill>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>{t('completedValidation.exitButton')}</Text>
        </TouchableOpacity>
        {/* <Text style={styles.versionText}>{`v${APP_CONFIG.APP_VERSION}`}</Text> */}
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
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  verifiedIcon: {
    width: 50,
    height: 50,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomButtons: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  exitButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  exitButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: SPACING.sm,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    textAlign: 'center',
  },
});
