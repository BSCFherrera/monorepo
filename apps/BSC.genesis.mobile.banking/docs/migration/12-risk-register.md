# 12 — Registro de riesgos

**Escala:** Probabilidad y Impacto en Bajo / Medio / Alto. **Exposición** = combinación de ambos.

---

## Riesgos críticos

### R-01 — La firma con llave en hardware no alcanza paridad en React Native

**Probabilidad:** Media · **Impacto:** Alto · **Exposición: Alta**

`DeviceKeyPlugin.kt` usa `setUserAuthenticationParameters(0, AUTH_BIOMETRIC_STRONG)`, `setIsStrongBoxBacked`, `setInvalidatedByBiometricEnrollment` y `setUnlockedDeviceRequired`. Ninguna librería de npm expone ese conjunto, y el puente TurboModule es código nuevo en la ruta más sensible del producto.

- **Mitigación:** es lo primero que se hace, en la oleada 0, antes de escribir una sola pantalla. El Kotlin se reutiliza tal cual; solo se reescribe el puente. Se prueba en el Pixel real.
- **Contingencia:** si la paridad no se alcanza, **se detiene la migración y se reporta**. No se degrada el control de seguridad para que quepa en React Native.

### R-02 — La migración degrada la postura de seguridad

**Probabilidad:** Media · **Impacto:** Alto · **Exposición: Alta**

El bundle de JavaScript en el dispositivo (T-07) y la superficie de cadena de suministro de npm (T-15) son amenazas nuevas, y son exactamente las que el análisis original usó para recomendar Flutter.

- **Mitigación:** aceptación formal de ambas en el Gate B; bytecode de Hermes; ofuscación; sin `console.*` ni source maps en release; SCA, SBOM y escaneo de secretos en CI; ninguna decisión de autorización en JavaScript.
- **Contingencia:** si seguridad no acepta T-07, la migración no procede. Mejor saberlo antes de la oleada 0 que después de la 5.

### ~~R-03 — El cliente pierde la vinculación de su dispositivo al migrar~~ · **CERRADO** · 2026-09-16

**Exposición: Ninguna**

Se cerró al confirmar el banco que **`BSC.MobileApp` nunca llegó a producción**: estaba en etapa de desarrollo. No hay clientes con la app instalada, así que no hay dispositivos enrolados que perder, ni plan de comunicación que preparar, ni fricción de re-enrolamiento que medir.

Por la misma razón desaparecen: el problema de convivencia entre las dos apps, la necesidad de despliegue gradual sobre un parque instalado y la vuelta atrás a la versión Flutter en producción.

**Lo que sí queda:** el flujo de enrolamiento debe ser sólido desde el primer arranque, porque **todos** los clientes lo recorrerán por primera vez cuando la app salga.

### R-04 — Los defectos de seguridad abiertos se heredan

**Probabilidad:** Media · **Impacto:** Alto · **Exposición: Alta**

Ocho hallazgos abiertos en la app Flutter: pinning vacío, firma con llave de depuración, `applicationId` de plantilla, cleartext permitido, PIN sin validar, IP interna en el código, sin CI/CD, dependencias no usadas. Una migración apresurada los copia con otro lenguaje.

- **Mitigación:** están registrados en `09-traceability-matrix.md` §4 como diferencias deliberadas y tienen su propia oleada (la 9). El Gate D no cierra con ninguno abierto.

---

### R-20 — Lo que la app Flutter documenta no siempre es lo que hace · **NUEVO** · 2026-09-16

**Probabilidad:** Media · **Impacto:** Alto · **Exposición: Alta**

Al ejecutar la primera verificación en un Pixel real apareció un defecto que el código Flutter **documentaba como resuelto**. `DeviceKeyPlugin.kt` afirma en su comentario que «la llamada a `Signature.sign()` dispara el diálogo biométrico del sistema». **No lo hace.** Android exige firmar con un objeto criptográfico ya autenticado mediante `BiometricPrompt.CryptoObject`; sin eso el Keystore rechaza la operación con `Key user not authenticated` y el cliente nunca ve un diálogo.

Dicho de otro modo: **la firma de transacciones de la app Flutter no podía funcionar en un teléfono real.** Como la app nunca llegó a producción, nadie lo detectó.

No es un caso aislado. El propio código Flutter documenta otros tres del mismo tipo, encontrados por quien lo escribió después:

