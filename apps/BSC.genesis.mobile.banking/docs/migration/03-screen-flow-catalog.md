# 03 — Catálogo de pantallas, rutas y flujos

**Fuente:** `lib/app/routes.dart`, `lib/features/**/presentation/screens/`, `lib/shared/widgets/`
**Estado:** rutas y pantallas **confirmadas en código**. Los estados visuales por pantalla se levantan uno a uno en Fase 1, contra la app en ejecución.

---

## 1. Mapa de rutas ✅

18 rutas declaradas en `go_router`. La guarda `_authGuard` redirige a `/login` cualquier ruta protegida sin sesión, y a `/home` cualquier ruta de autenticación **con** sesión.

### 1.1 Rutas de autenticación — sin barra inferior

| Ruta         | Pantalla             | Archivo                          | Líneas |
| ------------ | -------------------- | -------------------------------- | -----: |
| `/login`     | Login                | `auth/.../login_screen.dart`     |    614 |
| `/biometric` | Acceso por biometría | `auth/.../biometric_screen.dart` |    130 |
| `/pin`       | Acceso por PIN       | `auth/.../pin_screen.dart`       |    183 |

### 1.2 Rutas principales — dentro de `ShellRoute` con barra inferior

La barra (`bsc_bottom_nav.dart`, 205 líneas) envuelve estas cuatro y usa `NoTransitionPage`: **el cambio de pestaña no anima**. Es un detalle de comportamiento a preservar.

| Ruta         | Pantalla       | Parámetros de consulta                  |
| ------------ | -------------- | --------------------------------------- |
| `/home`      | Dashboard      | —                                       |
| `/transfers` | Transferencias | `source`, `beneficiary`, `btype`        |
| `/payments`  | Pagos          | `type`, `product`, `source`, `currency` |
| `/profile`   | Perfil         | —                                       |

### 1.3 Rutas de detalle — pantalla completa, sin barra inferior

| Ruta                   | Pantalla              | Parámetros                                                       |
| ---------------------- | --------------------- | ---------------------------------------------------------------- |
| `/accounts/:accountId` | Detalle de producto   | `type` (def. `CA`), `currency` (def. `214`), `masked`, `balance` |
| `/products/:productId` | Detalle de producto   | idénticos a la anterior                                          |
| `/account-officer`     | Oficial de cuenta     | —                                                                |
| `/exchange-rates`      | Tasas de cambio       | —                                                                |
| `/beneficiaries`       | Beneficiarios         | —                                                                |
| `/security`            | Seguridad             | —                                                                |
| `/security/devices`    | Mis dispositivos      | —                                                                |
| `/security/token`      | Token suave           | —                                                                |
| `/tax-receipts`        | Comprobantes fiscales | —                                                                |

> 🔎 `/accounts/:accountId` y `/products/:productId` construyen exactamente el mismo widget con los mismos parámetros. Probable duplicación histórica: **candidata a unificarse en la migración**, previa confirmación de que nada externo enlaza a `/accounts`.

> ⛔ **No hay deep links.** El `AndroidManifest.xml` no declara ningún `intent-filter` de `VIEW`/`BROWSABLE`. Si la app nueva debe abrirse desde un correo, un SMS o una notificación, es funcionalidad nueva y hay que diseñar la validación del enlace (ver `06-security-threat-model.md`, T-09).

## 2. Inventario de pantallas y superficies

15 pantallas y 34 widgets. Los widgets grandes son pantallas de hecho, aunque no se llamen así:

| Superficie                    | Archivo                            | Líneas | Tipo                                             |
| ----------------------------- | ---------------------------------- | -----: | ------------------------------------------------ |
| Login                         | `login_screen.dart`                |    614 | Pantalla                                         |
| Oficial de cuenta             | `account_officer_screen.dart`      |    544 | Pantalla                                         |
| Tasas de cambio               | `exchange_rates_screen.dart`       |    491 | Pantalla                                         |
| Perfil                        | `profile_screen.dart`              |    491 | Pantalla                                         |
| Comprobantes fiscales         | `tax_receipts_screen.dart`         |    488 | Pantalla                                         |
| Seguridad                     | `security_screen.dart`             |    322 | Pantalla                                         |
| Token suave                   | `soft_token_screen.dart`           |    309 | Pantalla                                         |
| Beneficiarios                 | `beneficiaries_screen.dart`        |    268 | Pantalla                                         |
| Mis dispositivos              | `my_devices_screen.dart`           |    251 | Pantalla                                         |
| Dashboard                     | `dashboard_screen.dart`            |    219 | Pantalla (compone 5 widgets)                     |
| PIN                           | `pin_screen.dart`                  |    183 | Pantalla                                         |
| Biometría                     | `biometric_screen.dart`            |    130 | Pantalla                                         |
| Transferencias                | `transfers_screen.dart`            |    100 | Contenedor del asistente                         |
| Pagos                         | `payments_screen.dart`             |     84 | Contenedor del asistente                         |
| Detalle de producto           | `product_detail_screen.dart`       |     71 | Contenedor (la UI vive en 5 widgets)             |
| **Alta de beneficiario**      | `add_beneficiary_sheet.dart`       |    689 | Hoja modal — la superficie individual más grande |
| Formulario de transferencia   | `transfer_step_form.dart`          |    508 | Paso del asistente                               |
| Formulario de pago            | `payment_step_form.dart`           |    498 | Paso del asistente                               |
| Estado de cuenta de tarjeta   | `credit_card_statement_sheet.dart` |    420 | Hoja modal                                       |
| Comprobante de transferencia  | `transfer_receipt_view.dart`       |    408 | Vista de resultado                               |
| Comprobante de pago           | `payment_receipt_view.dart`        |    398 | Vista de resultado                               |
| Confirmación de transferencia | `transfer_step_confirmation.dart`  |    376 | Paso del asistente                               |
| Hoja de segundo factor        | `two_factor_sheet.dart`            |    370 | Hoja modal                                       |
| Confirmación de pago          | `payment_step_confirmation.dart`   |    392 | Paso del asistente                               |
| Selector de rango de fechas   | `bsc_date_range_sheet.dart`        |    515 | Hoja modal compartida                            |
| Menú lateral                  | `bsc_drawer.dart`                  |    320 | Navegación                                       |
| Enrolamiento de dispositivo   | `device_enrollment_sheet.dart`     |    183 | Hoja modal                                       |

