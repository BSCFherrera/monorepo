# 01 — Inventario del estado actual (Flutter)

**Fuente:** `C:\Projects\BSC.MobileApp`, rama `feature/transaction-authorization`, commit `305d39e`
**Método:** lectura estática del repositorio + `flutter analyze` + `flutter test`. Sin modificaciones.
**Leyenda:** ✅ Confirmado en código · 🔎 Inferido · ❓ Pendiente de decisión · ⛔ No disponible

---

## 1. Tamaño y forma del proyecto

| Métrica                       | Valor                                                  | Cómo se obtuvo                                    |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| Archivos Dart                 | 150                                                    | `find lib -name "*.dart" \| wc -l`                |
| Líneas de Dart                | 29.671                                                 | `find lib -name "*.dart" -exec cat {} + \| wc -l` |
| Features                      | 13                                                     | `lib/features/*`                                  |
| Pantallas (`*_screen.dart`)   | 15                                                     | ✅                                                |
| Widgets reutilizables         | 34                                                     | ✅                                                |
| BLoC / Cubit                  | 7 BLoC + 2 Cubit                                       | ✅                                                |
| Endpoints declarados / usados | 45 / 44                                                | `lib/core/network/api_endpoints.dart`             |
| Archivos de prueba            | 8                                                      | `test/`                                           |
| Pruebas ejecutadas            | 77, todas en verde                                     | `flutter test` (17 s)                             |
| Avisos del analizador         | 390 (378 `info`, **0 error**, **0 warning**)           | `flutter analyze` (208 s)                         |
| Assets                        | 1 archivo (`assets/images/logo-bsc.svg`)               | ✅                                                |
| Módulos nativos Kotlin        | 2                                                      | `android/app/src/main/kotlin/`                    |
| Plataformas presentes         | Android ✅ · Web (esqueleto) ✅ · **iOS ⛔ no existe** | `ls` de la raíz                                   |

**Lectura:** el código está limpio desde el punto de vista del compilador y del analizador. Los 390 avisos son íntegramente de estilo — comas finales, `const`, comillas simples — ninguno indica un defecto funcional. Lo que falta no es calidad de código: es cobertura de pruebas, plataforma iOS y endurecimiento de la compilación de release.

## 2. Distribución por feature

| Feature           | Archivos | Líneas | Qué hace                                                                                | Capas presentes            |
| ----------------- | -------: | -----: | --------------------------------------------------------------------------------------- | -------------------------- |
| `product_detail`  |       26 |  6.320 | Detalle de cuenta, tarjeta, préstamo y certificado; movimientos, estados de cuenta, PDF | data/domain/presentation   |
| `payments`        |       14 |  3.341 | Pago de tarjeta y préstamo, asistente de 3 pasos, comprobante                           | data/domain/presentation   |
| `transfers`       |       13 |  3.314 | Transferencias propias, a terceros e interbancarias, asistente y comprobante            | data/domain/presentation   |
| `dashboard`       |       11 |  2.023 | Pantalla principal: saldos, productos, acciones rápidas                                 | data/domain/presentation   |
| `device_binding`  |        8 |  1.812 | Enrolamiento del dispositivo, mis dispositivos, token suave                             | data/domain/presentation   |
| `auth`            |       15 |  1.601 | Login, biometría, PIN                                                                   | completa, con casos de uso |
| `beneficiaries`   |        5 |  1.528 | Alta y consulta de beneficiarios, catálogos                                             | data/domain/presentation   |
| `two_factor`      |        4 |    857 | Selección de método, captura de código OTP                                              | data/domain/presentation   |
| `tax_receipts`    |        2 |    728 | Comprobantes fiscales (NCF)                                                             | data/presentation          |
| `exchange_rates`  |        8 |    704 | Tasas de cambio y cotización                                                            | data/domain/presentation   |
| `account_officer` |        3 |    613 | Oficial de cuenta asignado                                                              | data/domain/presentation   |
| `profile`         |        1 |    491 | Perfil del cliente                                                                      | solo presentation          |
| `customer`        |        4 |    313 | Identidad real del titular (fuente de verdad)                                           | data/domain/presentation   |

