---
kind: sensor
mode: inferential
returns: review-findings
id: spec-adherence
description: 'Walks the spec''s acceptance criteria against the current diff.'
---
# Sensor: spec-adherence

Walks the spec's acceptance criteria against the current diff.

- **Trigger** — **review** (review phase).
- **Inputs** — the spec (`docs/specs/<file>.md`), or for SDD-pipeline work all three documents in `docs/specs/<CODE>-<slug>/` (business spec, test plan, tech spec), and the diff.
- **Exit condition** — every criterion (generic flow) or every business rule / Gherkin scenario / EARS case (SDD flow) is met *with evidence* (a test, an output, a manual check).
- **Output** — per-criterion pass/fail with evidence link. A criterion missing evidence fails.
- **State writes** — none.
