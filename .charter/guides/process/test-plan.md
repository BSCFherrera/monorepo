---
kind: guide
id: process/test-plan
description: 'SDD step 2 — write Gherkin functional test cases proving every business rule, with explicit rule coverage.'
---
# Test plan

Step 2 of the SDD pipeline (`playbooks/sdd.md`). Turns the business
spec's rules into Gherkin scenarios and guarantees, via a coverage
table, that no rule ships untested.

## Entry condition

`business-spec-<CODE>.md` exists with `status: clear` in the same spec
folder. If not, return to `business-spec` first.

## Activities

1. **Dispatch the `functional-test-designer` agent.** For every business
   rule in the business spec, write at least one Gherkin scenario (more
   when the rule has distinct happy-path / edge / negative cases).
2. **Build the coverage table** — rule → scenario(s) — inline in the
   file. This table is not documentation; the **rule-coverage** sensor
   reads it.
3. **Idempotent re-entry.** If `test-plan-<CODE>.md` already exists,
   re-check its coverage table against the *current* business spec:
   - Fully covered → make no changes, report done.
   - Gaps → add scenarios only for the newly-uncovered rules; leave
     existing, already-covered scenarios untouched.
4. **Ask when a rule is ambiguously testable** and the business spec
   doesn't say which interpretation is right — do not pick silently.
5. **Save/update** `test-plan-<CODE>.md` in the spec folder.

## Sensors

- **rule-coverage** ([`sensors/rule-coverage.md`](sensors/rule-coverage.md))
  — walks the business spec's rules against the test plan's coverage
  table. Every rule needs ≥1 scenario. Re-runs here and again at the
  **review** phase (step 6 of the pipeline) against the final diff.

## Gate condition

`status: complete`: the rule-coverage sensor reports zero uncovered
rules. **No human approval gate** — proceeds to `tech-spec`
automatically. The agent asks the human only per the ambiguous-rule case
above.

## Artifacts

| Kind | Location |
|---|---|
| Test plan | `docs/specs/<CODE>-<slug>/test-plan-<CODE>.md` |

## Anti-patterns

- A business rule with zero scenarios — the coverage table exists
  precisely to make this impossible to miss.
- Rewriting already-compliant scenarios on a re-entry instead of leaving
  them untouched (churns unrelated history for no reason).
- Scenarios written in implementation language instead of business/
  behavior language.
