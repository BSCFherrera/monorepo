import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HeaderOnboarding } from '@components/onboarding/HeaderOnboarding';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  DIMENSIONS,
  BORDER_RADIUS,
} from '@constants/theme';
import { Card } from '@components/Common/Card';
import { TextField } from '@components/Common/TextField';
import { ButtonPill } from '@components/Common/ButtonPill';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { RootStackParamList } from '@/types/index';
import { Steps } from '@components/Common/Steps';
import { maskEmail } from '@utils/helpers';
import Clipboard from '@react-native-clipboard/clipboard';
import { APP_CONFIG } from '@constants/config';
import {
  BscColors,
  BscNavigationHeader,
  BscRadius,
  BscSpacing,
  BscSteps,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const UsernameRecoveryScreen = () => {
  const { t } = useTranslation('accessRecovery');
  const userEmail = useAccesRecoveryStore(state => state.userEmail);
  const clearVerifiedClient = useAccesRecoveryStore(state => state.clearVerifiedClient);
  const navigation = useNavigation<RootNavigationProp>();
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(userEmail);

  const handleContinue = () => {
    navigation.navigate('ResetPassword');
  };

  const handleBack = () => {
    navigation.navigate('Inicio');
    clearVerifiedClient();
  };

  useEffect(() => {
    if (showPassword) {
      setEmail(userEmail);
    } else {
      setEmail(maskEmail(userEmail || ''));
    }
  }, [showPassword, userEmail]);

  const onCopy = () => {
    Clipboard.setString(userEmail || '');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader
        onBack={handleBack}
        onClose={handleBack}
        showSupportButton
        title={t('userRecovery.titleNavbar')}
      />

      <BscSteps totalSteps={recoveryType === 'BOTH' ? 5 : 5} current={3} style={styles.steps} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card
          style={styles.titleCard}
          title={t('userRecovery.title')}
          subtitle={t('userRecovery.subtitle')}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
          iconName="shield"
          iconBackgroundColor={COLORS.secondary}
        />
        <Text style={styles.label}>{t('userRecovery.description')}</Text>
        <View style={styles.contentUser}>
          <View style={styles.row}>
            <Icon name="user-check" size={DIMENSIONS.iconSize.md} color={COLORS.primary} />
            <Text style={styles.label}>{t('userRecovery.userLabel')}</Text>
          </View>
          <TextField
            width="100%"
            value={email || ''}
            iconName={showPassword ? 'eye-off' : 'eye'}
            iconPosition="right"
            readOnly
            copyable
            onCopy={onCopy}
            onIconPress={() => setShowPassword(prev => !prev)}
          />
        </View>
        <View style={styles.bottomButtons}>
          {(recoveryType === 'BOTH' || !APP_CONFIG.BOTH_RECOVERY) && (
            <View style={styles.continueButtonContainer}>
              <ButtonPill
                onPress={handleContinue}
                width="100%"
                backgroundColor={COLORS.primary}
                textColor={COLORS.backgroundLight}
              >
                {t('userRecovery.continue')}
              </ButtonPill>
            </View>
          )}
          <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
            <Icon name="log-in" size={DIMENSIONS.iconSize.sm} color={COLORS.textPrimary} />
            <Text style={styles.exitButtonText}>{t('userRecovery.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  scroll: {
    flex: 1,
  },
  row: {
    marginVertical: BscSpacing.sm,
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    paddingHorizontal: BscSpacing.md + BscSpacing.sm,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.lg,
    gap: 15,
  },
  contentUser: {
    paddingHorizontal: BscSpacing.sm + BscSpacing.sm,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.lg,
    borderRadius: BscRadius.md,
    backgroundColor: COLORS.backgroundDark,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.backgroundDark,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: BscSpacing.xs,
  },
  titleCard: {
    backgroundColor: COLORS.primaryDark,
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
  },
  continueButtonContainer: {
    marginBottom: BscSpacing.sm,
  },
  exitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: BscSpacing.sm,
    gap: 10,
  },
  exitButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: BscSpacing.sm,
  },
  steps: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
});