**Total a portar: ~30 superficies visuales distintas**, no 15. La estimación debe usar este número.

## 3. Flujos principales ✅

### 3.1 Acceso

```
/login ──(credenciales correctas)──> /home
   │
   ├──(biometría habilitada)──> /biometric ──> /home
   └──(PIN habilitado)────────> /pin ──────────> /home
```

⛔ `pin_screen.dart:42` — `// TODO: Validate PIN hash against stored hash`. **Hoy el PIN no se compara contra nada.** Es un defecto de seguridad abierto, no un detalle a replicar.

### 3.2 Asistente de transferencia (3 pasos)

```
Formulario ──> Confirmación ──> [CT-02: riesgo → firma / código] ──> Ejecución ──> Comprobante
```

El mismo patrón se repite en pagos. Los pasos comparten estructura pero no código (`transfer_step_form.dart` y `payment_step_form.dart` son archivos separados de ~500 líneas cada uno). 🔎 **Oportunidad clara de unificación en la migración**, sujeta a que la especificación confirme que las diferencias son de datos y no de comportamiento.

### 3.3 Enrolamiento del dispositivo

```
/security ──> Hoja de enrolamiento ──> POST /devices/register ──> código por canal del cliente
   ──> POST /devices/verify ──> generación de llave en StrongBox
   ──> POST /devices/register-key (llave pública + veredicto de integridad) ──> listo para firmar
```

## 4. Estados visuales a catalogar

Esta matriz se completa en Fase 1 recorriendo la app Flutter instalada en el Pixel. Por cada superficie hay que registrar y luego reproducir:

| Estado           | Cómo forzarlo                                                           |
| ---------------- | ----------------------------------------------------------------------- |
| Cargando         | Latencia del backend; hay `shimmer` en un archivo                       |
| Vacío            | Cliente sin productos / sin movimientos / sin beneficiarios             |
| Error de negocio | Respuesta 4xx del backend                                               |
| Error técnico    | Respuesta 5xx o cuerpo inválido                                         |
| Sin conexión     | ⛔ **No existe hoy**: `connectivity_plus` está declarado pero no se usa |
| Tiempo agotado   | Timeout de 30 s                                                         |
| Sesión expirada  | Inactividad → aviso → expiración                                        |
| Éxito            | Comprobante                                                             |
| Bloqueado        | Dispositivo no íntegro, llave invalidada, API < 28                      |

## 5. Diseño visual a preservar

- **Paleta y gradientes ✅:** definidos en `bsc_colors.dart`. El gradiente de marca (azul `#0A2E6E` → `#0B3B8C` → verde `#0E7F63` → `#00A651`, con paradas `0 / 0.38 / 0.80 / 1.0`) aparece en el fondo del login, la cabecera del dashboard y cada _hero_ de producto. Es la firma visual del producto y debe reproducirse con exactitud.
- **Tema oscuro ✅ definido, apagado:** `BscTheme.darkTheme` existe y `app.dart` fuerza `ThemeMode.light`. ❓ Decidir si la app nueva lo enciende.
- **Orientación ✅:** bloqueada en vertical.
- **Idioma ✅:** español; textos incrustados en el código.
- **Componentes compartidos ✅:** `bsc_ui.dart`, 1.491 líneas. Es el catálogo real del _design system_ y el punto de partida del sistema de componentes en React Native.

## 6. Brechas

| #    | Brecha                                                                | Efecto                                                                                                                                               |
| ---- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| B-02 | Sin Figma ni _design system_ aprobado                                 | La referencia de paridad visual sería la app Flutter en ejecución, capturada pantalla por pantalla. Hay que autorizarlo y usar solo datos sintéticos |
| B-07 | Sin capturas autorizadas en el repositorio                            | Las capturas de referencia se generan en Fase 1 con el cliente de prueba, nunca con datos reales                                                     |
| B-08 | Comportamiento en pantallas pequeñas y fuente ampliada sin documentar | Hay que medirlo antes de fijar tolerancias de comparación visual                                                                                     |
