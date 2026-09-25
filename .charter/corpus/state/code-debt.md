---
kind: corpus
id: corpus/state/code-debt
description: 'Paired ledger: [charter-debt.'
---
# Code Debt Ledger

> Seeded by **bootstrap** on 2026-09-25. The **audit** and **debt-review** actions maintain it from the [code-debt sensor](sensors/code-debt.md).

Paired ledger: [`charter-debt.md`](charter-debt.md) — debt in the charter itself. Tracked separately on purpose.

The known debt this codebase carries. One row per item. The point of the ledger is to make the cost of debt *visible during planning* — when **orient** runs against a region with load-bearing debt, the plan should account for it.

## Ledger

| ID | Location | Category | Severity | Owner | Trigger to revisit | Notes |
|---|---|---|---|---|---|---|
| `DEBT-001` | root `package.json` → `@nx/eslint@20.3.0` → `@nx/devkit` | discovery | load-bearing | Genesis mobile team | Nx upgrade, or before tightening vuln-scan to `high` | `pnpm audit`: 3 high (`minimatch@9.0.3`, needs ≥9.0.7) + 1 moderate (`nx@20.3.0`, needs ≥22.7.2), all dev-tooling only. vuln-scan runs at `critical` until fixed. |
| `DEBT-002` | `docs/migration-audit.md:111` | discovery | noisy | Genesis mobile team | next edit to that doc | Mentions the internal LAN dev IP of the retired Flutter app in a committed doc; the secret scanner flags it on a root-wide run. Redact to a placeholder. |
| `DEBT-003` | `apps/BSC.genesis.mobile.banking/` | deliberate | load-bearing | Genesis mobile team | before pilot | App-wide coverage ~48% lines / 44% branches (Jest, 2026-09-25); only `@bsc/shared` enforces thresholds. |
| `DEBT-004` | `apps/BSC.genesis.mobile.banking/.prettierrc.js` vs root `.prettierrc.json` | drift | noisy | Genesis mobile team | tooling alignment | Two Prettier majors (app 2.8.8, root 3.x) and two ESLint config styles (app `.eslintrc.js`, root flat config). |
| `DEBT-005` | root `eslint.config.mjs`, app `.eslintrc.js` | deliberate | noisy | Genesis mobile team | Nx 22 upgrade (in progress on GEN-795) | Every project has scope/type tags; `@nx/enforce-module-boundaries` is not wired yet, so boundaries are enforced by review only. |
| `DEBT-006` | repo root | discovery | load-bearing | Genesis mobile team | pipeline setup | No CI definition or SAST tool in the repo; sensors run locally only. |

## Categories

See [`charter/sensors/code-debt.md`](sensors/code-debt.md) for category and severity definitions. Keep them consistent — the planning phase reads this table verbatim.

## How to use it

- **Before planning a change in a region with load-bearing debt** → factor the debt into the plan. Either pay it down first, route around it, or document why you're adding to it.
- **Before adding new debt** → add the row first (with a trigger to revisit). A debt item without a revisit trigger rots into noise.
- **During audit** → sweep `stale` items for removal and `discovery` items for triage.

## Pruning

`stale` items are deleted during **debt-review**, not archived. The whole point of the ledger is signal density; archiving every fix turns it into a museum.
