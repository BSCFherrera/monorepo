# 06 — Modelo de amenazas

**Metodología:** STRIDE sobre los límites de confianza del sistema, complementada con la revisión de controles de OWASP MASVS para lo móvil y OWASP ASVS para los puntos de contacto con el backend.

**Declaración honesta:** este documento **no constituye ni declara cumplimiento formal** de MASVS, ASVS, PCI DSS ni de ninguna norma. Es un análisis de ingeniería. Cualquier afirmación de cumplimiento requiere evidencia de auditoría que hoy no existe.

**Alcance:** la app móvil, su almacenamiento local, su código nativo y su comunicación con el backend. El backend y el bus quedan fuera salvo en lo que la app depende de ellos.

---

## 1. Activos

| #    | Activo                                                        | Por qué importa                                                                       |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A-01 | Llave privada de firma del dispositivo                        | Con ella se autorizan transacciones. Vive en StrongBox/TEE y no es exportable         |
| A-02 | Token de acceso y token de renovación                         | Dan acceso a la cuenta durante su vigencia                                            |
| A-03 | Secreto TOTP del cliente (`bsc_soft_token_secret`)            | **Uno por cliente y compartido entre canales**: comprometerlo afecta más que a la app |
| A-04 | Secreto de vinculación del dispositivo (`bsc_device_secret`)  | Segundo factor silencioso                                                             |
| A-05 | Datos del cliente: saldos, movimientos, identidad, documentos | PII y datos financieros                                                               |
| A-06 | Integridad de la operación en tránsito (monto, destino)       | Un cambio no detectado es un fraude consumado                                         |
| A-07 | El binario de la app y su bundle JavaScript                   | Superficie de manipulación y de ingeniería inversa                                    |
| A-08 | Credenciales de firma de la aplicación                        | Quien las tenga publica una app que los clientes creerán legítima                     |

## 2. Actores

| Actor                               | Capacidades asumidas                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| Cliente legítimo                    | Posee el teléfono y su biometría                             |
| Atacante remoto                     | Red, phishing, servidor malicioso, sin acceso físico         |
| Atacante con el teléfono en la mano | Robo o pérdida; puede intentar desbloquear                   |
| Atacante con root / _hooking_       | Frida, Xposed, emulador; control total del espacio de la app |
| Desarrollador o interno             | Acceso al código, al pipeline, a ambientes                   |
| Red hostil                          | Wi-Fi público, proxy corporativo, MITM con CA propia         |

## 3. Límites de confianza

```
[Cliente] ─1─ [UI React Native / bundle JS] ─2─ [Módulos nativos Kotlin]
                        │                                │
                        3                                4
                        │                                │
                [Almacenamiento seguro]          [StrongBox / TEE]
                        │
                        5
                        │
                  [Red TLS] ─6─ [¿API Gateway?] ─7─ [Backend] ─ [Bus App Connect] ─ [Core]
```

| #   | Límite                       | Nota                                                                                                                   |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Persona ↔ aplicación         | Suplantación, phishing, hombro                                                                                         |
| 2   | JavaScript ↔ nativo          | **Nuevo con React Native.** En Flutter el borde era Dart compilado ↔ Kotlin; ahora es JavaScript interpretado ↔ Kotlin |
| 3   | Aplicación ↔ almacenamiento  | Keystore, respaldos, caché, archivos temporales                                                                        |
| 4   | Aplicación ↔ hardware seguro | La llave privada nunca lo cruza                                                                                        |
| 5   | Dispositivo ↔ red            | TLS y pinning                                                                                                          |
| 6   | ❓ ¿Existe el gateway?       | `ARQUITECTURA-RED-SEGURIDAD.md` dice que debe existir; hoy la app apunta directo a una IP interna                      |
| 7   | Gateway ↔ backend            | Fuera del alcance de este documento                                                                                    |

## 4. Amenazas (STRIDE)