- El interceptor de autenticación llamaba a una ruta inexistente y leía un campo con otro nombre: la renovación de token no podía funcionar nunca.
- `RootDetection` y `AppIntegrity` estaban implementadas pero **nadie las llamaba**.
- `AppIntegrity` comparaba contra un nombre de paquete equivocado: en release habría bloqueado a todos los clientes.

**Consecuencia para la migración:** la app Flutter es una especificación funcional excelente —está bien escrita y bien comentada— pero **no es una garantía de que algo funcione**. Todo lo que dependa de hardware o del sistema operativo hay que verificarlo en un dispositivo real antes de darlo por migrado, no solo portarlo.

- **Mitigación:** ninguna capacidad que toque hardware se marca como verificada sin evidencia en dispositivo. La pantalla `SecurityCheckScreen` existe para eso y su evidencia se archiva en `archive/`.
- **Lo que esto valida:** el orden del plan de migración era correcto. Empezar por el núcleo de seguridad y no por las pantallas hizo que este defecto apareciera en la oleada 0 y no en la 5, con el flujo de transferencias ya construido encima.

## Riesgos altos

### R-05 — El contrato del backend no está publicado

**Probabilidad:** Alta · **Impacto:** Medio · **Exposición: Alta**

Sin OpenAPI versionado, el contrato se deriva leyendo controladores. Un desajuste aparece en ejecución, y en la feature más grande (`product_detail`, 5 tipos de producto con formas distintas) aparecerá tarde.

- **Mitigación:** esquemas Zod en el borde; pruebas de contrato con fixtures derivados de respuestas reales; P-03.

### R-06 — La estimación se subestima por contar solo las pantallas

**Probabilidad:** Alta · **Impacto:** Medio · **Exposición: Alta**

Hay 15 archivos `*_screen.dart`, pero **~30 superficies visuales**: las hojas modales y los pasos de asistente son pantallas de hecho. `add_beneficiary_sheet.dart` tiene 689 líneas, más que cualquier pantalla salvo el login.

- **Mitigación:** `03-screen-flow-catalog.md` §2 usa el inventario completo, no el conteo de archivos `_screen`.

### R-07 — La paridad visual no se alcanza porque Flutter dibuja y React Native compone

**Probabilidad:** Alta · **Impacto:** Medio · **Exposición: Alta**

Flutter renderiza con su propio motor; React Native usa controles nativos. Habrá diferencias legítimas en texto, sombras, elevaciones y animaciones. Los 6 gradientes de marca son especialmente sensibles.

- **Mitigación:** línea base capturada de la app Flutter, tolerancia explícita medida sobre las primeras pantallas, y revisión humana de toda diferencia. Aceptar de antemano que «pixel-perfect» no es un objetivo realista y acordar qué sí lo es.

### R-08 — El código de iOS se escribe pero no se puede verificar · **ACEPTADO** · 2026-09-16

**Probabilidad:** **Certeza** · **Impacto:** Medio · **Exposición: Media**

El banco decidió conseguir el equipo macOS **después** de la migración (P-13). Sin Mac no se puede compilar, probar, firmar ni publicar la app de iPhone, y el Secure Enclave ni siquiera se prueba en simulador.

Esto **no** es un riesgo pendiente de mitigar: es una limitación aceptada de forma consciente. Lo que hay que evitar es que se confunda «escrito» con «funcionando».

- **Mitigación:** arquitectura multiplataforma desde el inicio, sin atajos que después haya que deshacer. El módulo Swift se escribe siguiendo `adr/0003`. En la matriz de trazabilidad, todo lo de iOS queda marcado **«escrito, sin verificar»**, nunca «terminado».
- **Contingencia:** el Gate C y el Gate D se cierran **solo para Android**. iOS abre su propia fase de verificación cuando llegue el equipo, y hay que presupuestar ~42 puntos para ella.
- **Riesgo real que queda:** el módulo Swift puede tener defectos que nadie detecte durante meses. Se compensa manteniendo su superficie de métodos idéntica a la de Android y cubriendo la lógica compartida en TypeScript, que sí se prueba.

### R-19 — El control de autorización de transacciones está apagado · **NUEVO**

**Probabilidad:** **Alta** (verificado en configuración) · **Impacto:** Alto · **Exposición: Alta**

