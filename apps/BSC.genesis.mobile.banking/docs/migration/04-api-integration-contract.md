# 04 — Contrato de integración con BSC.BSCEnLinea.BackEnd

**Fuente del lado cliente:** `lib/core/network/api_endpoints.dart` (45 constantes, 44 usadas)
**Fuente del lado servidor:** `BSC.BSCEnLinea.BackEnd/src/BSC.EnLinea.API/Controllers/` (16 controladores)
**Estado:** ⛔ **No se encontró archivo OpenAPI/Swagger versionado en el repositorio del backend.** Este documento se construye leyendo el código de ambos lados. Las formas exactas de petición y respuesta se confirman en Fase 1 (P-03).

**Regla innegociable:** la migración **no cambia el contrato**. Cualquier incompatibilidad se documenta aquí y requiere aprobación antes de tocar nada del lado servidor.

---

## 1. Configuración del cliente ✅

| Aspecto                | Valor actual                                                                                                  | Evidencia                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `baseUrl`              | `--dart-define=API_BASE_URL`, por defecto `http://<IP interna del banco>:5000`                                | `api_constants.dart`      |
| Timeouts               | 30 s conexión / recepción / envío                                                                             | `api_constants.dart`      |
| Cabeceras fijas        | `Content-Type: application/json`, `Accept: application/json`, `X-Channel: MobileBanking`, `X-Channel-Type: 2` | `api_client.dart`         |
| Cabeceras por petición | `Authorization: Bearer <token>`, `X-Timestamp` (epoch ms UTC), `X-Nonce`                                      | `auth_interceptor.dart`   |
| Versionado             | Prefijo `/api/v1` en todas las rutas                                                                          | `api_endpoints.dart`      |
| Pinning                | ⛔ Configurado como método vacío                                                                              | `certificate_pinner.dart` |

⚠️ El _nonce_ se genera como `DateTime.now().microsecondsSinceEpoch` en base 36: único pero **predecible**. Si el servidor lo trata como defensa anti-replay real, debe pasar a ser aleatorio criptográfico. Ver T-04.

## 2. Autenticación y ciclo de vida del token ✅

| Ruta                          | Método | Propósito                        |
| ----------------------------- | ------ | -------------------------------- |
| `/api/v1/auth/login`          | POST   | Inicio de sesión                 |
| `/api/v1/auth/logout`         | POST   | Cierre de sesión                 |
| `/api/v1/auth/logout-all`     | POST   | Cierre en todos los dispositivos |
| `/api/v1/auth/refresh-token`  | POST   | Renovación (rota ambos tokens)   |
| `/api/v1/auth/me`             | GET    | Usuario de la aplicación         |
| `/api/v1/auth/validate-token` | GET    | Validación                       |

**Comportamiento verificado, a preservar exactamente:**

1. El token de acceso dura ~15 minutos. La app renueva **60 segundos antes de expirar**, no espera al 401.
2. La renovación es _single-flight_: la primera petición que la dispara ejecuta el refresh, y todas las demás esperan ese mismo resultado y luego se reenvían. Evita una tormenta de renovaciones concurrentes.
3. El backend **rota el refresh token** en cada llamada, así que hay que guardar los dos.
4. La respuesta viene con nombres en PascalCase (`AccessToken`, `RefreshToken`, `ExpiresAt`) y el cliente acepta también camelCase por tolerancia.
5. Un 401 en `/auth/login` o `/auth/refresh-token` es fallo real de credenciales, no dispara renovación.
6. Cada petición se reintenta **una sola vez** (`extra['bscRetried']`). Un token que sigue rechazándose cierra la sesión.

> El comentario del código documenta que la implementación anterior _no podía funcionar nunca_: llamaba a `/auth/refresh` en vez de `/auth/refresh-token`, sobre un Dio sin `baseUrl`, y leía `accessToken` de una respuesta que dice `AccessToken`. Las pruebas de `auth_interceptor_test.dart` existen precisamente por eso. **Ese conjunto de pruebas es el primero que debe replicarse en React Native.**

