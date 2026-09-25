---
kind: rule
id: rules/keystone-idioms-typescript
description: All application code in this repo is TypeScript — no new plain-JavaScript source files.
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "tsconfig*.json"
source: .charter/guides/idioms/typescript.md
generated_by: keystone-project
---

# TypeScript — rules

Full guide: `.charter/guides/idioms/typescript.md` (read on demand).

## IRON LAW

Every new source file in an app or lib is TypeScript (`.ts`/`.tsx`) — never `.js`/`.jsx` — with `strict: true` in the project's `tsconfig`.


## GOLDEN RULE

- Domain-layer types (entities, value objects) are expressed as real TypeScript types/interfaces, not loosely-typed objects or `any` — the hexagonal architecture's domain purity depends on the compiler catching a misuse, not just a naming convention.
- No `any` as an escape hatch for an unclear shape — model the shape, or use `unknown` and narrow it.
- Scaffold new apps/libs with the Nx generator's TypeScript option (the default for `@nx/next`, `@nx/vite`, `@nx/playwright`) rather than a JS variant.

For reasoning, see [`corpus/idioms/typescript.md`](corpus/idioms/typescript.md).
