---
name: keystone-rule-coverage
description: "Walks the business spec's rules against the test plan's Gherkin coverage table."
---
# Sensor: rule-coverage

Confirms every business rule in a business spec has at least one Gherkin
scenario proving it, per the test plan's coverage table.

- **Trigger** — **test-plan** phase (self-check on write and on
  idempotent re-entry), **review** phase (step 6 of the SDD pipeline,
  re-checked against the final diff).
- **Inputs** — `business-spec-<CODE>.md`'s `## Business rules` list and
  `test-plan-<CODE>.md`'s `## Coverage` table, both in the same spec
  folder.
- **Exit condition** — every business rule appears in the coverage table
  mapped to at least one scenario.
- **Output** — per-rule pass/fail. A rule with zero scenarios fails; at
  **review** time, a scenario with no corresponding E2E test also fails
  (see `rules/idioms/testing-policy`'s iron law).
- **State writes** — none.
