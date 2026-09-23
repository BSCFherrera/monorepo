# 08 — Plan de migración

**Estado:** propuesta, sujeta a las respuestas de `11-open-questions.md`.
**Unidad de estimación:** esfuerzo **relativo** (puntos), no días. Convertir a calendario exige saber cuánta gente y con qué dedicación (P-09).
**Supuesto de productividad:** el equipo de la Fábrica Digital trabaja con licencias de Claude Code, lo que reduce de forma apreciable el costo de la reescritura mecánica de interfaz —el grueso del volumen— pero **no** el de las decisiones de arquitectura, la especificación funcional, la verificación en hardware real ni la revisión de seguridad, que son las que gobiernan el calendario.

---

## 1. Principio de ordenamiento

**Se migra primero lo que puede matar el proyecto, no lo que se ve.**

Si la firma con llave en hardware no funciona en React Native con las mismas garantías que hoy —StrongBox, biometría obligatoria por firma, invalidación al cambiar la biometría—, la migración entera es inviable y hay que saberlo en la oleada 1, no en la 7. Es la inversión de la intuición habitual, que empezaría por el login porque es la primera pantalla.

## 2. Fases y gates

| Fase                       | Contenido                                                                                               | Gate de salida                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **0. Entorno**             | Repositorios, accesos, herramientas, decisión de iOS                                                    | Gate 0                             |
| **1. Descubrimiento**      | Inventario, specs, contrato de API, catálogo de pantallas, preguntas                                    | **Gate A — alcance aprobado**      |
| **2. Cimientos**           | ADR aprobados, esqueleto técnico, `verify` funcionando, CI mínimo, módulos nativos probados en hardware | **Gate B — arquitectura aprobada** |
| **3. Oleadas por feature** | Ciclos SDD/TDD, uno por feature                                                                         | **Gate C — por feature**           |
| **4. Verificación total**  | `verify` completo, pruebas por pantalla, seguridad, rendimiento                                         | **Gate D — candidata a release**   |
| **5. Cierre**              | Trazabilidad, documentación reconciliada, runbooks, plan de despliegue y vuelta atrás                   | **Gate E — cierre**                |

## 3. Oleadas

### Oleada 0 — Cimientos · esfuerzo: **13** · riesgo: **alto**

Lo que hay que resolver antes de escribir una sola pantalla.

| Entregable                                                                                            | Nota                                                                                            |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Proyecto React Native creado según D-01, con TypeScript estricto                                      |                                                                                                 |
| `packages/bsc-shared/` con `operationFingerprint` **compartido con el portal**, y sus pruebas al 100% | La prueba de aceptación es que el hash coincida carácter por carácter con el de C# y el de Dart |
| `DeviceKeyModule` portado del Kotlin existente, probado en el Pixel real                              | **Es el hito que decide la viabilidad**                                                         |
| `SecureScreenModule` portado                                                                          |                                                                                                 |
| Cliente HTTP con el interceptor de autenticación replicado y sus pruebas                              | Se portan primero las pruebas de `auth_interceptor_test.dart`                                   |
| Almacenamiento seguro con migración de las 13 claves                                                  |                                                                                                 |
| Gestor de sesión con inactividad + `AppState`                                                         |                                                                                                 |
| `verify` ejecutable y fallando correctamente                                                          |                                                                                                 |
| CI mínimo en Azure DevOps                                                                             |                                                                                                 |
| Sistema de diseño: tokens de color, tipografía, espaciado y los 6 gradientes                          |                                                                                                 |

**Criterio de salida:** una app sin pantallas de negocio que ya sabe autenticarse, renovar el token, expirar la sesión, y **firmar una operación con la llave del StrongBox en un teléfono real**. Con eso, el riesgo principal del proyecto queda cerrado.

### Oleada 1 — Acceso y sesión · esfuerzo: **8** · riesgo: medio

`auth` (login, biometría, PIN) + integración del gestor de sesión en la navegación.

⚠️ **El PIN no se migra tal cual: hoy no valida nada.** Hay que especificar el comportamiento correcto y escribir primero su prueba de regresión.

### Oleada 2 — Cliente y dashboard · esfuerzo: **13** · riesgo: bajo

