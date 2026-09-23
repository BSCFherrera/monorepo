# 09 — Matriz de trazabilidad

**Propósito:** conectar cada capacidad de la app Flutter con su especificación, su implementación en React Native, sus riesgos y sus pruebas. Se actualiza **en cada oleada**, y una oleada no se cierra si su fila no refleja el código real.

**Última revisión:** 2026-09-18. Se repasaron las tres tablas contra el código y contra las verificaciones cerradas en [`13-pendientes.md`](./13-pendientes.md). Diez filas de capacidades transversales seguían diciendo «Inventariado» o «Especificado» para cosas escritas, probadas y en algún caso ya vistas en el teléfono; los conteos de pruebas por feature estaban desfasados; y los identificadores de la sección 4 **colisionaban** con los de las decisiones del banco (ver el aviso de esa sección).

**Estados:** `Inventariado` → `Especificado` → `Pruebas escritas` → `Implementado` → `Verificado` → `Cerrado`

---

## 1. Capacidades transversales

**Estados de iOS:** todo lo de iOS se marca **«escrito, sin verificar»** hasta que exista el equipo macOS (P-13). Nunca «terminado».

| ID       | Capacidad Flutter                          | Evidencia                                                                                                | Spec        | Implementación RN                                                                                                   | Riesgo     | Pruebas                                                                                                                                                   | Estado                                                                   |
| -------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| CT-01    | Sesión e inactividad                       | `core/security/session_manager.dart`, `session_policy_service.dart`, `shared/widgets/session_guard.dart` | 02 §CT-01   | ✅ `src/core/security/sessionManager.ts` + `SessionGuard`                                                           | T-17       | ✅ Portado en `sessionManager.ts`; lo cubre CT-01b con sus 25 pruebas                                                                                     | **Verificado**                                                           |
| CT-02.1  | Huella canónica de operación               | `core/security/operation_fingerprint.dart`                                                               | 02 §CT-02.1 | ✅ `packages/bsc-shared/src/operationFingerprint.ts`                                                                | T-02       | ✅ **16 pruebas**, incluido el vector compartido `a455a04b…01ea`                                                                                          | **Verificado**                                                           |
| CT-02.2  | Clasificación de riesgo                    | `core/security/operation_risk.dart`                                                                      | 02 §CT-02.2 | ✅ `packages/bsc-shared/src/operationRisk.ts`                                                                       | T-01       | ✅ **17 pruebas**, 100% de ramas                                                                                                                          | **Verificado**                                                           |
| CT-02.3  | Firma con llave del dispositivo            | `core/security/device_key.dart` + `DeviceKeyPlugin.kt`                                                   | 02 §CT-02.3 | ✅ `DeviceKeyModule.kt` (Android) + `src/specs/NativeDeviceKey.ts` · ⏳ Swift pendiente                             | T-01, T-08 | ✅ **Verificado en Pixel 10a real**: StrongBox, biometría exigida por el sistema, firma validada fuera del teléfono. Evidencia en `archive/00-cimientos/` | **Verificado (Android)**                                                 |
| CT-02.3b | Contenido a firmar (reto + huella)         | `DeviceKey.signChallenge`                                                                                | 02 §CT-02.3 | ✅ `src/core/security/signingPayload.ts`                                                                            | T-04       | ✅ **15 pruebas** contrastadas contra `Buffer`                                                                                                            | **Verificado**                                                           |
| CT-02.3c | Decisión ante fallo de firma               | `SigningOutcome`, `DeviceBindingService.signOperation`                                                   | 02 §CT-02.3 | ✅ `src/core/security/signingOutcome.ts`                                                                            | T-01       | ✅ **16 pruebas**; cubre la regla de no ofrecer código si el cliente cancela                                                                              | **Verificado**                                                           |
| CT-02.4  | Enrolamiento del dispositivo               | `features/device_binding/domain/device_binding_service.dart`                                             | 02 §CT-02.4 | ✅ `src/features/deviceBinding`                                                                                     | T-13       | ✅ **56 pruebas** · V-01 cerrada: dispositivo `Active` con la llave en StrongBox                                                                          | **Verificado (Android)**                                                 |
| CT-01b   | Expiración por inactividad y segundo plano | `core/security/session_manager.dart`                                                                     | 02 §CT-01   | ✅ `src/core/security/sessionManager.ts`                                                                            | T-17       | ✅ **25 pruebas** con reloj inyectado, incluidos los estados de `AppState`                                                                                | **Verificado**                                                           |
| CT-03    | Renovación de token                        | `core/network/auth_interceptor.dart`                                                                     | 04 §2       | ✅ `src/core/network/authInterceptor.ts` + `apiClient.ts`                                                           | —          | ✅ **13 pruebas**: las 8 de Flutter más 5 casos límite                                                                                                    | **Verificado**                                                           |
| CT-03b   | Catálogo de 45 rutas                       | `core/network/api_endpoints.dart`                                                                        | 04 §3       | ✅ `src/core/network/endpoints.ts`                                                                                  | —          | ✅ Paridad leída del archivo Dart original                                                                                                                | **Verificado**                                                           |
| CT-04    | Almacenamiento seguro                      | `core/security/secure_storage.dart` (13 claves)                                                          | Pendiente   | ✅ `SecureStorageModule.kt` (EncryptedSharedPreferences) + `src/core/security/secureStorage.ts`                     | T-12       | ✅ **13 pruebas** · **V-09 cerrada**: leído `bsc_secure_store.xml` del teléfono, todo cifrado                                                             | **Verificado**                                                           |
| CT-05    | Bloqueo de capturas                        | `SecureScreenPlugin.kt`                                                                                  | Pendiente   | ✅ `SecureScreenModule.kt` + `src/specs/NativeSecureScreen.ts`                                                      | T-05       | ✅ Verificado en el Pixel: la captura sale en negro y el árbol de vistas sí tiene el contenido                                                            | **Verificado**                                                           |
| CT-12    | SHA-256                                    | — (usaba `package:crypto`)                                                                               | ADR-0004    | ✅ `packages/bsc-shared/src/sha256.ts`                                                                              | T-15       | ✅ **29 pruebas** contra el estándar y contra OpenSSL                                                                                                     | **Verificado**                                                           |
| CT-06    | Integridad del dispositivo                 | `core/security/device_integrity.dart`, `root_detection.dart`, `app_integrity.dart`                       | Pendiente   | ✅ `deviceIntegrity` con módulo nativo propio en Kotlin, en lugar de `flutter_jailbreak_detection`                  | T-13       | ✅ Portado y probado                                                                                                                                      | **Portado, sin verificar en dispositivo**                                |
| CT-07    | Certificate pinning                        | ⛔ `certificate_pinner.dart` está **vacío**                                                              | Pendiente   | ✅ Andamiaje escrito y comentado + `scripts/calcular-pin-spki.mjs`                                                  | T-03       | ✅ `verify` lo reporta mientras siga comentado                                                                                                            | **Bloqueado por D-02** — faltan las dos huellas SPKI                     |
| CT-08    | TOTP local                                 | `core/security/device_binding.dart`                                                                      | Pendiente   | ✅ `packages/bsc-shared/src/totp.ts`, RFC 6238 estricto                                                             | A-03       | ✅ Contrastado contra `node:crypto` y contra `TotpGenerator` de TokenBSC                                                                                  | **Verificado**                                                           |
| CT-09    | Formateadores y validadores                | `shared/utils/`                                                                                          | Pendiente   | ✅ `packages/bsc-shared/`                                                                                           | —          | ✅ Portadas, con dos defectos del original corregidos (la fecha un día antes, y la hora separada por espacio)                                             | **Verificado**                                                           |
| CT-10    | Sistema de diseño                          | `app/theme/*`, `shared/widgets/bsc_ui.dart` (1.491 líneas)                                               | 03 §5       | ✅ `src/design-system/`                                                                                             | —          | ✅ `parity.test.ts` lee los temas Dart · `medidasDelComprobante` y `medidasDeLasHojasDeTarjeta` leen los widgets                                          | **Portado; paridad por pantalla en curso**                               |
| CT-11    | Navegación y guardas                       | `app/routes.dart` (18 rutas)                                                                             | 03 §1       | 🔶 `src/app/navigation` con React Navigation. **El cajón de navegación (`bsc_drawer.dart`) no está portado** — D-27 | T-09       | ✅ `routeParity.test.ts` falla si una pantalla del original se queda sin ruta · `parametrosDePago.test.ts`                                                | **Portado** — V-14, el botón atrás, cerrada; el cajón queda fuera (D-27) |

