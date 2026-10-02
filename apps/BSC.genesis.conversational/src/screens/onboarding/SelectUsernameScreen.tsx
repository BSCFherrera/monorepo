import React, {useMemo, useState} from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '@/types/index';
import {useOnboardingStore} from '@store/index';
import {useKeyboardOffset} from '@hooks/useKeyboardOffset';
import {maskEmail} from '@utils/helpers';

// COMPONENTS
import {
  BscColors,
  BscNavigationHeader,
  BscPrimaryButton,
  BscSelectableListGroup,
  BscSelectableListGroupOption,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectUsernameRouteProp = RouteProp<RootStackParamList, 'SelectUsername'>;

/**
 * Entre la confirmación de contactos y la creación de contraseña: el cliente puede tener más de
 * un correo registrado, y este paso decide cuál de ellos queda como usuario de acceso a la app
 * (ver Figma "ContactMethodScreen/Default", sección "Usuario y contraseña"). La elección se
 * guarda en `verifiedEmail` del store de onboarding, el mismo campo que ya consume
 * `CreateUserOnboardingScreen` para precargar el campo de usuario, y que `FirmaDeDocumentoScreen`
 * también lee para avisar a qué correo se enviará el documento firmado.
 */
export const SelectUsernameScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const {params} = useRoute<SelectUsernameRouteProp>();
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const setVerifiedEmail = useOnboardingStore(state => state.setVerifiedEmail);
  const keyboardOffset = useKeyboardOffset();

  const emailList = useMemo(() => verifiedClient?.emails ?? [], [verifiedClient]);
  // Con un solo correo registrado no hay nada que elegir: se preselecciona (igual que el resto
  // de listas seleccionables de este flujo cuando solo hay una opción disponible).
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    emailList.length === 1 ? 0 : null,
  );

  const options: readonly BscSelectableListGroupOption[] = useMemo(
    () =>
      emailList.map((item, index) => ({
        value: String(index),
        icon: 'mail',
        title: maskEmail(item.email),
      })),
    [emailList],
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleContinue = () => {
    if (selectedIndex === null) {
      return;
    }

    const email = emailList[selectedIndex]?.email ?? '';
    setVerifiedEmail(email);
    navigation.navigate('CreateUserOnboarding', {cedula: params.cedula});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BscNavigationHeader onBack={handleBack} showSupportButton title="Usuario" />
      <Animated.View style={[styles.keyboardContainer, {paddingBottom: keyboardOffset}]}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('selectUsername.title')}</Text>
          <Text style={styles.subtitle}>{t('selectUsername.subtitle')}</Text>

          <BscSelectableListGroup
            options={options}
            value={selectedIndex === null ? '' : String(selectedIndex)}
            onChange={value => setSelectedIndex(Number(value))}
            disabled={options.length <= 1}
            testID="campo-usuario"
          />
        </ScrollView>

        <View style={styles.bottomButtons}>
          <BscPrimaryButton
            label={t('selectUsername.continueButton')}
            onPress={handleContinue}
            disabled={selectedIndex === null}
            testID="continuar-seleccion-usuario"
          />
          <BscTextButton
            label={t('selectUsername.exitButton')}
            onPress={handleBack}
            style={styles.exitButton}
          />
        </View>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.xl,
  },
  title: {
    ...BscTextStyles['Title XS/24 SemiBold'],
    textAlign: 'center',
    marginBottom: BscSpacing.sm,
  },
  subtitle: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
    marginBottom: BscSpacing.xl,
  },
  bottomButtons: {
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.md,
    paddingBottom: BscSpacing.sm,
    gap: BscSpacing.sm,
  },
  exitButton: {
    alignSelf: 'center',
  },
});
