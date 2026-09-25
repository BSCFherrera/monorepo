# BSC.MobileApp → React Native migration audit

Source: `/Users/luisc.echenique/projects/BSC/KRAKEN/BSC.MobileApp` (Flutter, Clean Architecture + Feature-First, BLoC/Cubit, GetIt, Dio, GoRouter, dartz).
Audited: 2026-09-16. Author: Claude Code, from a multi-agent source inspection.

## 0. Critical caveat — corrupted source checkout

**This audit is based on a checkout with real, verified corruption**, independent of any agent or tool artifact (confirmed directly via `xxd`/`od -c` and `git fsck`):

- **86 of 254 tracked files** are zero-byte on disk (correct reported size, all-null content).
- The local **git object store is broken**: `fatal: bad object HEAD`, pack file doesn't match its index, `develop`/`feature/transaction-authorization`/`origin/DEV` all point to invalid SHA1s. No local recovery via `git show`/`git log`/`git fsck` was possible.
- Every file carries `com.apple.quarantine`, consistent with the folder having been extracted from a downloaded archive rather than a normal `git clone` — a plausible (not confirmed) explanation for both the zeroed files and the broken pack.
- Corruption is **not random** — it clusters on the money-movement/security surface: the entire `lib/features/transfers/` feature (bloc, event, state, screens, widgets, repository, datasource), `lib/features/tax_receipts/`, the `two_factor` repository implementation, and **all of `lib/shared/`** (including `AuthBloc`/`AuthEvent`/`AuthState`, the entire `bsc_ui`/`bsc/*` design-system widget library, `formatters.dart`, `validators.dart`, `failure_messages.dart`, and — critically — `authorize_operation.dart`, the actual UI entry point into the authorization flow). All of `test/` (13 files, 0 readable) and `pubspec.yaml`/`pubspec.lock` are also corrupted. There is no `ios/` directory in this checkout at all.

**Decision (confirmed with the repo owner, 2026-09-16):**
- Skip migrating `transfers`, `tax_receipts`, the `two_factor` UI, and anything under `lib/shared/` until a clean copy of the source is available. Everything below marked "corrupted — not migrated yet" follows this decision.
- iOS is expected to exist for the real product; its absence here is treated as a gap in this checkout, not evidence the app is Android-only. Native iOS work in this migration is planned as a **port** once the real iOS project is located, not designed from scratch.

## 1. Existing application structure

```
lib/
├── app/        MaterialApp, GoRouter (routes.dart), theme (bsc_colors/typography/spacing/theme.dart)
├── core/       constants, di, error, network, security, shared domain (products/rates repos) — fully intact
├── features/   12 features, domain/data/presentation per feature (see §2)
└── shared/     cross-cutting widgets + app-level state (AuthBloc, CustomerCubit) — CORRUPTED, not migrated yet
```

12 features: `account_officer`, `auth`, `beneficiaries`, `customer`, `dashboard`, `device_binding`, `exchange_rates`, `payments`, `product_detail`, `profile`, `tax_receipts` (corrupted), `transfers` (corrupted).

Two features deviate from the domain/data/presentation template: `auth` has no `domain/` (its repository contract lives in `core/domain/repositories/`), `customer` has no `domain/`/`presentation/` (its Cubit lives in the corrupted `lib/shared/state/customer_cubit.dart`).

## 2. Screen and navigation inventory

GoRouter (`lib/app/routes.dart:31`), single synchronous `_authGuard` (routes.dart:161-180) reading `SessionManager.isAuthenticated`. Two navigator keys: root + shell (bottom-nav `ShellRoute`).

