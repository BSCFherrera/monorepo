---
kind: guide
id: process/toolchain-preflight
description: Before implementation starts on a task touching a stack idiom that mandates a specific runtime version, verify the required SDK/toolchain is actually installed.
corpus:
  - corpus/process/toolchain-preflight
---
# Toolchain preflight — rules

The rules from [`corpus/process/toolchain-preflight.md`](corpus/process/toolchain-preflight.md).

## RULES

- When a task touches a stack idiom that mandates a specific runtime version (a .NET TFM, a React Native minor, etc.), verify the required SDK/toolchain is actually installed (`dotnet --list-sdks`, the RN toolchain's own Gradle/JDK compatibility for the pinned version) *before* implementation begins, as part of the planning/orient step — not when the first scaffold command fails.
- For React Native specifically, also check the JDK version Gradle will use is within the range the project's Gradle/AGP versions support (JDK 17-21 for Gradle 8.x/9.x as of this writing) — this is a hidden transitive requirement, not something `react-native --version` or `node -v` surfaces.

For reasoning, see [`corpus/process/toolchain-preflight.md`](corpus/process/toolchain-preflight.md).
