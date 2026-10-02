import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, DIMENSIONS } from '@constants/theme';
import { PASSWORD_MAX_LENGTH } from '@utils/helpers';

import { Steps } from '@components/Common/Steps';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { TextField } from '@components/Common/TextField';
import { ErrorText } from '@components/Common/ErrorText';
import { HeaderOnboarding } from '@components/onboarding/HeaderOnboarding';
import { useKeyboardOffset } from '@hooks/useKeyboardOffset';
import { PasswordStrengthMeter } from '@components/onboarding/PasswordStrengthMeter';
import { ModalRef, RootStackParamList } from '@/types/index';
import { ButtonPill } from '@components/Common/ButtonPill';
import { ErrorServiceGeneral } from '@components/Common/ErrorServiceGeneral';
import { AccessRecoveryService } from '@services/index';
import { SuccessModal } from '@components/Common/SuccessModal';
import {
  BscColors,
  BscNavigationHeader,
  BscSpacing,
  BscSteps,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ResetPasswordScreen = () => {
  const { t } = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const verifiedClient = useAccesRecoveryStore(state => state.verifiedClient);

  const keyboardOffset = useKeyboardOffset();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  const errorServiceGeneralRef = useRef<ModalRef>(null);
  const successModalRef = useRef<ModalRef>(null);

  const isPasswordValid = useMemo(
    () => /^(?=.{8,20}$)(?=.*[A-Za-z])(?=.*\d).+$/.test(password),
    [password],
  );
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;
  const canContinue = isPasswordValid && isConfirmPasswordValid && !isRecoveringPassword;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPasswordError('');
    setConfirmPassword(text);
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordError(
      confirmPassword && confirmPassword !== password ? t('createUser.confirmPasswordError') : '',
    );
  };

  const getUserId = async (): Promise<string | null> => {
    try {
      const user = await AccessRecoveryService.getUserIdByInternalId(verifiedClient!.codigoPersona);
      return user.id;
    } catch {
      return null;
    }
  };

  const recoveryPassword = async (userId: string): Promise<boolean> => {
    try {
      await AccessRecoveryService.changePassword(userId, password);
      return true;
    } catch {
      return false;
    }
  };

  const handleContinueSuccess = () => {
    navigation.navigate('ResetPasswordFinished');
  };

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }
    setIsRecoveringPassword(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        return;
      }

      const success = await recoveryPassword(userId);
      if (!success) {
        return;
      }
      successModalRef.current?.open();
    } catch {
      errorServiceGeneralRef.current?.open();
    } finally {
      setIsRecoveringPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View style={[styles.keyboardContainer, { paddingBottom: keyboardOffset }]}>
        <BscNavigationHeader
          onBack={handleBack}
          onClose={handleBack}
          showSupportButton
          title={t('passwordRecovery.titleNavbar')}
        />

        <BscSteps totalSteps={recoveryType === 'BOTH' ? 5 : 5} current={3} style={styles.steps} />
        <View style={styles.mainContent}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{t('passwordRecovery.title')}</Text>
            <Text style={styles.subtitle}>{t('passwordRecovery.subtitle')}</Text>

            <Text style={[styles.label, styles.labelSpacing]}>
              {t('passwordRecovery.passwordLabel')}
            </Text>
            <TextField
              width="100%"
              value={password}
              placeholder={t('passwordRecovery.passwordPlaceholder')}
              onChangeText={setPassword}
              maxLength={PASSWORD_MAX_LENGTH}
              secureTextEntry={!showPassword}
              iconName={showPassword ? 'eye-off' : 'eye'}
              iconPosition="right"
              onIconPress={() => setShowPassword(prev => !prev)}
            />
            <PasswordStrengthMeter password={password} />
            <Text style={styles.hintText}>{t('passwordRecovery.passwordHint')}</Text>

            <Text style={[styles.label, styles.labelSpacing]}>
              {t('passwordRecovery.confirmPasswordLabel')}
            </Text>
            <TextField
              width="100%"
              value={confirmPassword}
              placeholder={t('passwordRecovery.confirmPasswordPlaceholder')}
              onChangeText={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              maxLength={PASSWORD_MAX_LENGTH}
              secureTextEntry={!showConfirmPassword}
              error={!!confirmPasswordError}
              rightElement={
                <View style={styles.confirmIconsRow}>
                  {isConfirmPasswordValid && (
                    <Icon
                      name="check-circle"
                      size={DIMENSIONS.iconSize.sm}
                      color={COLORS.success}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={DIMENSIONS.iconSize.sm}
                      color={COLORS.border}
                    />
                  </TouchableOpacity>
                </View>
              }
            />
            {confirmPasswordError ? <ErrorText text={confirmPasswordError} /> : null}
          </ScrollView>
          <View style={styles.bottomButtons}>
            <View style={styles.continueButtonContainer}>
              <ButtonPill
                onPress={handleContinue}
                disabled={!canContinue}
                width="100%"
                backgroundColor={COLORS.primary}
                textColor={COLORS.backgroundLight}
              >
                {t('passwordRecovery.continueButton')}
              </ButtonPill>
            </View>
            <TouchableOpacity onPress={handleBack} style={styles.exitButton}>
              <Text style={styles.exitButtonText}>{t('passwordRecovery.exitButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <SuccessModal
          ref={successModalRef}
          onContinue={handleContinueSuccess}
          nameTranslation="accessRecovery"
        />
        <ErrorServiceGeneral ref={errorServiceGeneralRef} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  keyboardContainer: {
    flex: 1,
  },
  steps: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: BscSpacing.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.lg,
  },
  title: {
    ...BscTextStyles['Title S/30 Bold'],
    textAlign: 'center',
    marginTop: BscSpacing.md,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    textAlign: 'center',
    marginBottom: BscSpacing.xl,
  },
  label: {
    ...BscTextStyles['Caption/12 Regular'],
    marginBottom: BscSpacing.xs,
    paddingLeft: 10,
  },
  labelSpacing: {
    marginTop: BscSpacing.lg,
  },
  hintText: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.secondary,
    marginTop: BscSpacing.xs,
    lineHeight: 18,
  },
  confirmIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
  },
  continueButtonContainer: {
    marginBottom: BscSpacing.sm,
  },
  exitButton: {
    alignItems: 'center',
    paddingVertical: BscSpacing.sm,
  },
  exitButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: BscSpacing.sm,
  },
});