**Observación arquitectónica ✅:** la separación por capas no es uniforme. `auth` tiene la estructura completa (_datasource → repository → usecase → bloc_), mientras `profile` es una sola pantalla sin capa de datos y `tax_receipts` salta el dominio. Esto **no es necesariamente un defecto**, pero en la migración hay que decidir si se normaliza o se conserva la asimetría (ver `05-target-architecture.md`, decisión D-03).

## 3. Núcleo compartido (`lib/core`, `lib/app`, `lib/shared`)

### 3.1 Red — `lib/core/network/`

| Archivo                   | Responsabilidad                                                                                                               | Estado             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `api_client.dart`         | Cliente Dio con `baseUrl`, timeouts de 30 s y cabeceras fijas `X-Channel: MobileBanking`, `X-Channel-Type: 2`                 | ✅                 |
| `auth_interceptor.dart`   | Adjunta el _bearer_, renueva 60 s antes de expirar, _single-flight_, reintento único por petición, rotación del refresh token | ✅ Bien construido |
| `certificate_pinner.dart` | **Vacío.** El método `configure` retorna sin hacer nada; solo hay un comentario                                               | ⛔ **Riesgo alto** |
| `error_handler.dart`      | Normalización de errores                                                                                                      | ✅                 |
| `api_endpoints.dart`      | 45 rutas, documentadas como espejo de `endpoints.ts` del portal                                                               | ✅                 |

Detalle importante ✅: el interceptor añade a **cada** petición cabeceras anti-replay `X-Timestamp` y `X-Nonce`. El _nonce_ se deriva de `DateTime.now().microsecondsSinceEpoch` en base 36 — es único, pero **predecible**. Si el backend lo usa como defensa real, debe revisarse (ver `06-security-threat-model.md`, T-04).

### 3.2 Seguridad — `lib/core/security/` (12 archivos)

| Archivo                                                              | Qué resuelve                                                                                                                                                                      | Traslado a React Native                                                                                                           |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `device_key.dart` + `DeviceKeyPlugin.kt`                             | Par EC P-256 en StrongBox/TEE, no exportable, `setUserAuthenticationRequired`, `setInvalidatedByBiometricEnrollment`, `setUnlockedDeviceRequired`, firma `SHA256withECDSA` en DER | **Módulo nativo propio. No existe equivalente en npm con estos parámetros.** El Kotlin se reutiliza                               |
| `operation_fingerprint.dart`                                         | Hash canónico SHA-256 de la operación, idéntico en C#, TS y Dart                                                                                                                  | **Se elimina: se usa el de TypeScript del portal**                                                                                |
| `operation_risk.dart`                                                | Clasifica la operación en `inquiry` / `routine` / `elevated` según monto, moneda, beneficiario nuevo, internacional y enfriamiento                                                | Lógica pura → TypeScript compartido                                                                                               |
| `session_manager.dart`                                               | Expiración por inactividad real, aviso previo, observador del ciclo de vida                                                                                                       | Reescritura; el ciclo de vida se observa distinto en RN (`AppState`)                                                              |
| `session_policy_service.dart`                                        | Lee la política de inactividad desde `/configuration/session`                                                                                                                     | Traslado directo                                                                                                                  |
| `secure_storage.dart`                                                | Envoltura del Keystore; 13 claves definidas                                                                                                                                       | `react-native-keychain` o módulo propio ❓                                                                                        |
| `biometric_auth.dart`                                                | Biometría vía `local_auth`                                                                                                                                                        | Librería equivalente en RN ❓                                                                                                     |
| `device_integrity.dart`, `root_detection.dart`, `app_integrity.dart` | Veredicto de integridad enviado al enrolar                                                                                                                                        | Reescritura + revisión: `app_integrity.dart` compara contra `com.bsc.mobileapp` y el paquete real es `com.example.bsc_mobile_app` |
| `device_binding.dart`                                                | TOTP local (SHA-256, 30 s, 6 dígitos)                                                                                                                                             | Lógica pura → TypeScript                                                                                                          |
| `secure_screen` (Kotlin)                                             | `FLAG_SECURE` por pantalla                                                                                                                                                        | Módulo nativo propio; el Kotlin se reutiliza                                                                                      |

