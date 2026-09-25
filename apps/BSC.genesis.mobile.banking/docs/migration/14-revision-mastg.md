# Revisión MASTG, priorizada por riesgo

**Fecha:** 2026-09-17 · **Alcance:** `BSC.MobileAppRN`, Android · **Estado:** primera pasada

El MASTG es la guía de pruebas de seguridad móvil de OWASP, y el MASVS el
conjunto de requisitos que la acompaña. Son el estándar con el que una auditoría
bancaria mide una aplicación móvil, así que conviene medirse antes de que lo
haga otro.

**Cómo leer esto.** No es un recorrido completo del estándar —eso es trabajo de
una auditoría formal— sino una revisión priorizada: se miran primero los
controles cuyo incumplimiento **mueve dinero o expone datos**, y después el
resto. Cada fila dice qué exige el control, qué hace la aplicación hoy y qué
falta.

Los identificadores `D-*` y `V-*` remiten a [`13-pendientes.md`](./13-pendientes.md).

| Estado | Qué significa                                               |
| ------ | ----------------------------------------------------------- |
| ✅     | Cumple, y hay una prueba o una verificación que lo sostiene |
| 🟡     | Cumple en parte, o cumple sin que nada lo vigile            |
| ⛔     | No cumple                                                   |
| ⏳     | Depende de una decisión del banco                           |

---

## 1. Almacenamiento (MASVS-STORAGE)

| Control                                     | Estado | Qué hace la aplicación                                                                                                                                                                                                              |
| ------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No guardar credenciales en claro**        | ✅     | `SecureStorage` va sobre `EncryptedSharedPreferences` de AndroidX. Las trece claves están nombradas y probadas. Falta ejercitar el cifrado en el teléfono (V-09)                                                                    |
| **La llave privada no sale del hardware**   | ✅     | Se genera en el Keystore con `setUserAuthenticationRequired` y `setInvalidatedByBiometricEnrollment`. Verificado en StrongBox en el Pixel en la oleada 0                                                                            |
| **No exponer datos por copia de seguridad** | ✅     | `allowBackup=false`, `fullBackupContent=false` y reglas de extracción que no dejan salir nada, ni a la nube ni a otro teléfono. Fijado por prueba                                                                                   |
| **No filtrar datos por registros**          | ✅     | El plugin propio quita `console.*` del paquete de producción —verificado sobre el paquete real— y el registro que queda redacta antes de escribir                                                                                   |
| **No exponer datos en capturas**            | 🟡     | `FLAG_SECURE` en la pantalla del token, verificado en el Pixel. **No está en las pantallas de saldos ni en los comprobantes**, igual que el original. Conviene decidirlo: el conmutador de aplicaciones muestra el último fotograma |

## 2. Criptografía (MASVS-CRYPTO)

| Control                                       | Estado | Qué hace la aplicación                                                                                                                                                       |
| --------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primitivas estándar y bien parametrizadas** | ✅     | SHA-256 y HMAC-SHA256 propios, contrastados contra `node:crypto`; firma EC P-256 del Keystore. TOTP RFC 6238                                                                 |
| **Sin claves escritas en el código**          | ✅     | El escáner de secretos lo comprueba en cada `npm run verify`                                                                                                                 |
| **Aleatoriedad adecuada**                     | 🟡     | El `deviceInstallId` **no** usa un generador criptográfico, y es correcto: el servidor no le concede autoridad. Queda dicho para que una auditoría no lo lea como un defecto |

## 3. Autenticación y autorización (MASVS-AUTH)

| Control                                             | Estado | Qué hace la aplicación                                                                                                                                                 |
| --------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **La biometría no es la decisión, solo desbloquea** | ✅     | La biometría desbloquea la llave del hardware; lo que viaja al banco es una firma. Un dispositivo comprometido no puede responder «sí» y pasar                         |
| **Operación ligada a su autorización**              | ✅     | La huella se deriva **del cuerpo que se envía**, y las tres coinciden con lo que el backend calcula —verificado contra el servidor levantado—                          |
| **El servidor manda**                               | ✅     | El `customerCode` sale del token de sesión, nunca del cuerpo, en todas las llamadas de dispositivos y transacciones                                                    |
| **Cierre de sesión por inactividad**                | ✅     | `SessionManager`, con el hueco medido al volver y no confiando en un temporizador                                                                                      |
| **Que la protección esté encendida**                | ⏳     | `TransactionAuthorizationSettings.Enforce` está **apagado**: hoy una operación sin autorización válida se ejecuta igual. Es D-04, y es lo más importante de esta lista |

