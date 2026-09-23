# BSC Genesis — monorepo

Nx + pnpm workspace for Banco Santa Cruz's Genesis apps and the shared design system they build on.

## Structure

```
apps/
├── BSC.genesis.mobile.banking/  React Native banking app (Android/iOS + web preview via Vite)
│   └── packages/
│       └── bsc-shared/          @bsc/shared — pure business logic (formatters, validation)
└── BSC.genesis.conversational/  (placeholder)
packages/
├── design-tokens/  @bsc/design-tokens — tokens generated from the Figma library (primitives → semantic → component, light + dark)
├── ui-native/      @bsc/ui-native — shared React Native components (Bsc*) and the Google Sans Flex font
├── contracts/      @bsc/contracts — framework-neutral prop and data contracts
├── utils/          @bsc/utils — framework-neutral pure utilities
└── i18n/           @bsc/i18n — translation system (i18next); Spanish today, language selector ready
libs/
└── BSC.genesis.design.system/   (placeholder from the original scaffold)
docs/
```

## Requirements

- Node >= 20, pnpm >= 9 (`corepack enable` recommended)
- Android: Android Studio / SDK, JDK 17 (Android Studio's bundled JDK works)
- iOS: Xcode + CocoaPods

## Install

```bash
pnpm install
cd apps/BSC.genesis.mobile.banking/ios && pod install   # iOS only
```

Open the iOS project through `BSCMobileAppRN.xcworkspace`, not the `.xcodeproj`.

## Common commands (from the repo root)

```bash
pnpm lint         # nx run-many -t lint
pnpm typecheck    # nx run-many -t typecheck
pnpm test         # nx run-many -t test

pnpm nx run BSC.genesis.mobile.banking:start      # Metro
pnpm nx run BSC.genesis.mobile.banking:android    # or :ios
pnpm nx run BSC.genesis.mobile.banking:web        # browser preview (Vite)
pnpm nx run BSC.genesis.mobile.banking:verify     # the app's full verification script

pnpm nx run design-tokens:generate                # regenerate tokens from the Figma snapshot
```

## Where things are documented

- Design tokens and the Figma snapshot: `packages/design-tokens/figma/README.md`
- Translations (adding text, adding a language, the selector): `packages/i18n/README.md`
- Font: `packages/ui-native/assets/fonts/README.md`
- App migration history, security model and open questions: `apps/BSC.genesis.mobile.banking/docs/migration/`

## Known caveats

- **iOS security modules are written but not verified on a device.** They run on the simulator,
  but the Secure Enclave and biometrics need a physical iPhone (see `docs/migration/adr/0003`).
- **Figma is the design source of truth**, read-only. The design tokens are regenerated from a
  committed snapshot; a test fails if the generated code drifts from it.
- The native projects and the registered component name still use the original app name
  (`BSCMobileAppRN`); only the folder and the Nx project are named `BSC.genesis.mobile.banking`.
