# Jira dashboard blueprint for frontend traceability

Use this dashboard to monitor story execution and state progression for frontend deliveries.

## Required fields

- `Trace Code`
- `Trace QA`
- `Trace Approval`
- `Trace Prod`
- `Team`
- `Service`

## Suggested JQL

### Current sprint stories

project = GEN AND issuetype in (Story, "Historia de Usuario") AND sprint in openSprints() AND "Service" = FrontEnd

### Complete traceability

project = GEN
AND issuetype in (Story, "Historia de Usuario")
AND "Service" = FrontEnd
AND "Trace Code" = true
AND "Trace QA" in (true, "Pass", "Passed", "Aprobado")
AND "Trace Approval" in (true, "Approved", "Aprobado")
AND "Trace Prod" = true

### Incomplete traceability

project = GEN
AND issuetype in (Story, "Historia de Usuario")
AND "Service" = FrontEnd
AND (
  "Trace Code" != true
  OR "Trace QA" not in (true, "Pass", "Passed", "Aprobado")
  OR "Trace Approval" not in (true, "Approved", "Aprobado")
)

## Widgets

1. Filter Results: current sprint stories
2. Pie Chart by Status
3. Two Dimensional Stats: Team vs Status
4. Filter Results: incomplete traceability
5. Created vs Resolved chart

## KPI

Coverage = (stories with complete traceability / total sprint stories) * 100

Target:

- Minimum 80%
