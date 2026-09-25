---
description: Step 2 of the SDD pipeline — write Gherkin functional test cases covering every business rule.
argument-hint: <jira_code>
---

# /test-plan

**Write the Gherkin functional test plan.** Second step of the SDD
pipeline (see [`playbooks/sdd.md`](playbooks/sdd.md)). Read
[`guides/process/test-plan.md`](guides/process/test-plan.md) for the
full discipline.

## Activities

1. **Read `business-spec-<CODE>.md`** from the spec folder
   (`docs/specs/<CODE>-<slug>/`). If missing or not `status: clear`,
   stop and say why.
2. **Dispatch the `functional-test-designer` agent.** It writes one or
   more Gherkin scenarios per business rule and builds the rule→scenario
   coverage table.
3. **Idempotent check.** If `test-plan-<CODE>.md` already exists, the
   agent re-checks coverage against the *current* business spec rather
   than rewriting the file: adds scenarios only for newly-uncovered
   rules, and makes no change at all if the file is already compliant.
4. **Run the `rule-coverage` sensor** ([`sensors/rule-coverage.md`](sensors/rule-coverage.md))
   against the result — every business rule must map to at least one
   scenario before the file is marked `status: complete`.
5. **Save** `test-plan-<CODE>.md` inside the spec folder.

## Gate

None — no human approval step. Proceeds to `/tech-spec` once
`status: complete`. The agent asks the human only if a business rule is
ambiguously testable and the business spec doesn't resolve which
interpretation is correct.

## Iron law

**Every business rule has at least one Gherkin scenario.** A test plan
with an uncovered rule is not complete, regardless of how many scenarios
it has for other rules.