| Route | Screen | Notes |
|---|---|---|
| `/login` | LoginScreen | has `_CredentialsSheet` modal |
| `/biometric` | BiometricScreen | biometric step |
| `/pin` | PinScreen | PIN entry/unlock |
| `/home` (shell) | DashboardScreen | balance toggle, `_DashboardSkeleton` loading state |
| `/transfers` (shell) | TransfersScreen | **corrupted** — wizard, params `source`/`beneficiary`/`btype` inferred from route only |
| `/payments` (shell) | PaymentsScreen | wizard entry, params `type`/`product`/`source`/`currency` |
| `/profile` (shell) | ProfileScreen | **corrupted** |
| `/accounts/:accountId`, `/products/:productId` | ProductDetailScreen → Account/CreditCard/Loan/Certificate detail views | dispatcher screen file **corrupted**; Loan detail view file **corrupted**; Account/CreditCard/Certificate detail views intact |
| `/account-officer` | AccountOfficerScreen | intact |
| `/exchange-rates` | ExchangeRatesScreen | intact |
| `/beneficiaries` | BeneficiariesScreen | intact |
| `/security`, `/security/devices`, `/security/token` | SecurityScreen, MyDevicesScreen, SoftTokenScreen | intact |
| `/tax-receipts` | TaxReceiptsScreen | **corrupted** |

No modal routes in GoRouter — bottom sheets (`two_factor_sheet.dart`, `bsc_date_range_sheet.dart`, etc., all corrupted) are presented imperatively via `showModalBottomSheet`. Deep linking is **not implemented at the OS level** on Android (no non-MAIN intent filter) despite `docs/ANALISIS-STACK-TECNOLOGICO.md` claiming it — treat as aspirational, not existing behavior to port.

## 3. State management

- **Bloc** (multi-step flows with business events): `PaymentBloc`, `ProductDetailBloc`, `ExchangeRateBloc`, `DashboardBloc`, and (per DI wiring only — source corrupted) `TransferBloc`, `AuthBloc`.
- **Cubit** (simple loads): `BeneficiariesCubit`, `CustomerCubit` (corrupted), `TaxReceiptsCubit` (corrupted).
- Verified pattern via `PaymentBloc`/`PaymentState`/`PaymentEvent` (intact — used as the canonical Bloc example since `TransferBloc` is corrupted): single flat `Equatable` state with a status enum and derived getters; `Either<Failure,T>.fold` converts to `errorMessage: FailureMessages.of(failure)` at the point of emit. Note: `FailureMessages` itself is corrupted, so its exact Spanish copy is unrecoverable until the source is restored — call sites confirm its role, not its content.
- Verified via `BeneficiariesCubit` (intact): plain `try/catch` around the repository call rather than `Either`-folding — a deviation from the stated `Either<Failure,T>` house rule, worth flagging as existing debt, not something to "fix" silently during migration.

## 4. Data models, repositories, API services

Pattern: `data/datasources/*_remote_datasource.dart` (raw Dio, hand-written dual-casing JSON parsing — no codegen) → `data/repositories/*_repository_impl.dart` (implements a `domain/repositories` contract, `Either<Failure,T>`) → `domain/entities/*.dart`. Two distinct backend response envelope shapes exist (`{Success,Data,Message,Errors}` for beneficiaries, `{value,isSuccess,isFailure,error}` BFF-style for payments) — do not assume one envelope shape for all services.

## 5. API endpoints, auth, interceptors, error handling

Base `/api/v1`, single `Dio` instance (`lib/core/network/api_client.dart`), interceptor order: `AuthInterceptor` → logging (stripped in release) → `CertificatePinner.configure` (**stub — no real pins**, flag as an existing gap, not something to invent for RN). `AuthInterceptor` (intact, `lib/core/network/auth_interceptor.dart`): proactive refresh 60s before expiry, single-flight 401 retry, `X-Timestamp`/`X-Nonce` anti-replay headers on every request. No `CancelToken` usage anywhere — request cancellation isn't implemented in Flutter either.

`ErrorHandler.handleDioError` (`lib/core/network/error_handler.dart`) is the sole Dio→Failure translator: timeout/connectionError/badCertificate → `NetworkFailure`; 400/409/422 → `ValidationFailure`; 401 → `AuthFailure`; 403 → `AuthFailure(forbidden)`; 404 → `ServerFailure(notFound)`; 429 → `ServerFailure(tooManyRequests)`; 5xx → `ServerFailure(serverError)`. `Failure.message` is backend-authored/user-facing, `Failure.detail` is internal-only, never shown. This exact contract is ported to `packages/contracts/src/failure.ts`.

