---
kind: guide
id: idioms/react/nextjs-ssr
description: Web apps (apps/<name> serving a browser UI) are built with Next.js SSR on React 19.2.8 / Next 16.3.4 — never a client-only SPA setup.
globs:
  - "apps/**/next.config.*"
  - "apps/**/next-env.d.ts"
---
# Next.js SSR web apps — rules

The rules from [`corpus/idioms/react/nextjs-ssr.md`](corpus/idioms/react/nextjs-ssr.md).

## SCOPE

Applies to `apps/**` projects that are a browser-facing web app (a Next.js project, signaled by `next.config.*`/`next-env.d.ts` at its root). Does not apply to a project with no Next.js config — that project made its own framework choice and is out of scope here.

## IRON LAW

Every web app is server-rendered via Next.js (App Router SSR) on `react@19.2.8` and `next@16.3.4` — no client-only SPA bootstrap (`create-react-app`, bare Vite SPA) for a new web app. Business logic — any calculation, validation, or derived value — executes server-side (Server Components, Server Actions, or route handlers), never in client-bundled code, regardless of client count.

## GOLDEN RULE

- Pin `react`, `react-dom`, and `next` to `19.2.8` / `16.3.4` in the app's `package.json` — don't drift to a different major/minor without an explicit, deliberate upgrade.
- Scaffold new web apps with the Nx Next.js generator (`nx g @nx/next:application`) so the app lands under `apps/<name>` wired into the Nx task graph, not `create-next-app` run outside Nx.
- Data needed for first paint is fetched server-side (Server Components / route handlers) — don't fetch client-side only to avoid SSR.
- A form or interactive flow that triggers a calculation invokes it via a Server Action or route handler — the client leaf collects input and renders the result, it never carries the calculation itself.
- A component needing browser-only APIs or interactivity is marked `"use client"` deliberately at the leaf, not by pushing the whole page to the client.

For reasoning, see [`corpus/idioms/react/nextjs-ssr.md`](corpus/idioms/react/nextjs-ssr.md).
