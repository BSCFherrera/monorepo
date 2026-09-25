---
captured: 2026-09-04
source: drift review finding — ISP-2 backend controller
proposed-layer: guides/idioms/hexagonal-architecture
---

## What happened

The first implementation had the API controller `catch
(InvalidLoanRequestException ex)` directly — `InvalidLoanRequestException`
is a `Domain`-layer type, and the controller imported
`LoanCalculatorApi.Domain` just to reference it. This is the most
obvious, least-effort way to map a validation failure to a 400, and it
worked, and both the unit tests and the running service behaved
correctly. A drift review still flagged it: `idioms/hexagonal-architecture`'s
iron law says presentation depends only on application, never domain
directly — importing a domain exception type into the controller is
exactly that violation, even though it's "just" error handling and not
business logic.

The fix: add an `Application`-layer exception
(`LoanValidationFailedException`), have the use case catch the domain
exception and rethrow the application one, and have the controller catch
only the application-layer type. No behavior changed; only the
dependency direction did.

## Why it matters

Error handling is an easy place for a layering violation to sneak in
unnoticed, because catching a lower layer's exception type "just to map
it to an HTTP response" doesn't feel like reaching into business logic
the way calling a domain method directly would. But it's the same
architectural violation the iron law is written to prevent — presentation
now has a compile-time dependency on domain's internal exception
vocabulary, and a future domain refactor (renaming/splitting that
exception) breaks the controller too.

## Proposed change

Add to `idioms/hexagonal-architecture`'s rules: an application use case
that calls into the domain must catch the domain's own exception types
itself and translate them into application-layer exceptions (or a
`Result`/outcome type) before they propagate — presentation-layer code
must never `catch` (or otherwise reference) a domain-namespaced
exception type, even solely for HTTP-status mapping. This applies
symmetrically to the "no domain import in presentation" rule already
stated for normal calls.
