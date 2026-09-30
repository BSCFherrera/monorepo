import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '@/types/index';
import {AuthService} from '@services/index';
import {useAuthStore} from '@store/auth.store';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProceedAfterLoginOptions {
  /** Notifica cuando se desactivó la biometría de otra cuenta, para que quien llama (ej.
   * `LoginScreen`) pueda refrescar su propio estado local de UI. */
  onDifferentAccountEnrolled?: () => void;
}

/**
 * Decide a dónde navegar después de CUALQUIER autenticación de login exitosa (contraseña,
 * Passkey, o al terminar/omitir la prueba de vida de Autentikar cuando el backend la exigió vía
 * `biometricLivenessRequired`): revoca la biometría configurada si pertenece a otra cuenta, ofrece
 * configurar Passkey o biometría si esta cuenta todavía no los tiene en este dispositivo, o entra
 * directo al Chat si ya los tiene todos.
 *
 * Extraído de `LoginScreen` (donde antes vivía como `proceedAfterAuthentication`) para que
 * `ProofOfLifeScreen` pueda reutilizar exactamente la misma decisión al retomar el flujo de login
 * después de la prueba de vida, sin duplicar esta lógica en dos lugares.
 */
export const useLoginPostAuthNavigation = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const markAuthenticated = useAuthStore(state => state.login);

  const proceedAfterLogin = async (
    normalizedUsername: string,
    options?: ProceedAfterLoginOptions,
  ): Promise<void> => {
    const enrolledUser = await AuthService.getBiometricLoginUser();
    const isSameAccountEnrolled =
      !!enrolledUser && enrolledUser.toLowerCase() === normalizedUsername.toLowerCase();

    if (enrolledUser && !isSameAccountEnrolled) {
      // Un dispositivo solo debe mantener biometría activa para una cuenta a la vez: si quien
      // acaba de entrar es otra persona, se revoca el acceso biométrico anterior.
      await AuthService.disableBiometricLogin();
      options?.onDifferentAccountEnrolled?.();
    }

    // TODO: validar si el dispositivo es seguro (biometría/passkey) antes de avanzar. Por ahora
    // se fuerza siempre a `true` mientras se define esa estrategia.
    const isSecureDevice = true;

    if (!isSecureDevice) {
      navigation.navigate('RegisterSecureDevice');
      return;
    }

    if (AuthService.isPasskeySupported()) {
      const enrolledPasskeyUser = await AuthService.getPasskeyRegisteredUser();
      const isSamePasskeyEnrolled =
        !!enrolledPasskeyUser && enrolledPasskeyUser === normalizedUsername.toLowerCase();

      if (!isSamePasskeyEnrolled) {
        navigation.navigate('ConfigurePasskey', {email: normalizedUsername});
        return;
      }
    }

    if (isSameAccountEnrolled) {
      markAuthenticated();
      return;
    }

    navigation.navigate('ConfigureAuthBiometric');
  };

  return {proceedAfterLogin};
};
