---
kind: skill
id: jira-spec-gate
description: Gate feature/user-story/spec work behind a Jira issue code, fetched live via the Atlassian MCP server — never hand-typed or guessed.
triggers:
  - implement a feature
  - implement this feature
  - new feature
  - new user story
  - implement a user story
  - implement the spec
  - work on this ticket
  - start this story
  - build this feature
---

# jira-spec-gate — require a Jira code, read the spec via MCP

This project wires Jira in as an MCP server (`.mcp.json` → `atlassian`),
not a copy-pasted description. When a developer asks the agent to
implement a feature, user story, or spec, the agent's own understanding
of "what to build" must come from the live Jira issue — not from the
request's prose alone.

## Run

1. **Check for an issue code.** Look for a Jira key in the user's
   message (pattern `[A-Z][A-Z0-9]+-[0-9]+`, e.g. `PROJ-123`). If none
   is present, **stop and ask for it** before doing anything else —
   do not start planning or writing code from prose alone.
2. **Confirm the MCP connection is live.** If Atlassian MCP tools
   (e.g. `getJiraIssue`, `searchJiraIssuesUsingJql`) are not yet
   loaded/authenticated in this session, check for the manual-mode
   snapshot (step 3b) before asking anything. Only if there is no
   snapshot, tell the user to run `/mcp` and authenticate against the
   `atlassian` server declared in `.mcp.json`, then retry.
3. **Fetch the issue.**
   a. **Via MCP (default).** Call the Atlassian MCP server's
      `getJiraIssue` tool with the confirmed issue code.
   b. **Manual mode (no Claude Code / no MCP).** When the MCP is not
      available in this agent (e.g. GitHub Copilot, or the framework ran
      with `-Agent manual`), use the snapshot the framework downloaded
      from the Jira REST API at
      `docs/framework/memory/jira-issues/<CODE>.md`. It counts as a live
      fetch: it was downloaded from Jira by `download-jira-task.ps1`, not
      typed by a person. Use it only if its `Jira ID` matches the
      confirmed code. If it is missing, tell the user to download it
      with `npm run framework:jira:download -- -JiraId <CODE> -Source rest`
      (Jira variables configured via `npm run framework:jira:configure`)
      and retry.

   Either way, do not ask the user to paste the description by hand, and
   do not fabricate fields that the source didn't return.
4. **Hand off to the SDD pipeline.** Feed the fetched issue into the
   **business-spec** command (`.charter/commands/business-spec.md`),
   step 1 of the `sdd` playbook (`.charter/playbooks/sdd.md`) — not the
   generic **spec** command. The `business-spec-writer` agent asks
   business-only clarifying questions itself if the issue is ambiguous;
   it does not need pre-existing acceptance criteria on the Jira issue
   the way the generic spec flow does — the pipeline's own
   `test-plan` step is where testable coverage gets built, as Gherkin
   scenarios traced to business rules.
5. **Never proceed past this gate silently.** If the issue can't be
   fetched (404, permission denied, MCP not connected and no matching
   snapshot), report the exact failure and stop — do not fall back to
   guessing the spec from the chat request.

## When to trigger

- Any request to implement a feature, user story, or spec that does
  not already carry a confirmed, MCP-fetched Jira issue in the
  current conversation.
- Re-fires if the user names a *different* Jira code mid-conversation
  than the one already fetched.

## Does not trigger

- Bug fixes, refactors, chores, or any work item the user explicitly
  says has no tracker card — the **spec** command's "no tracker card"
  path (author inline) still applies there.
- Once the current task's Jira issue has already been fetched via MCP
  in this session — don't re-fetch on every follow-up message.
