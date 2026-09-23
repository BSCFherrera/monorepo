import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Bloqueo de capturas de pantalla y de la vista previa en el conmutador de apps.
 *
 * Portado de `SecureScreenPlugin.kt`. Se activa **por pantalla y no
 * globalmente**: aplicarlo a toda la app impediría al cliente capturar un
 * comprobante legítimo, que es algo que la gente hace y que no tiene por qué
 * prohibirse.
 *
 * En Android lo resuelve `FLAG_SECURE`. En iOS no existe un equivalente
 * directo: se resuelve tapando la ventana al pasar a segundo plano y
 * deshabilitando la captura en los campos sensibles. Por eso el método se llama
 * por intención (`setSecure`) y no por mecanismo.
 */
export interface Spec extends TurboModule {
  /** Activa o desactiva la protección en la pantalla actual. */
  setSecure(secure: boolean): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SecureScreen');