## 2. Features

**Actualizada en la oleada 10.** Hasta entonces esta tabla seguía diciendo
«Inventariado» para features ya escritas, que es justo lo que la definición de
terminado prohíbe: _una oleada no se cierra si su fila no refleja el código
real_. Quedó desfasada porque el estado vivía además en el `CHANGELOG` y en el
traspaso, y actualizar tres sitios a mano falla siempre por el mismo motivo.

**«Portado» significa** escrito, con pruebas en verde y revisado contra el
widget Dart original. **No significa** visto en un teléfono: eso son las
verificaciones V-01…V-17 de [`13-pendientes.md`](./13-pendientes.md), y hasta
que se hagan ninguna fila puede decir «Verificado».

| ID   | Feature           | Líneas Dart | Oleada | Implementación RN             | Pruebas | Estado                                                                                                                                 |
| ---- | ----------------- | ----------: | ------ | ----------------------------- | ------: | -------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | `auth`            |       1.601 | 1      | `src/features/auth`           |      34 | **Verificado** — V-01 y el acceso por huella, vistos en el Pixel                                                                       |
| F-02 | `dashboard`       |       2.023 | 2      | `src/features/dashboard`      |      52 | **Verificado** — comparado lado a lado con la app Flutter en el mismo teléfono. Queda D-09, el saludo                                  |
| F-03 | `customer`        |         313 | 2      | `src/features/customer`       |      21 | **Verificado** — con datos reales del core                                                                                             |
| F-04 | `profile`         |         491 | 2      | `src/features/profile`        |       0 | Portado — **sin pruebas propias**: es una pantalla de presentación sin lógica, y la versión que escribe al pie es deuda anotada (D-18) |
| F-05 | `account_officer` |         613 | 2      | `src/features/accountOfficer` |       7 | **Verificado** — el oficial llega tras corregir el nombre del campo (defecto 16)                                                       |
| F-06 | `product_detail`  |       6.320 | 3      | `src/features/productDetail`  |     210 | Portado — **V-12 y V-13 a medias**: faltan las acciones de préstamo y certificado y las hojas de la tarjeta contra el original         |
| F-07 | `beneficiaries`   |       1.528 | 4      | `src/features/beneficiaries`  |      36 | **Verificado** — V-07, alta completa en el Pixel. El selector de tipo de documento sigue esperando D-07                                |
| F-08 | `transfers`       |       3.314 | 5      | `src/features/transfers`      |      57 | **Verificado** — V-02, transferencia real con firma. La huella coincide con la del backend                                             |
| F-09 | `payments`        |       3.341 | 6      | `src/features/payments`       |      66 | **Verificado** — V-03, pago real con firma. El pago a tarjeta de tercero sigue fuera (D-05) y el mínimo sale del detalle (D-26)        |
| F-10 | `device_binding`  |       1.812 | 7      | `src/features/deviceBinding`  |      56 | **Verificado** — V-01, V-05 y V-09. Falta **V-04**, la huella nueva, y **V-06**, la revocación                                         |
| F-11 | `two_factor`      |         857 | 7      | `src/features/twoFactor`      |      15 | Portado — **V-08 bloqueada por D-20**: el backend no valida el código, así que no hay rechazo que comprobar. D-06 sigue abierta        |
| F-12 | `exchange_rates`  |         704 | 8      | `src/features/exchangeRates`  |       8 | **Verificado** — V-11, tasas reales del core                                                                                           |
| F-13 | `tax_receipts`    |         728 | 8      | `src/features/taxReceipts`    |      15 | **Verificado** — V-11, cinco comprobantes reales con su hoja de detalle                                                                |

