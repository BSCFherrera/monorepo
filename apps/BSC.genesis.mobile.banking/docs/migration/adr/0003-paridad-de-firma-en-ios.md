# ADR-0003 — Paridad de la firma de transacciones en iOS

**Estado:** 🟡 Propuesto
**Fecha:** 2026-09-16
**Contexto:** iOS entró en alcance por decisión del banco (P-02 respondida el 2026-09-16)
**Relacionado:** CT-02.3, R-01, R-08, oleada 0

---

## Contexto

La app Flutter **nunca ha tenido proyecto iOS**: no existe carpeta `ios/`. Por lo tanto, todo lo relativo a iPhone es **desarrollo nuevo, no migración**, y no hay comportamiento previo que preservar — solo una garantía de seguridad que igualar.

Esa garantía la define hoy `DeviceKeyPlugin.kt` en Android:

| Garantía | Cómo se consigue en Android |
|---|---|
| La llave privada nunca sale del hardware | `AndroidKeyStore` + `setIsStrongBoxBacked(true)` |
| Cada firma exige verificación del usuario | `setUserAuthenticationRequired(true)` + `setUserAuthenticationParameters(0, AUTH_BIOMETRIC_STRONG)` |
| Inscribir una biometría nueva invalida la llave | `setInvalidatedByBiometricEnrollment(true)` |
| No se firma con la pantalla bloqueada | `setUnlockedDeviceRequired(true)` |
| Solo biometría fuerte, nunca el PIN del teléfono | `AUTH_BIOMETRIC_STRONG` |
| Algoritmo verificable por el backend .NET | EC P-256, `SHA256withECDSA`, firma en DER |

La tercera fila es la más importante y la menos obvia: sin ella, alguien que añada su rostro al teléfono de la víctima podría firmar transferencias. El comentario del código Android documenta que se descartó aceptar la credencial del dispositivo precisamente porque Android **desactiva** esa invalidación cuando la llave admite PIN.

## Lo que iOS ofrece

El Secure Enclave soporta llaves **EC P-256** no exportables, que es exactamente el algoritmo que el backend ya verifica. La equivalencia por garantía:

| Garantía | Equivalente en iOS | Paridad |
|---|---|---|
| Llave en hardware no exportable | `kSecAttrTokenIDSecureEnclave` | ✅ Equivalente |
| Verificación del usuario en cada uso | `SecAccessControlCreateWithFlags` con `.biometryCurrentSet` | ✅ Equivalente |
| Invalidación al cambiar la biometría | `.biometryCurrentSet` invalida la llave cuando cambia el conjunto de biometrías inscritas | ✅ Equivalente |
| Solo biometría, nunca el código del teléfono | Usar `.biometryCurrentSet` y **no** `.userPresence` ni `.devicePasscode` | ✅ Equivalente, si se elige bien la bandera |
| No firmar con el dispositivo bloqueado | `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` | ✅ Equivalente |
| EC P-256 / ECDSA / DER | `SecKeyCreateSignature` con `.ecdsaSignatureMessageX962SHA256` | ✅ Equivalente — produce DER, que es lo que .NET verifica |
| Nivel de respaldo declarable al banco | ⚠️ iOS **no expone** un equivalente de `KeyInfo.securityLevel` | ❌ **Sin paridad** |

## La única brecha real

Android puede **decirle al banco** qué protege la llave: `strongbox`, `tee`, `hardware` o `software`. La app envía ese veredicto al enrolar, y `DeviceKeySecurity.meetsBankingBar` lo usa para decidir qué concede cada dispositivo.

iOS no ofrece esa introspección. Se sabe si el dispositivo **tiene** Secure Enclave y si la creación de la llave tuvo éxito, pero no hay un descriptor equivalente que enviar.

### Opciones para la brecha

- **A. Valor fijo `secure_enclave`** cuando la llave se crea con éxito en el enclave, y fallo del enrolamiento si no. El banco lo trata como equivalente a `strongbox`.
- **B. Modelo de niveles por plataforma:** el backend deja de interpretar una cadena de Android y pasa a recibir `{plataforma, nivel}`, con su propia tabla de equivalencias.
- **C. No enviar nada desde iOS** y asumir el nivel por defecto.

**Recomendación: A.** Es la que no toca el backend —restricción que el banco fijó en P-03— y la que refleja la realidad: en iOS, o la llave está en el Secure Enclave o el enrolamiento no procede. La opción B es más limpia a largo plazo pero exige cambiar el contrato, y eso hoy está fuera de alcance.

> ⚠️ Requiere **confirmar con el equipo de backend** que `secure_enclave` es un valor aceptado por el campo de veredicto. Si el backend valida contra una lista cerrada, rechazará todos los enrolamientos de iPhone. Es una verificación de cinco minutos que, omitida, cuesta una oleada entera.

## Decisión propuesta

Escribir `DeviceKeyModule` en **Swift**, con la misma superficie de métodos que el de Android (`isSupported`, `hasKey`, `createKey`, `getPublicKey`, `sign`, `deleteKey`, `describeKey`), expuesto por el mismo TurboModule tipado. La lógica de negocio en TypeScript no distingue plataforma: solo llama al módulo.

**Como en Android, no se usa librería de terceros.** Está en la ruta de la firma del dinero.

## Requisitos operativos que esto crea

| Requisito | Estado |
|---|---|
| Equipo macOS con Xcode para compilar, probar y publicar | ⛔ **No disponible.** Bloqueante, con plazo administrativo |
| Cuenta de Apple Developer del banco (Enterprise u Organization) | ❓ Por confirmar |
| iPhone físico con Face ID o Touch ID para pruebas | ❓ El Secure Enclave y la biometría **no se pueden probar en simulador** |
| Perfiles de aprovisionamiento y certificados de distribución | ❓ Por confirmar |
| Versión mínima de iOS soportada | ❓ Por definir — sugerido iOS 15+ |

## Criterio de salida

La oleada 0 no cierra hasta que **una operación real se firme correctamente en un iPhone físico y el backend .NET verifique esa firma**, igual que se exige en Android. Una prueba en simulador no cuenta.