## 3. Matriz de endpoints

### Cliente y productos

| Ruta                                           | Método  | Controlador del backend | Uso en la app                                                              |
| ---------------------------------------------- | ------- | ----------------------- | -------------------------------------------------------------------------- |
| `/api/v1/customers/get-customer-profile`       | POST 🔎 | `CustomersController`   | Identidad real del titular, sucursal y oficial                             |
| `/api/v1/products/get-products-by-customer-id` | POST 🔎 | `ProductsController`    | Lista de productos del dashboard                                           |
| `/api/v1/products/details`                     | POST 🔎 | `ProductsController`    | Detalle por producto; la forma cambia según `productType` (CA/CC/TC/PR/CD) |

> ✅ Nota del código: `products/details` devuelve **nombres de campo del core en español y mayúsculas**. El mapeo DTO→modelo es manual y específico por tipo de producto. Es el punto de integración más frágil de la app.

### Cuentas

| Ruta                                               | Método  | Uso                     |
| -------------------------------------------------- | ------- | ----------------------- |
| `/api/v1/account-management/account-transactions`  | POST 🔎 | Movimientos             |
| `/api/v1/account-management/account-statement-pdf` | POST 🔎 | Estado de cuenta en PDF |

### Tarjetas de crédito

| Ruta                                                                           | Uso                               |
| ------------------------------------------------------------------------------ | --------------------------------- |
| `/api/v1/credit-card-management/transactions`                                  | Movimientos                       |
| `/api/v1/credit-card-management/statement`                                     | Estado de cuenta                  |
| `/api/v1/credit-card-management/statement/pdf`                                 | Estado en PDF                     |
| `/api/v1/credit-card-management/apply-credit-card-payment/execute`             | **Pago propio — mueve dinero**    |
| `/api/v1/credit-card-management/apply-credit-card-beneficiary-payment/execute` | **Pago a tercero — mueve dinero** |

### Préstamos

| Ruta                                                 | Uso                     |
| ---------------------------------------------------- | ----------------------- |
| `/api/v1/loan-management/loan-transactions/retrieve` | Movimientos             |
| `/api/v1/loan-management/apply-loan-payment/execute` | **Pago — mueve dinero** |

### Ejecución de pagos y transferencias

| Ruta                                              | Uso                              |
| ------------------------------------------------- | -------------------------------- |
| `/api/v1/payment-execution/transfer-fees-summary` | Comisiones antes de confirmar    |
| `/api/v1/payment-execution/transfer`              | **Transferencia — mueve dinero** |

### Beneficiarios

| Ruta                                            | Uso                            |
| ----------------------------------------------- | ------------------------------ |
| `/api/v1/beneficiaries`                         | Listado                        |
| `/api/v1/beneficiaries/validate-account`        | Validación de cuenta destino   |
| `/api/v1/beneficiaries/add-internal-bank`       | Alta dentro del banco          |
| `/api/v1/beneficiaries/add-local-interbank`     | Alta interbancaria local       |
| `/api/v1/beneficiaries/confirm`                 | Confirmación del alta          |
| `/api/v1/beneficiaries/catalogs/banks`          | Catálogo de bancos             |
| `/api/v1/beneficiaries/catalogs/account-types`  | Catálogo de tipos de cuenta    |
| `/api/v1/beneficiaries/catalogs/document-types` | Catálogo de tipos de documento |

### Segundo factor y dispositivos de confianza

