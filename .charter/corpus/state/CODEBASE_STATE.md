---
kind: corpus
id: corpus/state/CODEBASE_STATE
description: 'Empirical map of this codebase.'
last_reconciled: 2026-09-29
---
# Codebase State

Empirical map of this codebase. Updated by the **verify**, **learn**, and **audit** actions.

`BSC.genesis.monorepo` is the **Nx 22 + pnpm 9 workspace** for Banco Santa Cruz's Genesis apps. Today it holds one real app — the React Native banking app `apps/BSC.genesis.mobile.banking` (migrated from a retired Flutter app) — plus the design-system lib `libs/BSC.genesis.design.system` (all design rules, tokens and UI components) and the framework-neutral packages it builds on. Every language in the workspace is TypeScript (strict, `noUncheckedIndexedAccess`). The IA-SDLC framework (Keystone charter + OpenSpec) is installed at the root.

## Tool commands

All commands run from the repo root. Nx fans each target out to every project that defines it (6 projects: the app, `@bsc/shared`, `design-system`, and the three `libs/shared-*`).

| Tool | Command |
|---|---|
| lint | `pnpm nx run-many -t lint` (ESLint 8; root flat config `eslint.config.mjs` for `libs/shared-*`, `@react-native/eslint-config` via `.eslintrc.js` for the app and `libs/BSC.genesis.design.system`) |
| type_check | `pnpm nx run-many -t typecheck` (`tsc --noEmit` per project) |
| test | `pnpm nx run-many -t test` (Jest 29; `@react-native/jest-preset` for the app and `design-system`, `ts-jest` for the other packages) |
| build | `pnpm nx run-many -t build` (`tsc` for `libs/shared-*`; the app bundles Android + iOS JS with `react-native bundle` into `dist/`) |
| coverage | `pnpm nx run-many -t test --coverage` (thresholds live in each project's `jest.config.js`; `@bsc/shared` enforces its own) |
| secret_scan | `pnpm --dir apps/BSC.genesis.mobile.banking run scan:secrets` (in-house scanner `scripts/escanear-secretos.mjs`, app-scoped) |
| vuln_scan | `pnpm audit --audit-level critical` |
| sast | `(none)` — no SAST tool wired |
| format | `pnpm --dir apps/BSC.genesis.mobile.banking run format:check` (Prettier; app only — not an Nx target) |
| full app gate | `pnpm nx run BSC.genesis.mobile.banking:verify` (format → lint → types → tests with thresholds → secret scan, `scripts/verify.mjs`) |

`framework.config.json` `validationCommands` run the same targets through the root `package.json` scripts (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`).

CI platform: **none in the repo** — no `.github/workflows/`, `azure-pipelines.yml`, or equivalent. The remote is Azure DevOps (`dev.azure.com/BMSC/Proyecto_Genesis`); PRs target `develop` (`nx.json` `affected.defaultBase: develop`). Any pipeline is defined outside this repository.

Severity thresholds (used by vuln-scan and sast):

| Tool | Fail at or above |
|---|---|
| vuln_scan | critical — `pnpm audit` reports 2 high in Nx's own pinned dependencies (see `code-debt.md` `DEBT-001`); tighten to `high` once those are resolved |
| sast | n/a — sensor not wired |

## Sensors

Inventory of sensors wired up for this project (adapter: Claude Code).

### Computational

| Sensor | Status |
|---|---|
| lint | wired — `pnpm nx run-many -t lint` |
| type-check | wired — `pnpm nx run-many -t typecheck` |
| test | wired — `pnpm nx run-many -t test` |
| build | wired — `pnpm nx run-many -t build` |
| coverage | wired — `pnpm nx run-many -t test --coverage` |
| secret-scan | wired — app-scoped in-house scanner (a root-wide run flags semver ranges in `pnpm-lock.yaml` as IPs; not a supported scope) |
| vuln-scan | wired — `pnpm audit --audit-level critical` |
| sast | `(none)` — no SAST tool in the repo or pipeline |
| drift | wired |
| commit-message | wired |
| state-region | wired |
| risk-fingerprint | wired |
| traffic-topology | wired |
| tracker-card-fetcher | wired (Jira, `atlassian` MCP server in `.mcp.json` via `getJiraIssue`; project key `GEN`) |
| quality-radar | wired |
| code-debt | wired |
| charter-debt | wired |
| stack-drift | wired |
| ai-provenance | wired |
| rule-coverage | wired |

### Inferential

| Sensor | Status |
|---|---|
| spec-adherence | wired (OpenSpec `schema: spec-driven`, `openspec/config.yaml`) |
| review-functional | wired |
| review-security | wired |
| review-risk | wired |
| review-deployment | wired |

## Guides

Inferential guides (markdown rules) are activated by directory — see `charter/guides/`. Computational guides detected by bootstrap:

| Tool | Kind | What it covers | Activation |
|---|---|---|---|
| TypeScript | type checker / LSP | types for every `.ts`/`.tsx` | `tsconfig.base.json` (strict) + per-project `tsconfig.json`; `typecheck` target — `guides/computational/typescript.md` |
| ESLint | linter | lint for `libs/shared-*` (flat config), the app and `libs/BSC.genesis.design.system` (`.eslintrc.js`) | `lint` target — `guides/computational/eslint.md` |
| Prettier | formatter | formatting | root `.prettierrc.json` (Prettier 3) and app `.prettierrc.js` (Prettier 2.8.8) — `guides/computational/prettier.md` |

No `.editorconfig`, pre-commit hook (husky/lefthook), or committed editor settings.

## Stacks

| Stack | Idiom folder | Region(s) |
|---|---|---|
| typescript | `charter/guides/idioms/typescript.md` | `**/*.ts`, `**/*.tsx` |
| nx | `charter/corpus/idioms/nx/` (+ `charter/guides/idioms/nx/`) | `nx.json`, `**/project.json` |
| react-native | `charter/corpus/idioms/react-native/` (+ `charter/guides/idioms/react-native/`) | `apps/BSC.genesis.mobile.banking/**` |
| design-system | `charter/corpus/idioms/design-system/` (+ `charter/guides/idioms/design-system/`; rules in `libs/BSC.genesis.design.system/DESIGN-RULES.md`) | `libs/BSC.genesis.design.system/**`, app `*.tsx` |
| testing | `charter/guides/idioms/testing-policy.md`, `testing-stack.md` | `**/*.test.*`, `**/__tests__/**` |
| openspec | `charter/corpus/idioms/openspec/` (+ `charter/guides/idioms/openspec/`) | `openspec/**` |
| markdown-docs | `charter/corpus/idioms/markdown-docs/` (+ `charter/guides/idioms/markdown-docs/`) | `docs/**/*.md`, `README.md` |

Guides shipped by the framework for stacks **not present** here (`dotnet`, `react/nextjs-ssr`, `powershell`) stay installed but match no files, so they never load.

## Frameworks & libraries

| Name | Version | Role | Region(s) |
|---|---|---|---|
| `nx` | 22.7.12 | task runner / project graph | root |
| `pnpm` | 9.15.0 | package manager (workspaces: `apps/*`, `libs/*`, `apps/BSC.genesis.mobile.banking/packages/*`) | root |
| `typescript` | 5.9.3 root, ^5.9 app | language | all |
| `react-native` | 0.87.1 (new architecture, Hermes) | mobile UI | app, `libs/BSC.genesis.design.system` |
| `react` | 19.2.3 | UI | app |
| `react-native-web` + `vite` | 0.21 / 7 | browser preview of the app (`:web` target) | app `web/`, `vite.config.mts` |
| `@react-navigation/*` | 7.x | navigation | app `src/app/navigation` |
| `zustand` | — | state | app |
| `axios` | — | HTTP | app `src/core/network` |
| `i18next` | 26 | translations (Spanish today, selector ready) | `libs/shared-i18n`, app `src/i18n`, `src/locales` |
| `jest` / `ts-jest` / `@react-native/jest-preset` | 29 | tests | all |
| `@fission-ai/openspec` | 1.x (via framework) | spec-driven change management | `openspec/` |

## Nx tags

Every project declares a scope and a type in its `project.json`:

| Project | Tags |
|---|---|
| `BSC.genesis.mobile.banking` | `scope:mobile-banking`, `type:app` |
| `bsc-shared` (`@bsc/shared`) | `scope:mobile-banking`, `type:util` |
| `design-system` (`@bsc/design-system`) | `scope:shared`, `type:ui` |
| `contracts`, `utils`, `i18n` | `scope:shared`, `type:util` |

Boundaries are enforced by `@nx/enforce-module-boundaries` (`@nx/eslint-plugin` 22.7.12) as part of the **lint** sensor. The rule lives in one file, `eslint.module-boundaries.cjs`, loaded by the root flat config and by the legacy `.eslintrc.js` of the app and `libs/BSC.genesis.design.system`:

- `scope:shared` → only `scope:shared`; `scope:mobile-banking` → `scope:shared` + `scope:mobile-banking`
- `type:app` → `type:ui`, `type:util`; `type:ui` → `type:ui`, `type:util`; `type:util` → `type:util`

`bsc-shared` has no `lint` target of its own; its files are linted, with its own tags, by the app's `eslint .` run.

Nx project names of `libs/shared-*` are unchanged by the move to `libs/`; only the folders moved. On 2026-09-29 `design-tokens` and `ui-native` were merged into the single project `design-system` (`pnpm nx run design-system:generate`).

## Regions

A "region" is a directory or set of directories with shared conventions.

### `apps/BSC.genesis.mobile.banking/`
- **Idioms:** `react-native`, `typescript`, `design-system`, `testing`
- **Coverage:** ~49% lines for the app (app-wide run); `@bsc/shared` enforces its own thresholds
- **Last reconciled:** 2026-09-25
- **Active migrations:** Flutter → React Native (functionally complete; see `docs/migration/`). iOS security modules unverified on a physical device (ADR 0003).
- Notes: `src/app` (root, navigation, DI container), `src/core` (`network`, `security`, `observability`, `files`), `src/features/*/{data,domain,ui}` (e.g. `transfers`, `payments`, `auth`). Native projects still named `BSCMobileAppRN`. Scripts in `scripts/` (verify, SBOM, icons, secret scan).

### `apps/BSC.genesis.mobile.banking/packages/bsc-shared/` (`@bsc/shared`)
- **Idioms:** `typescript`, `testing`
- **Coverage:** thresholds enforced in its `jest.config.js`
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: pure logic — formatters, operation risk / fingerprint, SHA-256, TOTP. Also consumed by the Nuxt portal (outside this repo).

### `apps/BSC.genesis.conversational/`
- **Idioms:** none
- **Coverage:** n/a
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: placeholder (README only) from the original scaffold.

### `libs/BSC.genesis.design.system/` (`@bsc/design-system`)
- **Idioms:** `design-system`, `react-native`, `typescript`
- **Coverage:** Jest (`@react-native/jest-preset`)
- **Last reconciled:** 2026-09-29
- **Active migrations:** app-side UI components moving into the lib (`code-debt.md` `DEBT-007`)
- Notes: the single design-system lib — `DESIGN-RULES.md` (all design rules + token reference, source of truth), `src/tokens` (platform-neutral tokens; `src/tokens/generated/figma.ts` generated from the read-only Figma snapshot in `figma/` by the `generate` / `check-generated` targets — a test fails on drift, never hand-edit), `src/theme` (RN adapters), `src/components` (`Bsc*`), `assets/fonts` (Google Sans Flex). No `build` target (consumed as source). Merged on 2026-09-29 from `libs/shared-design-tokens` + `libs/shared-ui-native` (`git mv`, history kept). Only the lib's own files import `src/tokens`, via relative paths.

### `libs/shared-contracts/`, `libs/shared-utils/`, `libs/shared-i18n/`
- **Idioms:** `typescript`
- **Coverage:** Jest
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: framework-neutral prop/data contracts, pure utilities, i18next translation system.

### root config + framework (`nx.json`, `package.json`, `tsconfig.base.json`, `.charter/`, `.claude/`, `openspec/`, `docs/framework/`)
- **Idioms:** `nx`, `openspec`, `markdown-docs`
- **Coverage:** n/a
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: IA-SDLC framework installed 2026-09-25 from `BSC.genesis.ia.sdlc`.

## Deviations from framework idioms

The framework's org-level guides were written for greenfield projects. Where this repo differs, the rule stays as the target and the current state is recorded here so the agent does not "fix" it unprompted:

- **`@bsc/shared` stays inside the app** (`apps/BSC.genesis.mobile.banking/packages/bsc-shared`): within this repo only one app consumes it (the Nuxt portal that also uses it lives elsewhere), so the `libs/` rule for code shared by two or more apps does not apply yet. Move it to `libs/` when a second app in this repo needs it.
- **Business logic partly client-side.** `@bsc/shared` (operation risk, TOTP, formatters) runs in the app; there is no backend app in this monorepo (the API is external). The mobile guide's "all business logic in a backend app" rule is the direction, not the current state.
- **No Appium e2e suite** exists yet.
- **Fonts:** Google Sans Flex is bundled in `libs/BSC.genesis.design.system/assets/fonts`, not `@expo-google-fonts` (no Expo).
- **Design-system lib name.** `idioms/nx/monorepo-structure` names shared libs `libs/<scope>-<name>`; the design system is `libs/BSC.genesis.design.system` by the team's explicit choice (2026-09-29), keeping the name from the original Genesis scaffold. Tags are still `scope:shared`, `type:ui`. Don't rename it to `libs/shared-*`.
- **App-side UI components.** The design-system guide's iron law says apps define only screens and navigation and take every UI component from `@bsc/design-system`. The banking app still has ~30 components of its own outside screens (e.g. `dashboard/ui/BalanceSummaryCard.tsx`, `BscBottomNav.tsx`, `QuickActions.tsx`, `productDetail/ui/*Sections.tsx`, `*Sheet.tsx`, `app/navigation/QuickActionsSheet.tsx`) and its screens style themselves with `StyleSheet`. Recorded as `code-debt.md` `DEBT-007`: new UI goes to the lib; an existing one moves into the lib when a change touches it.
- **Coverage below the 85% floor** of `idioms/testing-policy` for the app (~48% lines) — see `code-debt.md` `DEBT-003`. New code still follows TDD and the floor applies to what a change touches.

## Jira MCP integration

- `.mcp.json` (repo root) registers the **official Atlassian remote MCP server** (`https://mcp.atlassian.com/v1/mcp/authv2`, OAuth 2.1) under the name `atlassian`. Committed — no secrets; auth is per-developer OAuth.
- First use per developer: run `/mcp` in Claude Code and authenticate against `atlassian`.
- Jira project key: **`GEN`** (`framework.config.json`).
- The **jira-spec-gate** skill requires a confirmed Jira issue code for any feature/user-story/spec request and fetches it via `getJiraIssue`.

## Methodology & pacing

- **Methodology:** TDD for unit tests, BDD (Gherkin) for e2e / pre-OpenSpec test cases — the framework default.
- **Pacing mode:** paired.
- **Design source of truth:** Figma (read-only). The retired Flutter app is not a parity target.
- **In-flight migrations:** see the mobile banking region above.
- **Known debt / do-not-touch:** see `code-debt.md`; generated design tokens are never hand-edited.
- **Compliance scope:** banking app handling customer financial data — confirm the applicable regime with the team (see `docs/migration/06-security-threat-model.md`, `14-revision-mastg.md`).
