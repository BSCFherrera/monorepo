# BSC Genesis — monorepo

Nx + pnpm workspace for Banco Santa Cruz's Genesis apps and the shared design system they build on.

## Structure

```
apps/
├── BSC.genesis.mobile.banking/  React Native banking app (Android/iOS + web preview via Vite)
│   └── packages/
│       └── bsc-shared/          @bsc/shared — pure business logic (formatters, validation)
└── BSC.genesis.conversational/  React Native conversational app (AI chat over WebSocket, onboarding, access recovery)
libs/
├── BSC.genesis.design.system/  @bsc/design-system — the design system: rules (DESIGN-RULES.md), Figma-generated tokens, every UI component (Bsc*) and the Google Sans Flex font
├── shared-contracts/      @bsc/contracts — framework-neutral prop and data contracts
├── shared-utils/          @bsc/utils — framework-neutral pure utilities
└── shared-i18n/           @bsc/i18n — translation system (i18next); Spanish today, language selector ready
docs/
tools/scripts/                   workspace scripts (shared mobile dependencies check)
```

## Shared dependencies

Every React Native app shares the same third-party dependencies at the same version.
Versions live once, in the pnpm catalog of `pnpm-workspace.yaml`; packages under `apps/` and
`libs/` declare `"<name>": "catalog:"` instead of a version. `pnpm deps:check` enforces it (also
part of the app's `verify`). See `docs/mobile/dependencias-compartidas.md`.

## Requirements

- Node >= 20, pnpm >= 9 (`corepack enable` recommended)
- Android: Android Studio / SDK, JDK 17 (Android Studio's bundled JDK works)
- iOS: Xcode + CocoaPods

## Install

```bash
pnpm install
cd apps/BSC.genesis.mobile.banking/ios && pod install   # iOS only
cd apps/BSC.genesis.conversational/ios && pod install   # iOS only
```

The conversational app also needs two untracked env files, copied by hand: `.env` and
`android/.env` (see its README).

Open the iOS project through `BSCMobileAppRN.xcworkspace`, not the `.xcodeproj`.

## Common commands (from the repo root)

```bash
pnpm lint         # nx run-many -t lint
pnpm typecheck    # nx run-many -t typecheck
pnpm test         # nx run-many -t test
pnpm deps:check   # shared mobile dependencies: catalog only, same set in every RN app
pnpm deps:sync    # fix what can be fixed automatically, then run pnpm install

pnpm banking:start                                # Metro (terminal 1)
pnpm banking:android                              # or banking:ios (terminal 2)
pnpm nx run BSC.genesis.mobile.banking:web        # browser preview (Vite)
pnpm nx run BSC.genesis.mobile.banking:verify     # the app's full verification script

pnpm conversational:start                         # Metro (terminal 1) — same port as banking
pnpm conversational:android                       # or conversational:ios (terminal 2)

pnpm nx run design-tokens:generate                # regenerate tokens from the Figma snapshot

pnpm feature:start GEN-123 story "Title"          # new OpenSpec change + branch, then Claude Code `run sdd on GEN-123`
pnpm nx run design-system:generate                # regenerate tokens from the Figma snapshot
```

The `<app>:start|android|ios` scripts in this package.json are shortcuts for
`nx run <project>:<target>`. The commands themselves are defined once, in each app's
`project.json` (`apps/<app>/project.json` → `targets`); add the same three shortcuts
when a new app joins the monorepo. `pnpm nx show project <project>` lists every target.

## Where things are documented

- Design rules (read before any UI work): `libs/BSC.genesis.design.system/DESIGN-RULES.md`
- Design tokens and the Figma snapshot: `libs/BSC.genesis.design.system/figma/README.md`
- Shared dependencies (catalog, adding a dependency, unlinked native modules, adding an app): `docs/mobile/dependencias-compartidas.md`
- Translations (adding text, adding a language, the selector): `libs/shared-i18n/README.md`
- Font: `libs/BSC.genesis.design.system/assets/fonts/README.md`
- App migration history, security model and open questions: `apps/BSC.genesis.mobile.banking/docs/migration/`

## Known caveats

- **iOS security modules are written but not verified on a device.** They run on the simulator,
  but the Secure Enclave and biometrics need a physical iPhone (see `docs/migration/adr/0003`).
- **Figma is the design source of truth**, read-only. The design tokens are regenerated from a
  committed snapshot; a test fails if the generated code drifts from it.
- The native projects and the registered component name still use the original app name
  (`BSCMobileAppRN`); only the folder and the Nx project are named `BSC.genesis.mobile.banking`.
