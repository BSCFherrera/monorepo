---
kind: corpus
id: corpus/idioms/dotnet/backend
description: Why every backend app (web's non-SSR backend included, and mobile's backend) standardizes on .NET 10 instead of per-team runtime choice.
---

# .NET backend apps — reasoning

A monorepo with web, mobile, and API teams choosing their own backend runtime ad hoc ends up with one Node service, one Python service, one older .NET service — each with its own build, test, and ops tooling to maintain, and no shared libs across them. Standardizing backend apps on .NET 10 gives every `apps/<name>` API the same runtime, the same task-graph shape, and lets [`corpus/idioms/hexagonal-architecture`](corpus/idioms/hexagonal-architecture.md) layering (`Domain`/`Application`/`Infrastructure`/`Presentation`) look the same everywhere a reviewer opens it, regardless of which client calls it.

The carve-out for a web app's own Next.js SSR server matters because that server isn't a second backend — it's the same app's rendering boundary, covered by [`corpus/idioms/react/nextjs-ssr`](corpus/idioms/react/nextjs-ssr.md). The line to hold is: SSR (Server Components, Server Actions, route handlers that only serve that app's own pages) stays in Next.js; anything that is a real service — shared across clients, its own bounded context, called by mobile too — is a .NET 10 backend app instead of quietly growing inside `apps/web/app/api/`. Left unchecked, that boundary erodes one route handler at a time until the "backend" is scattered across every client's own server layer with no single place mobile or a future client can call.

This composes directly with [`corpus/idioms/react-native/mobile-app`](corpus/idioms/react-native/mobile-app.md): a mobile app's backend was already required to be its own `apps/<name>` deployable — this rule fixes what that deployable is built on.

Standardizing on .NET carries its own test stack per [`corpus/idioms/testing-stack`](corpus/idioms/testing-stack.md): NUnit for unit/integration (the mainstream, SDK-native choice — no reason to introduce xUnit or MSTest alongside it) and Playwright's API testing mode for e2e, so a .NET backend still gets Nx-graph-integrated, real-running-service e2e coverage without a fourth test framework entering the repo just for API-only services.

Standardizing the *runtime* does not settle the *topology* question. Not every new API needs a new `apps/<name>` — sometimes the right shape is a new bounded-context module inside an existing modular-monolith backend, sometimes it genuinely is a new microservice. That call has real cost either way (a wrong new-service split adds deploy/ops overhead and cross-service calls for something that belonged together; a wrong bolt-on couples two bounded contexts that will need to scale or deploy independently later) and depends on team topology, expected scaling, and existing bounded-context boundaries — none of which the architect can infer from the codebase alone. The tech-spec step is where this is decided explicitly rather than defaulted; per [`guides/process/tech-spec`](guides/process/tech-spec.md)'s ask-when-ambiguous activity, guessing here is exactly the kind of architectural assumption that should stop and ask instead.

## DTO field types are a validation gate too

A DTO's field type is itself a validation gate that runs *before* any application/domain code — a tech spec's promised error shape for an invalid input is only reachable if the DTO's type is loose enough to let that value arrive intact. On one project a tech spec documented that a fractional `termMonths` must return `400` with a machine-readable `invalid_loan_request` code from the domain's own validation; the request DTO typed `TermMonths` as `int`, so ASP.NET's model binder rejected the malformed JSON-to-int conversion before the domain ever saw it, returning its own generic `ProblemDetails` shape with no `errorCode`. The controller's exception mapping and the domain's whole-number check were both correct — and both unreachable for this input. This shipped with a placeholder `Assert.Pass()` standing in for the controller test and no e2e case sending a fractional term; only an independent review that ran the live service and checked the actual response body caught it. The rule of thumb: if the tech spec's error contract depends on the domain seeing an invalid value, the DTO type must not be narrow enough to reject that value first.

## Anti-patterns

- A new backend service scaffolded in Node/Express or Python because "it's faster to spin up" for a one-off endpoint, bypassing the standard stack.
- A web app's `route handlers` growing into a de facto second backend (auth, business rules, data access for other clients) instead of being extracted into a `.NET 10` service.
- A backend app left on an older .NET TFM (net8.0, net9.0) with no plan to move to `net10.0`.
- `Domain` project referencing `Microsoft.AspNetCore.*` or an ORM package directly, violating the hexagonal boundary.
- A backend test project scaffolded with xUnit or MSTest because that's the CLI template default, instead of NUnit.
- A request DTO field typed narrower than the invalid input the tech spec's error contract needs to reach the domain (e.g. `int` for a value whose fractional-ness is the thing being validated), routing the rejection through the framework's default model-binding error instead.

## References

- .NET 10 release notes: https://dotnet.microsoft.com/download/dotnet/10.0
- NUnit docs: https://docs.nunit.org
- Playwright `APIRequestContext` (API testing): https://playwright.dev/docs/api-testing

Back to the rules: [`guides/idioms/dotnet/backend.md`](guides/idioms/dotnet/backend.md).
