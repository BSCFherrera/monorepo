---
kind: rule
id: rules/keystone-idioms-dotnet-backend
description: Every backend app (an API/service apps/<name> — including the backend behind a non-SSR web/mobile client) is built on .NET 10, never a different runtime, and never the Next.js SSR server itself.
globs:
  - "apps/**/*.csproj"
  - "apps/**/*.sln"
  - "apps/**/Program.cs"
source: .charter/guides/idioms/dotnet/backend.md
generated_by: keystone-project
---

# .NET backend apps — rules

Full guide: `.charter/guides/idioms/dotnet/backend.md` (read on demand).

## IRON LAW

Every backend app — a standalone API/service `apps/<name>`, including the backend that serves a mobile app (per [`idioms/react-native/mobile-app`](idioms/react-native/mobile-app.md)) or the backend a web app calls for anything beyond its own SSR rendering — is built on **.NET 10**. Never a different runtime (Node/Express, Python, Java, older .NET) for a new backend app, and never business logic re-implemented in the Next.js SSR server in place of a real backend.


## GOLDEN RULE

- **Whether a new API surface needs a brand-new `apps/<name>` microservice or is a module inside an existing modular-monolith backend app is a tech-spec-time decision** (per [`process/tech-spec`](process/tech-spec.md)), never assumed by default. If it's genuinely unclear which shape fits, ask — don't default to "spin up a new app" or "bolt it onto the existing one."
- Pin the target framework to `net10.0` in every backend app's `.csproj` — don't drift onto an older TFM without a deliberate, explicit upgrade.
- Scaffold new backend apps as `apps/<name>` in the Nx monorepo (an Nx .NET generator/community plugin, or a manually wired .NET project added to the Nx task graph), following [`idioms/nx/monorepo-structure`](idioms/nx/monorepo-structure.md) — never a standalone .NET solution living outside the monorepo.
- The backend app follows [`idioms/hexagonal-architecture`](idioms/hexagonal-architecture.md) layering (`Domain/`, `Application/`, `Infrastructure/`, `Presentation/` projects/folders) — `Domain` never references a framework or driver package.
- A web app's own Next.js SSR layer (Server Components/Actions, route handlers) stays the presentation/rendering boundary for that app's own pages; anything that is genuinely a separate service (shared across clients, a distinct bounded context) is its own `.NET 10` backend app, not more Next.js route handlers.
- Unit and integration tests run under **NUnit** (per [`idioms/testing-stack`](idioms/testing-stack.md)) — never xUnit, MSTest, Jest, or Vitest for a .NET project. TDD and coverage rules apply per [`idioms/testing-policy`](idioms/testing-policy.md): every test still traces to the same Gherkin scenarios as any other stack.
- E2E specs run under Playwright's API testing mode (`APIRequestContext`) against the real running service, per [`idioms/testing-stack`](idioms/testing-stack.md) — never a mocked-dependency test standing in for an e2e scenario.


## RULES

- When a tech spec documents a specific error code/shape for a particular invalid input (not just "return 400"), verify the request DTO's field types can actually represent that invalid input long enough to reach the domain validation meant to reject it. A narrower type (e.g. `int` for a value whose whole-number-ness is itself part of the business rule being validated) routes the rejection through ASP.NET's default model-binding error instead of the documented one — prefer a looser type (e.g. `decimal`) and let the domain own both the check and the error shape.

For reasoning, see [`corpus/idioms/dotnet/backend.md`](corpus/idioms/dotnet/backend.md).
