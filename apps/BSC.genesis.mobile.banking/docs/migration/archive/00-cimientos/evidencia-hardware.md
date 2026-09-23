# Oleada 0 — Evidencia de la firma en hardware

**Fecha:** 2026-09-16
**Dispositivo:** Pixel 10a (`stallion`), Android 16, serial `5C121JEA322911`
**Compilación:** `app-debug.apk`, `com.bsc.mobile`, React Native 0.87.1, NDK 28.2.13676358, arm64-v8a
**Ejecutado con:** `SecurityCheckScreen` + `scripts/verify-device-signature.mjs`

Esta es la evidencia del **criterio de salida de la oleada 0**: si la firma con llave en hardware no alcanzaba paridad con la app Flutter, la migración se detenía. Alcanzó paridad.

---

## 1. En el dispositivo

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Soporte de llave con verificación de usuario | ✅ El dispositivo lo soporta |
| 2 | Llave previa descartada | ✅ Se parte de un estado limpio |
| 3 | Par de llaves generado | ✅ `algoritmo=EC-P256 backing=strongbox userAuth=true invalidatedByBiometric=true` |
| 4 | La llave vive en hardware | ✅ **StrongBox**: elemento seguro dedicado, el nivel más alto |
| 5 | Cumple el nivel exigido para banca | ✅ Hardware + verificación obligatoria + invalidación por biometría |
| 6 | Llave pública exportable (SPKI) | ✅ 124 caracteres base64 |
| 7 | Diálogo biométrico del sistema | ✅ Mostrado; huella verificada |
| 8 | Operación firmada | ✅ Firma DER de 96 caracteres base64 |

La pantalla queda tapada en negro al capturarla mientras el diálogo biométrico está visible: Android impide capturar ventanas seguras. Es el comportamiento correcto y, de paso, confirma que el diálogo era el del sistema y no una imitación dibujada por la app.

## 2. Fuera del dispositivo

Verificado en la laptop con la llave pública que el teléfono entregó, reproduciendo lo que hace `TransactionAuthorizationGuard` en el backend .NET:

| # | Comprobación | Resultado |
|---|---|---|
| 1 | El contenido firmado es el reto seguido de la huella | ✅ 53 bytes (21 de reto + 32 de huella) |
| 2 | La llave pública es EC P-256 en formato SPKI | ✅ `tipo=ec curva=prime256v1` |
| 3 | La firma está en DER, no en formato plano | ✅ Primer byte `0x30`, 71 bytes |
| 4 | La firma es válida para esa llave y ese contenido | ✅ ECDSA P-256 sobre SHA-256 |
| 5 | **La firma NO verifica si el contenido cambia** | ✅ Un byte distinto en la huella la invalida |

La quinta es la que sostiene toda la autorización de transacciones: es lo que impide que una autorización de RD$ 25,000 sirva para una de RD$ 500,000.

## 3. Defecto encontrado y corregido

La primera ejecución falló con `Key user not authenticated`, **y el diálogo biométrico nunca apareció**.

`DeviceKeyPlugin.kt` de la app Flutter documenta que «la llamada a `Signature.sign()` dispara el diálogo biométrico del sistema». **No lo hace.** Android exige firmar con un objeto criptográfico ya autenticado mediante `BiometricPrompt.CryptoObject`; sin eso el Keystore rechaza la operación y el cliente no ve nada.

Es decir: **la firma de transacciones de la app Flutter no podía funcionar en un teléfono real.** Como la app nunca llegó a producción, nadie lo detectó.

**Corrección:** `DeviceKeyModule.sign()` ahora prepara el `Signature` con `initSign`, lo envuelve en un `CryptoObject`, muestra el `BiometricPrompt` del sistema restringido a biometría fuerte, y firma dentro de la devolución de llamada de éxito. La promesa se resuelve una sola vez, con guarda atómica, porque el sistema puede invocar varias devoluciones de llamada en una misma sesión.

Registrado como **R-20** en `12-risk-register.md`.

## 4. Qué queda sin verificar

| Aspecto | Estado |
|---|---|
| Invalidación real al inscribir una biometría nueva | ⏳ Requiere agregar una huella al teléfono y repetir. Es la garantía más importante después de la firma |
| Firma verificada por el backend real | ⏳ Se hace al conectar con `/devices/verify-signature` |
| Todo lo de iOS | ⏳ Sin equipo macOS (P-13) |
| `FLAG_SECURE` del módulo de pantalla segura | ⏳ Sin ejercitar todavía |

## 6. Cancelación del diálogo — verificado

Ejecutado el 2026-09-16 tocando «Cancelar» en el diálogo del sistema, localizado dinámicamente con `uiautomator dump` (el botón queda en `[63,2214][294,2340]`).

