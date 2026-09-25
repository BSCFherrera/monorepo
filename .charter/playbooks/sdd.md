---
kind: playbook
id: sdd
description: 'Jira-sourced spec-driven development pipeline — business spec → test plan → tech spec → plan → implement → validate → commit/PR.'
---
# sdd

**Jira-sourced SDD pipeline.** Orchestrates
`business-spec → test-plan → tech-spec → orient(plan) → implementation → verify+review(validate) → release`
for any feature or user story whose spec lives in Jira. This is the
canonical path for product-owner-authored work — see
[`skills/jira-spec-gate/SKILL.md`](skills/jira-spec-gate/SKILL.md) for
how a Jira code gates entry.

**Invoke as:** "run sdd on `<JIRA-CODE>`" — or the **jira-spec-gate**
skill hands off here automatically when a feature/user-story request
carries a confirmed Jira code.

## Spec folder

Every artifact this playbook produces lands in one folder:
`docs/specs/<CODE>-<slug>/`, where `<slug>` is the Jira issue's own
summary, lowercased, non-alphanumeric runs collapsed to a single hyphen,
trimmed (e.g. `PROJ-123-add-recurring-subcategory-default`). Nothing
this pipeline writes lives outside that folder except the code itself
and the commit/PR.

## Activities

The agent walks each phase in order. **Pause for explicit human
acceptance after each of the first four phases** (business-spec,
test-plan, tech-spec, plan) before proceeding to the next — do not
race ahead. Every agent in every step also follows: **never assume —
if unsure, ask.**

1. **business-spec** — read [`business-spec.md`](commands/business-spec.md).
   Fetch the Jira issue via MCP (manual mode: the framework's REST
   snapshot in `docs/framework/memory/jira-issues/<CODE>.md`), write the
   business-only spec. Ask
   business questions if unclear. If the issue is frontend-classified
   and supplies no design reference, generate a proposed design (e.g.
   via the `design` skill) before this gate closes — see
   [`guides/process/business-spec.md`](guides/process/business-spec.md).
   **Gate:** explicit user acceptance of the business spec.
2. **test-plan** — read [`test-plan.md`](commands/test-plan.md). Write
   Gherkin scenarios covering every business rule; idempotent re-entry
   if the file already exists. **Gate:** explicit user acceptance of
   the test plan.
3. **tech-spec** — read [`tech-spec.md`](commands/tech-spec.md). Hard
   stop if business-spec or test-plan is missing/incomplete. Architect
   writes concrete changes + EARS test cases traced to the Gherkin
   scenarios. **Gate:** explicit user acceptance of the tech spec.
4. **plan** — read [`orient.md`](commands/orient.md) /
   [`guides/process/planning.md`](guides/process/planning.md). Load
   idioms for the touched region, write the implementation plan. Saved
   to the spec folder as `plan-<CODE>.md` (not `docs/plans/`, per the
   SDD-flow override in `guides/process/planning.md`). **Gate:**
   explicit user acceptance of the implementation plan.
5. **implementation** — read [`guides/process/implementation.md`](guides/process/implementation.md).
   TDD: EARS cases are the Red step. Every Gherkin scenario gets a real
   E2E test (`rules/idioms/testing-policy`). Unit, integration, and e2e
   tests all get written per the loaded idiom rules for the touched
   stack(s).
6. **validate** — read [`verify.md`](commands/verify.md) and
   [`review.md`](commands/review.md). Mechanical sensors (lint,
   type-check, test, build, drift, commit-message) plus semantic review
   (functional/security/risk/deployment) plus **spec-adherence** walked
   against all three spec-folder documents plus **rule-coverage**
   re-checked against the final diff. Coverage floor: 85%
   (statements/branches/lines), both frontend and backend. **Gate:** the
   implementer's own ad-hoc checks during implementation (TDD-green)
   do not satisfy this step — the **verify** action, **spec-adherence**,
   **rule-coverage**, and the four review agents must actually be
   invoked and their output read before proceeding to release
   (see `guides/process/verification.md`'s GOLDEN RULE).
7. **release** — read [`guides/process/release.md`](guides/process/release.md).
   Commit (conventional commits, `AI-Generated-By:` trailer, never `--no-verify`)
   and open the PR, linked to the Jira issue and the spec folder.

## Iron laws (carry across every phase)

- **Never assume — if unsure, ask.**
- **Human gate after each of business-spec, test-plan, tech-spec, and
  plan.** No proceeding to the next phase without explicit acceptance.
- **No proceeding past `tech-spec` without a complete business spec and
  test plan** (architect's hard stop).
- **No completion claims without fresh verification evidence** — sensors
  run in the `validate` turn, not claimed from memory.
- **No commits with failing sensors. Never `--no-verify`.**
- **No hiding AI involvement.** Commits carry `AI-Generated-By:`; PRs and the Jira issue state it plainly.

## When *not* to use sdd

- Work with no Jira issue — use the generic [`task`](task.md) playbook
  and its single-stage `spec` action instead.
- One-off questions or trivial edits — skip straight to the relevant
  action, per `task.md`'s own guidance.