Full endpoint list (auth, customer, products/accounts/cards/loans, payment-execution, currency-exchange, configuration, beneficiaries, two-factor, devices, tax-receipts-NCF) — ~35 endpoints, enumerated during the audit session; re-derive from `lib/core/network/api_endpoints.dart` (intact) rather than duplicating the full list here, to avoid drift.

## 6. Local / secure storage

Only `flutter_secure_storage` is used (no shared_preferences, no hive). Android: `encryptedSharedPreferences: true`. iOS: `KeychainAccessibility.first_unlock_this_device` (per source comment — the actual iOS project to verify this against doesn't exist in this checkout). 14 storage keys confirmed (`bsc_access_token`, `bsc_refresh_token`, `bsc_device_secret`, `bsc_user_pin_hash`, `bsc_biometric_enabled`, `bsc_integrity_verdict`, `bsc_device_install_id`, `bsc_device_enrolled`, `bsc_soft_token_secret`, `bsc_customer_code`, `bsc_last_user_name`, `bsc_last_access`, `bsc_token_expiry`, `bsc_device_enrolled_at`, `bsc_recent_destinations`).

## 7. Flutter packages and RN equivalents

See mapping table (§20).

## 8. Native Android/iOS integrations

Two bespoke **Android-only** MethodChannels, both registered manually in `MainActivity.kt` (not via `GeneratedPluginRegistrant` — deliberate, to avoid a 3rd-party dependency on the transaction-signing path):

- **`bsc.security/device_key`** (`lib/core/security/device_key.dart` ↔ `android/.../DeviceKeyPlugin.kt`) — EC P-256 key in `AndroidKeyStore`, StrongBox-preferred with TEE fallback, `setUserAuthenticationRequired(true)` + `setInvalidatedByBiometricEnrollment(true)` + `setUnlockedDeviceRequired(true)`, `AUTH_VALIDITY_SECONDS=0` (re-auth every use). Methods: `isSupported`, `hasKey`, `createKey`, `describeKey`, `sign` (SHA256withECDSA, DER), `deleteKey`. **No iOS implementation exists in this checkout.** RN/iOS equivalent to build once the real iOS project is found: Secure Enclave EC key via `kSecAttrTokenIDSecureEnclave` + `kSecAccessControlBiometryCurrentSet`.
- **`bsc.security/screen`** (`SecureScreenPlugin.kt`) — toggles `FLAG_SECURE` per-screen (used only on the soft-token screen, not app-wide). No direct iOS equivalent exists; standard approach is `UIScreen.capturedDidChangeNotification` + backgrounding overlay — net-new design once iOS is available.

## 9. Permissions

`AndroidManifest.xml`: only `android.permission.INTERNET`. `usesCleartextTraffic="true"` (flag — allows plaintext HTTP, worth revisiting regardless of migration). Package id is still the unfinalized Flutter default `com.example.bsc_mobile_app`. Release builds are currently **debug-signed** (`android/app/build.gradle.kts:29-35`, explicit `// TODO: Add your own signing config` comment) — not production-ready as-is, independent of this migration.

## 10. Push notifications

**None exist.** No `firebase_messaging` or APNs/FCM code anywhere. This is net-new work for RN, not a port.

## 11. Deep links / universal links

**Not implemented** on either platform despite doc claims (see §2). Net-new work for RN.

## 12. Analytics, crash reporting, logging

**Zero crash reporting, zero analytics.** `AppLogger` (`lib/core/utils/logger.dart`) is `kDebugMode`-gated, no remote sink — completely no-op in release. Its `error()` method has a bare `// TODO: send to Crashlytics/Sentry` comment, never implemented.

## 13. Device capabilities

Biometrics (`local_auth`), device info (`device_info_plus`), root/jailbreak detection (`flutter_jailbreak_detection`), share sheet (`share_plus`), external links (`url_launcher`). No camera, gallery, geolocation, or Bluetooth usage found anywhere.

## 14. Environment configuration and secrets

No `.env`/flavors — everything via `--dart-define` (`API_BASE_URL`, `ENV`), read through `String.fromEnvironment` (`lib/core/constants/api_constants.dart`). Documented envs (per `docs/ARQUITECTURA-MOBILE.md`, flagged stale elsewhere but consistent here): DEV `http://localhost:5000/api/v1`, QA `https://qa-api.bscenlinea.com.do/api/v1`, PROD `https://api.bscenlinea.com.do/api/v1`. No secrets committed; the LAN dev IP fallback (`172.27.5.12`) is a minor hygiene flag, not a real secret.

## 15. Localization and accessibility

`flutter_localizations` configured with `Locale('es')` hardcoded as current locale, `en` listed in `supportedLocales` but **no ARB files exist anywhere** — the English support is decorative (only affects built-in Material/Cupertino widget strings, not app copy). Per CLAUDE.md's own rule ("Cero español en `data/`"), confirmed **violations exist today** at specific lines (`beneficiary_repository.dart:293`, `customer_repository_impl.dart:66`, `product_detail_models.dart:141,231,415`) — real, pre-existing debt, not something this migration introduces. **Zero `Semantics` widget usage found anywhere** — no accessibility labels exist to port; this is genuinely a gap to design in RN, not carry over.

## 16. Existing tests

**All 13 files under `test/` are corrupted (0 readable).** CLAUDE.md states "117 casos, 14 de ellos sobre BLoC" — read literally, that's 14 test *cases*, likely concentrated in `test/features/transfer_bloc_test.dart` (also corrupted), not 14 separate files as might be assumed. Directory layout (recoverable, content not) shows testing concentrated on `core/security` (fingerprint, risk classification, device integrity, session, auth interceptor). CI (`azure-pipelines.yml:72-87`) runs `flutter test --coverage` and publishes `lcov.info` + JUnit — a coverage gate exists in principle even though the actual suite can't be inspected here.

## 17. Assets, fonts, icons

Only one real image asset: `assets/images/logo-bsc.svg`. `assets/icons/` exists but is empty. **No bundled fonts** — typography relies on the system default `Roboto`. No Lottie/Rive animation assets or packages found.

## 18. Design system

Fully intact and clean (`lib/app/theme/bsc_colors.dart`, `bsc_typography.dart`, `bsc_spacing.dart`, `bsc_theme.dart`) — ported 1:1 to `packages/design-tokens/`. Brand blue (`#0B3B8C`) → institutional green (`#00A651`) gradient identity, 4pt spacing scale, Material-based type scale on system Roboto. `darkTheme` in Flutter is currently identical to `lightTheme` — no real dark mode exists to port. The reusable widget library (`lib/shared/widgets/bsc/*`, ~26 components per `docs/PLAN-MEJORA-ARQUITECTURA-V2.md`) is **corrupted** — not migrated yet; only the token values (colors/typography/spacing/radius/shadows) were recoverable, not the component implementations.

## 19. Known risks, blockers, features that cannot be migrated 1:1

- **Corrupted source** (§0) — the single biggest blocker. Blocks: `transfers`, `tax_receipts`, `two_factor` UI, `AuthBloc`, the entire shared widget library, all tests, exact `FailureMessages` Spanish copy, `pubspec.yaml`'s real dependency/version list.
- **No iOS project exists in this checkout** — every native integration audit item for iOS is currently "to be ported once found," not confirmed compatible.
- **SSL pinning is a stub today** (`certificate_pinner.dart`) — not a regression to introduce in RN, but don't assume the Flutter app "does" pinning; it doesn't yet.
- **Zero crash reporting/analytics/push notifications today** — all three are net-new capabilities for the RN app, not ports, and should be scoped/approved as new work, not assumed in scope.
- **Known production bug** (per `docs/PLAN-MEJORA-ARQUITECTURA-V2.md` Fase 0): `isNewBeneficiary`/`deviceInCoolingOff` risk signals were, at time of writing, not always passed to `OperationRisk.classify` by production callers — verify this is actually fixed in `OperationAuthorizer` (intact, confirms the fix exists there) vs. any surviving direct callers before treating the risk classifier as safe to port as-is.
- **Fase 0.2** (server-verifiable two-factor for high-risk operations) is explicitly deferred pending a business decision (per CLAUDE.md) — do not silently "improve" this during migration.
- **3 duplicate currency formatters** exist in Flutter (`Formatters`, `CurrencyFormatter`, `PaymentFormatter`) per the architecture plan — the RN migration should NOT replicate all three; but since the source files are corrupted, do not invent a "unified" formatter without the original logic to verify against. Wait for clean source.
- `docs/ARQUITECTURA-MOBILE.md` is confirmed **stale** (wrong colors, phantom dependencies like `firebase_messaging`/`fl_chart`/`mobile_scanner` that don't appear anywhere in actual source) — do not use it as ground truth; this audit is based on the source tree itself.

## 20. Flutter → React Native dependency mapping

| Flutter feature/package | Current purpose | RN replacement | Migration risk | Required action |
|---|---|---|---|---|
| `flutter_bloc` | State management (Bloc/Cubit) | Custom hooks + context, or a lightweight state library per-flow | Low | Confirm per-flow: Bloc→multi-step wizard hook, Cubit→simple data-fetch hook |
| `dio` | HTTP client | `axios` (mandated) | Low | `data/httpclient/` — done (this milestone) |
| `dartz` (`Either<Failure,T>`) | Functional error handling | `Result<T>` discriminated union (`@bsc/contracts`) | Low | Done — see `packages/contracts` |
| `go_router` | Navigation | `@react-navigation/native` | Medium | Typed navigators, preserve the single synchronous auth-guard pattern |
| `get_it` | DI | React Context / hooks, or a lightweight DI helper in `common/` | Low | Constructor/hook-based injection, no service-locator-in-component pattern (mirrors CLAUDE.md's own CI rule #6) |
| `flutter_secure_storage` | Token/session/device-secret storage | `react-native-keychain` or `expo-secure-store` | Medium | Confirm Android/iOS parity with the 14 keys in §6 |
| `local_auth` | Biometric prompts | `react-native-biometrics` | Medium | Verify StrongBox/Secure-Enclave-equivalent guarantees are preserved |
| `flutter_jailbreak_detection` | Root/jailbreak detection | `jail-monkey` | Low | — |
| `device_info_plus` / `package_info_plus` | Device/app metadata | `react-native-device-info` | Low | — |
| `share_plus` | Share sheet | `react-native-share` | Low | — |
| `url_launcher` | External links | `Linking` (RN core) | Low | — |
| `otp` (TOTP) | Soft-token generation | `otplib` | Low | — |
| Custom `bsc.security/device_key` channel | Hardware-backed device key + operation signing | Custom native module (Android Keystore port + new iOS Secure Enclave implementation) | **High** | No pub package exists — must be written as a native module on both platforms; iOS has no prior art to port from in this checkout |
| Custom `bsc.security/screen` channel | Per-screen screenshot/recording prevention | Custom native module (`FLAG_SECURE` port + new iOS capture-notification handling) | Medium | Same as above — iOS side is net-new |
| Certificate pinning | Currently a stub | Real pinning via `react-native-ssl-pinning` or platform config, **only if/when the Flutter side actually implements it** | Low (currently N/A) | Don't build ahead of the Flutter app's own gap without a product decision |
| Push notifications | Does not exist | `@react-native-firebase/messaging` or `notifee`, if approved as new scope | N/A — greenfield | Requires explicit approval, not implied by "parity" |
| Crash reporting/analytics | Does not exist | Sentry RN / Crashlytics RN, if approved | N/A — greenfield | Same |
| `transfers`, `tax_receipts`, `two_factor` UI, shared widget library | — | — | **Blocked** | Cannot be audited or migrated until source is restored |

## Deliverables checklist status

- [x] Flutter application audit (this document)
- [x] Screen and navigation inventory (§2)
- [x] Dependency mapping (§20)
- [x] Risk report (§19)
- [x] Phased migration plan (see root `README.md`)
- [x] Nx + pnpm monorepo skeleton
- [~] React Native `BSC.genesis.mobile.banking` app (`apps/BSC.genesis.mobile.banking`) — integrated into the Nx workspace
- [x] `contracts`, `utils`, `design-tokens` packages (utils intentionally empty pending clean source)
- [~] Centralized Axios data layer — in progress
- [ ] Migrated screens/business logic — not started (blocked features aside)
- [~] Automated tests — package-level tests pass; app/e2e in progress
- [ ] Android/iOS setup documentation
- [x] Root README (installation/execution)
- [ ] Functional-parity checklist
- [ ] Final report
