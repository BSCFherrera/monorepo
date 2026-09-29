# Frontend traceability profile

This repository uses the same traceability controls defined for backend projects.

## Pipelines

- `.azuredevops/build/traceability-pr.yml`
  - Validates Jira key in PR commits and comments PR evidence on Jira issue.
- `.azuredevops/build/traceability-prod-gate.yml`
  - Observes Jira QA and change approval before production (non-blocking by default).

## Required variable group

Use variable group `vg-jira-traceability`:

- `JIRA_BASE_URL`
- `JIRA_USER`
- `JIRA_TOKEN` (secret)
- `JIRA_KEY_REGEX`
- `JIRA_QA_FIELD_ID`
- `JIRA_APPROVAL_FIELD_ID`
- `ENABLE_JIRA_PR_LINK`
- `TRACEABILITY_ENFORCE_GATE` (set `false` for non-blocking mode)

## Conventions

- Branch: `feature/GEN-123-short-description`
- Commit message includes Jira key: `GEN-123`
- PR title includes Jira key.

## Rollout for new frontend projects

1. Copy `.azuredevops/build/traceability-pr.yml`.
2. Copy `.azuredevops/build/traceability-prod-gate.yml`.
3. Copy `.azuredevops/scripts/traceability/`.
4. Add `traceability-pr` as required branch policy.
5. Run `traceability-prod-gate` before production stages in observability mode.

## Dashboard

Use the shared Jira dashboard blueprint from backend docs:

- `jira-dashboard.md`

If you do not have Jira admin permissions, use:

- `implementation-package/README.md`
