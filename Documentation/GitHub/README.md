# Land Documentation

This is the master index for the Land code editor's GitHub-facing documentation.
Every document in `Documentation/GitHub/` and all per-Element
`Documentation/GitHub/` directories is catalogued here.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Build System](#build-system)
3. [Workflow Examples](#workflow-examples)
4. [Per-Element Documentation](#per-element-documentation)
5. [Legacy / Pre-existing Deep Dives](#legacy--pre-existing-deep-dives)
6. [Related Documentation](#related-documentation)

---

## System Architecture

Documents covering the overall Land system, its components, and their
interactions.

| Document                                                         | Lines | Topics                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Architecture.md`](Architecture.md)                             | 360+  | Process model, component map, IPC architecture, service layers, data flow patterns                                                                                                                                                                      |
| [`EditorCore.md`](EditorCore.md)                                 | 440+  | Workbench adaptation, Wind service layer (~40 services), Layer stacks, command dispatch, workbench variants                                                                                                                                             |
| [`Polyfills.md`](Polyfills.md)                                   | 480+  | Preload.ts shim, SkyBridge, Cocoon prelude, Output transforms, Worker SW, LandFix diagnostics, telemetry bridge                                                                                                                                         |
| [`RustInfrastructure.md`](RustInfrastructure.md)                 | 640+  | Common traits, Echo scheduler, Mountain internals, Mist DNS, Air daemon, Rest OXC, SideCar, Grove                                                                                                                                                       |
| [`InterComponentProtocol.md`](InterComponentProtocol.md)         | 610+  | Tauri IPC catalog, Vine gRPC proto definitions, Spine protocol, connection lifecycle, health monitoring                                                                                                                                                 |
| [`VSCode-API-Coverage-Matrix.md`](VSCode-API-Coverage-Matrix.md) | 420+  | Authoritative map of every top-level `vscode.*` API surface and its implementation split across Sky, Cocoon, and Mountain; Track A vs Track B strategy; coverage delta 75%→88% weighted (TextEditor 95%, Workspace 96%, SCM 95%, Window 95%)            |
| [`FilesystemFootprint.md`](FilesystemFootprint.md)               | 200+  | Index + ownership domains + bundle-identifier story. Six sub-documents under [`FilesystemFootprint/`](FilesystemFootprint/): `UserDotfile`, `PlatformPaths` (macOS / Linux / Windows), `PerElement`, `EnvironmentVariables`, `Cleanup`, `Encapsulation` |

---

## Build System

Documents covering the build pipeline, environment configuration, and build
profiles.

| Document                                             | Lines | Topics                                                                                                                            |
| ---------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`Building.md`](Building.md)                         | 260+  | Prerequisites, two-stage build process, build profiles, running the application, troubleshooting                                  |
| [`BuildMatrix.md`](BuildMatrix.md)                   | 210+  | Build variant profiles, per-Element build system mapping, environment variable reference                                          |
| [`EnvironmentVariables.md`](EnvironmentVariables.md) | 650+  | Complete env var catalog, multi-file .env system, tier-gating reference                                                           |
| [`BuildPipeline.md`](BuildPipeline.md)               | 530+  | Build stages, env propagation to each Element, profile system, artifact layout, Output transforms, Worker build, SideCar binaries |

---

## Workflow Examples

Detailed end-to-end walkthroughs of specific user interactions and system
operations.

| Document                                                                                                                   | Topics                                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`Workflow/ApplicationStartupAndHandshake.md`](Workflow/ApplicationStartupAndHandshake.md)                                 | Full startup sequence: Mountain -> Cocoon -> Wind -> Sky workbench |
| [`Workflow/OpeningAFileFromTheUI.md`](Workflow/OpeningAFileFromTheUI.md)                                                   | File explorer click to editor rendering                            |
| [`Workflow/InvokingALanguageFeatureHoverProvider.md`](Workflow/InvokingALanguageFeatureHoverProvider.md)                   | Extension hover provider dispatch via gRPC                         |
| [`Workflow/SavingAFileWithSaveParticipants.md`](Workflow/SavingAFileWithSaveParticipants.md)                               | Save interception with extension participants                      |
| [`Workflow/ExecutingACommandFromTheCommandPalette.md`](Workflow/ExecutingACommandFromTheCommandPalette.md)                 | Unified command dispatch (Rust + extension)                        |
| [`Workflow/CreatingAndInteractingWithAWebviewPanel.md`](Workflow/CreatingAndInteractingWithAWebviewPanel.md)               | Extension webview panel lifecycle                                  |
| [`Workflow/CreatingAndInteractingWithAnIntegratedTerminal.md`](Workflow/CreatingAndInteractingWithAnIntegratedTerminal.md) | PTY process management and I/O streaming                           |
| [`Workflow/SourceControlManagementSCM.md`](Workflow/SourceControlManagementSCM.md)                                         | Git extension integration via Mountain                             |
| [`Workflow/UserDataSynchronization.md`](Workflow/UserDataSynchronization.md)                                               | Settings sync with three-way merge                                 |
| [`Workflow/RunningExtensionTests.md`](Workflow/RunningExtensionTests.md)                                                   | Extension Development Host test runner                             |
| [`Workflow/TierGatedImplementationSelection.md`](Workflow/TierGatedImplementationSelection.md)                             | Env propagation across all Element build systems                   |

---

## Per-Element Documentation

Each Land Element has an `Architecture.md` in its own `Documentation/GitHub/`
directory covering internal module structure, data flow, and implementation
details.

### Rust Elements 🦀

| Element      | Role                                                           | Key Dependencies     | Doc                                                                                                               |
| ------------ | -------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Common**   | Abstract core library: traits, ActionEffect, DTOs, CommonError | (none, foundational) | [`Architecture.md`](https://github.com/CodeEditorLand/Common/tree/Current/Documentation/GitHub/Architecture.md)   |
| **Echo**     | Work-stealing task scheduler with priority tiers               | Common               | [`Architecture.md`](https://github.com/CodeEditorLand/Echo/tree/Current/Documentation/GitHub/Architecture.md)     |
| **Mountain** | Primary Tauri backend, gRPC host, sidecar orchestrator         | Common, Echo, Mist   | [`Architecture.md`](https://github.com/CodeEditorLand/Mountain/tree/Current/Documentation/GitHub/Architecture.md) |
| **Air**      | Background daemon: updates, indexing, crypto                   | Common, Mist         | [`Architecture.md`](https://github.com/CodeEditorLand/Air/tree/Current/Documentation/GitHub/Architecture.md)      |
| **Mist**     | Local DNS server for `*.editor.land`                           | Common               | [`Architecture.md`](https://github.com/CodeEditorLand/Mist/tree/Current/Documentation/GitHub/Architecture.md)     |
| **Grove**    | WASM extension host (WASMtime)                                 | Common               | [`Architecture.md`](https://github.com/CodeEditorLand/Grove/tree/Current/Documentation/GitHub/Architecture.md)    |
| **Rest**     | OXC-based TypeScript compiler                                  | Common               | [`Architecture.md`](https://github.com/CodeEditorLand/Rest/tree/Current/Documentation/GitHub/Architecture.md)     |
| **SideCar**  | Vendored Node.js runtime manager                               | Common, Mist         | [`Architecture.md`](https://github.com/CodeEditorLand/SideCar/tree/Current/Documentation/GitHub/Architecture.md)  |

### TypeScript Elements 📜

| Element    | Role                                         | Framework        | Doc                                                                                                             |
| ---------- | -------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| **Cocoon** | Node.js extension host with vscode API shim  | Effect-TS        | [`Architecture.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/Architecture.md) |
| **Wind**   | UI service layer with ~40 Effect-TS services | Effect-TS + Vite | [`Architecture.md`](https://github.com/CodeEditorLand/Wind/tree/Current/Documentation/GitHub/Architecture.md)   |
| **Sky**    | Astro-based UI component layer               | Astro + Vite     | [`Architecture.md`](https://github.com/CodeEditorLand/Sky/tree/Current/Documentation/GitHub/Architecture.md)    |
| **Output** | Build artifact management, dual-compiler     | ESBuild          | [`Architecture.md`](https://github.com/CodeEditorLand/Output/tree/Current/Documentation/GitHub/Architecture.md) |
| **Worker** | Service worker: caching, CSS interceptor     | ESBuild          | [`Architecture.md`](https://github.com/CodeEditorLand/Worker/tree/Current/Documentation/GitHub/Architecture.md) |

### Protocol Layer 🔌

| Element  | Role                      | Format           | Doc                                                                                                           |
| -------- | ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| **Vine** | gRPC protocol definitions | Protocol Buffers | [`Architecture.md`](https://github.com/CodeEditorLand/Vine/tree/Current/Documentation/GitHub/Architecture.md) |

---

## Legacy / Pre-existing Deep Dives

Each Element also contains a `DeepDive.md` in its `Documentation/GitHub/`
directory. These pre-existing documents provide historical technical depth and
may contain implementation notes not yet migrated to `Architecture.md`.

| Element      | DeepDive                                                                                                  | Topics                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Air**      | [`DeepDive.md`](https://github.com/CodeEditorLand/Air/tree/Current/Documentation/GitHub/DeepDive.md)      | Daemon architecture, gRPC server, update lifecycle, downloader           |
| **Cocoon**   | [`DeepDive.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/DeepDive.md)   | Extension host, Effect-TS composition, service providers, gRPC client    |
| **Common**   | [`DeepDive.md`](https://github.com/CodeEditorLand/Common/tree/Current/Documentation/GitHub/DeepDive.md)   | ActionEffect system, Environment DI, trait architecture, service lifting |
| **Echo**     | [`DeepDive.md`](https://github.com/CodeEditorLand/Echo/tree/Current/Documentation/GitHub/DeepDive.md)     | Work-stealing queues, priority scheduling, performance benchmarks        |
| **Grove**    | [`DeepDive.md`](https://github.com/CodeEditorLand/Grove/tree/Current/Documentation/GitHub/DeepDive.md)    | 5-layer architecture, WASMtime sandbox, transport strategies             |
| **Mist**     | [`DeepDive.md`](https://github.com/CodeEditorLand/Mist/tree/Current/Documentation/GitHub/DeepDive.md)     | DNS zone, forward allowlisting, DNSSEC signing                           |
| **Mountain** | [`DeepDive.md`](https://github.com/CodeEditorLand/Mountain/tree/Current/Documentation/GitHub/DeepDive.md) | ApplicationRunTime, AppState, vine gRPC, process management              |
| **Output**   | [`DeepDive.md`](https://github.com/CodeEditorLand/Output/tree/Current/Documentation/GitHub/DeepDive.md)   | ESBuild pipeline, Rest OXC integration, transform configuration          |
| **Rest**     | [`DeepDive.md`](https://github.com/CodeEditorLand/Rest/tree/Current/Documentation/GitHub/DeepDive.md)     | OXC parser/transformer/codegen pipeline, parallel compilation            |
| **SideCar**  | [`DeepDive.md`](https://github.com/CodeEditorLand/SideCar/tree/Current/Documentation/GitHub/DeepDive.md)  | Binary resolution, download system, spawn configuration                  |
| **Sky**      | [`DeepDive.md`](https://github.com/CodeEditorLand/Sky/tree/Current/Documentation/GitHub/DeepDive.md)      | Astro page architecture, workbench variants, SkyBridge                   |
| **Vine**     | [`DeepDive.md`](https://github.com/CodeEditorLand/Vine/tree/Current/Documentation/GitHub/DeepDive.md)     | Proto definitions, gRPC services, code generation                        |
| **Wind**     | [`DeepDive.md`](https://github.com/CodeEditorLand/Wind/tree/Current/Documentation/GitHub/DeepDive.md)     | Effect-TS services, Preload.ts, Tauri integration                        |
| **Worker**   | [`DeepDive.md`](https://github.com/CodeEditorLand/Worker/tree/Current/Documentation/GitHub/DeepDive.md)   | Caching strategies, CSS interceptor, service worker lifecycle            |

### Element-Specific Supplementary Docs 📎

Some Elements contain additional documentation beyond `DeepDive.md` and
`Architecture.md`:

| Element      | File                                                                                                                                      | Topics                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Mountain** | [`NamingConventions.md`](https://github.com/CodeEditorLand/Mountain/tree/Current/Documentation/GitHub/NamingConventions.md)               | PascalCase conventions, provider/ DTO naming          |
| **Echo**     | [`Todo.md`](https://github.com/CodeEditorLand/Echo/tree/Current/Documentation/GitHub/Todo.md)                                             | Community contribution guide, 9 TODOs across 6 levels |
| **Cocoon**   | [`CocoonImplementationPlan.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/CocoonImplementationPlan.md)   | Integration plan and synchronization status           |
| **Cocoon**   | [`RefactoringStrategy.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/RefactoringStrategy.md)             | File split plan, naming conventions                   |
| **Cocoon**   | [`VsCodeValidationChecklist.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/VsCodeValidationChecklist.md) | VS Code API compatibility validation                  |

---

## Related Documentation

- [`Documentation/Module/Telemetry/`](../Module/Telemetry/) - Telemetry system
  docs (Effect-OTel, Sidecars, Tree-Shaking)
- `CHANGELOG.md` - Project changelog
- `CONTRIBUTING.md` - Contribution guidelines
- [`Building.md`](Building.md) - Build instructions and prerequisites
- [Workflow Examples](Workflow.md) - Workflow document index

---

## Coverage Summary

> [!NOTE] VS Code API weighted coverage as of 2026-05-23: **88%** overall.
>
> | Namespace    | Coverage |
> | ------------ | -------- |
> | TextEditor   | 95%      |
> | Workspace    | 96%      |
> | SCM          | 95%      |
> | Window       | 95%      |
> | LSP/Language | 95%      |
>
> Full breakdown in
> [`VSCode-API-Coverage-Matrix.md`](VSCode-API-Coverage-Matrix.md).

---

## 🟠 Low-Level Shim | 🔵 Coverage / Telemetry

> ℹ️ New experimental feature (2026-06-13). Two-tier interception system at the
> JavaScript engine level (orange) and application service level (blue).

| 🟠 Low-Level Shim (`#FF6B35`)                                  | 🔵 Coverage Shim (`#2563EB`)                       |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `TierShim=Own\|Preempt`                                        | `TierShim=Proxy\|Replace`                          |
| Engine prototype monkey-patches                                | ServiceCollection + IPC routing                    |
| Covers 100% of Emitter events                                  | Covers 15 of 22 domains (growing)                  |
| 6 hook layers (ErrorHandler→Timing)                            | 3 intercept strategies (IPC/DI/Audit)              |
| <2% prod overhead (sampled)                                    | <1% overhead (passthrough)                         |
| `Land/…/Shim/Intercept/*.ts`                                   | `Land/…/Wind/Source/Shim/*.ts`                     |
| [Docs: Low-Level Shim](https://editor.land/doc/low-level-shim) | [Docs: Coverage](https://editor.land/doc/coverage) |

> ⚠️ **EXPERIMENTAL** - Gated behind `TierShim` env var (default: `None`). See
> [EnvironmentVariables.md](EnvironmentVariables.md) and
> `.hermes/microsoft/04-Atomic-Task-List.md` (40 tasks, 9 phases).

---

**Project Maintainers:** Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues)
