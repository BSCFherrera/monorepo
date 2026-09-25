---
captured: 2026-09-04
source: implementation surprise — ISP-2 backend (.NET 10) and mobile (RN 0.87/Gradle/AGP) toolchain setup
proposed-layer: guides/process
---

## What happened

The charter mandates `.NET 10` for backends and `react-native@0.87.x` for
mobile apps, but neither was checked before implementation started.
`.NET 10 SDK` wasn't installed (only 8.0.408 and 9.0.202 were) — caught
only when the first `dotnet new webapi` scaffold needed it. Separately,
building the RN 0.87 Android project needed JDK 17-21 specifically (the
only JDK installed was 24, which Gradle 8.13/9.4.1's Groovy compiler
can't load — "Unsupported class file major version"). Both gaps were
discovered mid-implementation, each costing a stop to install the
missing toolchain (with a `brew install --cask` needing the user's own
sudo, since the agent can't supply an interactive password) before work
could resume.

## Why it matters

An iron law that mandates a specific runtime version (`.NET 10`,
`react-native@0.87.x`) is a claim about what must be *installed*, not
just what must appear in a `.csproj`/`package.json`. Discovering a
missing SDK or an incompatible JDK mid-scaffold turns a single planning-phase
check into a multi-step, user-blocking detour in the middle of
implementation — and for RN specifically, the JDK requirement isn't
even the RN version's own constraint, it's a transitive one (Gradle's
own Java-version ceiling), so it's easy to miss even when the RN version
itself was checked.

## Proposed change

Add to the planning/orient step (or a bootstrap pre-flight): when a task
touches a stack idiom that mandates a specific runtime version (a .NET
TFM, a React Native minor, etc.), verify the required SDK/toolchain is
actually installed (`dotnet --list-sdks`, the RN toolchain's own Gradle/JDK
compatibility for the pinned version) *before* implementation begins,
not when the first scaffold command fails. For React Native specifically,
also check the JDK version Gradle will use is within the range the
project's Gradle/AGP versions support (JDK 17-21 for Gradle 8.x/9.x as of
this writing) — this is a hidden transitive requirement, not something
`react-native --version` or `node -v` surfaces.
