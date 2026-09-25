---
description: Step 3 of the SDD pipeline — the architect writes the technical spec from the business spec and test plan.
argument-hint: <jira_code>
---

# /tech-spec

**Write the technical spec.** Third step of the SDD pipeline (see
[`playbooks/sdd.md`](playbooks/sdd.md)). Read
[`guides/process/tech-spec.md`](guides/process/tech-spec.md) for the
full discipline.

## Activities

1. **Read `business-spec-<CODE>.md` and `test-plan-<CODE>.md`** from the
   spec folder. **Hard stop** — if either is missing or not in a
   terminal status (`clear` / `complete`), stop and warn the user by
   name of the missing/incomplete file. Do not proceed on a partial
   input.
2. **Invoke `orient`** to load the touched region's idioms (hexagonal
   architecture, Nx structure, any stack-specific idioms) before drafting.
3. **Dispatch the `architect` agent.** It produces concrete changes plus
   EARS-format technical test cases, each tracing to a Gherkin scenario
   from the test plan.
4. **Save** `tech-spec-<CODE>.md` inside the spec folder.

## Gate

None — no human approval step. Proceeds to planning once
`status: complete`. The agent asks the human only when an architectural
choice is genuinely ambiguous and the codebase's existing conventions
don't resolve it.

## Iron law

**No technical spec without a complete business spec and test plan.**
