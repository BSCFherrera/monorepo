<!-- keystone:start -->
@CHARTER.md

You **must** read [`CHARTER.md`](CHARTER.md) before doing anything in this repo — it carries the iron laws and the ambient rules that govern the charter. The import above loads it; do not proceed without it.

## On this host — Claude Code

- **Subagents** — spawn charter agents (`.charter/agents/`) as subagents via the Task tool for review/scout work.
- **Slash commands** — charter commands and playbooks surface as `/keystone-<id>`.
- **Skills** — auto-activate by their `triggers:`.
- **Hooks** — charter hooks fire automatically on Claude Code lifecycle events.
<!-- keystone:end -->

## Project-specific overrides to CHARTER.md's iron laws

`CHARTER.md` is regenerated verbatim from keystone's own embedded stock
template every time `keystone project` runs — any hand-edit to it is
silently discarded (confirmed reproducible; see
`.charter/corpus/state/charter-debt.md`, `HDEBT-002`). **Never hand-edit
`CHARTER.md`.** It always reflects keystone's generic baseline, not this
project's actual rules.

This project's custom iron laws — the ones that override or add to the
stock baseline — live in the ambient guides under `.charter/guides/`
instead, which `project`/`index`/`lint` never touch and which are always
loaded per `CHARTER.md`'s own "guide → ambient" activation rule. Read
`CHARTER.md`'s Iron laws section as the generic floor, then also check
these project-specific overrides before treating CHARTER.md's list as
complete:

- **AI provenance, never laundered** — `.charter/guides/process/release.md`'s
  IRON LAW supersedes `CHARTER.md`'s stock "No AI attribution" line.
  Agent-produced commits carry an `AI-Generated-By: <tool>/<model>`
  trailer (never `Co-Authored-By:`); omitting it on an agent-produced
  commit is the violation now, not the other way around.

When adding a new project-wide iron law that must survive
`keystone project`, add it to an ambient guide (no `globs:`) under
`.charter/guides/process/`, not to `CHARTER.md`.
