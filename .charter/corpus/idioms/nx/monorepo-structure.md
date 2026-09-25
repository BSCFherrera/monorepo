---
kind: corpus
id: corpus/idioms/nx/monorepo-structure
description: Why Nx is the mandatory monorepo tool for every new project, and how boundaries/tags/generators/CI wiring keep it meaningful.
---

# Nx monorepo — reasoning

The org ships mobile and web products, each with a backend and a frontend, often sharing types, API clients, and UI primitives across surfaces. Without a shared monorepo convention, every project reinvents its own folder layout, its own task runner, and its own notion of "what's shared vs. app-local" — and that reinvention cost is paid again on every new project and by every engineer who moves between them.

Nx gives every project the same shape (`apps/` for deployables, `libs/` for shared code) and the same task interface (`nx build`, `nx test`, `nx lint`, `nx affected`) independent of the languages or frameworks inside. This is why the mandate is a **tool**, not a language or framework choice — a TypeScript backend, a Kotlin Android app, and a Swift iOS app can all live in Nx-managed `apps/` with their build/test/lint wired into the same task graph and CI affected-detection. Tooling and agent behavior (this charter's own idiom guides, sensors, and playbooks) transfer across every project without relearning a bespoke layout each time.

`apps/` and `libs/` alone don't prevent drift back into a tangled monolith — a library can still reach into another app's internals, or a "shared" lib can quietly become app-specific. Two further conventions keep the structure honest as the workspace grows:

- **Tags + `enforce-module-boundaries`**: every project declares scope/type tags (`scope:web`, `scope:shared`, `type:feature`, `type:ui`, `type:data-access`, `type:util`) and an ESLint rule enforces which tags may depend on which. This turns "libs shouldn't import app internals" from a review convention into a lint failure.
- **Generators over hand scaffolding**: `nx g @nx/<plugin>:application|library` wires the new project into `project.json`, the task graph, and default lint/test config consistently. A hand-copied project silently drifts from whatever config the generator would have produced.

This is a charter-wide default applied across every company project, most of which predate it and were never built on Nx. A mandate that fired just because a repo happens to have a folder named `apps/` or `libs/` — common, generic names outside Nx too — would misfire on those repos and push for an unwanted, unrequested migration. So the rule is scoped narrowly: it binds a **brand-new** project (nothing to break) and any repo that has **already** adopted Nx (signaled by `nx.json`/`project.json` at its root). An existing non-Nx project is left alone; adopting Nx there is a deliberate, separate decision for its owners to make, not something this guide forces by proximity.

## Anti-patterns

- Treating this guide as a mandate to migrate an existing non-Nx project just because it has `apps/` or `libs/` folders, or because it was touched while the guide is loaded.
- A new project scaffolded by hand (`mkdir src`, custom `package.json` scripts) instead of `npx create-nx-workspace` / `nx add`.
- Code copy-pasted between `apps/` instead of extracted into `libs/`, so a bug fix has to be applied in more than one place.
- A `libs/` project with no `tags` in `project.json` — it can't be governed by `enforce-module-boundaries` and silently becomes importable from anywhere.
- A feature library imported directly by another feature library instead of through a `data-access` or shared `util`/`ui` layer.
- CI or local scripts calling the underlying tool directly (`jest ...`, `vite build`) instead of through `npx nx`, silently losing Nx's caching and affected-project detection.
- CI running the full task graph on every PR instead of `nx affected`, paying full build/test time regardless of change size.
- A dev-server command checked for a "done"/exit status — it never exits, and the check hangs or falsely reports failure.

## References

- Nx documentation: https://nx.dev
- Module boundaries: https://nx.dev/features/enforce-module-boundaries
- Generators: https://nx.dev/features/generate-code

Back to the rules: [`guides/idioms/nx/monorepo-structure.md`](guides/idioms/nx/monorepo-structure.md).
