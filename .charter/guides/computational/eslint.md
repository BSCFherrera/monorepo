---
kind: guide
id: computational/eslint
description: "ESLint configs for libs (flat) and the RN app (legacy) — the lint sensor's source of truth."
globs:
  - "libs/**/*.ts"
  - "libs/**/*.tsx"
  - "apps/BSC.genesis.mobile.banking/**/*.js"
  - "apps/BSC.genesis.mobile.banking/**/*.ts"
  - "apps/BSC.genesis.mobile.banking/**/*.tsx"
---

# ESLint

**What it covers** — lint: `@typescript-eslint/recommended`, `no-unused-vars` as error, `no-explicit-any` as warning; the app uses `@react-native/eslint-config` and `i18next/no-literal-string` (error) on features already migrated to `@bsc/i18n` (today `src/features/auth/**` and `PantallaDeArranque.tsx`).
**Activation** — editor lint-as-you-type; `pnpm nx run-many -t lint` (the **lint** sensor).
**Authority** — blocking for errors, advisory for warnings.
**Configured by** — root `eslint.config.mjs` (flat config, ignores `android/`, `ios/`, `dist/`, `.nx/`) and `apps/BSC.genesis.mobile.banking/.eslintrc.js` (legacy config, ESLint 8).
