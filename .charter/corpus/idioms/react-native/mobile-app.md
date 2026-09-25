---
kind: corpus
id: corpus/idioms/react-native/mobile-app
description: Why mobile apps standardize on React Native 0.87.x with backend-only business logic and Appium e2e, instead of a native-per-platform or client-heavy setup.
---

# React Native mobile apps — reasoning

React Native lets one codebase target iOS and Android through the Nx monorepo's normal task graph, same as any other `apps/<name>` deployable — no separate native toolchain per platform, no drift between two hand-maintained native apps. Pinning `0.87.x` matters because RN's supported-version window is narrow: only the current line receives security and platform-compatibility patches (new Xcode/Android SDK releases routinely break older RN minors), so "whatever version scaffolded first" silently becomes a maintenance liability the moment Apple or Google ships a new OS.

Mobile is a second (or third) client on top of whatever backend already serves the web app. [`corpus/idioms/hexagonal-architecture`](corpus/idioms/hexagonal-architecture.md)'s multi-client rule exists exactly for this shape: a calculation implemented once in the mobile bundle and once in the web client drifts the first time one gets patched and the other doesn't. Routing the mobile app's business logic through its own backend `apps/<name>` (not a shared library imported into the RN bundle) keeps the computation server-side, testable against a real endpoint, and reusable if a third client (CLI, another platform) shows up later.

Per [`corpus/idioms/testing-stack`](corpus/idioms/testing-stack.md), React Native is its own sanctioned test-stack pairing, not a variant of the web/backend one. Unit/integration: RN's testing toolchain — Metro-aware transforms, native-module mocking, `@testing-library/react-native` — is built and maintained against Jest via `@react-native/jest-preset`; Vitest has no official RN support, and the community shims that exist are young third-party projects, not a foundation to build a monorepo's mobile coverage on. E2E: Playwright drives a browser's DOM, not a compiled native iOS/Android binary. Appium is the equivalent for native — it drives the real app through platform accessibility trees, so an RN e2e suite still exercises a real running app end-to-end (per [`corpus/idioms/testing-policy`](corpus/idioms/testing-policy.md)), just through the tool built for the platform instead of the one built for the browser.

Nx's React Native generator release cadence lags React Native's own official template. For a fast-moving RN minor (a new architecture-adjacent release like 0.87), trusting the generator's Android scaffold as correct is a false economy: on RN 0.87.1 via `@nx/react-native@23.2.0` (npm's current, non-stale version of both), the generated `android/` project failed to build for reasons unrelated to Nx's own logic — a Gradle wrapper too old for the AGP the scaffold's unpinned `classpath` resolves, `gradle.properties` missing flags AGP 9 needs to coexist with the scaffold's explicit Kotlin plugin application, a rejected Proguard filename, and a `MainApplication.kt` written against a `ReactNativeHost` API RN 0.87 removed outright in favor of `ReactHost`. None of these failures pointed back to "the scaffold is stale" on their own — each looked like an unrelated build error until diffed against the official `@react-native-community/template` for the same RN version. Treating that official template as ground truth, and the generator's output as only a starting point, is the only way to catch this drift before it burns build-debugging time on symptoms instead of the cause.

## Appium selectors on RN 0.87+ (new architecture)

On React Native 0.87's new-architecture Android build, a component's `testID` prop surfaces to the native view hierarchy as the Android `resource-id` attribute, not `content-desc` (accessibility label/id). WebdriverIO's `~testID` selector — the standard "accessibility id" strategy, and the one every Appium/RN tutorial shows — silently finds nothing: `findElements` returns an empty array with no error, which looks identical to "the element hasn't rendered yet." A bare `id=testID` locator also fails, since it assumes a package-qualified resource id (`com.app:id/name`) and RN's testID carries no package prefix. The working selector is `driver.$('android=new UiSelector().resourceId("credit-amount-input")')`. Dumping the live `uiautomator` hierarchy (`adb shell uiautomator dump`) is what actually reveals the mismatch — `resource-id` populated, `content-desc` empty — rather than re-deriving it from scratch on a silent "not found."

## Anti-patterns

- A mobile app scaffolded outside the Nx monorepo (bare `npx react-native init` run standalone), disconnected from the shared task graph and `libs/`.
- Building straight off the Nx generator's Android scaffold without diffing it against the official RN template for the pinned version first — the generator's template lag surfaces as confusing, seemingly-unrelated Gradle/Kotlin/native-API build failures instead of an obvious version mismatch.
- A validation or pricing rule implemented in a React Native screen/hook because "it's just a small check" — the same rule the web client already computes server-side.
- Appium specs skipped in favor of only a Jest/RTL component test with a mocked API client — catches a UI regression but not a contract mismatch with the real backend.
- `react-native` left on a caret/latest range, silently drifting off the supported `0.87.x` line on a routine install.

## References

- React Native releases and support policy: https://reactnative.dev/versions
- Appium docs: https://appium.io/docs/en/latest/
- React Native testing docs (Jest preset): https://reactnative.dev/docs/testing-overview

Back to the rules: [`guides/idioms/react-native/mobile-app.md`](guides/idioms/react-native/mobile-app.md).