| #        | STRIDE                          | Amenaza                                                             | Control actual                                                                                                                                                      | Control en la app nueva                                                                                                                                                                                                                                                           | Riesgo residual                        |
| -------- | ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **T-01** | Spoofing                        | Suplantación del cliente con teléfono robado                        | Biometría exigida por el SO en cada firma; llave invalidada al inscribir biometría nueva                                                                            | Conservar idéntico; **es el control más fuerte del producto**                                                                                                                                                                                                                     | Bajo                                   |
| **T-02** | Tampering                       | Alteración del monto o destino entre confirmación y ejecución       | Huella canónica SHA-256 firmada y verificada por el backend                                                                                                         | Conservar; usar la implementación TypeScript compartida                                                                                                                                                                                                                           | Bajo                                   |
| **T-03** | Tampering                       | MITM con CA instalada en el dispositivo                             | ⛔ **Ninguno: el pinning es un método vacío**                                                                                                                       | Pinning por SPKI con pin de respaldo y rotación documentada (ADR-0002)                                                                                                                                                                                                            | **Alto hoy**                           |
| **T-04** | Repudiation / Replay            | Reenvío de una petición capturada                                   | Cabeceras `X-Timestamp` y `X-Nonce`, pero el nonce es **predecible** y ❓ no se sabe si el servidor lo valida                                                       | Nonce aleatorio criptográfico; confirmar validación en servidor; idempotencia en los endpoints que mueven dinero                                                                                                                                                                  | Medio                                  |
| **T-05** | Information disclosure          | Captura de pantalla o vista previa en el conmutador de apps         | `FLAG_SECURE` por pantalla mediante módulo nativo                                                                                                                   | Portar el módulo Kotlin; **revisar la lista de pantallas protegidas**, hoy no está documentada                                                                                                                                                                                    | Bajo                                   |
| **T-06** | Information disclosure          | Tráfico HTTP en claro                                               | ⛔ `usesCleartextTraffic="true"` en el manifiesto                                                                                                                   | Prohibido en release; permitido solo en la variante de desarrollo y bloqueado por el verificador de configuración                                                                                                                                                                 | **Alto hoy**                           |
| **T-07** | Tampering / Reverse engineering | **Manipulación del bundle JavaScript**                              | No aplica en Flutter: compila AOT sin intérprete                                                                                                                    | **Amenaza nueva introducida por esta migración.** Mitigación: bytecode de Hermes (no JavaScript legible), ofuscación, `console.*` eliminado en release, sin _source maps_ en el paquete, verificación de firma de la app, y ninguna decisión de autorización tomada en JavaScript | **Medio — requiere aceptación formal** |
| **T-08** | Elevation of privilege          | Hooking con Frida para saltar la verificación biométrica            | La biometría la exige el **sistema operativo** al usar la llave, no una bandera de la app: un hook no la evita                                                      | Conservar esta propiedad. **No mover la decisión a JavaScript bajo ninguna circunstancia**                                                                                                                                                                                        | Bajo                                   |
| **T-09** | Spoofing                        | Enlace o intent malicioso que abre la app en un estado no confiable | ⛔ No aplica: no hay deep links                                                                                                                                     | Si se agregan, validación de origen y firma, y nunca ejecutar una operación directa desde un enlace                                                                                                                                                                               | N/A hoy                                |
| **T-10** | Information disclosure          | Secretos en el código o en los artefactos                           | ⛔ La IP interna del banco está en `api_constants.dart`                                                                                                             | Escaneo de secretos en CI sobre **código y bundle compilado**; configuración inyectada en compilación                                                                                                                                                                             | Medio                                  |
| **T-11** | Spoofing                        | App repackaged distribuida fuera de la tienda                       | ⛔ `applicationId` de plantilla y **release firmada con llave de depuración**                                                                                       | `applicationId` propio, llave de release custodiada, verificación de firma en arranque, Play Integrity ❓                                                                                                                                                                         | **Alto hoy**                           |
| **T-12** | Information disclosure          | Datos sensibles en respaldos del sistema o en caché en disco        | 🔎 Sin verificar; `allowBackup` no está declarado                                                                                                                   | `allowBackup=false`, reglas de extracción de datos, caché de red solo en memoria                                                                                                                                                                                                  | Medio                                  |
| **T-13** | Elevation of privilege          | Dispositivo con root usado para enrolar                             | Veredicto de integridad evaluado y enviado al enrolar                                                                                                               | Conservar. ⚠️ El veredicto lo produce el cliente: **el backend no puede confiar en él**, sirve para proteger al cliente honesto y dejar traza                                                                                                                                     | Medio                                  |
| **T-14** | Information disclosure          | PII y montos en registros y reportes de fallos                      | No hay observabilidad: no hay fuga, pero tampoco visibilidad                                                                                                        | Redactor obligatorio en el origen, antes de que el dato entre al registro                                                                                                                                                                                                         | Medio                                  |
| **T-15** | Elevation of privilege          | Dependencia de npm comprometida (cadena de suministro)              | 30 dependencias Dart, 8 de ellas sin usar                                                                                                                           | **npm tiene una superficie de cadena de suministro mucho mayor que pub.dev.** Lockfile fijado, SCA en CI, SBOM por versión, justificación escrita de cada dependencia, cero dependencias no usadas                                                                                | **Medio — aumenta con la migración**   |
| **T-16** | Information disclosure          | Portapapeles: el cliente copia un número de cuenta                  | 🔎 Sin control                                                                                                                                                      | Evaluar `secureTextEntry` y limpieza del portapapeles en campos sensibles                                                                                                                                                                                                         | Bajo                                   |
| **T-17** | Denial of service               | Sesión que no expira en un teléfono desatendido                     | Expiración por inactividad real con aviso, política del backend                                                                                                     | Conservar; cubrir además el paso a segundo plano                                                                                                                                                                                                                                  | Bajo                                   |
| **T-18** | Spoofing                        | **El PIN no se valida contra nada**                                 | ⛔ `pin_screen.dart:42` TODO abierto                                                                                                                                | Definir el comportamiento correcto; el PIN nunca se almacena en claro y se compara contra un hash con sal                                                                                                                                                                         | **Alto hoy**                           |
| **T-19** | Elevation of privilege          | **Ejecutar una transacción sin autorización válida**                | ⛔ `appsettings.json:19` → `"Enforce": false`. El guard registra el rechazo pero **ejecuta la transacción igual**. Toda la cadena de firma está en modo observación | Desarrollar y probar contra un ambiente con `Enforce: true`; confirmar el valor en producción y el plan de activación (P-15)                                                                                                                                                      | **Alto hoy — lado servidor**           |

