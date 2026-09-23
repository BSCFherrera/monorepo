# 05 — Arquitectura destino (React Native)

**Estado:** propuesta. **Ninguna decisión está tomada.** Cada punto presenta opciones, consecuencias y recomendación razonada, y se congela como ADR en `adr/` solo después de aprobación en el Gate B.

---

## 1. Principios

1. **Los límites por feature se conservan.** La app Flutter está organizada en 13 features con separación entre presentación, dominio y datos. Es una buena estructura y el equipo ya la conoce; cambiarla sin necesidad añade riesgo sin beneficio.
2. **Nada de traducción mecánica.** No se convierte un widget de Dart en un componente de React uno a uno. Se migra la _responsabilidad_.
3. **La seguridad nativa se conserva en su lenguaje.** El Kotlin de `DeviceKeyPlugin` y `SecureScreenPlugin` es correcto y está auditado por su propio comentario; se reutiliza y se le cambia únicamente el puente.
4. **Una sola implementación de la lógica compartida.** Todo lo que hoy existe por duplicado entre portal y app pasa a un paquete TypeScript único. Es el beneficio que justifica la migración.
5. **La UI nunca es un control de seguridad.** La autorización la impone el backend; la app solo presenta y firma.

## 2. Estructura propuesta

```
BSC.MobileAppRN/
├── android/                    # Proyecto Android; aloja los módulos nativos Kotlin
│   └── app/src/main/java/do/com/bsc/mobile/
│       ├── DeviceKeyModule.kt      # portado de DeviceKeyPlugin.kt
│       └── SecureScreenModule.kt   # portado de SecureScreenPlugin.kt
├── ios/                        # Solo si iOS entra en alcance (P-02)
├── src/
│   ├── app/                    # Arranque, navegación, tema, proveedores
│   ├── core/
│   │   ├── network/            # Cliente HTTP, interceptores, pinning, errores
│   │   ├── security/           # Puentes a los módulos nativos, sesión, almacenamiento
│   │   └── di/                 # Composición de dependencias
│   ├── features/               # Un directorio por feature, mismos límites que hoy
│   │   └── <feature>/
│   │       ├── domain/         # Entidades y reglas puras, sin React ni red
│   │       ├── data/           # Repositorios, DTOs, mapeo
│   │       └── ui/             # Pantallas, componentes, hooks de presentación
│   └── design-system/          # Equivalente de bsc_ui.dart + tokens
├── packages/bsc-shared/        # ← Paquete TypeScript compartido con el portal
│   ├── operationFingerprint.ts # UNA sola implementación, hoy duplicada
│   ├── operationRisk.ts
│   ├── validators.ts
│   ├── formatters.ts
│   └── contracts/              # Tipos de petición y respuesta del backend
├── e2e/
└── docs/migration/
```

**El punto clave es `packages/bsc-shared/`.** Hoy `operationFingerprint` existe tres veces: C# en el backend, TypeScript en el portal y Dart en la app. La versión Dart desaparece y la de TypeScript se comparte. Quedan dos implementaciones (una por lenguaje de plataforma) en vez de tres, y la que se elimina es precisamente la que más cuesta mantener sincronizada.

> ❓ **Decisión D-08:** cómo se distribuye ese paquete — repositorio propio publicado en el feed privado de Azure Artifacts, o _git submodule_, o copia sincronizada. Afecta al pipeline de ambos repositorios.

---

## 3. Decisiones a tomar

### D-01 — React Native Community CLI vs Expo

| Opción                  | A favor                                                                                                                   | En contra                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Community CLI**       | Control total del proyecto Android/iOS; los módulos Kotlin se agregan sin fricción; nada se interpone en la ruta de firma | Configuración manual; más trabajo de mantenimiento del proyecto nativo                                                                                                                                                                     |
| **Expo con _prebuild_** | Mucho mejor DX, actualizaciones over-the-air, plantillas maduras                                                          | Los _config plugins_ generan el proyecto nativo: un archivo que se regenera es un archivo que puede perder una bandera de seguridad sin que nadie lo note. Las actualizaciones OTA en banca suelen requerir aprobación explícita de riesgo |