**Hallazgo ✅:** el comentario de `device_integrity.dart` documenta que `RootDetection` y `AppIntegrity` existían pero **nadie las llamaba**, y que `AppIntegrity.verifyAppIntegrity()` comparaba contra un nombre de paquete equivocado, de modo que en release habría bloqueado a todos los clientes. Está corregido, pero ilustra el tipo de defecto que una migración con pruebas desde el inicio evita.

### 3.3 Estado, navegación e inyección

- **Estado ✅:** `flutter_bloc` 8.1.6. Siete BLoC (auth, dashboard, product_detail, payment, transfer, exchange_rate) y dos Cubit (beneficiaries, customer). Tres se registran globalmente en `app.dart`: `AuthBloc`, `DashboardBloc`, `CustomerCubit`.
- **Navegación ✅:** `go_router` 14.2.7. **18 rutas**, una `ShellRoute` con barra inferior (`/home`, `/transfers`, `/payments`, `/profile`) y una guarda `_authGuard` que redirige a `/login` si no hay sesión. Los parámetros viajan por _query string_ (`?source=`, `?beneficiary=`, `?type=`, `?currency=`).
- **Inyección ✅:** `get_it` 7.7.0, registro manual en `injection.dart` (250 líneas). Sin generación de código.
- **Deep links ⛔:** el `AndroidManifest.xml` **no declara ningún `intent-filter`** de `VIEW`/`BROWSABLE`. No hay deep links ni App Links hoy.

### 3.4 Diseño

- `bsc_colors.dart` ✅: sistema de tokens completo — azul corporativo `#0B3B8C`, verde institucional `#00A651`, neutros, estados, rampa categórica de 6 colores y **6 gradientes de marca** con paradas definidas.
- `bsc_typography.dart`, `bsc_spacing.dart`, `bsc_theme.dart` ✅: tema claro y oscuro definidos, pero `app.dart` fija `themeMode: ThemeMode.light` — **el tema oscuro existe y está apagado**.
- `bsc_ui.dart` ✅: **1.491 líneas** de componentes compartidos. Es el archivo individual más grande del proyecto y el catálogo de facto del _design system_.
- Localización ✅: `es` por defecto, `en` declarado. Los textos están **incrustados en el código**, no en archivos de traducción.
- Orientación ✅: bloqueada a vertical en `main.dart`.

## 4. Dependencias

30 dependencias de ejecución y 6 de desarrollo. **Ocho declaradas que nunca se importan** (verificado con `grep -rl "package:<nombre>" lib`):

| Paquete no usado                          | Implicación                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `firebase_core`, `firebase_messaging`     | **Las notificaciones push NO están implementadas.** No hay `google-services.json` en el proyecto |
| `mobile_scanner`                          | No hay lectura de códigos QR                                                                     |
| `fl_chart`                                | No hay gráficos                                                                                  |
| `connectivity_plus`                       | **No hay detección de estado de red.** El modo sin conexión no está resuelto                     |
| `pinput`                                  | La captura de OTP se hizo a mano (`otp_input.dart`, 218 líneas)                                  |
| `cached_network_image`, `flutter_animate` | Sin uso                                                                                          |

También ✅: `build_runner` y `json_serializable` están declarados pero **no hay ni un archivo `.g.dart`** — la serialización JSON es manual en todo el proyecto, leyendo los nombres de campo en mayúsculas que devuelve el core bancario.

