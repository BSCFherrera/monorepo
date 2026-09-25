---
kind: guide
id: computational/prettier
description: "Prettier formatting, checked by the app's verify target."
globs:
  - "apps/BSC.genesis.mobile.banking/src/**/*.ts"
  - "apps/BSC.genesis.mobile.banking/src/**/*.tsx"
  - "apps/BSC.genesis.mobile.banking/packages/**/src/**/*.ts"
---

# Prettier

**What it covers** — formatting. Root: single quotes, trailing commas, width 100, semicolons. App: single quotes, trailing commas, `arrowParens: avoid` (default width 80).
**Activation** — on-save in the editor; checked by `pnpm --dir apps/BSC.genesis.mobile.banking run format:check`, which the app's `verify` target runs first. No Nx target or pre-commit hook.
**Authority** — blocking inside the app's `verify`; advisory elsewhere.
**Configured by** — root `.prettierrc.json` (Prettier 3) and `apps/BSC.genesis.mobile.banking/.prettierrc.js` (Prettier 2.8.8). The two versions differ — see `corpus/state/code-debt.md` `DEBT-004`.
