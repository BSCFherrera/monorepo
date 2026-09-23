# 00 — Resumen ejecutivo

**Proyecto:** Migración de `BSC.MobileApp` (Flutter) a React Native (`BSC.MobileAppRN`)
**Fase actual:** Fase 1 — Descubrimiento · **Gate actual:** Gate 0 cerrado parcialmente, Gate A abierto
**Fecha:** 2026-09-16 · **Commit Flutter inspeccionado:** `305d39e` (rama `feature/transaction-authorization`)
**Estado:** _Alcance en elaboración. No se ha autorizado implementación._

---

## Glosario mínimo

Escrito para alguien que trabaja en .NET y Vue/Nuxt y no ha programado en Flutter.
Cada término aparece con su equivalente en el mundo que ya conoces.

| Término                   | Qué es                                                                                                                                  | Equivalente conocido                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Flutter**               | Framework de UI de Google. Dibuja su propia interfaz con un motor gráfico propio; no usa los controles del sistema operativo.           | Como si Vue trajera su propio motor de render en vez de usar el DOM del navegador.        |
| **Dart**                  | El lenguaje de Flutter. Tipado y compilado.                                                                                             | TypeScript, pero de Google y sin relación con JavaScript.                                 |
| **Widget**                | La unidad de interfaz en Flutter. Todo es un widget: un texto, un botón, una pantalla, incluso el espaciado.                            | Un componente `.vue`.                                                                     |
| **BLoC / Cubit**          | Patrón de manejo de estado. El BLoC recibe _eventos_ y emite _estados_; el Cubit es su versión simple, con métodos en vez de eventos.   | Una store de Pinia. Cubit ≈ store con acciones; BLoC ≈ store con reducer estilo Redux.    |
| **`pubspec.yaml`**        | Declara dependencias y assets del proyecto.                                                                                             | `package.json`.                                                                           |
| **`pubspec.lock`**        | Fija las versiones exactas instaladas.                                                                                                  | `package-lock.json`.                                                                      |
| **GetIt**                 | Localizador de servicios: registra objetos una vez y los entrega a quien los pida.                                                      | El contenedor de inyección de dependencias de .NET (`IServiceCollection`).                |
| **GoRouter**              | Enrutador declarativo, con rutas por URL y guardas de acceso.                                                                           | Vue Router / el enrutador de Nuxt.                                                        |
| **Dio**                   | Cliente HTTP con interceptores.                                                                                                         | Axios — que es literalmente lo que usa el portal.                                         |
| **AOT** (_ahead-of-time_) | Compilación a código máquina antes de instalar. El binario no lleva intérprete dentro.                                                  | Compilar a nativo en vez de servir JavaScript.                                            |
| **React Native**          | Framework de Meta: dibuja con los controles **nativos** del sistema y ejecuta la lógica en un motor de JavaScript incrustado en la app. | React, pero renderizando a vistas de Android/iOS en lugar de al DOM.                      |
| **Hermes**                | El motor de JavaScript que React Native embebe en la app.                                                                               | Como V8, pero optimizado para móvil.                                                      |
| **StrongBox**             | Chip de seguridad dedicado dentro del teléfono Android donde vive una llave criptográfica que ni la propia app puede leer.              | Un HSM, del tamaño de una uña y dentro del celular.                                       |
| **TOTP**                  | Código de 6 dígitos que cambia cada 30 segundos, derivado de un secreto compartido y del reloj.                                         | El código de Google Authenticator.                                                        |
| **Certificate pinning**   | La app confía solo en el certificado TLS específico del banco, no en cualquiera que el sistema acepte.                                  | Impide que un proxy corporativo o un atacante lea el tráfico aunque instale su propia CA. |
| **Platform channel**      | Puente entre el código Flutter y código nativo Kotlin/Swift, para lo que el framework no cubre.                                         | Un P/Invoke: código gestionado llamando a código de la plataforma.                        |
| **Módulo nativo (RN)**    | El equivalente del platform channel en React Native.                                                                                    | Lo mismo, con otro nombre.                                                                |

