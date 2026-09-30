import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import Icon from '@react-native-vector-icons/feather';

import {BORDER_RADIUS, COLORS, DIMENSIONS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';
import {RootStackParamList} from '@/types/index';
import {AccessOrigin, useOnboardingStore} from '@store/onboarding.store';
import {useAuthStore} from '@store/auth.store';
import {useAutentikarVerification} from '@hooks/useAutentikarVerification';
import {useLoginPostAuthNavigation} from '@hooks/useLoginPostAuthNavigation';
import {formatName} from '@utils/helpers';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {ErrorServiceGeneral} from '@components/onboarding/ErrorServiceGeneral';
import {ProofOfLifeSuccessModal} from '@components/onboarding/ProofOfLifeSuccessModal';
import {ButtonPill} from '@components/Common/ButtonPill';

type ProofOfLifeRouteProp = RouteProp<RootStackParamList, 'ProofOfLife'>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Prueba de vida de Autentikar (cédula dominicana + rostro). Reutiliza `useAutentikarVerification`
 * para el ciclo backend + módulo nativo; esta pantalla solo aporta la UI y decide a dónde navegar
 * al terminar, según `accessOrigin` (mismo patrón que `ConfigureAuthBiometricScreen`):
 * - Registro (`ConfigureAuthBiometricScreen`): al completar la prueba de vida se avanza a
 *   'CompletedValidation'; en la omisión o el segundo fallo seguido se va directo a
 *   'WelcomeOnboarding'.
 * - Login (`LoginScreen`, cuando el backend devuelve `biometricLivenessRequired`): tanto al
 *   completarla como al omitirla se retoma el flujo normal de login (`useLoginPostAuthNavigation`),
 *   igual que si nunca se hubiera exigido la prueba de vida.
 */
export const ProofOfLifeScreen: React.FC = () => {
  const {t} = useTranslation('onboarding');
  const navigation = useNavigation<RootNavigationProp>();
  const {params} = useRoute<ProofOfLifeRouteProp>();
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const accessOrigin = useOnboardingStore(state => state.accessOrigin);
  const documentNumberFromToken = useAuthStore(state => state.user?.numeroDocumento);
  const {status, maxAttemptsReached, run} = useAutentikarVerification();
  const {proceedAfterLogin} = useLoginPostAuthNavigation();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const isLoginOrigin = accessOrigin === AccessOrigin.LOGIN;
  // Registro: viene del route param o de `verifiedClient` (verificación de documento). Login: no
  // hay verificación de documento en ese flujo, así que se lee del accessToken (claim
  // `document_number`, ver `AuthService.updateUserFromAccessToken`).
  const numeroDocumento =
    params?.numeroDocumento ?? verifiedClient?.numeroIdentificacion ?? documentNumberFromToken ?? '';
  const isBusy = status === 'starting' || status === 'verifying';

  // Login: retoma exactamente la misma decisión de navegación que se habría tomado justo después
  // del login/passkey si no se hubiera exigido la prueba de vida (Passkey/Biometría/Chat).
  const finishLoginFlow = async () => {
    await proceedAfterLogin(params?.username ?? '');
  };

  const goToWelcome = () => {
    if (isLoginOrigin) {
      finishLoginFlow();
      return;
    }
    navigation.replace('WelcomeOnboarding');
  };

  // Éxito de la prueba de vida: el registro del dispositivo seguro ya se resolvió al iniciar
  // Autentikar (ver `useAutentikarVerification`), así que se avanza a la pantalla de validación
  // completada, desde donde el usuario continúa a 'WelcomeOnboarding'. En Login no existe esa
  // pantalla intermedia: se retoma directo el flujo normal de login.
  const goToCompletedValidation = () => {
    if (isLoginOrigin) {
      finishLoginFlow();
      return;
    }
    navigation.replace('CompletedValidation');
  };

  const handleContinue = async () => {
    if (isBusy) {
      return;
    }

    if (!numeroDocumento) {
      setIsErrorModalOpen(true);
      return;
    }

    const completed = await run(numeroDocumento, params?.deviceId);
    if (completed) {
      setIsSuccessModalOpen(true);
    } else {
      setIsErrorModalOpen(true);
    }
  };

  // Al primer fallo, cerrar el modal solo deja al usuario reintentar con 'Continuar'. Al
  // segundo fallo seguido, cerrarlo avanza igual a 'Welcome' (registro) o retoma el flujo de
  // login (Login): en ambos casos el usuario puede continuar sin la prueba de vida completada.
  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false);
    if (maxAttemptsReached) {
      goToWelcome();
    }
  };

  const title = verifiedClient?.primerNombre
    ? t('proofOfLife.title', {name: formatName(verifiedClient.primerNombre)})
    : t('proofOfLife.titleDefault');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="shield" size={DIMENSIONS.iconSize.lg} color={COLORS.secondary} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{t('proofOfLife.subtitle')}</Text>

        <Image
          source={require('@assets/biometric-face-color.png')}
          style={styles.faceImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomButtons}>
        <ButtonPill
          onPress={handleContinue}
          width="100%"
          backgroundColor={COLORS.primary}
          textColor={COLORS.backgroundLight}
          disabled={isBusy}>
          {isBusy ? t('proofOfLife.verifyingButton') : t('proofOfLife.startButton')}
        </ButtonPill>
        <TouchableOpacity onPress={goToWelcome} disabled={isBusy} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>{t('proofOfLife.skipButton')}</Text>
        </TouchableOpacity>
      </View>

      <ProofOfLifeSuccessModal
        visible={isSuccessModalOpen}
        onContinue={() => {
          setIsSuccessModalOpen(false);
          goToCompletedValidation();
        }}
      />

      <ErrorServiceGeneral visible={isErrorModalOpen} onClose={handleErrorModalClose} />
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
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
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
  faceImage: {
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
