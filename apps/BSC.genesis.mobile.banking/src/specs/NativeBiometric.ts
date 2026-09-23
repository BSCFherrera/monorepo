import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Verificación biométrica del cliente.
 *
 * Distinta de `NativeDeviceKey`: allí la biometría autoriza el **uso de una
 * llave** para firmar dinero, y la exigencia la impone el sistema operativo
 * sobre la llave misma. Aquí solo se comprueba que quien tiene el teléfono es
 * su dueño, para desbloquear la app.
 *
 * La diferencia importa: un atacante que lograra saltar esta comprobación
 * entraría a ver saldos, pero **no podría firmar una transferencia**, porque esa
 * ruta pasa por la llave del hardware y no por una bandera de JavaScript.
 *
 * Portado de `lib/core/security/biometric_auth.dart`, que usaba `local_auth`.
 */
export interface Spec extends TurboModule {
  /** Si el teléfono tiene hardware biométrico utilizable e inscrito. */
  isAvailable(): Promise<boolean>;

  /**
   * Si hay reconocimiento facial fuerte inscrito.
   *
   * La pantalla de acceso lo usa para decir «Entrar con Face ID» o «Entrar con
   * tu huella». Decirle a alguien que use algo que su teléfono no tiene es una
   * forma segura de que crea que la app está rota.
   */
  hasFaceUnlock(): Promise<boolean>;

  /**
   * Pide la verificación. Resuelve `true` si el cliente se verificó.
   *
   * Nunca rechaza por cancelación: una sonda de identidad que lanza deja la
   * pantalla colgada, y quien la llama necesita decidir qué mostrar.
   *
   * **Los textos del diálogo llegan de JavaScript**, ya traducidos: el idioma
   * lo elige el cliente dentro de la app, y un texto escrito en Kotlin o en
   * Swift saldría en el idioma del teléfono, no en el de la app.
   */
  authenticate(reason: string, title: string, cancelLabel: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BiometricAuth');
