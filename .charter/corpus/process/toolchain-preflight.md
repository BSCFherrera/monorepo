---
kind: corpus
id: corpus/process/toolchain-preflight
description: Why a mandated runtime version (.NET 10, react-native@0.87.x) must be checked as an installed toolchain, not just a manifest pin, before implementation starts.
---

# Toolchain preflight — reasoning

An iron law that mandates a specific runtime version is a claim about what must be *installed*, not just what must appear in a `.csproj`/`package.json`. On one project, `.NET 10` wasn't installed (only 8.0.408 and 9.0.202 were) — caught only when the first `dotnet new webapi` scaffold needed it. Separately, building a React Native 0.87 Android project needed JDK 17-21 specifically; the only JDK installed was 24, which Gradle 8.13/9.4.1's Groovy compiler can't load ("Unsupported class file major version"). Both gaps surfaced mid-implementation, each costing a stop to install the missing toolchain (sometimes needing the user's own `sudo` for a `brew install --cask`, since the agent can't supply an interactive password) before work could resume.

Discovering a missing SDK or an incompatible JDK mid-scaffold turns a single planning-phase check into a multi-step, user-blocking detour in the middle of implementation. For React Native specifically, the JDK requirement isn't even the RN version's own constraint — it's transitive, via Gradle's own Java-version ceiling — so it's easy to miss even when the RN version itself was checked and pinned correctly.

## Anti-patterns

- Verifying a manifest's pinned version (`net10.0` in a `.csproj`, `react-native@0.87.x` in `package.json`) without checking the corresponding SDK/toolchain is actually installed on the machine doing the work.
- Discovering a missing or incompatible toolchain only when the first scaffold/build command fails, instead of during planning/orient.
- Checking a mobile app's RN version without checking the JDK version Gradle will resolve for it.

## References

- .NET SDK list: `dotnet --list-sdks`
- Gradle/JDK compatibility matrix: https://docs.gradle.org/current/userguide/compatibility.html

Back to the rules: [`guides/process/toolchain-preflight.md`](guides/process/toolchain-preflight.md).