`customer`, `dashboard`, `profile`, `account_officer`. Es la primera oleada con valor visible y la que establece los patrones de pantalla que reutilizan las demás. Buena candidata para la primera demostración a áreas funcionales.

### Oleada 3 — Detalle de producto · esfuerzo: **21** · riesgo: **alto**

`product_detail`: 6.320 líneas y 5 tipos de producto (CA/CC/TC/PR/CD), cada uno con una forma de respuesta distinta y nombres de campo del core en español y mayúsculas. Incluye movimientos, estados de cuenta y descarga de PDF.

Es la feature más grande y la más expuesta al mapeo manual de DTOs. **Aquí es donde los esquemas Zod pagan su costo**: convierten un fallo silencioso en un error claro.

### Oleada 4 — Beneficiarios · esfuerzo: **13** · riesgo: medio

`beneficiaries`: alta interna e interbancaria, validación de cuenta, 3 catálogos, confirmación. Es requisito de las transferencias a terceros, por eso va antes.

### Oleada 5 — Transferencias · esfuerzo: **21** · riesgo: **alto**

`transfers` completo, con el asistente de 3 pasos, comisiones, comprobante y la integración con la autorización de la oleada 0. **Es la primera oleada que mueve dinero de verdad**, y la que exige todos los escenarios transversales de `07-test-strategy.md`.

### Oleada 6 — Pagos · esfuerzo: **13** · riesgo: alto

`payments`: tarjeta y préstamo, propios y a terceros. Reutiliza el patrón de asistente de la oleada 5. Si en la oleada 5 se unifican los pasos compartidos, esta oleada baja de forma considerable.

### Oleada 7 — Dispositivos y segundo factor · esfuerzo: **13** · riesgo: medio

`device_binding` (pantalla de seguridad, mis dispositivos, token suave) y `two_factor`. La criptografía ya está resuelta desde la oleada 0; esto es la interfaz sobre ella.

### Oleada 8 — Complementarias · esfuerzo: **8** · riesgo: bajo

`exchange_rates`, `tax_receipts`.

### Oleada 9 — Endurecimiento · esfuerzo: **13** · riesgo: **alto**

No es limpieza final: es trabajo sustantivo que **no existe hoy en la app Flutter**.

| Tarea                                                                           | Corrige    |
| ------------------------------------------------------------------------------- | ---------- |
| Certificate pinning por SPKI con respaldo y rotación                            | T-03       |
| `applicationId` propio y firma de release custodiada                            | T-11       |
| Prohibición de tráfico en claro en release                                      | T-06       |
| Endurecimiento del bundle: Hermes, ofuscación, sin `console.*`, sin source maps | T-07       |
| Observabilidad con redacción de PII                                             | T-14       |
| SBOM, SCA, escaneo de secretos, licencias en CI                                 | T-15, T-10 |
| `allowBackup=false` y reglas de extracción                                      | T-12       |
| Revisión MASTG priorizada por riesgo                                            | —          |

### Oleada 10 — Verificación total y despliegue · esfuerzo: **8**

`verify` completo, pruebas por pantalla, rendimiento contra la línea base de Flutter, informe final, runbooks, plan de piloto y de vuelta atrás.

## 4. Resumen

| Oleada                         | Esfuerzo | Riesgo |
| ------------------------------ | -------: | ------ |
| 0 — Cimientos                  |       13 | Alto   |
| 1 — Acceso                     |        8 | Medio  |
| 2 — Cliente y dashboard        |       13 | Bajo   |
| 3 — Detalle de producto        |       21 | Alto   |
| 4 — Beneficiarios              |       13 | Medio  |
| 5 — Transferencias             |       21 | Alto   |
| 6 — Pagos                      |       13 | Alto   |
| 7 — Dispositivos y 2FA         |       13 | Medio  |
| 8 — Complementarias            |        8 | Bajo   |
| 9 — Endurecimiento             |       13 | Alto   |
| 10 — Verificación y despliegue |        8 | Medio  |
| **Total**                      |  **144** |        |

### iOS — confirmado en alcance (P-02, 2026-09-16)