## 4. Comunicaciones (MASVS-NETWORK)

| Control                                     | Estado | Qué hace la aplicación                                                                                                                                                                                                |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sin tráfico en claro**                    | ✅     | Prohibido en la configuración de red; la excepción del bucle local vive en un archivo que solo se compila en depuración                                                                                               |
| **Sin confiar en certificados del usuario** | ✅     | Solo en depuración                                                                                                                                                                                                    |
| **Certificate pinning**                     | ⏳     | **No hay.** La aplicación acepta cualquier certificado que el sistema confíe, incluido el de un proxy corporativo. El andamiaje y la herramienta para calcular las huellas están; faltan las huellas del banco (D-02) |

## 5. Integridad y resistencia (MASVS-RESILIENCE)

| Control                                   | Estado | Qué hace la aplicación                                                                                                                                                                                                                                                   |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Detección de dispositivo comprometido** | 🟡     | Módulo propio: binarios `su`, aplicaciones de root y compilación con claves de prueba. El veredicto viaja al enrolar. **Es una señal, no una garantía**: lo produce el cliente y un atacante lo falsifica. Sirve para negar el caso honesto y dejar constancia del resto |
| **Ofuscación y reducción del código**     | ✅     | R8 encendido con sus reglas; Hermes compila el JavaScript a bytecode. `assembleRelease` verificado                                                                                                                                                                       |
| **Firma de la aplicación**                | ⛔     | Hoy la release se firma con **la llave de depuración**, que es pública. El mecanismo para leer un almacén externo está; falta la custodia (D-03)                                                                                                                         |
| **Detección de depurador**                | 🟡     | Se comprueba, pero solo se reporta al enrolar. No se actúa en tiempo de ejecución                                                                                                                                                                                        |
| **Anti-tampering del paquete**            | 🟡     | Se compara el nombre del paquete instalado. Una verificación de firma —comparar el certificado con el que firmó— sería más fuerte y hoy no se puede: no hay firma de release (D-03)                                                                                      |

## 6. Privacidad (MASVS-PRIVACY)

| Control                                     | Estado | Qué hace la aplicación                                                                        |
| ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| **Minimizar lo que se registra**            | ✅     | El registro redacta antes de escribir, y la redacción vive en el registro, no en quien llama  |
| **Permisos mínimos**                        | ✅     | El manifiesto declara **un solo permiso**: `INTERNET`                                         |
| **Sin identificadores persistentes de más** | ✅     | El `deviceInstallId` es propio de la aplicación y no sale de ella salvo al banco              |
| **Qué se considera PII**                    | ⏳     | Las listas de redacción son nuestras. Falta que Seguridad y Cumplimiento las confirmen (F-07) |

## 7. Plataforma (MASVS-PLATFORM)

| Control                               | Estado | Qué hace la aplicación                                                                                                              |
| ------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Sin componentes exportados de más** | ✅     | Solo `MainActivity`. El `FileProvider` va con `exported="false"` y permisos de un solo uso                                          |
| **Sin deep links sin validar**        | ✅     | No hay `intent-filter` de navegación, y el verificador lo comprueba                                                                 |
| **WebView**                           | ✅     | No se usa ninguno                                                                                                                   |
| **Tecleado seguro**                   | 🟡     | Los campos de contraseña y código usan el teclado del sistema. No se desactiva el autocompletado ni se pide teclado sin sugerencias |

---

## Lo que esta revisión dice, en una frase

**La aplicación está sólida donde se mueve el dinero** —la firma, la huella, el
almacenamiento y la red— **y le faltan tres cosas para poder publicarse**, y las
tres son decisiones del banco, no trabajo pendiente del equipo: encender
`Enforce` (D-04), las huellas del pinning (D-02) y la custodia del almacén de
claves (D-03).

Lo demás son matices que conviene resolver antes de una auditoría formal, no
antes de un piloto.

## Lo que esta revisión **no** cubre

Y conviene decirlo, porque una lista de controles verdes invita a creer que se
ha mirado todo:

- **iOS entero.** No hay ni un módulo nativo escrito (P-13).
- **Pruebas dinámicas**: interceptar el tráfico con un proxy, manipular el
  binario en ejecución, intentar saltarse el pinning. Exigen herramientas y un
  entorno de pruebas de penetración.
- **Ingeniería inversa real** del APK de release para medir cuánto cuesta.
- **El backend y TokenBSC**, que quedan fuera del alcance del MASTG y tienen su
  propio modelo de amenazas.