---

## Qué es la aplicación hoy

`BSC.MobileApp` es la banca móvil de Banco Santa Cruz escrita en Flutter. En números verificados sobre el commit `305d39e`:

- **29.671 líneas** de Dart en **150 archivos**, organizadas en **13 features**.
- **15 pantallas** y **34 widgets** reutilizables.
- **45 endpoints** declarados contra `BSC.BSCEnLinea.BackEnd`, de los cuales **44 se usan**.
- **2 módulos nativos Kotlin** escritos a mano: firma con llave en hardware y bloqueo de capturas de pantalla.
- **8 archivos de prueba, 77 pruebas, todas en verde.** Cubren la seguridad del núcleo y las utilidades; **no** cubren pantallas ni flujos de dinero.
- `flutter analyze`: **390 avisos, 0 errores, 0 advertencias** — todo es estilo (comas finales, `const`), nada roto.
- **Solo Android.** No existe carpeta `ios/`: la app nunca se ha construido para iPhone.

La pieza más valiosa y más difícil de mover no es la interfaz: es la **autorización de transacciones**. La app genera un par de llaves EC P-256 dentro del StrongBox del teléfono, marcado como no exportable, que exige biometría fuerte en cada firma y se autodestruye si alguien inscribe una huella o un rostro nuevo. El banco solo guarda la llave pública, de modo que ni el banco puede firmar en nombre del cliente. Eso está implementado a mano en Kotlin (`DeviceKeyPlugin.kt`, 323 líneas) precisamente porque ninguna librería de terceros expone esos parámetros — y esa restricción **se traslada idéntica a React Native**.

## Qué cambia realmente con React Native

La migración **no** es una traducción archivo por archivo. Los tres bloques se comportan de forma distinta:

1. **Interfaz (≈70% del código Dart): se reescribe por completo.** Flutter dibuja su propia UI; React Native usa vistas nativas. No hay conversión automática ni parcial. Es el grueso del esfuerzo y, paradójicamente, el de menor riesgo técnico: es trabajo conocido y verificable a simple vista.
2. **Lógica de negocio, validaciones y contratos (≈20%): se reescribe en TypeScript, y aquí está la ganancia.** El portal `BSC.BSCEnLinea.FrontEnd` ya tiene buena parte de esa lógica en TypeScript. `src/utils/operationFingerprint.ts` del portal y `lib/core/security/operation_fingerprint.dart` de la app móvil son **el mismo algoritmo escrito dos veces**, y los comentarios de ambos archivos lo dicen explícitamente. En React Native pasarían a ser uno solo.
3. **Seguridad nativa (≈10% del código, ≈80% del riesgo).** `DeviceKeyPlugin.kt` y `SecureScreenPlugin.kt` son Kotlin puro. **El Kotlin se conserva casi intacto**; lo que se reescribe es el puente hacia JavaScript. Trabajo acotado pero crítico: es la ruta por la que se firma el dinero.

## La objeción que hay que responder primero

El propio repositorio contiene un análisis firmado —`BSC.MobileApp/docs/ANALISIS-STACK-TECNOLOGICO.md`, sección 1.1— que evaluó exactamente esta disyuntiva y **concluyó que Flutter era la decisión correcta para banca**, con un argumento concreto: React Native lleva un _bundle_ de JavaScript dentro del teléfono, mientras que Flutter compila a código máquina sin intérprete expuesto. Ese documento incluso anticipó el escenario que hoy se plantea: _«el único escenario donde React Native sería superior es si la prioridad #1 fuera reutilizar código y talento del equipo Vue/TS y acelerar el time-to-market»_.

Esto no bloquea la migración, pero obliga a dos cosas antes del Gate A:

