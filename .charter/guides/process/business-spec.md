---
kind: guide
id: process/business-spec
description: 'SDD step 1 — read the Jira issue and capture business intent, business-only, before any technical thinking starts.'
---
# Business spec

Step 1 of the SDD pipeline (`playbooks/sdd.md`). Captures *what the
business wants*, in business language, from a Jira issue that carries
no technical definition of its own.

## Entry condition

A confirmed Jira issue code, gated by the **jira-spec-gate** skill.
Every SDD task starts here — this pipeline does not accept a spec
authored from prose alone when a Jira code is available.

## Activities

1. **Fetch the issue** via the Atlassian MCP server (`getJiraIssue`).
   Never hand-transcribe.
2. **Understand the business intent.** The `business-spec-writer` agent
   reads the issue and extracts intent + business rules. It writes
   *nothing* technical — no endpoints, no DTOs, no file paths, no
   framework or module names.
3. **Classify frontend + check for a design reference.** If the work
   touches a frontend/UI surface (Jira issue type, component, or label
   naming front/frontend/UI/UX; or the description implies screens,
   forms, or visual behavior), check whether the issue already supplies
   one: an attached image/mockup, a link to a design tool (Figma,
   Sketch, Adobe XD, Zeplin, InVision), or explicit written visual/UI
   rules detailed enough to build from without guessing appearance.
   - **Found:** record the reference, `needs_design: false`.
   - **Missing:** set `needs_design: true`. A proposed design (wireframe
     or mockup covering the screens/flows implied by the business rules)
     must be generated and attached to the spec folder before this gate
     can close — on the Claude Code host, via the `design` skill.
   - Not a frontend-classified issue: omit this section, `needs_design`
     does not apply.
4. **Ask when unclear.** If any part of the issue is ambiguous,
   contradictory, or silent on a case that matters, the agent asks the
   human a business-only question before writing the spec. This is the
   **only** human-in-the-loop moment for steps 1–3 of the pipeline — see
   `guides/process/modes.md`'s pacing note below.
5. **Save** to `docs/specs/<CODE>-<slug>/business-spec-<CODE>.md`.

## Sensors

None — this phase has no code to check yet. The **tracker-card-fetcher**
sensor runs implicitly as part of fetching the issue.

## Gate condition

`status: clear` in the business spec's frontmatter: every open question
answered, every business rule independently checkable, and — for a
frontend-classified issue — `needs_design` is not left `true` with no
design artifact attached. **No human approval gate beyond the
clarifying-question exchange in step 4** — once the agent itself has no
open questions and the design reference (if required) exists, the
pipeline proceeds to `test-plan` automatically.

This differs from the generic `spec` phase's approval gate
(`guides/process/spec.md`) by design: SDD-pipeline work is always
Jira-sourced and product-owner-authored at the source, so the gate is
"is the agent's reading of it unambiguous," not "did a human bless a
freeform spec."

## Artifacts

| Kind | Location |
|---|---|
| Business spec | `docs/specs/<CODE>-<slug>/business-spec-<CODE>.md` |
| Proposed design (frontend, only when Jira supplies none) | `docs/specs/<CODE>-<slug>/design-<CODE>.md` (or an image/link, plus the source artifact e.g. a `design` skill canvas) |

## Anti-patterns

- Writing an implementation noun (endpoint, DTO, table, component name)
  into the business spec — that belongs in `tech-spec`.
- Guessing at an ambiguous requirement instead of asking.
- Marking `status: clear` while an open question is still listed.
- Marking a frontend-classified spec `status: clear` with
  `needs_design: true` and no design artifact attached.
- Generating a proposed design when Jira already supplied one, or
  skipping the check entirely because the issue "looks" backend-only
  without actually reading for UI-facing rules.
