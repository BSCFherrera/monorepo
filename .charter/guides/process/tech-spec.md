---
kind: guide
id: process/tech-spec
description: 'SDD step 3 — the architect turns the business spec and test plan into concrete changes and EARS technical test cases.'
---
# Tech spec

Step 3 of the SDD pipeline (`playbooks/sdd.md`). The first phase allowed
to think in implementation terms — concrete changes, plus EARS-format
technical test cases traced to the test plan's Gherkin scenarios.

## Entry condition

Both `business-spec-<CODE>.md` (`status: clear`) and
`test-plan-<CODE>.md` (`status: complete`) exist in the spec folder.
**Hard stop otherwise** — the `architect` agent names exactly which file
is missing or incomplete and refuses to draft against a partial input.

## Activities

1. **Orient.** Load the touched region's idioms — `rules/idioms/hexagonal-architecture`,
   `rules/idioms/nx-monorepo`, and any stack-specific idioms — before
   drafting. The tech spec must fit the mandated architecture.
2. **Dispatch the `architect` agent.** Concrete changes (modules, ports,
   adapters, components, migrations — whatever the stack requires) plus
   EARS-format technical test cases.
3. **Trace every EARS case to a Gherkin scenario.** A technical behavior
   with no corresponding scenario signals the test plan is incomplete —
   flag it back to `test-plan` rather than inventing an untraceable case.
4. **Ask when an architectural choice is genuinely ambiguous** and
   existing codebase conventions don't settle it. A backend API surface
   in particular: whether it's a new `apps/<name>` microservice or a
   module inside an existing modular-monolith backend app (per
   `rules/idioms/dotnet-backend`) is a call that must be made explicitly
   here — ask rather than default to either shape when unsure.
5. **Save** `tech-spec-<CODE>.md` in the spec folder.

## Sensors

None new — the touched-region idiom guides (loaded via **orient**) act
as ambient constraints on what the architect proposes.

## Gate condition

`status: complete`. **No human approval gate** — proceeds to planning
automatically. The agent asks the human only per the ambiguous-choice
case above.

## Artifacts

| Kind | Location |
|---|---|
| Tech spec | `docs/specs/<CODE>-<slug>/tech-spec-<CODE>.md` |

## Anti-patterns

- Drafting a tech spec against a business spec or test plan that isn't
  in a terminal status.
- An EARS test case that doesn't trace to any Gherkin scenario.
- A technical design that violates the loaded hexagonal-architecture or
  Nx-monorepo rules instead of working within them.
- Defaulting a new API to "new microservice app" or "add to the existing
  backend" without asking, when the codebase doesn't already settle it.
