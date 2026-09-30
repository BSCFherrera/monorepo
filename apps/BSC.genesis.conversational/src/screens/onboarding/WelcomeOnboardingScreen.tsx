import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {COLORS} from '@constants/theme';
import {useAndroidBackHandler} from '@hooks/index';
import {useOnboardingStore} from '@store/onboarding.store';
import {useAuthStore} from '@store/auth.store';

// COMPONENTS
import {HeaderOnboarding} from '@components/onboarding/HeaderOnboarding';
import {WelcomeModal} from '@components/onboarding/WelcomeModal';

// Normaliza el nombre: primera letra mayúscula, el resto minúsculas
const formatUserName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

export const WelcomeOnboardingScreen: React.FC = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const verifiedClient = useOnboardingStore(state => state.verifiedClient);
  const authenticate = useAuthStore(state => state.login);
  const userName = verifiedClient?.primerNombre
    ? formatUserName(verifiedClient.primerNombre)
    : undefined;

  // Bloquea el back nativo (botón/gesto) de Android: no se puede retroceder desde esta pantalla
  useAndroidBackHandler(() => {});

  const handleAccessChat = () => {
    setShowWelcomeModal(false);

    // El registro ya generó una sesión válida (login real contra AuthService en
    // CreateUserOnboardingScreen), así que acá solo queda marcarla como autenticada. La navegación
    // a 'Chat' la resuelve `Navigation` de forma centralizada al reaccionar al cambio de
    // `isAuthenticated` (ver comentario en `src/navigation/Navigation.tsx`): esta pantalla es
    // pública y puede quedar desmontada por ese mismo cambio de stack antes de que un efecto local
    // aquí llegara a ejecutarse.
    authenticate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <HeaderOnboarding showBottomLine />

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onAccessChat={handleAccessChat}
        userName={userName}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
});
