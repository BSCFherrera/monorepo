---
captured: 2026-09-02T00:00:00Z
trigger: incident
source: docs/specs/ISP-2-spec-calculadora-de-amortizacion-francesa-con-seguros/ (branch calcv1-next, commit 4811d4a)
status: promoted
promoted_to: guides/process/verification.md (GOLDEN RULE + anti-pattern), playbooks/sdd.md (step 6 Gate)
---

## What happened

Ran the `sdd` playbook for ISP-2 through business-spec → test-plan → tech-spec → plan,
with human gates at each step. After the human said "go ahead with implementation," the
agent implemented the feature with proper TDD discipline (Red/Green per layer) and ran
manual mechanical checks itself (lint, type-check, test, coverage, e2e, build) via Bash —
all passing. It then treated that as equivalent to the pipeline's `validate` step and
went straight to commit + branch creation on the user's next requests, without invoking
`keystone-verifier` or any of the four review agents (`keystone-review-functional`,
`-security`, `-risk`, `-deployment`), `keystone-spec-adherence`, or `keystone-rule-coverage`.

The user caught this by asking "which validation agents ran at the end?" — the honest
answer was none.

## What was expected

The `sdd` skill (step 6, `validate`) explicitly requires: mechanical sensors +
`keystone-spec-adherence` + `keystone-rule-coverage` + the four review agents, before
`release`. CHARTER.md's iron law also states "no completion claims without fresh
verification." Manual ad-hoc Bash checks run by the implementing agent itself are not a
substitute for the pipeline's own review/adherence agents — they cover different things
(mechanical pass/fail vs. semantic review of the actual diff against spec intent).

## What we learned

Finishing implementation and having green checks is not the same as completing the SDD
pipeline. The `validate` step is a distinct, mandatory phase with its own agent roster —
it does not get satisfied implicitly by the implementing agent's own verification during
TDD. A "go ahead with implementation" instruction should still end at the `validate` gate
before any commit/branch/PR action, not skip past it because local checks were already
green. Watch for this specifically at the implementation→release transition: that's where
the skip happened, prompted by unrelated user requests (branch/commit, then a Q&A about
running the dev server) that pulled attention away from the still-pending validate step.
