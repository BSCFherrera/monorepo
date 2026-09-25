---
captured: 2026-09-04
source: spec-adherence review finding — ISP-2 backend API contract
proposed-layer: guides/idioms/dotnet/backend
---

## What happened

The tech spec documented that an invalid request (including a fractional
`termMonths`) must return `400` with a machine-readable
`invalid_loan_request` error code, produced by the domain's own
validation. The request DTO typed `TermMonths` as `int`. Sending
`termMonths: 12.5` never reached the domain at all — ASP.NET's model
binder rejected the malformed JSON-to-int conversion first, returning
its own generic `ProblemDetails` shape with no `errorCode` field. The
controller's exception-to-400 mapping, and the domain's own
whole-number check, were both correct — but unreachable for this input,
because the DTO's type made the "wrong" layer responsible for rejecting
it. This shipped with zero test coverage (the controller test for this
case was a placeholder `Assert.Pass()`, and the e2e suite never actually
sent a fractional term) and was only caught by an independent
spec-adherence review that ran the live service and checked the actual
response body.

## Why it matters

A DTO's field type is itself a validation gate that happens *before*
any application/domain code runs. When a tech spec promises a specific
error shape for an invalid input, the DTO's type must be loose enough
to let that specific invalid value actually reach the layer responsible
for producing the promised error — otherwise the framework's own default
error response silently substitutes for the documented contract, and
nothing in a type-correct compile or a happy-path test will catch it.

## Proposed change

Add to `idioms/dotnet/backend`: when a tech spec documents a specific
error code/shape for a particular invalid input (not just "return
400"), verify the request DTO's field types can actually represent that
invalid input long enough to reach the domain validation that's meant
to reject it. A narrower type (e.g. `int` for a value whose whole-number-ness
is itself part of the business rule being validated) routes the
rejection through the framework's default model-binding error instead
of the documented one — prefer a looser type (e.g. `decimal`) and let
the domain own both the check and the error shape.
