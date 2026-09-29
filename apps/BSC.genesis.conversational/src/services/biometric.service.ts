import ReactNativeBiometrics, {BiometryType, BiometryTypes} from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export interface BiometricAvailability {
  available: boolean;
  biometryType?: BiometryType;
}

class BiometricService {
  async checkAvailability(): Promise<BiometricAvailability> {
    try {
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      return {available, biometryType};
    } catch {
      return {available: false};
    }
  }

  async authenticate(promptMessage = 'Confirma tu identidad para entrar'): Promise<boolean> {
    try {
      const {success} = await rnBiometrics.simplePrompt({promptMessage});
      return success;
    } catch {
      return false;
    }
  }

  getBiometricLabel(type?: BiometryType): string {
    switch (type) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return 'Biometria';
      default:
        return 'Biometria';
    }
  }
}

export default new BiometricService();
