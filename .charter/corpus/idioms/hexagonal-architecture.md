---
kind: corpus
id: corpus/idioms/hexagonal-architecture
description: Why hexagonal architecture is mandatory and kept language-agnostic across the org's projects.
---

# Hexagonal architecture — reasoning

The org builds mobile and web products, each typically pairing a backend with one or more frontends, in whatever language fits the surface (a TypeScript/Node backend, a Kotlin or Swift mobile app, a React or Vue web app). A single architectural pattern — hexagonal, a.k.a. ports and adapters — is mandated across all of them so that:

- Business logic is technology-independent and stays testable in isolation, without spinning up a database, an HTTP server, or a mobile runtime.
- Swapping a technology (a database, an auth provider, an LLM vendor, a payment gateway) means writing a new adapter, not touching the rules that actually matter to the business.
- An engineer moving between projects — or between the mobile app and its backend — finds the same four folders and the same dependency direction every time, regardless of the language.
- When a product ships more than one client against the same backend (a very common shape here: web + mobile), business computation stays in exactly one place. A derived value computed independently in two clients will eventually diverge — a rule change shipped to one and missed in the other is a silent, hard-to-catch bug, not a hypothetical.

## UI gating vs. domain invariant

A UI-only enablement/gating rule ("don't let the user submit until fields look filled in") and a domain invariant ("this value is never valid for this business object") are different concerns even when the source spec's wording makes them read like the same sentence. On one project, a business spec's button-enablement rule ("Calculate is enabled only once every field holds a positive numeric value") got implemented literally as a domain-layer invariant, rejecting values the test plan's own Given-clauses — and a separate business rule in the same spec requiring a 0%-interest-rate code path — declared valid backend input. The domain ended up stricter than the business rules it was supposed to implement, and the mismatch wasn't caught until a dedicated review pass, well after the code and tests were both green (the unit tests had quietly substituted non-zero fixture values to dodge the exact case the test plan asked for). The test plan's Given-clauses are the tiebreaker: if they feed the domain a value the spec's prose would reject, the constraint belongs in presentation, not the domain constructor.

## Exception layering applies to error handling too

Catching a lower layer's exception type "just to map it to an HTTP response" doesn't feel like reaching into business logic the way calling a domain method directly would — but it's the same dependency-direction violation the iron law exists to prevent. A controller that does `catch (InvalidLoanRequestException ex)` directly has a compile-time dependency on the domain's internal exception vocabulary, even though the behavior is correct and the code passes review at a glance; a drift review is often what actually catches it. The fix costs nothing behavior-wise: an application-layer exception (e.g. `LoanValidationFailedException`) that the use case throws after catching the domain one, with the controller catching only the application type — only the dependency direction changes. Left unfixed, a future domain refactor (renaming or splitting that exception) breaks the controller too.

## Anti-patterns

- Domain code importing a database client, HTTP client, or framework decorator (`@Column()`, an ORM base class, a UI framework hook).
- Business logic (a calculation, a validation rule, an eligibility check) written inside an adapter instead of a domain service.
- A port named after its implementation (`IPrismaUserRepository`) instead of the business concept (`UserRepositoryPort`).
- A module reaching into another module's `infrastructure/` or `domain/` directly instead of calling its `application/` service/facade.
- A mobile or web client recomputing a value the backend already computes and could simply return in the API response.
- Adapter selection scattered as ad hoc `if (env === 'prod')` branches through business code instead of centralized at one composition point.
- A UI-facing acceptance criterion ("field must be positive before submit is enabled") copied straight into a domain constructor without cross-checking it against the test plan's own Given-clauses.
- A controller/presentation-layer `catch` block referencing a domain-namespaced exception type directly, even only to map it to an HTTP status.

## References

- Alistair Cockburn, Hexagonal Architecture: https://alistair.cockburn.us/hexagonal-architecture/
- Herberto Graça, Ports & Adapters Architecture: https://herbertograca.com/2017/09/14/ports-adapters-architecture/
- Reference project pattern (`agents-example/.agents/ARCHITECTURE.md`) — this org's rule strips the NestJS/TypeScript-specific naming and decimal-library details, keeping only the layering, port-naming, and multi-client business-logic-placement rules, since the org's stack varies by project and by client (mobile vs. web).

Back to the rules: [`guides/idioms/hexagonal-architecture.md`](guides/idioms/hexagonal-architecture.md).
