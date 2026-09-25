---
kind: rule
id: rules/keystone-idioms-testing-policy
description: TDD, Gherkin-to-E2E traceability, and coverage thresholds — mandatory for every project, language-agnostic.
globs:
  - "**/*.spec.*"
  - "**/*.test.*"
  - "**/*.e2e.*"
  - "**/e2e/**"
  - "**/*.feature"
source: .charter/guides/idioms/testing-policy.md
generated_by: keystone-project
---

# Testing policy — rules

Full guide: `.charter/guides/idioms/testing-policy.md` (read on demand).

## IRON LAW

Every `Scenario:` in a spec's Gherkin test plan gets a real end-to-end test exercising the actual backend — never only a unit test against a mocked API. A mocked-API unit test cannot catch a frontend/backend contract mismatch (wrong shape, a field validated as required on one side and optional on the other).


## GOLDEN RULE

- **TDD is mandatory**: write the failing test → confirm it fails → implement the minimum to pass → refactor. Applies per layer (unit, integration, e2e).
- **Coverage floor: 85%** on statements, branches, and lines — for both frontend and backend. Enforced in CI; a build under threshold fails the gate.
- **Complete-feature gate runs the full test matrix** — every suite (frontend unit, backend unit, backend integration, e2e) passes, regardless of which suite covers the change. A red suite outside the feature's own code still blocks; never skip, `.only`, or `--grep` around it. A minor adjustment runs only the suite level(s) its change type maps to.
- **Lint gate is scoped to touched code** — zero lint errors on lines the change touched, even pre-existing ones on those lines. Untouched files with pre-existing lint errors don't block.


## RULES

- Every technical (EARS-format) test case in a tech spec traces back to a Gherkin scenario in the test plan — EARS cases are the Red step of the TDD loop, not written after the fact.
- End-to-end tests must **fail** when a backend error occurs — never suppress or skip on a detected error state. Assert the absence of an error before asserting the positive outcome.
- Interactive elements carry a stable test-selector attribute (e.g. `data-testid`) for reliable e2e targeting — never select by CSS class or DOM position alone.
- Shared/serial test fixtures (e.g. a persistent test user) are isolated per test before parallelizing e2e runs — ordering dependencies between tests are a bug, not a constraint to design around.

For reasoning, see [`corpus/idioms/testing-policy.md`](corpus/idioms/testing-policy.md).