**Consecuencia para la migración:** el inventario real de capacidades es menor que el que sugiere el `pubspec.yaml`. Push, QR, gráficos y modo sin conexión son **funcionalidad nueva**, no migración. Esto cambia la estimación y debe confirmarse (P-04).

## 5. Compilación, configuración y despliegue

| Aspecto                                  | Estado                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Ambientes                                | Vía `--dart-define`: `ENV` y `API_BASE_URL`. **No hay flavors ni variantes de compilación**  |
| `API_BASE_URL` por defecto               | `http://<IP interna del banco>:5000` — IP interna del banco, en claro, en el código ⛔       |
| `applicationId`                          | `com.example.bsc_mobile_app` — el TODO de la plantilla nunca se resolvió ⛔                  |
| Firma de release                         | `signingConfig = signingConfigs.getByName("debug")` ⛔                                       |
| Permisos Android                         | Únicamente `INTERNET` ✅ (mínimo correcto)                                                   |
| `usesCleartextTraffic`                   | `true` ⛔                                                                                    |
| `minSdk` / `targetSdk`                   | Heredados de Flutter, no fijados explícitamente. `DeviceKeyPlugin` exige API 28+ para firmar |
| NDK                                      | `28.2.13676358`                                                                              |
| CI/CD                                    | ⛔ **No existe.** `.github/` solo tiene `copilot-instructions.md`                            |
| Firma, distribución interna, publicación | ⛔ No hay evidencia en el repositorio                                                        |
| Ofuscación                               | Documentada en el README (`--obfuscate --split-debug-info`) pero **no automatizada**         |

## 6. Pruebas existentes

| Archivo                                     | Qué cubre                                 |
| ------------------------------------------- | ----------------------------------------- |
| `test/core/auth_interceptor_test.dart`      | Renovación de token, reintento            |
| `test/core/device_integrity_test.dart`      | Veredicto de integridad                   |
| `test/core/formatters_test.dart`            | Formato de montos y fechas                |
| `test/core/operation_fingerprint_test.dart` | Huella canónica                           |
| `test/core/operation_risk_test.dart`        | Clasificación de riesgo                   |
| `test/core/session_manager_test.dart`       | Inactividad, aviso, reinicio del contador |
| `test/features/domain_logic_test.dart`      | Lógica de dominio                         |
| `test/otp_input_test.dart`                  | Widget de captura de OTP                  |

**Lo que no está cubierto:** ninguna pantalla salvo `otp_input`, ningún BLoC, ningún repositorio, ninguna llamada real a la API, ningún flujo de extremo a extremo, y **ningún flujo de dinero**. No hay pruebas de integración ni E2E, ni herramienta E2E configurada.

**Lectura honesta:** las 77 pruebas están bien escritas y prueban lo correcto dentro de su alcance —el núcleo de seguridad—, pero el porcentaje de comportamiento del producto verificado automáticamente es bajo. La migración es la oportunidad de corregirlo, y el enfoque TDD lo hace obligatorio (ver `07-test-strategy.md`).

## 7. Documentación existente en el repositorio Flutter

| Documento                                   | Contenido                                                                           | Utilidad para la migración                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `docs/ANALISIS-STACK-TECNOLOGICO.md`        | Justifica Flutter frente a React Native, con veredicto explícito a favor de Flutter | **Crítica.** Es la decisión que esta migración revierte (P-01)                                     |
| `docs/ARQUITECTURA-MOBILE.md`               | Arquitectura, endpoints, seguridad, paleta, CI/CD propuesto                         | Alta. Nota: describe features (`accounts`, `credit_cards`) que no existen con ese nombre en `lib/` |
| `docs/ARQUITECTURA-RED-SEGURIDAD.md`        | Argumenta que la app **no** debe hablar directo al backend, sino por un API Gateway | Alta. ❓ No hay evidencia de que el gateway exista hoy                                             |
| `docs/BANCA-CONVERSACIONAL-ARQUITECTURA.md` | Estrategia de IA conversacional                                                     | Fuera de alcance                                                                                   |
| `docs/*.html`, `docs/diagramas/*.svg`       | Guion técnico y diagramas, sin versionar (`??` en git)                              | Media                                                                                              |

