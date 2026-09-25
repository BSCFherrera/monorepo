---
kind: guide
id: computational/typescript
description: "TypeScript compiler (strict) — the type-check sensor's source of truth."
globs:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript compiler

**What it covers** — types for every `.ts`/`.tsx` file: `strict`, `noUncheckedIndexedAccess`, `isolatedModules`.
**Activation** — LSP in the editor; `pnpm nx run-many -t typecheck` (the **type-check** sensor).
**Authority** — blocking.
**Configured by** — `tsconfig.base.json` (root, path aliases for `@bsc/contracts`, `@bsc/utils`, `@bsc/design-tokens`) plus each project's `tsconfig.json`; the app extends `@react-native/typescript-config`.
