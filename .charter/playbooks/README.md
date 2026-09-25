# Playbooks

A **playbook** is a markdown file that runs an ordered set of [commands](commands/README.md). Commands are single units of work; playbooks chain them.

This directory holds **project playbooks**. Policies can also distribute playbooks — they live at `charter/policies/<name>/playbooks/` when vendored.

## Command vs. playbook

- **Command** — one unit of work (one markdown file). Read [`charter/commands/`](commands).
- **Playbook** — orchestrates multiple commands in order. This directory.

Most files in `charter/commands/` are single-purpose (e.g., `spec`, `verify`, `review`). When a playbook says "run spec, then orient, then verify," it follow-links into those command files.

## Invocation

The agent reads its menu file (`CLAUDE.md`, `AGENTS.md`, etc.) on session start. The menu lists every playbook and command with a one-line description and a link. When the user says "run task" (or "run the task playbook"), the agent follows the link and executes.

## Playbooks in this project

| Playbook | File | What it chains |
|---|---|---|
| **task** | [`task.md`](task.md) | spec → orient → implementation → check-drift → verify → review (+ optional learn) |
| **sdd** | [`sdd.md`](sdd.md) | business-spec → test-plan → tech-spec → orient(plan) → implementation → verify+review → release. Jira-sourced feature work — human gate after each of business-spec, test-plan, tech-spec, and plan. |

## Override cascade

For any `<name>.md`, the project's `charter/playbooks/<name>.md` always wins by default. Among policies, policies nested deeper in `keystone.json` refine the outer policies they're nested in. A policy can mark an item `strict` to make it absolute — nothing else can override a strict item, not the project, not any other policy. `keystone verify` reports a violation if any layer attempts to shadow a strict item.

The same cascade applies to **commands** (`charter/commands/`) and **guides** (`charter/guides/`). **Corpus** is background reference loaded on-demand by forward-link from a guide; it doesn't cascade and is never strict-able.
