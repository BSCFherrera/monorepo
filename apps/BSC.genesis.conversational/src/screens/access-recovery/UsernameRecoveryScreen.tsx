import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { RootStackParamList } from '@/types/index';
import { maskEmail } from '@utils/helpers';
import Clipboard from '@react-native-clipboard/clipboard';
import { APP_CONFIG } from '@constants/config';
import {
  BscCard,
  BscColors,
  BscIcon,
  BscIconTile,
  BscNavigationHeader,
  BscPrimaryButton,
  BscSpacing,
  BscSteps,
  BscTextButton,
  BscTextField,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const UsernameRecoveryScreen = () => {
  const { t } = useTranslation('accessRecovery');
  const userEmail = useAccesRecoveryStore(state => state.userEmail);
  const clearVerifiedClient = useAccesRecoveryStore(state => state.clearVerifiedClient);
  const navigation = useNavigation<RootNavigationProp>();
  const recoveryType = useAccesRecoveryStore(state => state.recoveryType);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState(userEmail);

  const handleContinue = () => {
    navigation.navigate('ResetPassword');
  };

  const handleBack = () => {
    navigation.navigate('Inicio');
    clearVerifiedClient();
  };

  useEffect(() => {
    if (showEmail) {
      setEmail(userEmail);
    } else {
      setEmail(maskEmail(userEmail || ''));
    }
  }, [showEmail, userEmail]);

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

      <BscSteps totalSteps={5} current={3} style={styles.steps} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BscCard style={styles.titleCard}>
          <BscIconTile
            icon="shield-check"
            color={BscColors.textOnPrimary}
            background={BscColors.secondary}
          />
          <Text style={styles.titleCardTitle}>{t('userRecovery.title')}</Text>
          <Text style={styles.titleCardSubtitle}>{t('userRecovery.subtitle')}</Text>
        </BscCard>
        <Text style={styles.label}>{t('userRecovery.description')}</Text>
        <View style={styles.contentUser}>
          <View style={styles.row}>
            <BscIcon name="verified" size={20} color={BscColors.primary} />
            <Text style={styles.label}>{t('userRecovery.userLabel')}</Text>
          </View>
          <BscTextField
            label=""
            value={email || ''}
            onChangeText={() => {}}
            editable={false}
            testID="campo-usuario"
          />
          <View style={styles.fieldActions}>
            <BscTextButton
              label={showEmail ? t('userRecovery.hideButton') : t('userRecovery.showButton')}
              leading={
                <BscIcon
                  name={showEmail ? 'eye-off' : 'eye'}
                  size={16}
                  color={BscColors.primary}
                />
              }
              onPress={() => setShowEmail(prev => !prev)}
            />
            <BscTextButton label={t('userRecovery.copyButton')} onPress={onCopy} />
          </View>
        </View>
        <View style={styles.bottomButtons}>
          {(recoveryType === 'BOTH' || !APP_CONFIG.BOTH_RECOVERY) && (
            <View style={styles.continueButtonContainer}>
              <BscPrimaryButton
                label={t('userRecovery.continue')}
                onPress={handleContinue}
                testID="continuar-recuperar-usuario"
              />
            </View>
          )}
          <BscTextButton
            label={t('userRecovery.backToLogin')}
            leading={<BscIcon name="arrow-in" size={16} color={BscColors.textSecondary} />}
            onPress={handleBack}
            style={styles.exitButton}
          />
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
    borderRadius: 12,
    backgroundColor: BscColors.surfaceMuted,
  },
  label: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
    marginBottom: BscSpacing.xs,
  },
  titleCard: {
    alignItems: 'center',
    backgroundColor: BscColors.primaryDark,
  },
  titleCardTitle: {
    ...BscTextStyles['Title XS/24 SemiBold'],
    color: BscColors.textOnPrimary,
    textAlign: 'center',
    marginTop: BscSpacing.sm,
  },
  titleCardSubtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
    marginTop: BscSpacing.xs,
  },
  steps: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
  fieldActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: BscSpacing.xs,
  },
  bottomButtons: {
    paddingTop: BscSpacing.md,
  },
  continueButtonContainer: {
    marginBottom: BscSpacing.sm,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
