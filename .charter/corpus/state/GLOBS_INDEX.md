---
kind: corpus
id: corpus/state/GLOBS_INDEX
description: 'Reverse-index of every guide that declares globs: in its frontmatter.'
---
# Globs Index

> **Generated.** The **bootstrap** action seeds this from the region map in `CODEBASE_STATE.md`; **synthesize** and **audit** regenerate it whenever a guide's `globs:` frontmatter changes. **Do not edit by hand** — manual edits are overwritten on the next regeneration.

Reverse-index of every guide that declares `globs:` in its frontmatter. Pointer-style adapters (Claude Code, Codex, Aider, Continue, etc.) read this in their action playbooks to gate idiom loading on the touched-files set without re-walking the tree.

Guides without `globs:` are not listed here — they activate ambient per their topic default.

## Index

| Glob pattern | Guides claiming it |
|---|---|
| `**/*.e2e.*` | `charter/guides/idioms/testing-policy.md`, `charter/guides/idioms/testing-stack.md` |
| `**/*.feature` | `charter/guides/idioms/testing-policy.md` |
| `**/*.spec.*` | `charter/guides/idioms/testing-policy.md`, `charter/guides/idioms/testing-stack.md` |
| `**/*.test.*` | `charter/guides/idioms/testing-policy.md`, `charter/guides/idioms/testing-stack.md` |
| `**/*.ts` | `charter/guides/computational/typescript.md`, `charter/guides/idioms/typescript.md` |
| `**/*.tsx` | `charter/guides/computational/typescript.md`, `charter/guides/idioms/typescript.md` |
| `**/application/**` | `charter/guides/idioms/hexagonal-architecture.md` |
| `**/domain/**` | `charter/guides/idioms/hexagonal-architecture.md` |
| `**/e2e/**` | `charter/guides/idioms/testing-policy.md`, `charter/guides/idioms/testing-stack.md` |
| `**/infrastructure/**` | `charter/guides/idioms/hexagonal-architecture.md` |
| `**/presentation/**` | `charter/guides/idioms/hexagonal-architecture.md` |
| `**/project.json` | `charter/guides/idioms/nx/monorepo-structure.md` |
| `README.md` | `charter/guides/idioms/markdown-docs/spanish-process-docs.md` |
| `apps/**/*.appium.config.*` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/**/*.csproj` | `charter/guides/idioms/dotnet/backend.md` |
| `apps/**/*.sln` | `charter/guides/idioms/dotnet/backend.md` |
| `apps/**/*.tsx` | `charter/guides/idioms/design-system/bsc-design-system.md` |
| `apps/**/Program.cs` | `charter/guides/idioms/dotnet/backend.md` |
| `apps/**/metro.config.js` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/**/next-env.d.ts` | `charter/guides/idioms/react/nextjs-ssr.md` |
| `apps/**/next.config.*` | `charter/guides/idioms/react/nextjs-ssr.md` |
| `apps/**/react-native.config.js` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/*-e2e/**` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/*/android/**` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/*/ios/**` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/*/package.json` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/BSC.genesis.mobile.banking/**/*.js` | `charter/guides/computational/eslint.md` |
| `apps/BSC.genesis.mobile.banking/**/*.ts` | `charter/guides/computational/eslint.md` |
| `apps/BSC.genesis.mobile.banking/**/*.tsx` | `charter/guides/computational/eslint.md` |
| `apps/BSC.genesis.mobile.banking/packages/**/src/**/*.ts` | `charter/guides/computational/prettier.md` |
| `apps/BSC.genesis.mobile.banking/src/**` | `charter/guides/idioms/react-native/mobile-app.md` |
| `apps/BSC.genesis.mobile.banking/src/**/*.ts` | `charter/guides/computational/prettier.md` |
| `apps/BSC.genesis.mobile.banking/src/**/*.tsx` | `charter/guides/computational/prettier.md` |
| `docs/**/*.md` | `charter/guides/idioms/markdown-docs/spanish-process-docs.md` |
| `libs/**/*.ts` | `charter/guides/computational/eslint.md` |
| `libs/**/*.tsx` | `charter/guides/computational/eslint.md`, `charter/guides/idioms/design-system/bsc-design-system.md` |
| `libs/*/package.json` | `charter/guides/idioms/react-native/mobile-app.md` |
| `libs/BSC.genesis.design.system/**` | `charter/guides/idioms/design-system/bsc-design-system.md` |
| `libs/BSC.genesis.design.system/src/**` | `charter/guides/idioms/react-native/mobile-app.md` |
| `nx.json` | `charter/guides/idioms/nx/monorepo-structure.md` |
| `openspec/**` | `charter/guides/idioms/openspec/change-lifecycle.md` |
| `openspec/changes/**/*.md` | `charter/guides/idioms/design-system/bsc-design-system.md` |
| `playwright.config.*` | `charter/guides/idioms/testing-stack.md` |
| `pnpm-workspace.yaml` | `charter/guides/idioms/react-native/mobile-app.md` |
| `scripts/**/*.ps1` | `charter/guides/idioms/powershell/fail-fast-automation.md` |
| `tsconfig*.json` | `charter/guides/idioms/typescript.md` |
| `vitest.config.*` | `charter/guides/idioms/testing-stack.md` |

## How it's regenerated

1. Walk every guide under `charter/guides/` and `charter/policies/*/guides/`.
2. For each guide, read its frontmatter and collect each entry in `globs:` (if present).
3. Invert: for each glob pattern, list the guides that claim it.
4. Sort patterns by path-prefix for stable diffs.
5. Replace the **Index** table above; touch nothing else.

## Consumers

| Adapter | How it uses the index |
|---|---|
| Claude Code | `orient` reads the index to load only the idiom guides whose globs match touched files. |
| Codex | Same as Claude Code, via `charter/adapters/codex/activation.md`. |
| Aider / Cline / Continue / Goose / Pi | Same pointer-style pattern; per-adapter `activation.md` describes the lookup. |
| Cursor | Does not read this file — it uses native `globs:` on `.cursor/rules/*.mdc`. |
| `_generic` | Does not read this file — falls back to topic defaults. |