`src/BSC.EnLinea.API/appsettings.json:19` fija `"TransactionAuthorization": { "Enforce": false }`. Con esa bandera en `false`, el propio código del backend documenta que una transacción **sin autorización válida se ejecuta igual** y solo se registra en la bitácora. Toda la cadena —llave en hardware, firma biométrica, huella canónica, consumo de la autorización— está en **modo observación**, no bloqueando.

Es un riesgo del sistema actual, no introducido por la migración, pero afecta directamente al diseño de la app nueva: **construir contra un control apagado y encenderlo después es la forma más común de descubrir tarde que nunca funcionó de verdad.**

- **Mitigación:** confirmar el valor en producción (P-15.1) y el plan para activarlo (P-15.2). La app nueva se desarrolla y se prueba **contra un ambiente con `Enforce: true`**, aunque producción todavía no lo tenga.
- **Contingencia:** si no puede activarse antes del Gate D, se documenta como riesgo residual aceptado, con firma del área de seguridad y fecha de vencimiento.

---

## Riesgos medios

### R-09 — Dependencia comprometida en npm

**Probabilidad:** Media · **Impacto:** Alto

- **Mitigación:** lockfile fijado, SCA en CI, SBOM por versión, justificación escrita de cada dependencia, cero dependencias no usadas, y ninguna dependencia de terceros en la ruta de firma.

### R-10 — Duplicación de operaciones que mueven dinero · **REBAJADO**

**Probabilidad:** Baja · **Impacto:** Alto

Verificado el 2026-09-16: el backend **consume** la autorización (`ConsumeAuthorizationAsync`), es decir, la invalida tras el primer uso. Un segundo envío de la misma operación autorizada se rechaza. Eso es idempotencia efectiva por diseño, y cubre los tres controladores que mueven dinero.

⚠️ **Condicionado a R-19:** esa protección solo actúa con `Enforce: true`. Apagada, no hay ninguna.

- **Mitigación:** además del control del servidor, bloquear el botón al confirmar y no reintentar automáticamente en endpoints que mueven dinero; distinguir en la interfaz «ya se ejecutó» de «autorización inválida» (P-15.3); escenario obligatorio de doble toque en cada oleada que mueva dinero.

### R-11 — El paquete compartido con el portal se desincroniza

**Probabilidad:** Media · **Impacto:** Medio

Si `bsc-shared` se distribuye mal, se acaba con dos copias otra vez — que es justo el problema que la migración pretende resolver.

- **Mitigación:** decidir D-08 antes de la oleada 0; una sola fuente publicada con versión; prueba que verifica que los tres canales producen la misma huella.

### R-12 — El equipo no conoce React Native

**Probabilidad:** Media · **Impacto:** Medio

El equipo domina Vue/Nuxt y .NET. React Native comparte lenguaje con el portal, pero no modelo de componentes, ni navegación, ni herramientas nativas.

- **Mitigación:** las oleadas 0 a 2 establecen los patrones antes de tocar dinero; revisión cruzada obligatoria; licencias de Claude Code para la reescritura mecánica.

### R-13 — La cobertura de pruebas se queda como está

**Probabilidad:** Media · **Impacto:** Alto

Hoy hay 77 pruebas que no cubren pantallas, BLoCs, repositorios ni flujos de dinero. Bajo presión de calendario, la tentación es repetir ese patrón.

- **Mitigación:** umbrales por zona que hacen fallar el pipeline, no un promedio global; TDD con evidencia del ciclo; el DoD lo exige explícitamente.

### R-14 — Rendimiento inferior en listas largas

**Probabilidad:** Media · **Impacto:** Medio

Los movimientos de cuenta y los estados de tarjeta pueden ser listas largas, y es el escenario donde React Native históricamente sufre más frente a Flutter.

- **Mitigación:** medir la línea base en la app Flutter **antes** de migrar (B-06); usar listas virtualizadas desde el inicio; medir en el Gate D contra esa línea base, no contra una impresión.

---

## Riesgos bajos

| #    | Riesgo                                      | Mitigación                            |
| ---- | ------------------------------------------- | ------------------------------------- |
| R-15 | Textos incrustados dificultan la traducción | Extraer a catálogo desde la oleada 0  |
| R-16 | Tema oscuro definido y apagado              | Decidir en P-12.1                     |
| R-17 | Rutas duplicadas `/accounts` y `/products`  | Unificar previa confirmación (P-12.3) |
| R-18 | Deuda por asimetría de capas entre features | Norma de dos niveles (D-03)           |
