import {Dimensions, NativeModules, PixelRatio, Platform} from 'react-native';
import DeviceInfoLib from 'react-native-device-info';
import {DeviceInfo} from '@/types/index';

/**
 * Servicio de Información de Dispositivo: construye el objeto `DeviceInfo` que se envía
 * como contexto (fingerprint) en las peticiones al backend, y expone la IP del dispositivo
 * de forma reutilizable para actualizarla en cualquier punto de la app (ej. header `x-device-data`).
 */
class DeviceInfoService {
  /**
   * IP local del dispositivo (interfaz de red activa). Reutilizable desde cualquier
   * parte de la app, ej. para refrescar `deviceInfo.ip` en el store de auth.
   */
  async getIpAddress(): Promise<string> {
    try {
      return await DeviceInfoLib.getIpAddress();
    } catch {
      return '0.0.0.0';
    }
  }

  /**
   * Construye el objeto completo de DeviceInfo. Se ejecuta una vez al abrir la app
   * (el store no persiste entre sesiones, por lo que se recalcula en cada apertura).
   */
  async buildDeviceInfo(): Promise<DeviceInfo> {
    const [ip, deviceUuid, supportedAbis] = await Promise.all([
      this.getIpAddress(),
      DeviceInfoLib.getUniqueId(),
      DeviceInfoLib.supportedAbis(),
    ]);

    const {width, height} = Dimensions.get('screen');
    const pixelRatio = PixelRatio.get();
    const reactNativeVersion = `${Platform.constants.reactNativeVersion.major}.${Platform.constants.reactNativeVersion.minor}.${Platform.constants.reactNativeVersion.patch}`;

    return {
      os: DeviceInfoLib.getSystemName(),
      osVersion: DeviceInfoLib.getSystemVersion(),
      browser: 'ReactNative',
      browserMajor: `${Platform.constants.reactNativeVersion.major}`,
      browserVersion: reactNativeVersion,
      deviceModel: DeviceInfoLib.getModel(),
      deviceVendor: DeviceInfoLib.getBrand(),
      deviceType: DeviceInfoLib.getDeviceType(),
      cpuArchitecture: supportedAbis[0] ?? 'Unknown',
      engineName: 'JSC/Hermes',
      screenResolution: `${Math.round(width * pixelRatio)}x${Math.round(height * pixelRatio)}`,
      colorDepth: 32,
      language: this.getDeviceLanguage(),
      ip,
      deviceUuid,
    };
  }

  /**
   * Locale del dispositivo (ej. "es-DO"). RN no expone esto de forma nativa/unificada,
   * por lo que se lee directo de los módulos nativos de Settings (mismo approach usado
   * históricamente por react-native-localize antes de que existiera Intl en Hermes).
   */
  private getDeviceLanguage(): string {
    try {
      if (Platform.OS === 'ios') {
        const settings = NativeModules.SettingsManager?.settings;
        return settings?.AppleLocale || settings?.AppleLanguages?.[0] || 'es-DO';
      }

      return NativeModules.I18nManager?.localeIdentifier || 'es-DO';
    } catch {
      return 'es-DO';
    }
  }
}

export default new DeviceInfoService();
