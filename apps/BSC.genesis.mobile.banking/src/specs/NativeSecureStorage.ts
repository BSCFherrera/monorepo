import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Almacenamiento cifrado por el sistema operativo.
 *
 * En Android lo respalda `EncryptedSharedPreferences` con una llave maestra del
 * Keystore — exactamente lo que usaba la app Flutter con
 * `flutter_secure_storage` y `encryptedSharedPreferences: true`, de modo que la
 * garantía es la misma. En iOS será el Llavero.
 *
 * Aquí viven los tokens de sesión y los secretos de segundo factor. **No vive
 * la llave de firma**: esa se genera dentro del StrongBox y nunca sale, ni
 * siquiera cifrada.
 *
 * Se escribe a mano en vez de usar un paquete de npm por coherencia con el
 * resto del núcleo de seguridad: lo que guarda esto da acceso a la cuenta
 * mientras el token sea válido.
 */
export interface Spec extends TurboModule {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;

  /** Borra varias claves de una vez, sin tocar las demás. */
  removeItems(keys: string[]): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SecureStorage');
