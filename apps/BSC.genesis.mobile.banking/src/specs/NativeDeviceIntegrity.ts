import { TurboModuleRegistry, type TurboModule } from 'react-native';

/**
 * Integridad del dispositivo, para el momento del enrolamiento.
 *
 * La app Flutter resolvía esto con `flutter_jailbreak_detection`, una
 * dependencia de terceros en la ruta más sensible de la aplicación: la que
 * decide si el banco entrega un secreto a este teléfono. Aquí se escribe a
 * mano, y son menos de cien líneas de Kotlin que cualquiera puede leer —la
 * misma razón por la que los demás módulos de seguridad viven dentro del
 * proyecto y no como paquete publicado.
 *
 * ⚠️ **Este veredicto lo produce el cliente, así que el backend no puede
 * confiarse de él**: un atacante con el teléfono comprometido lo falsifica sin
 * esfuerzo. Sirve para dos cosas reales, y conviene tenerlas presentes para no
 * pedirle más de lo que puede dar:
 *
 * 1. Negar el caso honesto — el cliente cuyo teléfono está comprometido y no lo
 *    sabe, que es la mayoría de los casos reales.
 * 2. Dejar constancia en la bitácora del banco del resto.
 *
 * La protección de verdad es que la llave privada vive en el hardware seguro y
 * no sale de ahí, no esta comprobación.
 */
export interface Spec extends TurboModule {
  /**
   * Constantes que la compilación inyecta (D-18).
   *
   * Son **síncronas** a propósito: la URL del backend hace falta para construir
   * el cliente HTTP, que se arma en el primer render. Resolverla con una
   * promesa obligaría a que la aplicación entera esperara antes de existir.
   */
  getConstants(): {
    /**
     * La URL del backend que Gradle escribió en la compilación.
     *
     * **Vacía si no se inyectó ninguna**, y eso es deliberado: una release mal
     * configurada tiene que fallar de forma ruidosa, no apuntar en silencio a
     * donde no debe. Ver `config.ts` y T-10.
     */
    baseUrl: string;
  };

  /**
   * Si el dispositivo está comprometido: root, emulador con permisos o
   * herramientas de superusuario instaladas.
   *
   * Nunca lanza: un fallo de la comprobación devuelve `false`. Acusar al
   * teléfono de estar alterado porque una sonda no pudo ejecutarse bloquearía
   * a clientes legítimos, que es un daño peor que el que se quiere evitar.
   */
  isDeviceCompromised(): Promise<boolean>;

  /**
   * Si hay un depurador conectado al proceso.
   *
   * En una compilación de depuración esto es siempre cierto y por eso el
   * veredicto no se evalúa en desarrollo: hacerlo haría imposible trabajar.
   */
  isDebuggerAttached(): Promise<boolean>;

  /**
   * El identificador real del paquete instalado.
   *
   * Se lee del sistema y no se escribe a mano. En la app Flutter estaba
   * escrito a mano —`com.bsc.mobileapp`— y no coincidía con el `applicationId`
   * real del proyecto, de modo que la verificación de integridad habría
   * fallado siempre en release y bloqueado a todos los clientes. Nunca llegó a
   * llamarse, así que el defecto no se vio.
   */
  getPackageName(): Promise<string>;

  /**
   * La versión de la aplicación tal como la declara el paquete instalado.
   *
   * Va aquí y no en un módulo propio porque es el mismo dato del mismo sitio
   * —el `PackageManager`— y no justifica un puente más.
   *
   * **Importa que salga del manifiesto y no de `package.json`.** Las dos
   * versiones estuvieron desalineadas —la app decía «0.1.0» y el manifiesto
   * «1.0»—, de modo que la aplicación se contradecía a sí misma y soporte no
   * podía saber qué compilación tenía delante al recibir un reporte. Ahora
   * Gradle lee `package.json`, así que hay una sola fuente; leer el manifiesto
   * es lo que garantiza que lo que se enseña es lo que se instaló.
   */
  getAppVersion(): Promise<string>;

  /**
   * El número de compilación (`versionCode`), como texto.
   *
   * El perfil del original escribe «Versión 1.0.0 (1)»: el número entre
   * paréntesis es lo que distingue dos compilaciones de la misma versión, que
   * es justo el dato que soporte necesita cuando un cliente reporta algo que
   * en otra instalación no pasa.
   */
  getAppBuild(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DeviceIntegrity');