## 8. Integración con el ecosistema BSC

- **Backend:** `BSC.BSCEnLinea.BackEnd`, .NET, 16 controladores. ⛔ **No se encontró ningún archivo OpenAPI/Swagger versionado** — el contrato hay que derivarlo del código de los controladores o de una instancia en ejecución (P-03).
- **Portal web:** `BSC.BSCEnLinea.FrontEnd`, Nuxt 4 + Vue 3.5 + TypeScript 5.9 + Vuetify 3.9 + Pinia. Es el cliente de referencia: los comentarios del código Flutter lo declaran explícitamente como _reference implementation_.
- **Bus de integración:** el backend no llama a los sistemas centrales directamente, sino a través de IBM App Connect. Relevante para tiempos de respuesta y modos de fallo.
- **TokenBSC:** microservicio de segundo factor. El archivo `.code-workspace` referencia una carpeta `BSC.TokenBSC` que **no existe** en `C:\Projects` (sí existe `BSC.TokenBSC.Api`) ❓.
- **Lógica ya duplicada hoy:** `operation_fingerprint.dart` (Dart), `operationFingerprint.ts` (TypeScript, portal) y `OperationFingerprint.cs` (C#, backend) implementan el mismo algoritmo. Los tres archivos se advierten mutuamente en comentarios de que un solo carácter de diferencia rompe la transacción. **Es el argumento más fuerte a favor de la migración**, y conviene usarlo tal cual ante el comité.

## 9. Herramientas disponibles en la máquina de trabajo

| Herramienta                      | Estado                                                                      |
| -------------------------------- | --------------------------------------------------------------------------- |
| Flutter 3.29.0 / Dart 3.6.2      | ✅ En `C:\Users\rceballos\flutter` (no está en el PATH del shell)           |
| Android SDK + `adb`              | ✅ En `C:\Users\rceballos\Android\Sdk\platform-tools` (no está en el PATH)  |
| Node 24.20.0 + npm 11.19.0       | ✅                                                                          |
| JDK 17 (Microsoft)               | ✅                                                                          |
| Xcode / macOS / CocoaPods / Ruby | ⛔ No disponible. **iOS no se puede compilar desde esta máquina**           |
| Watchman                         | ⛔ No instalado (opcional en Windows, recomendable)                         |
| Yarn / pnpm                      | ⛔ No instalados                                                            |
| `az` CLI                         | ⛔ No instalada; los PR de Azure DevOps se abren por navegador              |
| Dispositivo de prueba            | ✅ Pixel 10a, Android 16, por USB; requiere `adb reverse tcp:5000 tcp:5000` |

---

## Brechas de información que impiden cerrar el inventario

| #    | Brecha                                                           | Efecto                                                                                             |
| ---- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| B-01 | Sin contrato OpenAPI del backend                                 | El documento `04` se construye leyendo controladores; riesgo de discrepancia                       |
| B-02 | Sin acceso a Figma ni _design system_ aprobado                   | La paridad visual se mediría contra la app Flutter en ejecución, no contra un diseño de referencia |
| B-03 | Sin evidencia del API Gateway en producción                      | No se puede especificar la topología real de red ni el pinning                                     |
| B-04 | Sin pipeline, sin llaves de firma, sin cuenta de distribución    | No se puede definir CI/CD ni el Gate D                                                             |
| B-05 | Sin política institucional escrita de librerías, licencias y MDM | Las dependencias se elegirían sin criterio formal                                                  |
| B-06 | Sin métricas de rendimiento de referencia de la app Flutter      | No hay línea base contra la cual comparar React Native                                             |
