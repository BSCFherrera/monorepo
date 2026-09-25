---
captured: 2026-09-04
source: functional + spec-adherence review findings — ISP-2 (French amortization calculator)
proposed-layer: guides/idioms/hexagonal-architecture
---

## What happened

The business spec's button-enablement rule ("Calculate is enabled only
once every field holds a positive numeric value") got implemented
literally as a *domain-layer* invariant on `LoanRequest` (rejecting
`monthlyInsurance <= 0` and, until a follow-up fix, an annual rate of
exactly `0`). But the test plan's own Gherkin scenarios — and a
different business rule in the same spec explicitly requiring a 0%
interest-rate code path — passed `monthlyInsurance: 0` and
`annualInterestRate: 0` as valid backend inputs. The domain rejected
requests the test plan itself declared valid; a functional review and a
spec-adherence review both caught this independently, and it required
a business decision (not just a code fix) to resolve the 0%-rate case,
since the mobile UI's own button-enable check made the whole feature
unreachable.

## Why it matters

A UI-only enablement/gating rule ("don't let the user submit until
fields look filled in") and a domain invariant ("this value is never
valid for this business object") are different concerns even when the
Jira wording makes them read like the same sentence. Copying the
UI-facing acceptance criterion straight into the domain constructor
without cross-checking it against the test plan's own Given-clauses
produced a domain that was *stricter than the business rules it was
supposed to implement* — and the mismatch wasn't caught until a
dedicated review pass, well after the code and tests were both green
(the unit tests had silently substituted non-zero fixture values to
dodge the very case the test plan asked for).

## Proposed change

Add to `idioms/hexagonal-architecture`: when a business spec states a
field-level constraint that reads like "field X must be positive/valid
before the user can act," check whether it's describing a *presentation
gating rule* (only the UI, prevents a premature submit) or a genuine
*domain invariant* (this value is never valid for this entity) before
implementing it — and cross-check the chosen interpretation against the
test plan's own Given-clauses for every scenario touching that field.
If the test plan feeds the domain a value the spec's wording would
reject, that's a signal the constraint belongs in presentation only, not
in the domain constructor — surface the conflict rather than silently
picking the stricter reading.
