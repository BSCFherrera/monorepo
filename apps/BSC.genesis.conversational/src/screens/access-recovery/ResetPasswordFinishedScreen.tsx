import { RootStackParamList } from '@/types/index';
import { BscColors, BscPrimaryButton, BscSpacing, BscTextStyles } from '@bsc/design-system';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAccesRecoveryStore } from '@store/access-recovery.store';
import { formatName } from '@utils/helpers';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ResetPasswordFinishedScreen = () => {
  const { t } = useTranslation('accessRecovery');
  const navigation = useNavigation<RootNavigationProp>();
  const verifiedClient = useAccesRecoveryStore(state => state.verifiedClient);
  const clearVerifiedClient = useAccesRecoveryStore(state => state.clearVerifiedClient);

  const handleContinueSuccess = () => {
    navigation.navigate('Inicio');
    clearVerifiedClient();
  };

  const subTitle = t('passwordRecovery.finishSubtitle', {
    firstName: formatName(verifiedClient?.primerNombre || ''),
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('passwordRecovery.finishTitle')}</Text>
        <Text style={styles.subtitle}>{subTitle}</Text>

        <View style={styles.content}>
          <BscPrimaryButton
            label={t('passwordRecovery.login')}
            onPress={handleContinueSuccess}
            testID="button-to-login"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BscColors.surface,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.xl,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  scroll: {
    flex: 1,
  },
  row: {
    marginVertical: BscSpacing.sm,
    flexDirection: 'row',
    gap: 10,
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
});
