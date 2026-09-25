# 02 — Especificación funcional

**Estado del documento:** _esqueleto con las dos capacidades transversales ya especificadas._ Las 13 features se especifican una por una durante la Fase 1, en el orden de oleadas de `08-migration-plan.md`. Cada spec de feature se congela en `archive/` antes de escribir una sola línea de código de esa feature.

**Leyenda:** ✅ Confirmado en código · 🔎 Inferido · ❓ Pendiente de decisión · ⛔ No disponible

---

## Principio rector

La migración **preserva el comportamiento observable**. Cualquier diferencia respecto a la app Flutter es un cambio funcional y requiere aprobación explícita, aunque parezca una mejora. Las diferencias inevitables —las que impone la plataforma— se registran en `09-traceability-matrix.md` con su justificación.

---

## CT-01 — Sesión y expiración por inactividad ✅

**Evidencia:** `lib/core/security/session_manager.dart`, `session_policy_service.dart`, `shared/widgets/session_guard.dart`, `app/routes.dart`.

La política la publica el backend en `GET /api/v1/configuration/session` (`InactivityTimeoutMinutes`, `WarningBeforeTimeoutSeconds`). El portal lee la misma ruta. Los valores por defecto de la app —10 minutos de inactividad, aviso 60 segundos antes— **solo aplican si esa llamada falla**.

La actividad se mide por interacción real del cliente (puntero y teclado), no por tiempo transcurrido desde el login. El comentario del código documenta que antes no era así y eso expulsaba a la gente a mitad de una tarea.

```gherkin
Escenario: la sesión expira tras inactividad real
  Dado que el cliente inició sesión
  Y la política del backend indica 10 minutos de inactividad y 60 segundos de aviso
  Cuando pasan 9 minutos sin ninguna interacción del cliente
  Entonces la app muestra el aviso con una cuenta regresiva de 60 segundos

Escenario: la actividad durante el aviso lo retira
  Dado que el aviso de expiración está visible
  Cuando el cliente toca la pantalla o elige «seguir conectado»
  Entonces el aviso desaparece
  Y la cuenta de inactividad vuelve a empezar desde cero

Escenario: al expirar se limpia el estado
  Dado que el aviso terminó su cuenta regresiva
  Entonces la sesión se cierra
  Y las credenciales de sesión se borran del almacenamiento seguro
  Y la app navega a /login explicando por qué

Escenario: la política del backend no está disponible
  Dado que GET /configuration/session falla
  Entonces se usan 10 minutos y 60 segundos
  Y el fallo no interrumpe al cliente con ningún mensaje
```

**Criterio de aceptación en React Native:** la medición de actividad debe cubrir también el paso a segundo plano y el regreso (`AppState`), que en Flutter atiende `WidgetsBindingObserver`. Es un punto de no-equivalencia directa y necesita prueba propia.

---

## CT-02 — Autorización de transacciones ✅

**Evidencia:** `lib/core/security/device_key.dart`, `operation_fingerprint.dart`, `operation_risk.dart`, `features/device_binding/domain/device_binding_service.dart`, `android/.../DeviceKeyPlugin.kt`, y del lado del banco `BSC.EnLinea.Infrastructure/Security/TransactionAuthorizationGuard.cs`.

Es la capacidad más delicada del producto y la que gobierna el orden de la migración.

### CT-02.1 — Huella canónica de la operación

Antes de mover dinero, los tres canales calculan el mismo hash sobre la misma cadena. Las reglas son rígidas a propósito:

| Regla              | Valor                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Separador          | `\|`                                                                                                  |
| Prefijo de versión | `v1`                                                                                                  |
| Orden de campos    | versión, tipo de operación, código de cliente, cuenta origen, cuenta destino, monto, código de moneda |
| Monto              | siempre con dos decimales (`ToString("F2")` en C#)                                                    |
| Campos ausentes    | cadena vacía, nunca `null` ni omisión                                                                 |
| Texto              | mayúsculas, sin espacios al borde                                                                     |
| Hash               | SHA-256 en hexadecimal minúscula                                                                      |
| Tipos de operación | `2` transferencia · `7` pago de tarjeta · `8` pago de préstamo                                        |

```gherkin
Escenario: la huella coincide entre canales
  Dado un pago de tarjeta por 1.234,50 DOP del cliente C-001
  Cuando la app calcula la huella
  Entonces es idéntica, carácter por carácter, a la que calcula el backend en C#
  Y a la que calcula el portal en TypeScript

Escenario: la operación cambió después de autorizarse
  Dado que el cliente autorizó una transferencia de 1.000,00
  Cuando se envía la ejecución con monto 10.000,00
  Entonces el backend la rechaza con «La operación no coincide con la autorizada»
```

**Decisión de migración:** en React Native este algoritmo **no se reimplementa**. Se consume el de TypeScript ya existente en el portal, extraído a un paquete compartido. Elimina una de las tres copias y con ella toda una clase de fallo.

### CT-02.2 — Nivel de riesgo y verificación exigida

| Nivel      | Cuándo                       | Qué se le pide al cliente                             |
| ---------- | ---------------------------- | ----------------------------------------------------- |
| `inquiry`  | La operación no mueve dinero | Nada                                                  |
| `routine`  | Operación cotidiana          | Firma con rostro o huella, **sin código que digitar** |
| `elevated` | Alto riesgo                  | Firma **más** código fuera de banda (SMS o correo)    |

Escalan siempre a `elevated`: operaciones internacionales, beneficiarios nuevos, y montos sobre el umbral (`50.000 DOP`, o `5.000 DOP` si el dispositivo está en período de enfriamiento). Los dólares se evalúan convertidos, con tasa de respaldo `59,5` cuando no hay tasa del día.

> ❓ **Pendiente:** los umbrales están escritos en el código como valores por defecto razonables. El propio comentario dice que deberían venir de configuración _«cuando Cumplimiento los fije»_. Migrar sin resolverlo perpetúa el problema. Ver P-05.

### CT-02.3 — Firma con llave del dispositivo

```gherkin
Escenario: firma correcta
  Dado un dispositivo enrolado con llave utilizable
  Cuando el cliente confirma una transferencia de nivel routine
  Entonces el sistema operativo pide rostro o huella
  Y al verificarse, la llave del StrongBox firma la huella de la operación
  Y la app envía el identificador de autorización con la ejecución

Escenario: la biometría del teléfono cambió
  Dado que alguien inscribió una huella nueva en el dispositivo
  Cuando el cliente intenta firmar
  Entonces la llave está invalidada por el sistema operativo
  Y la app pide volver a registrar el dispositivo
  Y NO cae automáticamente al código por SMS

Escenario: el cliente cancela la biometría
  Cuando el cliente cierra el diálogo biométrico
  Entonces la operación no se ejecuta
  Y NO se ofrece el código por SMS como alternativa inmediata
```

El último escenario es una regla de negocio deliberada, documentada en `device_binding_service.dart`: _«si el cliente canceló la biometría, insistir con un código lo entrena a esquivar la verificación»_. Debe conservarse.

### CT-02.4 — Enrolamiento del dispositivo

Se rechaza el enrolamiento si el veredicto de integridad no es `ok` (root, manipulación o depurador), o si el teléfono no soporta llaves con verificación de usuario (API < 28). La app sigue funcionando para consultas; lo que no puede es enrolarse como dispositivo de confianza. Límite: **5 dispositivos por cliente** 🔎 (a confirmar contra el backend).

---

## Capacidades pendientes de especificar

Cada una produce su propio spec en Fase 1, con Given/When/Then, estados de pantalla y contrato de API:

| #    | Feature                        | Complejidad estimada    | Notas de descubrimiento                                                                                                 |
| ---- | ------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| F-01 | `auth` — login, biometría, PIN | Media                   | ⛔ El PIN **no se valida** hoy (`pin_screen.dart:42`). Hay que definir el comportamiento correcto, no copiar el actual  |
| F-02 | `dashboard`                    | Media                   | Saldos, lista de productos, acciones rápidas, sección «hoy»                                                             |
| F-03 | `product_detail`               | **Alta** (6.320 líneas) | 5 tipos de producto (CA/CC/TC/PR/CD) con formas de respuesta distintas; movimientos, estados de cuenta, descarga de PDF |
| F-04 | `transfers`                    | **Alta**                | Asistente de 3 pasos, comisiones, comprobante, integración con CT-02                                                    |
| F-05 | `payments`                     | **Alta**                | Pago de tarjeta y préstamo, propio y de terceros                                                                        |
| F-06 | `beneficiaries`                | Media                   | Alta interna e interbancaria local, validación de cuenta, 3 catálogos, confirmación                                     |
| F-07 | `device_binding`               | Media                   | Enrolamiento, mis dispositivos, revocación, token suave                                                                 |
| F-08 | `two_factor`                   | Baja                    | Métodos, generación y verificación de código                                                                            |
| F-09 | `exchange_rates`               | Baja                    | Listado y cotización                                                                                                    |
| F-10 | `tax_receipts`                 | Media                   | NCF: resumen, detalle, detalle de transacción                                                                           |
| F-11 | `account_officer`              | Baja                    | Oficial asignado                                                                                                        |
| F-12 | `profile`                      | Baja                    | Datos del cliente                                                                                                       |
| F-13 | `customer`                     | Baja                    | Identidad del titular; alimenta a las demás                                                                             |

## Capacidades declaradas pero NO implementadas ⛔

Verificado por ausencia de importaciones. Si se esperan en la app nueva, **son desarrollo nuevo y no migración**, y cambian la estimación:

- Notificaciones push (Firebase declarado, sin usar, sin `google-services.json`).
- Detección de conectividad y modo sin conexión (`connectivity_plus` declarado, sin usar).
- Lectura de QR (`mobile_scanner` declarado, sin usar).
- Gráficos (`fl_chart` declarado, sin usar).
- Analytics, auditoría de cliente y reporte de fallos: **no hay ninguna herramienta integrada**.
- Traducción a inglés: el idioma está declarado pero los textos están incrustados en español en el código.

Ver P-04.