```
BSC-VERIFY FALLO | Fallo durante la verificación | user_not_authenticated: Cancelar
```

El módulo nativo devuelve **`user_not_authenticated`**, que es el código que `outcomeForSigningError` traduce a `shouldFallbackToOtp: false`. Es decir: **cancelar la biometría no abre un camino más débil.**

Es una regla de negocio deliberada, heredada de `device_binding_service.dart`: ofrecer el código a quien acaba de rechazar la verificación lo entrenaría a esquivarla. La decisión está cubierta además por prueba unitaria en `signingOutcome.test.ts`.

Un primer intento quedó inconcluso porque la huella se leyó antes de que el toque llegara al botón, y la firma se completó en vez de cancelarse. Se repitió sin tocar el teléfono.

## 5. Cómo reproducirlo

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
npx react-native start
adb shell am start -n com.bsc.mobile/.MainActivity
# Tocar «Ejecutar verificación» y completar la biometría.
adb logcat -d --pid=$(adb shell pidof com.bsc.mobile) > verify.log
node scripts/verify-device-signature.mjs verify.log
```

**Nota sobre los valores:** la llave pública, el contenido firmado y la firma no se archivan aquí. Son de una llave de prueba en un dispositivo de desarrollo y se regeneran en cada ejecución, así que copiarlos no aportaría nada verificable.

---

# Verificación de las oleadas 1 a 3 en dispositivo

**Fecha:** 2026-09-16 · **Dispositivo:** Pixel 10a, Android 16
**Backend:** `http://localhost:5000` por túnel `adb reverse`, con el cliente de prueba

## Contratos contra el backend real

Siete pruebas de contrato ejecutadas contra la API levantada, con datos reales:

| # | Comprobación | Resultado |
|---|---|---|
| 1 | El login devuelve lo que el parser espera | ✅ |
| 2 | `/auth/me` devuelve el usuario en la forma esperada | ✅ |
| 3 | El perfil del cliente se interpreta sin perder campos | ✅ |
| 4 | La lista de productos se interpreta y agrupa | ✅ Sin categorías desconocidas |
| 5 | El resumen patrimonial se calcula con datos reales | ✅ Sin `NaN` |
| 6 | Los movimientos de una cuenta real se interpretan | ✅ |
| 7 | La política de sesión del backend se puede leer | ✅ |

Además, **las 45 rutas se verificaron contra el Swagger publicado**, que quedó versionado en `docs/migration/contratos/swagger-v1.json`.

## Recorrido en el teléfono

| Paso | Resultado |
|---|---|
| Pantalla de acceso | ✅ Gradiente de marca, panel blanco, ambas vías de entrada |
| Hoja de credenciales | ✅ |
| Credenciales incorrectas | ✅ «Usuario o contraseña incorrectos.», sin distinguir cuál |
| Acceso correcto | ✅ |
| Dashboard con datos reales | ✅ Cuentas, tarjetas y certificados agrupados |
| Formato de moneda | ✅ Distingue `RD$` de `$` por código de moneda |
| Montos grandes | ✅ `RD$2,000,000.00`, sin notación científica |
| Números enmascarados | ✅ `****3953` |
| Detalle de producto | ✅ Cabecera con saldo y lista de movimientos |
| Período sin movimientos | ✅ «Sin movimientos en este período», no pantalla de error |

## Defectos encontrados y corregidos en esta verificación

| # | Defecto | Cómo se detectó |
|---|---|---|
| 1 | **Los movimientos de préstamo son GET, no POST.** La ruta termina en `/retrieve` y eso indujo al error; el parámetro además se llama `loanCode`, no `loanNumber`, y exige la moneda | Prueba de paridad contra el Swagger. Con POST habría compilado igual y devuelto 405 al abrir un préstamo |
| 2 | **El teclado tapaba la hoja de credenciales.** `KeyboardAvoidingView` no funciona dentro de un `Modal` transparente en Android: esa ventana no recibe los márgenes del teclado | Probando en el Pixel. En emulador y en pruebas automáticas no se manifiesta |
| 3 | **`zod` rompía el empaquetado.** Usa sintaxis que exige un plugin de Babel adicional — y al mirarlo, solo validaba un objeto que los parsers ya habían construido y validado. Se eliminó | Metro, al empaquetar |

## Observación menor, sin corregir

Con el teclado abierto, el botón «Entrar» de la hoja queda fuera de la vista y hay que desplazarse para alcanzarlo. Funciona, pero conviene revisarlo con diseño: en una pantalla de acceso, el botón debería estar siempre a la vista.
