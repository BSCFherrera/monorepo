---
kind: corpus
id: corpus/state/CODEBASE_STATE
description: 'Empirical map of this codebase.'
last_reconciled: 2026-09-25
---
# Codebase State

Empirical map of this codebase. Updated by the **verify**, **learn**, and **audit** actions.

`BSC.genesis.monorepo` is the **Nx 20 + pnpm 9 workspace** for Banco Santa Cruz's Genesis apps. Today it holds one real app — the React Native banking app `apps/BSC.genesis.mobile.banking` (migrated from a retired Flutter app) — plus the shared design system and framework-neutral packages it builds on. Every language in the workspace is TypeScript (strict, `noUncheckedIndexedAccess`). The IA-SDLC framework (Keystone charter + OpenSpec) is installed at the root.

## Tool commands

All commands run from the repo root. Nx fans each target out to every project that defines it (7 projects: the app, `@bsc/shared`, and the five `packages/*`).

| Tool | Command |
|---|---|
| lint | `pnpm nx run-many -t lint` (ESLint 8; root flat config `eslint.config.mjs` for `packages/*`, `@react-native/eslint-config` via `.eslintrc.js` for the app) |
| type_check | `pnpm nx run-many -t typecheck` (`tsc --noEmit` per project) |
| test | `pnpm nx run-many -t test` (Jest 29; `@react-native/jest-preset` for the app, `ts-jest` for packages) |
| build | `pnpm nx run-many -t build` (`tsc` for `packages/*`; the app bundles Android + iOS JS with `react-native bundle` into `dist/`) |
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
| vuln_scan | critical — set at bootstrap because `pnpm audit` currently reports 3 high + 1 moderate (see `code-debt.md`); tighten to `high` once those are resolved |
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
| ESLint | linter | lint for `packages/*` (flat config) and the app (`.eslintrc.js`) | `lint` target — `guides/computational/eslint.md` |
| Prettier | formatter | formatting | root `.prettierrc.json` (Prettier 3) and app `.prettierrc.js` (Prettier 2.8.8) — `guides/computational/prettier.md` |

No `.editorconfig`, pre-commit hook (husky/lefthook), or committed editor settings.

## Stacks

| Stack | Idiom folder | Region(s) |
|---|---|---|
| typescript | `charter/guides/idioms/typescript.md` | `**/*.ts`, `**/*.tsx` |
| nx | `charter/corpus/idioms/nx/` (+ `charter/guides/idioms/nx/`) | `nx.json`, `**/project.json` |
| react-native | `charter/corpus/idioms/react-native/` (+ `charter/guides/idioms/react-native/`) | `apps/BSC.genesis.mobile.banking/**` |
| design-system | `charter/corpus/idioms/design-system/` (+ `charter/guides/idioms/design-system/`) | `packages/design-tokens/**`, `packages/ui-native/**`, app `*.tsx` |
| testing | `charter/guides/idioms/testing-policy.md`, `testing-stack.md` | `**/*.test.*`, `**/__tests__/**` |
| openspec | `charter/corpus/idioms/openspec/` (+ `charter/guides/idioms/openspec/`) | `openspec/**` |
| markdown-docs | `charter/corpus/idioms/markdown-docs/` (+ `charter/guides/idioms/markdown-docs/`) | `docs/**/*.md`, `README.md` |

Guides shipped by the framework for stacks **not present** here (`dotnet`, `react/nextjs-ssr`, `powershell`) stay installed but match no files, so they never load.

## Frameworks & libraries

| Name | Version | Role | Region(s) |
|---|---|---|---|
| `nx` | 20.3.0 | task runner / project graph | root |
| `pnpm` | 9.15.0 | package manager (workspaces: `apps/*`, `packages/*`, `apps/BSC.genesis.mobile.banking/packages/*`) | root |
| `typescript` | ~5.6 root, ^5.9 app | language | all |
| `react-native` | 0.87.1 (new architecture, Hermes) | mobile UI | app, `packages/ui-native` |
| `react` | 19.2.3 | UI | app |
| `react-native-web` + `vite` | 0.21 / 7 | browser preview of the app (`:web` target) | app `web/`, `vite.config.mts` |
| `@react-navigation/*` | 7.x | navigation | app `src/app/navigation` |
| `zustand` | — | state | app |
| `axios` | — | HTTP | app `src/core/network` |
| `i18next` | 26 | translations (Spanish today, selector ready) | `packages/i18n`, app `src/i18n`, `src/locales` |
| `jest` / `ts-jest` / `@react-native/jest-preset` | 29 | tests | all |
| `@fission-ai/openspec` | 1.x (via framework) | spec-driven change management | `openspec/` |

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

### `apps/BSC.genesis.conversational/`, `libs/BSC.genesis.design.system/`
- **Idioms:** none
- **Coverage:** n/a
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: placeholders (README only) from the original scaffold.

### `packages/design-tokens/` (`@bsc/design-tokens`)
- **Idioms:** `design-system`, `typescript`
- **Coverage:** Jest
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: generated from a committed Figma snapshot (`generate` / `check-generated` targets). Figma is the read-only source of truth; a test fails if generated code drifts from the snapshot — never hand-edit generated output.

### `packages/ui-native/` (`@bsc/ui-native`)
- **Idioms:** `design-system`, `react-native`, `typescript`
- **Coverage:** Jest
- **Last reconciled:** 2026-09-25
- **Active migrations:** none
- Notes: shared `Bsc*` components, theme, component tokens, Google Sans Flex font. No `build` target (consumed as source).

### `packages/contracts/`, `packages/utils/`, `packages/i18n/`
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

- **Shared code lives in `packages/`, not `libs/{scope}-{name}`** (`nx.json` `workspaceLayout.libsDir: packages`). Follow the existing layout; don't move packages.
- **No Nx `tags` / `@nx/enforce-module-boundaries`** on any project yet. Adding them is a deliberate change, not drive-by work.
- **Business logic partly client-side.** `@bsc/shared` (operation risk, TOTP, formatters) runs in the app; there is no backend app in this monorepo (the API is external). The mobile guide's "all business logic in a backend app" rule is the direction, not the current state.
- **No Appium e2e suite** exists yet.
- **Design tokens live in `packages/design-tokens` (`@bsc/design-tokens`)**, not `libs/shared-design-tokens`; shared RN components are `packages/ui-native`. The font is Google Sans Flex bundled in `packages/ui-native/assets/fonts`, not `@expo-google-fonts` (no Expo).
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
