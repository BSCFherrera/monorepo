---
kind: guide
id: process/planning
description: 'The phase that turns an approved spec into an approved plan, before code is written.'
---
# Planning

The phase that turns an approved spec into an approved plan, before code is written.

## Entry condition

One of:

- An **approved spec** exists in `docs/specs/` with explicit acceptance criteria (generic flow — invoke the **spec** action if not).
- For Jira-sourced SDD work (`playbooks/sdd.md`): `tech-spec-<CODE>.md` exists with `status: complete` in `docs/specs/<CODE>-<slug>/`. If not, return to the **tech-spec** action first.

The spec (or tech spec) carries the task's tracker card reference in its frontmatter. Every artifact written in this phase carries that same reference forward.

## Activities

### 1. Session hygiene

Long sessions drift. Before starting fresh work, check whether the current session is the right home for it.

- **Corrected twice on the same thing** → reset the context (the agent's context-clear action) and re-prompt with the lesson built in. A third correction means the context is fighting you.
- **Direction has changed** (different feature, different intent) → reset the context.
- **Session past ~45 minutes of active work** → compact or summarize, if the agent supports it.
- **Three concurrent worktrees** is a soft ceiling. Beyond that, attention divides faster than parallelism saves time.

If a discovery from this session is worth keeping, write it to a corpus file or `charter/learning/inbox/` *before* clearing.

The specific context-clear / compaction primitives for your agent live in `charter/adapters/<your-agent>/activation.md`.

### 2. Orient

Invoke the **orient** action. It identifies the touched region, lazy-loads matching idioms, surfaces ambient invariants and open `state/` notes for the region. The agent reads what applies before reading anything else.

If a matched idiom mandates a specific runtime version, verify the toolchain is actually installed now, per [`process/toolchain-preflight`](process/toolchain-preflight.md) — not when the first scaffold command fails.

### 3. Frame the work

Pick the right supporting artifact for the task's shape (the spec is already in hand from the spec phase):

| Task shape | Supporting artifact | Saved to |
|---|---|---|
| Proposal needing feedback before commitment | RFC | `docs/rfcs/NNNN-<slug>.md` |
| Decision already taken, needs recording | ADR | `docs/adrs/NNNN-<slug>.md` |
| Security-relevant feature | Threat model | `docs/threats/<feature>.md` |
| Bug | Reproduction + failing test plan | inline in plan |
| Refactor | Catalog of small steps with tests-after-each | inline in plan |
| Performance work | Baseline + hypothesis + measurement plan | inline in plan |

### 4. Worktree setup (when parallelizing)

If the task is parallel work, set up a worktree. Run independent tasks in separate `git worktree`s with separate Claude sessions. Do not interleave two features in one session — cross-talk costs more than the worktree setup.

### 5. Onboarding (when applicable)

If a new contributor is starting, walk them through layout, conventions, and a trivial first change. The first PR's job is to prove the loop works, not to deliver value.

### 6. Write the plan

The plan is a numbered list of steps with verifiable success criteria per step. Strong success criteria let the agent loop independently; weak criteria ("make it work") require constant clarification.

Plan saved to `docs/plans/YYYY-MM-DD-<topic>.md` (generic flow) — or, for SDD work, `docs/specs/<CODE>-<slug>/plan-<CODE>.md`, keeping every artifact for the ticket in one folder. If the plan has 3+ tasks, the implementation phase will dispatch each via the subagent-per-task pattern.

## Sensors

Planning runs read-only sensors:

- **State-region sensor** — reads `state/CODEBASE_STATE.md` to surface what is known about the touched region (idioms loaded, coverage, active migrations).
- **Drift sensor (preview)** — flags discrepancies between corpus claims and codebase for the region. Findings inform the plan; they do not block it.

No verification sensors run here — there is no code yet.

## Gate condition

**Generic flow:** an approved plan exists. "Approved" means the user has read it and either accepted it, edited it, or specified changes that have been folded in. Plans the user has not seen are not approved.

In paired mode this gate is explicit. In solo mode the agent stops at this gate only if the plan has non-trivial consequences and no clear winner. In autopilot mode the agent records the planning decision in the assumption log and proceeds.

**SDD flow (`playbooks/sdd.md`):** an approved plan exists — same acceptance bar as the generic flow. Do not proceed to implementation until the user has explicitly accepted the plan (matching the playbook's own `plan` step, which requires this gate).

## Artifacts

| Kind | Location |
|---|---|
| RFC | `docs/rfcs/NNNN-<slug>.md` |
| ADR | `docs/adrs/NNNN-<slug>.md` |
| Threat model | `docs/threats/<feature>.md` |
| Plan | `docs/plans/YYYY-MM-DD-<topic>.md` (generic) or `docs/specs/<CODE>-<slug>/plan-<CODE>.md` (SDD flow) |

Each artifact carries the spec's tracker card reference forward when one was provided.

## Anti-patterns

- Starting to write code before a plan exists.
- A plan with steps whose success cannot be verified.
- Bringing yesterday's exploration into today's task instead of resetting the context.
- One mega-session that touches five features.
- Producing an ADR for a decision still being debated — use an RFC.
