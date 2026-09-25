# PowerShell — this package's stack

Automation scripts under `scripts/**/*.ps1` implement the framework's
Jira ↔ OpenSpec ↔ Git lifecycle (create-change, opsx-propose/apply,
memory sync, publish, validation). No test runner or linter is wired
for this stack; correctness is exercised by running the `framework:*`
npm scripts end to end.
