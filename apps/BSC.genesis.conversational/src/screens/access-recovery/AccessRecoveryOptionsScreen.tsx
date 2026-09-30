import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {useTranslation} from 'react-i18next';
import {TouchableCard} from '@components/Common';
import {useNavigation} from '@react-navigation/native';
import {RecoveryType, RootStackParamList} from '@/types/index';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAccesRecoveryStore} from '@store/access-recovery.store';

type AccessRecoveryOptionsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AccessRecovery'
>;

export const AccessRecoveryOptionsScreen: React.FC = () => {
  const {t} = useTranslation('accessRecovery');
  const navigation = useNavigation<AccessRecoveryOptionsScreenNavigationProp>();
  const setRecoveryType = useAccesRecoveryStore(state => state.setRecoveryType);

  const handleRecoveryPress = (type: RecoveryType) => {
    setRecoveryType(type);
    navigation.navigate('AccountIdentification');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('recoveryOptions.title')}</Text>
        <Text style={styles.subtitle}>{t('recoveryOptions.description')}</Text>

        <TouchableCard
          title={t('recoveryOptions.userRecoverySubtitle')}
          subtitle={t('recoveryOptions.userRecoveryLabel')}
          iconName="user-plus"
          onPress={() => handleRecoveryPress('USERNAME')}
        />

        <TouchableCard
          title={t('recoveryOptions.passwordRecoverySubtitle')}
          subtitle={t('recoveryOptions.passwordRecoveryLabel')}
          iconName="refresh-ccw"
          onPress={() => handleRecoveryPress('PASSWORD')}
        />

        <TouchableCard
          title={t('recoveryOptions.bothRecoverySubtitle')}
          subtitle={t('recoveryOptions.bothRecoveryLabel')}
          iconName="help-circle"
          onPress={() => handleRecoveryPress('BOTH')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md + SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'justify',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    paddingLeft: 10,
  },
});