- Declarar explícitamente **qué cambió en las prioridades** para revertir la decisión (P-01 en `11-open-questions.md`). Cualquier arquitecto que lea ambos documentos hará esa pregunta, y conviene tener la respuesta escrita antes que improvisada.
- Incorporar al alcance las **medidas de endurecimiento del bundle JavaScript** que el análisis original señaló como el punto débil de React Native, para que la migración no degrade la postura de seguridad. Ver `06-security-threat-model.md`, amenaza T-07.

## Estado de la seguridad actual

Lo que está construido y funciona, verificado en código:

- Llave de firma en StrongBox/TEE con biometría obligatoria e invalidación automática ante cambio biométrico.
- Huella canónica de operación (`OperationFingerprint`) idéntica en los tres canales: backend C#, portal TypeScript y app Dart.
- Clasificación de riesgo por monto, beneficiario nuevo, moneda y período de enfriamiento del dispositivo.
- Renovación de token con _single-flight_ (una sola renovación concurrente) y reintento único por petición.
- Expiración de sesión por inactividad real del cliente, con la política servida por el backend.
- Bloqueo de capturas de pantalla aplicado por pantalla y no globalmente, para no impedir que el cliente guarde un comprobante legítimo.
- Tokens y secretos en el Keystore de Android.

Lo que **no** está, y hoy es riesgo abierto con independencia del framework:

| Hallazgo                                                          | Evidencia                                                                                                                         | Severidad                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| El _certificate pinning_ es un método vacío                       | `lib/core/network/certificate_pinner.dart`: el cuerpo es un comentario                                                            | **Alta**                                |
| El `applicationId` sigue siendo `com.example.bsc_mobile_app`      | `android/app/build.gradle.kts:19`, TODO sin resolver                                                                              | **Alta**                                |
| La compilación de release se firma con la llave de depuración     | `android/app/build.gradle.kts:31`, TODO sin resolver                                                                              | **Alta**                                |
| El PIN no se valida contra nada                                   | `lib/features/auth/presentation/screens/pin_screen.dart:42`                                                                       | **Alta**                                |
| Tráfico HTTP en claro habilitado                                  | `AndroidManifest.xml`: `usesCleartextTraffic="true"`                                                                              | **Alta**                                |
| URL interna del banco escrita en el código como valor por defecto | `api_constants.dart`: `http://<IP interna del banco>:5000`                                                                        | **Media**                               |
| No existe CI/CD                                                   | `.github/` contiene únicamente `copilot-instructions.md`                                                                          | **Media**                               |
| 8 de 30 dependencias declaradas nunca se importan                 | Firebase Core y Messaging, `mobile_scanner`, `fl_chart`, `connectivity_plus`, `pinput`, `cached_network_image`, `flutter_animate` | **Media** (superficie de ataque y SBOM) |

Ninguno de estos se resuelve por migrar. Todos deben entrar en el plan como trabajo explícito, y el proyecto nuevo no debe heredarlos.

## Recomendación

1. **No cerrar el Gate A** hasta resolver las preguntas bloqueantes de `11-open-questions.md`, en particular la reversión de la decisión de stack, el alcance de iOS y quién provee el equipo macOS de construcción.
2. **Migrar por oleadas empezando por el núcleo de seguridad, no por las pantallas.** Si la firma con llave en hardware no funciona en React Native, todo lo demás sobra. El orden propuesto está en `08-migration-plan.md`.
3. **Extraer la lógica compartida a un paquete TypeScript** consumido por el portal y por la app. Es el beneficio concreto y medible de la migración, y hoy ya existe al menos un algoritmo duplicado que lo demuestra.
4. **Tratar los 8 hallazgos de seguridad abiertos como trabajo de la migración**, no como deuda heredada: el proyecto nuevo se construye desde cero y omitirlos los perpetúa con otro nombre.

## Próxima acción

Responder las preguntas bloqueantes de `11-open-questions.md` y aprobar o corregir este alcance.
