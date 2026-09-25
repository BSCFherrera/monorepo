---
captured: 2026-09-04
source: implementation surprise — ISP-2 mobile app (React Native 0.87.1 via @nx/react-native@23.2.0)
proposed-layer: guides/idioms/react-native
proposed-globs:
  - "apps/*/android/**"
---

## What happened

`@nx/react-native@23.2.0`'s `application` generator scaffolds a React Native
Android project that does not build against the RN version the charter
mandates (0.87.x). Its own peer dependency even caps `react-native
<0.85.0` — installing 0.87.x requires `--legacy-peer-deps`. Once installed,
the generated Android project failed to build for reasons unrelated to
Nx: the generator's template lags RN's own current template by several
releases. Concretely, on RN 0.87 the generated project needed:

- `gradle-wrapper.properties` bumped `8.13` → `9.4.1` (unpinned
  `classpath("com.android.tools.build:gradle")` resolves the newest AGP,
  which requires Gradle ≥9.4.1 on this RN line).
- `gradle.properties` needed `android.builtInKotlin=false` and
  `android.newDsl=false` — without them, AGP 9's native Kotlin/DSL
  integration collides with the generator's explicit
  `apply plugin: "org.jetbrains.kotlin.android"`, failing with `Cannot
  add extension with name 'kotlin'`.
- `getDefaultProguardFile('proguard-android.txt')` is rejected by this
  AGP; must be `proguard-android-optimize.txt`.
- `MainApplication.kt` was scaffolded against RN's pre-0.87
  `ReactNativeHost`/`DefaultReactNativeHost` API, which RN 0.87 removed
  outright. Had to rewrite to the current `ReactHost` +
  `getDefaultReactHost(context, packageList)` + `loadReactNative(this)`
  shape.
- The RN host now always requests the JS module named `index` — the
  generator scaffolds `entryFile = file("../../src/main.tsx")` with no
  Kotlin-side override point for a custom main-module name anymore. Had
  to add `index.js` at the app root (`import './src/main'`) and point
  `build.gradle`'s `entryFile` at that instead.
- RN 0.87 dropped its bundled Jest preset/asset-transformer entirely
  (`react-native/jest/assetFileTransformer.js` no longer exists in the
  package's `exports` map) — moved to the separate
  `@react-native/jest-preset` package.
- Android SDK Platform 37 / Build-Tools 37.0.0 had to be installed
  manually; the generator's `compileSdkVersion` (35) was already stale.

All of these were only discoverable by downloading the *official* RN
template (`npm pack @react-native-community/template@<version>` and
diffing) and comparing file-by-file — the Nx generator's own output gave
no hint anything was wrong until the build failed with increasingly
unrelated-looking errors.

## Why it matters

Nx's React Native generator release cadence lags React Native's own
template. For a fast-moving RN minor (a new architecture-adjacent
release like 0.87), trusting the generator's scaffold as correct is a
false economy — it silently ships a project that cannot build on the
RN version the charter mandates, and the failures it produces (Kotlin
extension conflicts, missing Gradle plugin APIs, a 500 from Metro on
first launch) don't obviously point back to "the scaffold is stale."

## Proposed change

Add a rule to `idioms/react-native/mobile-app`: after scaffolding a new
RN app via the Nx generator, diff its `android/` directory against
`npm pack @react-native-community/template@<the pinned RN version>`
(extracted to a scratch dir) *before* attempting a build — reconcile
`gradle-wrapper.properties`, `gradle.properties`,
`MainApplication.kt`/`MainActivity.kt`, and the root `build.gradle`'s
`buildToolsVersion`/`compileSdkVersion`/`targetSdkVersion`/
`kotlinVersion` against the official template's values, not the
generator's. Treat the official template as ground truth, the Nx
generator as a starting point only.