| Concepto                                                                                      | Esfuerzo adicional |
| --------------------------------------------------------------------------------------------- | ------------------ |
| `DeviceKeyModule` en Swift sobre Secure Enclave (ADR-0003) — **desarrollo nuevo, no portado** | +8                 |
| `SecureScreenModule` en Swift (iOS no tiene `FLAG_SECURE`: se resuelve distinto)              | +3                 |
| Paridad visual y ajustes de plataforma en ~30 superficies                                     | +21                |
| Proyecto iOS, firma, perfiles, CI y proceso de App Store                                      | +13                |
| Pruebas en iPhone físico y escenarios por plataforma                                          | +5                 |
| **Subtotal iOS**                                                                              | **+50 (≈ +35%)**   |

**Total con iOS: ~195 puntos**, antes de decidir P-04.

⚠️ **Dependencia bloqueante:** sin equipo macOS no hay compilación, ni pruebas, ni publicación, y el Secure Enclave **no se puede probar en simulador**. Es un plazo administrativo, no técnico: hay que iniciarlo en paralelo con la oleada 0 de Android. Ver P-13.

## 5. Ciclo de cada oleada (SDD)

1. **Discover** — evidencia en el código Flutter, dependencias, riesgos de la feature.
2. **Specify** — comportamiento, contratos, estados, seguridad, criterios de aceptación.
3. **Review** — preguntas y **aprobación explícita del spec**. Sin esto no se avanza.
4. **Test design** — pruebas escritas antes del código; matriz de escenarios.
5. **Implement** — el mínimo cambio que pone las pruebas en verde dentro de la arquitectura aprobada.
6. **Verify** — `verify` + pruebas por pantalla + seguridad + rendimiento aplicables.
7. **Reconcile** — trazabilidad, ADR, deuda, riesgos y diferencias respecto a Flutter.
8. **Archive** — spec congelado, evidencia de pruebas y handoff en `archive/`.

Una oleada **no está terminada** si la documentación y la trazabilidad no reflejan el código real.

## 6. Convivencia, piloto y vuelta atrás

**Simplificación confirmada el 2026-09-16:** `BSC.MobileApp` **nunca llegó a producción**. No hay clientes con la app instalada, y eso elimina de un golpe los problemas que normalmente dominan una migración móvil.

| Aspecto                                   | Situación real                                                                                                                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convivencia entre las dos apps            | **No aplica.** Nadie tiene la app Flutter instalada                                                                                                                                            |
| Re-enrolamiento de clientes               | **No aplica.** No hay dispositivos enrolados que perder. Lo que sí importa es que el flujo de enrolamiento sea sólido, porque **todos** los clientes lo recorrerán por primera vez             |
| Despliegue gradual sobre parque instalado | **No aplica.** La app nueva es el primer lanzamiento real                                                                                                                                      |
| Vuelta atrás a la versión Flutter         | **No aplica.** No hay versión anterior publicada                                                                                                                                               |
| `applicationId`                           | Se define ahora sin restricciones heredadas. Propuesto: `do.com.bsc.mobile` (P-10)                                                                                                             |
| Piloto                                    | Grupo interno antes del lanzamiento ❓                                                                                                                                                         |
| **Criterio de aborto**                    | Si en la oleada 0 la firma con llave en hardware no alcanza paridad, **se detiene y se reporta**, en vez de degradar el control de seguridad para que quepa en React Native. Esto sigue en pie |

**Consecuencia de fondo:** la migración deja de ser un reemplazo arriesgado de un sistema vivo y pasa a ser la **construcción del lanzamiento real**, tomando la app Flutter como especificación funcional detallada y verificable. Eso baja el riesgo del proyecto de forma considerable, y sube la importancia de los ocho hallazgos de seguridad abiertos: ya no se trata de corregir deuda heredada, sino de **no lanzar con esos defectos**.

## 7. Alcance ejecutable ahora

| Concepto                                                     | Puntos   |
| ------------------------------------------------------------ | -------- |
| Base (Android, paridad estricta)                             | 144      |
| Módulo de firma en Swift, escrito sin verificar (`adr/0003`) | +8       |
| P-04 — capacidades diferidas a después de la migración       | 0        |
| **Total ejecutable**                                         | **~153** |
| Verificación de iOS, fase posterior (requiere Mac e iPhone)  | ~42      |

Ese último criterio es el más importante del plan: es la línea que no se cruza.
