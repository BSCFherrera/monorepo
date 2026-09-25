---
kind: rule
id: rules/keystone-idioms-nx-monorepo-structure
description: Nx is the mandatory monorepo tool for every brand-new project, and governs any repo that already has nx.json — never a forced migration for existing non-Nx projects.
globs:
  - "nx.json"
  - "**/project.json"
source: .charter/guides/idioms/nx/monorepo-structure.md
generated_by: keystone-project
---

# Nx monorepo — rules

Full guide: `.charter/guides/idioms/nx/monorepo-structure.md` (read on demand).

## IRON LAW

A **brand-new** project is created as an Nx workspace (`npx create-nx-workspace`), unless the user has explicitly chosen otherwise for that project. No hand-rolled `apps/`/`libs/` layout for a project starting from zero.


## GOLDEN RULE

- Deployable units (a web app, a mobile app, an API service) live in `apps/<name>`.
- Code shared by two or more apps lives in `libs/<scope>-<name>` — never duplicated across apps.
- Every `libs/**` project declares `tags` in its `project.json` (scope + type, e.g. `scope:shared`, `type:feature`) and boundaries are enforced via `@nx/enforce-module-boundaries`, not code review alone.
- New apps and libs are scaffolded with `nx g @nx/<plugin>:application|library` (an Nx generator), not copy-pasted from an existing project or hand-written.
- Run tasks through Nx (`npx nx run`, `npx nx run-many`, `npx nx affected`) — never call the underlying tool (jest, vite, tsc, etc.) directly, so caching and affected-detection stay meaningful.
- When the Nx MCP server is available, use `nx_workspace`/`nx_project_details` to inspect the real project graph and `nx_docs` for config/best-practice questions — never assume or invent Nx config, targets, or flags.
- CI runs `nx affected` (build/test/lint) against the target base branch, not the full task graph, so review time scales with the change, not the repo.
- Dev/long-running servers started via `nx serve` run indefinitely — start them in the background and do not poll for a "done" state; assume success absent an immediate error.
- Any start/stop script for a long-running server must work on both Windows and macOS.

For reasoning, see [`corpus/idioms/nx/monorepo-structure.md`](corpus/idioms/nx/monorepo-structure.md).