| Ruta                                      | Método | Uso                                                                         |
| ----------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `/api/v1/two-factor/methods`              | GET 🔎 | Métodos disponibles                                                         |
| `/api/v1/two-factor/generate-token`       | POST   | Envío del código                                                            |
| `/api/v1/two-factor/verify-token`         | POST   | Verificación                                                                |
| `/api/v1/two-factor/soft-token/provision` | POST   | Aprovisiona el secreto TOTP — **uno por cliente**, compartido entre canales |
| `/api/v1/devices`                         | GET    | Listado de dispositivos ✅                                                  |
| `/api/v1/devices/{deviceId}`              | DELETE | Revocación ✅                                                               |
| `/api/v1/devices/register`                | POST   | Paso 1 del enrolamiento ✅                                                  |
| `/api/v1/devices/verify`                  | POST   | Paso 2, con el código ✅                                                    |
| `/api/v1/devices/register-key`            | POST   | Llave pública + veredicto de integridad ✅                                  |
| `/api/v1/devices/challenge`               | POST   | Reto para firmar ✅                                                         |
| `/api/v1/devices/verify-signature`        | POST   | Verificación de la firma ✅                                                 |

Los métodos de `/devices` están **confirmados contra `DevicesController.cs`**. El resto está marcado 🔎 y se confirma en Fase 1.

> ✅ Nota del código: `customerCode` **no viaja en el cuerpo** de las llamadas de dispositivos — el servidor lo obtiene del token de sesión. Es la decisión correcta y hay que preservarla: la UI nunca debe poder indicar de qué cliente se trata.

### Divisas, configuración y comprobantes fiscales

| Ruta                                                                        | Uso                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/api/v1/currency-exchange/rates`                                           | Tasas                                                                                            |
| `/api/v1/currency-exchange/rate-quote`                                      | Cotización                                                                                       |
| `/api/v1/configuration/session`                                             | Política de inactividad (la misma que lee el portal)                                             |
| `/api/v1/customer-billing-procedure/search-ncf-summary/retrieve`            | Resumen NCF                                                                                      |
| `/api/v1/customer-billing-procedure/search-ncf-detail/retrive`              | Detalle NCF — **`retrive` sin la `e` es como está en el servidor**, no un error de transcripción |
| `/api/v1/customer-billing-procedure/search-ncf-transaction-detail/retrieve` | Detalle de transacción NCF                                                                       |

## 4. Controladores del backend sin consumo desde móvil

Presentes en el backend, sin ruta declarada en la app: `InternationalCatalogsController`, `NotificationController`, `TransactionsController`. ❓ Confirmar si son exclusivos del portal o si la app móvil debería consumirlos (P-06).

## 5. Manejo de errores — a especificar

⛔ No existe un catálogo de códigos de error documentado. Se sabe que la app maneja al menos `DEVICE_005` (integridad) y `UNSUPPORTED` (teléfono sin soporte de llave), y que el backend responde «La operación no coincide con la autorizada» cuando la huella no cuadra.

**Entregable de Fase 1:** tabla completa de `código de error → mensaje al cliente → acción de la app → reintentable sí/no`, derivada del backend y no inventada del lado cliente.

## 6. Aspectos del contrato sin resolver ❓

| #    | Pregunta                                                    | Por qué importa                                                                                                                                 |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | ¿Hay idempotencia en los endpoints que mueven dinero?       | Sin ella, un doble toque o un reintento de red puede duplicar una transferencia. Es el escenario transversal más grave                          |
| C-02 | ¿Existe correlation ID de extremo a extremo?                | Sin él, un incidente no se puede seguir entre app, backend y bus                                                                                |
| C-03 | ¿Cómo pagina el listado de movimientos?                     | Afecta el rendimiento de listas largas                                                                                                          |
| C-04 | ¿El backend valida `X-Timestamp` y `X-Nonce`?               | Si no los valida, son cabeceras decorativas; si los valida, el nonce predecible es un defecto                                                   |
| C-05 | ¿La app habla directo al backend o pasa por un API Gateway? | `docs/ARQUITECTURA-RED-SEGURIDAD.md` dice que **no debe** ir directo, pero hoy va directo a una IP interna. Determina dónde se ancla el pinning |
| C-06 | ¿Límite real de dispositivos por cliente?                   | La app asume 5 🔎                                                                                                                               |
| C-07 | Versionado del contrato y compatibilidad hacia atrás        | Determina si app vieja y app nueva pueden convivir durante el piloto                                                                            |
