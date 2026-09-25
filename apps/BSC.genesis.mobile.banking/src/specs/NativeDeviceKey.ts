import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Par de llaves de firma del dispositivo, dentro del hardware seguro.
 *
 * Esta es la interfaz tipada entre JavaScript y el código nativo. React Native
 * genera a partir de ella la clase base de Kotlin y la de Swift, de modo que un
 * desajuste de tipos entre ambos lados **no compila** en vez de fallar en
 * ejecución — que es exactamente lo que se quiere en la ruta por la que se
 * firma el dinero.
 *
 * Portado de `lib/core/security/device_key.dart` y `DeviceKeyPlugin.kt` de la
 * app Flutter, conservando la misma superficie de métodos. La lógica
 * criptográfica de Kotlin se reutiliza tal cual; lo que cambia es el puente.
 *
 * ⚠️ Ninguna decisión de seguridad se toma aquí. Este archivo solo describe la
 * forma de la llamada: la exigencia de biometría la impone el sistema operativo
 * al usar la llave, no una bandera de JavaScript que un atacante pueda saltar.
 */
export interface Spec extends TurboModule {
  /**
   * Si el teléfono puede sostener una llave con verificación de usuario.
   *
   * En Android exige API 28 o superior: por debajo no se puede invalidar la
   * llave al cambiar la biometría, y una llave que sobrevive a la inscripción
   * de un rostro nuevo no sirve para autorizar dinero.
   */
  isSupported(): Promise<boolean>;

  /**
   * Si hay una llave y además sirve para firmar.
   *
   * Comprobar solo que exista no alcanza: una llave invalidada porque cambió la
   * biometría del teléfono sigue cargando del almacén sin error.
   */
  hasKey(): Promise<boolean>;

  /**
   * Genera el par. Descarta cualquier llave previa.
   *
   * Devuelve `{ publicKey, algorithm, security }`, donde `publicKey` es SPKI en
   * base64 —lo único que sale del teléfono— y `security` describe qué protege
   * la llave.
   */
  createKey(): Promise<Object>;

  /** Llave pública en SPKI/base64, o `null` si no hay llave. */
  getPublicKey(): Promise<string | null>;

  /**
   * Firma el contenido (base64) y devuelve la firma en DER/base64.
   *
   * Dispara el diálogo biométrico del sistema. Si el cliente no se verifica,
   * rechaza con `user_not_authenticated` y no hay firma.
   */
  sign(payloadBase64: string): Promise<string>;

  /** Borra la llave. Devuelve si había una que borrar. */
  deleteKey(): Promise<boolean>;

  /**
   * Dónde vive la llave y con qué protecciones. Se envía al banco al enrolar.
   */
  describeKey(): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceKey');
