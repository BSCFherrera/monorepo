---
kind: corpus
id: corpus/idioms/testing-policy
description: Why the org holds a mandatory Gherkin-to-E2E trace and an 85% coverage floor across every project.
---

# Testing policy — reasoning

The org's SDD pipeline (see `playbooks/sdd.md`) produces a Gherkin test plan for every business rule before any code exists, and an EARS-format technical test case for every implementation-level behavior in the tech spec. Those artifacts are only worth the time spent writing them if the tests they describe actually get built and actually run — a Gherkin scenario that never becomes an E2E test is documentation, not a gate.

A concrete failure mode motivates the E2E iron law: a unit test against a mocked API can pass while the real backend rejects the exact same payload (a DTO field the frontend sends as optional, the backend validates as required). The mock encodes the test author's assumption about the contract, not the contract itself. Only a test that exercises the real backend catches that class of bug — which is why every Gherkin scenario requires a real E2E test, not a substitute.

The 85%/statements-branches-lines floor, held equally for frontend and backend, is a deliberate choice not to grade the two differently — with multiple clients (web + mobile) against a shared backend (see `guides/idioms/hexagonal-architecture`'s multi-client rule), frontend code carries real behavior (state, validation, rendering logic) that deserves the same bar as backend code, not a lighter one.

## Anti-patterns

- A Gherkin scenario in the test plan with no corresponding E2E spec.
- Coverage reported at the file or package level while the aggregate hides an untested critical path.
- An E2E test that swallows or skips on a detected backend error instead of failing on it.
- Backfilling EARS technical test cases after implementation instead of writing them from the tech spec as the TDD Red step.
- Relaxing the coverage floor for "just this feature" instead of treating a miss as a signal the change needs more tests.

## References

- Reference project pattern (`agents-example/.agents/TESTING_POLICY.md`) — this org's rule adopts the Gherkin→E2E iron law, the full-matrix complete-feature gate, the scoped-lint-gate rule, and the E2E-must-fail-on-error rule near-verbatim; the org sets a flat 85% floor for both frontend and backend (the reference project used 85%/60% split) and generalizes suite names away from that project's specific Nx targets.

Back to the rules: [`guides/idioms/testing-policy.md`](guides/idioms/testing-policy.md).
