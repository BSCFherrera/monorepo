---
kind: corpus
id: corpus/idioms/typescript
description: Why every app/lib in this repo defaults to TypeScript rather than plain JavaScript.
---

# TypeScript — reasoning

This repo's architecture leans on the compiler doing work a code reviewer would otherwise have to do by hand. [`corpus/idioms/hexagonal-architecture`](hexagonal-architecture.md) requires `domain/` to hold plain-language entities and business rules with zero framework imports — that boundary is only mechanically enforceable (rather than a convention someone eventually violates) when the domain's shapes are real types a compiler checks at every call site, not untyped objects passed around by convention.

The same reasoning extends to Next.js Server Actions ([`corpus/idioms/react/nextjs-ssr`](react/nextjs-ssr.md)): the request/response shape crossing the client/server boundary is exactly the kind of contract that silently drifts in plain JS and is caught immediately by TypeScript on both sides.

`strict: true` specifically (not just `.ts` file extensions with loose checking) is what makes `unknown`/narrowing and null-safety actually load-bearing — a non-strict `tsconfig` lets `any` and implicit `undefined` back in through the side door.

## Anti-patterns

- A new file authored as `.js` "for now, will type it later" — it never gets typed later.
- `any` used to silence a type error instead of modeling the actual shape or narrowing from `unknown`.
- A `tsconfig.json` with `strict: false` or individual strict flags disabled to make a migration easier, left that way past the migration.

## References

- TypeScript handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Nx TypeScript support: https://nx.dev/getting-started/tutorials

Back to the rules: [`guides/idioms/typescript.md`](guides/idioms/typescript.md).