## 5. Amenazas que esta migración **introduce**

Hay que declararlas de forma explícita, porque el análisis original del repositorio las usó como argumento a favor de Flutter:

1. **T-07 — Bundle JavaScript en el dispositivo.** Flutter compila a código máquina; React Native embarca bytecode de Hermes. Es más difícil de leer que JavaScript plano, pero sigue siendo más accesible que un binario AOT. Mitigable, no eliminable.
2. **T-15 — Superficie de dependencias.** npm es un ecosistema mayor y con historial de incidentes de cadena de suministro más frecuente que pub.dev.
3. **Un límite de confianza nuevo (el número 2).** El borde JavaScript ↔ nativo no existía antes. Todo lo que cruce ese borde debe tratarse como entrada no confiable en el lado Kotlin.

**Estas tres deben ser aceptadas formalmente por seguridad antes del Gate B.** No es una formalidad: son precisamente los puntos que el documento `ANALISIS-STACK-TECNOLOGICO.md` usó para recomendar Flutter.

## 6. Controles a verificar en el Gate D

- [ ] Sin secretos en el código, el bundle, el repositorio, los registros ni los artefactos.
- [ ] TLS con pinning activo y rotación probada (incluyendo la prueba de que el pin de respaldo funciona).
- [ ] Tokens y secretos exclusivamente en almacenamiento seguro del sistema operativo.
- [ ] No se almacena PIN, CVV, contraseña, OTP ni dato bancario que no sea imprescindible.
- [ ] Redacción de PII y montos en registros, analytics y reportes de fallos, verificada con una prueba.
- [ ] Cierre de sesión, expiración, renovación, revocación e inactividad, con borrado completo del estado.
- [ ] Sin datos sensibles en portapapeles, caché, archivos temporales, respaldos ni vista previa en segundo plano.
- [ ] Detección de root, emulador y manipulación conforme a la política institucional, evaluando falsos positivos y su impacto en clientes legítimos.
- [ ] Enlaces, intents y navegación no confiable validados (o ausentes por diseño).
- [ ] Validación de toda entrada y salida; sin WebViews con contenido remoto (❓ confirmar que no se necesitan).
- [ ] La autorización la impone siempre el backend.
- [ ] Dependencias con procedencia, licencia, análisis de vulnerabilidades, lockfile y SBOM por versión.
- [ ] Firma de release con llave custodiada, permisos mínimos, y endurecimiento de la compilación de producción.
- [ ] SAST, SCA, escaneo de secretos y revisión MASTG priorizada por riesgo, ejecutados en CI.

## 7. Nota sobre controles invasivos

No se implementará bloqueo de dispositivo, detección agresiva de manipulación ni ningún control que pueda expulsar a clientes legítimos **sin aprobación previa y análisis de impacto**. La app actual ya toma esta postura y está bien razonada en su código: un teléfono con root puede consultar el saldo; lo que no puede es enrolarse como dispositivo de confianza. Conviene preservar ese criterio.