**Recomendación: Community CLI.** El proyecto vive o muere por dos módulos Kotlin en la ruta de autorización de dinero. Cualquier capa que regenere el proyecto nativo es un riesgo desproporcionado frente al ahorro de configuración. Además, las actualizaciones OTA de Expo — su mayor ventaja — probablemente no serían aprobadas en un canal financiero, con lo que se paga el costo sin cobrar el beneficio.

### D-02 — TypeScript y nivel de rigor

**Recomendación: `strict: true` completo, más `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.** El portal ya usa TypeScript 5.9; compartir configuración facilita el paquete común. Un proyecto nuevo es el único momento barato para activar el modo estricto: hacerlo después cuesta diez veces más.

### D-03 — Uniformidad de capas entre features

Hoy la estructura es asimétrica: `auth` tiene _datasource → repository → usecase → bloc_; `profile` es una sola pantalla.

**Recomendación:** norma de dos niveles. Toda feature tiene `ui/` y `data/`; `domain/` es **obligatorio solo si tiene reglas de negocio propias**. Forzar tres capas en una pantalla de perfil produce ceremonia sin valor, y la ausencia de capas en una feature de transferencias produce defectos.

### D-04 — Navegación

| Opción               | Nota                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **React Navigation** | Estándar de facto; equivalente directo del `ShellRoute` de GoRouter mediante _bottom tab navigator_ anidado; guardas por estado de sesión |
| Expo Router          | Atado a D-01                                                                                                                              |

**Recomendación: React Navigation**, con guarda de sesión equivalente a `_authGuard` y **sin habilitar deep links** hasta que exista una especificación de validación de enlaces aprobada.

### D-05 — Estado local y estado remoto

Hoy todo pasa por BLoC, incluido el estado que en realidad es caché de servidor.

| Capa                                                | Opción recomendada        | Por qué                                                                                                      |
| --------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Estado de servidor (saldos, movimientos, catálogos) | **TanStack Query**        | Reintentos, invalidación, caché y estados de carga/error resueltos. Hoy eso está escrito a mano en cada BLoC |
| Estado de cliente (asistentes, formularios, sesión) | **Zustand**               | Ligero y explícito; conceptualmente cercano a Pinia, que el equipo ya usa                                    |
| Formularios                                         | **React Hook Form + Zod** | Zod valida en tiempo de ejecución los datos del backend, que es exactamente donde hoy falla el mapeo manual  |

**Consecuencia a declarar:** separar estado de servidor y estado de cliente es una **mejora arquitectónica**, no una traducción. Cambia la forma del código respecto a Flutter y requiere aprobación explícita en el Gate B.

⚠️ **Restricción de caché:** ningún saldo, movimiento ni dato de cliente puede persistir en disco sin cifrar. La caché de TanStack Query se mantiene **solo en memoria** y se destruye al cerrar sesión.

### D-06 — Cliente HTTP

**Recomendación: Axios**, que es el que ya usa el portal, con interceptores que reproduzcan exactamente el comportamiento de `auth_interceptor.dart`: renovación anticipada de 60 s, _single-flight_, reintento único, rotación del refresh token, cabeceras anti-replay. Las respuestas se validan con esquemas Zod en el borde — si el backend cambia una forma, falla la validación con un mensaje claro en vez de producir `undefined` tres pantallas después.

### D-07 — Almacenamiento seguro

| Necesidad                 | Opción                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tokens y secretos         | `react-native-keychain` ❓, o módulo propio sobre EncryptedSharedPreferences para replicar exactamente lo de hoy |
| Preferencias no sensibles | MMKV o AsyncStorage                                                                                              |

**A verificar antes de decidir:** hoy `flutter_secure_storage` usa `encryptedSharedPreferences: true` en Android. Hay que confirmar que la alternativa elegida ofrece la misma garantía y una migración limpia de las 13 claves existentes — sobre todo `bsc_device_secret` y `bsc_soft_token_secret`.

### D-08 — Módulos nativos de seguridad

**No hay opción: se escriben a mano.** Ninguna librería de npm expone simultáneamente `setUserAuthenticationRequired`, `setInvalidatedByBiometricEnrollment`, `setUnlockedDeviceRequired`, `setIsStrongBoxBacked` y `setUserAuthenticationParameters(0, AUTH_BIOMETRIC_STRONG)`. Es la misma razón por la que se escribió a mano en Flutter, y el comentario del archivo Kotlin lo argumenta: _«está en la ruta de la firma de transacciones, así que un paquete comprometido sería un compromiso de la autorización»_.

**El trabajo real es el puente, no la criptografía.** El Kotlin se copia casi tal cual; se reescribe la clase que lo expone a JavaScript.

> **Recomendación de arquitectura de módulos: TurboModules (Nueva Arquitectura), no la puente antigua.** Los TurboModules tienen interfaz tipada generada desde TypeScript, lo que elimina toda una clase de errores de conversión de tipos justo en la ruta más sensible.

### D-09 — Certificate pinning

Hoy es un método vacío, así que **cualquier cosa que se haga es una mejora**. Opciones: `react-native-ssl-pinning`, configuración declarativa de Android Network Security Config, o módulo propio.

**Recomendación:** pinning por **clave pública (SPKI), no por certificado**, con al menos un pin de respaldo, y política de rotación documentada antes de activarlo. Un pin sin plan de rotación deja a todos los clientes fuera el día que caduca el certificado — que es exactamente el modo de fallo que más asusta y el motivo más común por el que esta característica se queda sin implementar. Ver ADR-0002.

### D-10 — Sistema de diseño

`bsc_ui.dart` (1.491 líneas) es el catálogo de facto. Se reconstruye como librería de componentes React Native con los tokens de `bsc_colors.dart` portados literalmente.

**Recomendación:** componentes propios sobre primitivas de React Native, **sin librería de UI de terceros**. Una librería como NativeBase o Tamagui impondría sus propios tokens y decisiones visuales, y el objetivo aquí es paridad exacta con un diseño ya aprobado. Los gradientes requieren `react-native-linear-gradient` (o el equivalente de Expo si se elige D-01 distinto).

### D-11 — Pruebas

| Nivel                  | Herramienta recomendada                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Unitarias y de dominio | Jest + ts-jest                                                                                                         |
| Componentes            | React Native Testing Library                                                                                           |
| Contratos              | Zod + fixtures derivados de respuestas reales redactadas                                                               |
| E2E                    | **Detox** (recomendado: corre sobre la app compilada, no sobre un simulador web) o Maestro (más simple, menos control) |

### D-12 — Observabilidad

⛔ Hoy no hay **nada**: ni analytics, ni reporte de fallos, ni métricas. La app solo imprime por consola en depuración.

**Recomendación:** introducirla, con **redacción obligatoria** de PII y datos financieros en el origen — nunca confiando en filtros del proveedor. Toda la capa de registro pasa por un redactor que enmascara números de cuenta, montos, documentos de identidad, nombres y tokens. La elección de proveedor depende de la política institucional (P-07).

---

## 4. Lo que la arquitectura debe garantizar explícitamente

| Garantía                                              | Cómo                                                                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Ninguna llave privada sale del hardware               | Módulo nativo; la llave es no exportable por construcción                                                                     |
| Ningún secreto en el bundle JavaScript                | Escaneo de secretos en CI sobre el bundle compilado, no solo sobre el código fuente                                           |
| Ningún dato sensible en disco sin cifrar              | Caché en memoria; auditoría de rutas de escritura en el Gate D                                                                |
| Ninguna autorización decidida en el cliente           | El nivel de riesgo se calcula en el cliente para la experiencia, pero **el backend vuelve a evaluarlo** ❓ a confirmar (C-04) |
| El bundle JavaScript es la nueva superficie de ataque | Ver `06-security-threat-model.md`, T-07                                                                                       |

## 5. Diagramas pendientes

Se producen en Fase 1 y se guardan en `docs/migration/diagramas/`:

- Contexto: app ↔ (gateway) ↔ backend ↔ bus App Connect ↔ core.
- Flujo de autorización de transacción de extremo a extremo.
- Ciclo de vida del token y la sesión.
- Enrolamiento del dispositivo y ciclo de vida de la llave.
