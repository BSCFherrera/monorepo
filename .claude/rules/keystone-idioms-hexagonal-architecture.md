---
kind: rule
id: rules/keystone-idioms-hexagonal-architecture
description: Hexagonal (ports & adapters) architecture, mandatory and language-agnostic, for every module in every project.
globs:
  - "**/domain/**"
  - "**/application/**"
  - "**/infrastructure/**"
  - "**/presentation/**"
source: .charter/guides/idioms/hexagonal-architecture.md
generated_by: keystone-project
---

# Hexagonal architecture — rules

Full guide: `.charter/guides/idioms/hexagonal-architecture.md` (read on demand).

## IRON LAW

Dependencies point inward only. `presentation` depends on `application`; `application` depends on `domain`; `infrastructure` implements `domain`'s ports. `domain` never imports `application`, `infrastructure`, `presentation`, or any framework/driver library. This applies symmetrically to exceptions: an application use case that calls into the domain must catch the domain's own exception types itself and translate them into application-layer exceptions (or a `Result`/outcome type) before they propagate — presentation must never `catch` (or otherwise reference) a domain-namespaced exception type, even solely for HTTP-status mapping.


## GOLDEN RULE

- Ports are named after the business concept they serve, never the technology behind them (`UserRepositoryPort`, not `PostgresUserRepository`).
- Adapters implement a port and carry the technology in their own name (`PostgresUserRepositoryAdapter`), never the reverse.
- Cross-module calls go through the target module's application service/facade — never reach into another module's `domain/` or `infrastructure/` directly.
- **Multi-client rule**: for any product with more than one client (web + mobile, web + CLI, etc.), all derived/computed values are computed by the backend and returned via the API. Clients render; they never recompute a business rule themselves. Logic duplicated across clients drifts — a fix applied to one client and missed in another is a live bug.


## RULES

- Every module has the same four folders: `domain/`, `application/`, `infrastructure/`, `presentation/` (naming adapts to the language's convention; the layering does not).
- `domain/` holds entities and business rules as plain language constructs — no framework annotations, no ORM decorators, no HTTP/DB/SDK imports.
- `application/` orchestrates use cases: calls domain services, injects and calls ports (never concrete adapters), maps between domain entities and DTOs.
- `infrastructure/` implements ports as adapters (database, external APIs, file system), maps technology-specific errors into domain exceptions, and contains zero business logic.
- `presentation/` (HTTP controllers, CLI commands, mobile view-models/screens, GraphQL resolvers) validates input, calls application services, and formats the response — it never talks to infrastructure or domain directly.
- Adapter selection (which concrete adapter backs a port at runtime) is resolved once, at composition/wiring time, via factory or config — not scattered as environment checks through business code.


## RULES

- When a business spec states a field-level constraint that reads like "field X must be positive/valid before the user can act," check whether it's describing a *presentation gating rule* (only the UI, prevents a premature submit) or a genuine *domain invariant* (this value is never valid for this entity) before implementing it — and cross-check the chosen interpretation against the test plan's own Given-clauses for every scenario touching that field. If the test plan feeds the domain a value the spec's wording would reject, that's a signal the constraint belongs in presentation only, not the domain constructor — surface the conflict rather than silently picking the stricter reading.

For reasoning, see [`corpus/idioms/hexagonal-architecture.md`](corpus/idioms/hexagonal-architecture.md).
