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
| `DEBT-001` | root `package.json` → `nx@22.7.12` | discovery | noisy | Genesis mobile team | next Nx 22.x patch or Nx 23 (needs ESLint 9) | `pnpm audit`: 2 high, dev-tooling only — `brace-expansion@5.0.8` (needs ≥5.0.9) and `smol-toml@1.6.1` (needs ≥1.7.1), both pinned exactly by `nx`. Fixable with `pnpm.overrides`. The Nx 20 advisories (`minimatch`, `nx`) were fixed by the Nx 22 upgrade. vuln-scan stays at `critical` until these clear. |
| `DEBT-002` | `docs/migration-audit.md:111` | discovery | noisy | Genesis mobile team | next edit to that doc | Mentions the internal LAN dev IP of the retired Flutter app in a committed doc; the secret scanner flags it on a root-wide run. Redact to a placeholder. |
| `DEBT-003` | `apps/BSC.genesis.mobile.banking/` | deliberate | load-bearing | Genesis mobile team | before pilot | App-wide coverage ~48% lines / 44% branches (Jest, 2026-09-25); only `@bsc/shared` enforces thresholds. |
| `DEBT-004` | `apps/BSC.genesis.mobile.banking/.prettierrc.js` vs root `.prettierrc.json` | drift | noisy | Genesis mobile team | tooling alignment | Two Prettier majors (app 2.8.8, root 3.x) and two ESLint config styles (app `.eslintrc.js`, root flat config). |
| `DEBT-006` | repo root | discovery | load-bearing | Genesis mobile team | pipeline setup | No CI definition or SAST tool in the repo; sensors run locally only. |
| `DEBT-007` | `apps/BSC.genesis.mobile.banking/src/` (`features/*/ui/`, `app/`) | deliberate | load-bearing | Genesis mobile team | a change that modifies one of these components' UI or behavior (not import-only edits), or a dedicated migration ticket | ~30 UI components defined in the app outside screens (e.g. `dashboard/ui/BalanceSummaryCard.tsx`, `BscBottomNav.tsx`, `DashboardHeader.tsx`, `QuickActions.tsx`, `productDetail/ui/*Sections.tsx`, `*Sheet.tsx`, `transfers/ui/TransferWizardChrome.tsx`, `app/navigation/QuickActionsSheet.tsx`), and screens styled with their own `StyleSheet` — both predate the design-system iron law (apps define only screens; all UI from `@bsc/design-system`). Move each into `libs/BSC.genesis.design.system` when its UI or behavior changes; don't copy the pattern. Once paid, add a lint rule that forbids `StyleSheet` in apps. |

## Categories

See [`charter/sensors/code-debt.md`](sensors/code-debt.md) for category and severity definitions. Keep them consistent — the planning phase reads this table verbatim.

## How to use it

- **Before planning a change in a region with load-bearing debt** → factor the debt into the plan. Either pay it down first, route around it, or document why you're adding to it.
- **Before adding new debt** → add the row first (with a trigger to revisit). A debt item without a revisit trigger rots into noise.
- **During audit** → sweep `stale` items for removal and `discovery` items for triage.

## Pruning

`stale` items are deleted during **debt-review**, not archived. The whole point of the ledger is signal density; archiving every fix turns it into a museum.
