---
kind: command
id: business-spec
description: 'Step 1 of the SDD pipeline — read the Jira issue via MCP and write the business-only spec.'
args:
  - name: jira_code
    type: string
    required: true
    description: The Jira issue code (e.g. PROJ-123) this spec is for.
---

# /business-spec

**Read the Jira issue and write the business spec.** First step of the
SDD pipeline (see [`playbooks/sdd.md`](playbooks/sdd.md)). Read
[`guides/process/business-spec.md`](guides/process/business-spec.md)
for the full discipline.

## Activities

1. **Confirm the Jira code.** The **jira-spec-gate** skill requires a
   confirmed issue code before this proceeds — see
   [`skills/jira-spec-gate/SKILL.md`](skills/jira-spec-gate/SKILL.md).
2. **Fetch the issue via the Atlassian MCP server** (`getJiraIssue`).
   In manual mode (no MCP in this agent), read instead the snapshot the
   framework downloaded from the Jira REST API,
   `docs/framework/memory/jira-issues/<CODE>.md` — see step 3b of the
   **jira-spec-gate** skill. Never hand-transcribe a pasted description
   when the code is available to fetch live.
3. **Determine the spec folder.** `docs/specs/<CODE>-<slug>/`, where
   `<slug>` is the Jira issue's own summary, lowercased, non-alphanumeric
   runs collapsed to a single hyphen, trimmed. Create it if absent.
4. **Dispatch the `business-spec-writer` agent** with the fetched issue.
   It reads for business intent only — no technical detail — and asks
   business-only clarifying questions when the issue is ambiguous.
5. **Save** `business-spec-<CODE>.md` inside the spec folder.

## Gate

None — no human approval step. The only human-in-the-loop moment is the
agent's own clarifying questions in step 4, when the issue is unclear.
Once `status: clear`, the pipeline proceeds to `/test-plan` on its own.

## Iron law

**Never assume.** An agent that guesses at business intent instead of
asking has failed this step, even if the guess turns out right.
