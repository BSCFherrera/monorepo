---
kind: corpus
id: corpus/idioms/react/nextjs-ssr
description: Why company web apps standardize on Next.js SSR at a pinned React/Next version instead of a client-only SPA.
---

# Next.js SSR web apps — reasoning

Web apps across the org need consistent SEO, first-paint performance, and auth/session handling at the server boundary — a client-only SPA (bare Vite/CRA) defers all of that to the browser and pushes every team to re-solve the same SSR/hydration problems ad hoc. Standardizing on Next.js App Router SSR gives every web app the same rendering model, the same data-fetching boundary (Server Components / route handlers), and the same deployment shape.

Pinning `react@19.2.8` / `next@16.3.4` (rather than "latest" or a loose range) keeps every web app on one known-compatible pair — React and Next ship breaking changes across majors/minors that aren't always caught by semver alone, and an unplanned drift on one app leaves it out of step with the shared `libs/ui` components and tooling built against the pinned pair.

This idiom composes with [`corpus/idioms/nx/monorepo-structure`](corpus/idioms/nx/monorepo-structure.md) — a Next.js web app is still an `apps/<name>` deployable, scaffolded through the Nx `@nx/next` generator, task-graph-managed like any other app.

Server-side business logic is not only a multi-client concern. Even a single-client app keeps calculations, validation, and derived values on the server (Server Actions / route handlers) rather than the client bundle: it keeps the SSR boundary meaningful (server owns computation, client owns presentation), avoids duplicating logic if a second client ever appears, and keeps the calculation covered by an end-to-end test that exercises a real server boundary instead of a unit test against code embedded in a component. This composes with [`corpus/idioms/hexagonal-architecture`](corpus/idioms/hexagonal-architecture.md)'s multi-client rule — that rule's *trigger* is multiple clients, but the underlying reason (clients render, they don't compute) holds even at one client, so we hold the line here too rather than waiting for a second client to force the refactor.

## Anti-patterns

- A new web app bootstrapped with `create-next-app` or `create-react-app` outside Nx, bypassing the generator and the task graph.
- `react`/`next` left on a caret/latest range so a routine `npm install` silently jumps major versions.
- An entire page marked `"use client"` to sidestep an SSR data-fetching question, losing server rendering for the whole route instead of isolating the interactive leaf.
- First-paint data fetched client-side (`useEffect` + fetch) when it could have been fetched server-side, causing a loading-spinner flash SSR was meant to avoid.
- A calculation or validation rule implemented inside a `"use client"` component instead of a Server Action/route handler — works today with one client, but drifts the moment a second client (mobile, CLI) needs the same rule and re-implements it separately.

## References

- Next.js App Router docs: https://nextjs.org/docs/app
- Nx Next.js plugin: https://nx.dev/nx-api/next

Back to the rules: [`guides/idioms/react/nextjs-ssr.md`](guides/idioms/react/nextjs-ssr.md).
