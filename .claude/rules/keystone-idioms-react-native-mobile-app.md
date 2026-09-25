---
kind: rule
id: rules/keystone-idioms-react-native-mobile-app
description: Mobile apps (apps/<name> shipping to iOS/Android) are built with React Native 0.87.x, keep all business logic in a dedicated backend app, and use Appium for e2e — never Playwright for native e2e.
globs:
  - "apps/**/react-native.config.js"
  - "apps/**/metro.config.js"
  - "apps/**/*.appium.config.*"
  - "apps/*/android/**"
  - "apps/*/ios/**"
  - "apps/*-e2e/**"
  - "apps/BSC.genesis.mobile.banking/src/**"
  - "packages/ui-native/src/**"
source: .charter/guides/idioms/react-native/mobile-app.md
generated_by: keystone-project
---

# React Native mobile apps — rules

Full guide: `.charter/guides/idioms/react-native/mobile-app.md` (read on demand).

## IRON LAW

Every mobile app is built with `react-native@0.87.x` — the currently supported line — never an older unsupported minor. All business logic — any calculation, validation, or derived value — lives in a dedicated backend app under `apps/<name>` in the same Nx monorepo, exposed over an API; the mobile app calls that API and never recomputes the rule client-side, per the [`idioms/hexagonal-architecture`](idioms/hexagonal-architecture.md) multi-client rule. Unit and integration tests for a mobile app run under **Jest** (with `@testing-library/react-native`) — not Vitest, which has no official React Native support. End-to-end tests run under **Appium** against the real built app — not Playwright, which cannot drive a native mobile UI.


## GOLDEN RULE

- Pin `react-native` to `0.87.x` in the app's `package.json` — don't drift onto an unsupported minor without a deliberate, explicit upgrade.
- Scaffold new mobile apps as `apps/<name>` in the Nx monorepo (an Nx React Native generator/community plugin, or a manually wired RN project added to the Nx task graph) — never a standalone RN project living outside the monorepo.
- The mobile app's backend is its own deployable app under `apps/<backend-name>`, following [`idioms/nx/monorepo-structure`](idioms/nx/monorepo-structure.md) and [`idioms/hexagonal-architecture`](idioms/hexagonal-architecture.md) layering (`domain/`, `application/`, `infrastructure/`, `presentation/`) — never a set of serverless functions or ad hoc endpoints bolted onto an existing app.
- Mobile view-models/screens are the `presentation/` layer per hexagonal architecture: they validate input, call the backend API, and render the response — they never carry a calculation or derived value themselves.
- TDD applies per [`idioms/testing-policy`](idioms/testing-policy.md): the RN app's own unit/integration tests run under **Jest** + `@testing-library/react-native`, its mandated stack per [`idioms/testing-stack`](idioms/testing-stack.md) — the backend app's unit/integration tests still run under Vitest, since business logic lives there and most coverage lands on that side. The mobile app's own e2e suite runs under Appium against the real backend, never a mocked-API stand-in, per [`idioms/testing-policy`](idioms/testing-policy.md)'s real-backend rule.
- Interactive elements carry a stable accessibility id / testID for Appium targeting — never select by screen position or platform-specific view hierarchy alone.
- After scaffolding a new mobile app (or bumping its RN version) via the Nx React Native generator, diff its generated `android/` directory against `npm pack @react-native-community/template@<the pinned RN version>` (extracted to a scratch dir) *before* attempting a build — reconcile `gradle-wrapper.properties`, `gradle.properties`, `MainApplication.kt`/`MainActivity.kt`, and the root `build.gradle`'s `buildToolsVersion`/`compileSdkVersion`/`targetSdkVersion`/`kotlinVersion` against the official template's values. Treat the official template as ground truth, the Nx generator's scaffold as a starting point only.


## RULES

- On React Native (new architecture, 0.87+), target `testID` in Appium specs via `android=new UiSelector().resourceId("<testID>")`, not the `~testID` accessibility-id selector — `testID` maps to the native `resource-id` attribute, not `content-desc`, so `~testID` silently finds nothing. When a selector returns no elements, verify against the live `uiautomator` dump (`adb shell uiautomator dump`) rather than assuming a timing issue.

For reasoning, see [`corpus/idioms/react-native/mobile-app.md`](corpus/idioms/react-native/mobile-app.md).