## 3. Endpoints

Las 45 rutas de `04-api-integration-contract.md` se trazan individualmente durante cada oleada, con estas columnas: `ruta → feature → esquema Zod → prueba de contrato → estado`. Se completa a partir de la oleada 0.

## 4. Diferencias deliberadas respecto a Flutter

Registro de todo lo que **no** es equivalente uno a uno.

> ⚠️ **Estos identificadores cambiaron de prefijo el 2026-09-18, y conviene
> saber por qué.** Nacieron como `D-01`…`D-09` y luego
> [`13-pendientes.md`](./13-pendientes.md) empezó a usar `D-01`…`D-26` para las
> **decisiones del banco**, que son otra cosa. Las dos numeraciones convivieron
> un tiempo diciendo cosas distintas con el mismo nombre: aquí `D-05` era
> «se activa el certificate pinning» y allí es «el pago a la tarjeta de un
> tercero». Un identificador que significa dos cosas no se puede citar en una
> reunión, que es justo para lo que existen. Las de esta tabla pasan a
> **`DD-xx`**, de _diferencia deliberada_; las `D-xx` son siempre las
> decisiones del banco.

| #     | Diferencia                                                                                | Motivo                                                                             | Estado                                                                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DD-01 | La huella de operación deja de tener implementación propia y se comparte en `@bsc/shared` | Elimina una de tres copias del mismo algoritmo, que es el objetivo de la migración | ✅ **Hecha y verificada contra el backend real.** Las tres cadenas coinciden carácter por carácter                                                              |
| DD-02 | El estado de servidor se separa del estado de cliente en vez de un BLoC por todo          | Hoy la caché y los reintentos están escritos a mano en cada BLoC                   | ⛔ **No se hizo.** Se resolvió sin TanStack Query, con estado local y repositorios: una dependencia menos (P-07)                                                |
| DD-03 | Las respuestas del backend se validan en tiempo de ejecución                              | El mapeo manual falla en silencio cuando cambia la forma                           | 🔶 **A medias.** Los contratos validan a mano y con pruebas contra respuestas reales; validar contra el Swagger exige D-14                                      |
| DD-04 | El PIN se valida de verdad                                                                | En el original no valida nada (`pin_screen.dart:42`)                               | ✅ **Sin efecto: no hay PIN.** El banco decidió biometría y passkey, así que la pantalla no se portó                                                            |
| DD-05 | Se activa el certificate pinning                                                          | En el original es un método vacío                                                  | 🔶 Andamiaje escrito y herramienta lista. **Bloqueado por D-02**, que son las huellas SPKI del banco                                                            |
| DD-06 | Posible unificación de `/accounts/:id` y `/products/:id`                                  | Construyen el mismo widget con los mismos parámetros                               | ✅ **Hecha.** Una sola ruta, `DetalleDeProducto`                                                                                                                |
| DD-07 | Posible unificación de los pasos de los asistentes de transferencia y pago                | ~1.000 líneas duplicadas entre dos archivos                                        | ✅ **Hecha, y con una lección**: por ese camino se coló la estructura de transferencias en la confirmación de pago, y hubo que corregirla con prueba de paridad |
| DD-08 | Eliminación de las 8 dependencias declaradas y no usadas                                  | Reducen superficie y ensucian el SBOM                                              | ✅ **Hecha.** De 31 dependencias a 12                                                                                                                           |
| DD-09 | El cliente debe volver a enrolar su dispositivo al pasar a la app nueva                   | La llave del StrongBox no se transfiere entre aplicaciones                         | ✅ Sin impacto real: **la app Flutter nunca estuvo en producción** (P-15.1), así que no hay clientes que migrar                                                 |

## 5. Lo que «Verificado» quiere decir aquí

Tres palabras que se confunden, y confundirlas es lo que hizo que esta matriz
estuviera desfasada dos veces:

- **Portado** — escrito, con pruebas en verde y revisado contra el widget Dart
  original. **No implica haberlo visto nunca.**
- **Verificado** — visto funcionando en el Pixel 10a contra el backend y el
  core reales, con la verificación `V-xx` correspondiente cerrada en
  [`13-pendientes.md`](./13-pendientes.md).
- **Cerrado** — verificado **y** con las decisiones del banco que lo afectan ya
  respondidas. Hoy **ninguna fila está cerrada**, porque D-01 a D-05 y D-18 a
  D-26 siguen sin respuesta.

Lo que el navegador enseña **no cuenta como verificado** para biometría, llaves
en StrongBox, almacenamiento cifrado, `FLAG_SECURE`, el botón atrás de Android
ni el comportamiento del APK de release. Esas cinco solo se dan por buenas en
un teléfono.
