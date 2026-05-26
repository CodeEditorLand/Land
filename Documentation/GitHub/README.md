# Land Documentation 📖

This is the master index for the Land code editor's GitHub-facing documentation.
Every document in `Documentation/GitHub/` and all per-Element
`Documentation/GitHub/` directories is catalogued here.

---

## Table of Contents 📑

1. [System Architecture](#system-architecture)
2. [Build System](#build-system)
3. [Workflow Examples](#workflow-examples)
4. [Per-Element Documentation](#per-element-documentation)
5. [Legacy / Pre-existing Deep Dives](#legacy--pre-existing-deep-dives)
6. [Related Documentation](#related-documentation)

---

## System Architecture 🏗️

Documents covering the overall Land system, its components, and their
interactions.

| Document                                                 | Lines | Topics                                                                                                                                                                                             |
| -------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Architecture.md`](Architecture.md)                     | 360+  | Process model, component map, IPC architecture, service layers, data flow patterns                                                                                                                 |
| [`EditorCore.md`](EditorCore.md)                         | 440+  | Workbench adaptation, Wind service layer (~40 services), Layer stacks, command dispatch, workbench variants                                                                                        |
| [`Polyfills.md`](Polyfills.md)                           | 480+  | Preload.ts shim, SkyBridge, Cocoon prelude, Output transforms, Worker SW, LandFix diagnostics, telemetry bridge                                                                                    |
| [`RustInfrastructure.md`](RustInfrastructure.md)         | 640+  | Common traits, Echo scheduler, Mountain internals, Mist DNS, Air daemon, Rest OXC, SideCar, Grove                                                                                                  |
| [`InterComponentProtocol.md`](InterComponentProtocol.md) | 610+  | Tauri IPC catalog, Vine gRPC proto definitions, Spine protocol, connection lifecycle, health monitoring                                                                                            |
| [`FilesystemFootprint.md`](FilesystemFootprint.md)       | 400+  | Every host path the editor reads / writes: `~/.fiddee/`, bundle-identifier Library trees, temp leakage, foreign-tool dirs, write-site index, cleanup recipe, encapsulation + versioning directions |

---

## Build System 🔧

Documents covering the build pipeline, environment configuration, and build
profiles.

| Document                                             | Lines | Topics                                                                                                                            |
| ---------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`Building.md`](Building.md)                         | 260+  | Prerequisites, two-stage build process, build profiles, running the application, troubleshooting                                  |
| [`BuildMatrix.md`](BuildMatrix.md)                   | 210+  | Build variant profiles, per-Element build system mapping, environment variable reference                                          |
| [`EnvironmentVariables.md`](EnvironmentVariables.md) | 650+  | Complete env var catalog, multi-file .env system, tier-gating reference                                                           |
| [`BuildPipeline.md`](BuildPipeline.md)               | 530+  | Build stages, env propagation to each Element, profile system, artifact layout, Output transforms, Worker build, SideCar binaries |

---

## Workflow Examples 🔄

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

## Per-Element Documentation 🗺️

Each Land Element has an `Architecture.md` in its own `Documentation/GitHub/`
directory covering internal module structure, data flow, and implementation
details.

### Rust Elements 🦀

| Element      | Role                                                           | Key Dependencies     | Doc                                                                        |
| ------------ | -------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| **Common**   | Abstract core library: traits, ActionEffect, DTOs, CommonError | (none, foundational) | [`Architecture.md`](Element/Common/Documentation/GitHub/Architecture.md)   |
| **Echo**     | Work-stealing task scheduler with priority tiers               | Common               | [`Architecture.md`](Element/Echo/Documentation/GitHub/Architecture.md)     |
| **Mountain** | Primary Tauri backend, gRPC host, sidecar orchestrator         | Common, Echo, Mist   | [`Architecture.md`](Element/Mountain/Documentation/GitHub/Architecture.md) |
| **Air**      | Background daemon: updates, indexing, crypto                   | Common, Mist         | [`Architecture.md`](Element/Air/Documentation/GitHub/Architecture.md)      |
| **Mist**     | Local DNS server for `*.land.playform.cloud`                   | Common               | [`Architecture.md`](Element/Mist/Documentation/GitHub/Architecture.md)     |
| **Grove**    | WASM extension host (WASMtime)                                 | Common               | [`Architecture.md`](Element/Grove/Documentation/GitHub/Architecture.md)    |
| **Rest**     | OXC-based TypeScript compiler                                  | Common               | [`Architecture.md`](Element/Rest/Documentation/GitHub/Architecture.md)     |
| **SideCar**  | Vendored Node.js runtime manager                               | Common, Mist         | [`Architecture.md`](Element/SideCar/Documentation/GitHub/Architecture.md)  |

### TypeScript Elements 📜

| Element    | Role                                         | Framework        | Doc                                                                      |
| ---------- | -------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| **Cocoon** | Node.js extension host with vscode API shim  | Effect-TS        | [`Architecture.md`](Element/Cocoon/Documentation/GitHub/Architecture.md) |
| **Wind**   | UI service layer with ~40 Effect-TS services | Effect-TS + Vite | [`Architecture.md`](Element/Wind/Documentation/GitHub/Architecture.md)   |
| **Sky**    | Astro-based UI component layer               | Astro + Vite     | [`Architecture.md`](Element/Sky/Documentation/GitHub/Architecture.md)    |
| **Output** | Build artifact management, dual-compiler     | ESBuild          | [`Architecture.md`](Element/Output/Documentation/GitHub/Architecture.md) |
| **Worker** | Service worker: caching, CSS interceptor     | ESBuild          | [`Architecture.md`](Element/Worker/Documentation/GitHub/Architecture.md) |

### Protocol Layer 🔌

| Element  | Role                      | Format           | Doc                                                                    |
| -------- | ------------------------- | ---------------- | ---------------------------------------------------------------------- |
| **Vine** | gRPC protocol definitions | Protocol Buffers | [`Architecture.md`](Element/Vine/Documentation/GitHub/Architecture.md) |

---

## Legacy / Pre-existing Deep Dives 🔬

Each Element also contains a `DeepDive.md` in its `Documentation/GitHub/`
directory. These pre-existing documents provide historical technical depth and
may contain implementation notes not yet migrated to `Architecture.md`.

| Element      | DeepDive                                                           | Topics                                                                   |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **Air**      | [`DeepDive.md`](Element/Air/Documentation/GitHub/DeepDive.md)      | Daemon architecture, gRPC server, update lifecycle, downloader           |
| **Cocoon**   | [`DeepDive.md`](Element/Cocoon/Documentation/GitHub/DeepDive.md)   | Extension host, Effect-TS composition, service providers, gRPC client    |
| **Common**   | [`DeepDive.md`](Element/Common/Documentation/GitHub/DeepDive.md)   | ActionEffect system, Environment DI, trait architecture, service lifting |
| **Echo**     | [`DeepDive.md`](Element/Echo/Documentation/GitHub/DeepDive.md)     | Work-stealing queues, priority scheduling, performance benchmarks        |
| **Grove**    | [`DeepDive.md`](Element/Grove/Documentation/GitHub/DeepDive.md)    | 5-layer architecture, WASMtime sandbox, transport strategies             |
| **Mist**     | [`DeepDive.md`](Element/Mist/Documentation/GitHub/DeepDive.md)     | DNS zone, forward allowlisting, DNSSEC signing                           |
| **Mountain** | [`DeepDive.md`](Element/Mountain/Documentation/GitHub/DeepDive.md) | ApplicationRunTime, AppState, vine gRPC, process management              |
| **Output**   | [`DeepDive.md`](Element/Output/Documentation/GitHub/DeepDive.md)   | ESBuild pipeline, Rest OXC integration, transform configuration          |
| **Rest**     | [`DeepDive.md`](Element/Rest/Documentation/GitHub/DeepDive.md)     | OXC parser/transformer/codegen pipeline, parallel compilation            |
| **SideCar**  | [`DeepDive.md`](Element/SideCar/Documentation/GitHub/DeepDive.md)  | Binary resolution, download system, spawn configuration                  |
| **Sky**      | [`DeepDive.md`](Element/Sky/Documentation/GitHub/DeepDive.md)      | Astro page architecture, workbench variants, SkyBridge                   |
| **Vine**     | [`DeepDive.md`](Element/Vine/Documentation/GitHub/DeepDive.md)     | Proto definitions, gRPC services, code generation                        |
| **Wind**     | [`DeepDive.md`](Element/Wind/Documentation/GitHub/DeepDive.md)     | Effect-TS services, Preload.ts, Tauri integration                        |
| **Worker**   | [`DeepDive.md`](Element/Worker/Documentation/GitHub/DeepDive.md)   | Caching strategies, CSS interceptor, service worker lifecycle            |

### Element-Specific Supplementary Docs 📎

Some Elements contain additional documentation beyond `DeepDive.md` and
`Architecture.md`:

| Element      | File                                                                                               | Topics                                                |
| ------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Mountain** | [`NamingConventions.md`](Element/Mountain/Documentation/GitHub/NamingConventions.md)               | PascalCase conventions, provider/ DTO naming          |
| **Wind**     | [`VscodeIntegration.md`](Element/Wind/Documentation/GitHub/VscodeIntegration.md)                   | Native VS Code workbench inside Tauri via Wind        |
| **Echo**     | [`Todo.md`](Element/Echo/Documentation/GitHub/Todo.md)                                             | Community contribution guide, 9 TODOs across 6 levels |
| **Cocoon**   | [`CocoonImplementationPlan.md`](Element/Cocoon/Documentation/GitHub/CocoonImplementationPlan.md)   | Integration plan and synchronization status           |
| **Cocoon**   | [`RefactoringStrategy.md`](Element/Cocoon/Documentation/GitHub/RefactoringStrategy.md)             | File split plan, naming conventions                   |
| **Cocoon**   | [`VsCodeValidationChecklist.md`](Element/Cocoon/Documentation/GitHub/VsCodeValidationChecklist.md) | VS Code API compatibility validation                  |

---

## Related Documentation 📚

- [`Documentation/Module/Telemetry/`](../Module/Telemetry/) - Telemetry system
  docs (Effect-OTel, Sidecars, Tree-Shaking)
- `CHANGELOG.md` - Project changelog
- `CONTRIBUTING.md` - Contribution guidelines
- [`Building.md`](Building.md) - Build instructions and prerequisites
- [Workflow Examples](Workflow.md) - Workflow document index

---

**Project Maintainers:** Source Open
([Source/Open@Land.PlayForm.Cloud](mailto:Source/Open@Land.PlayForm.Cloud)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues)
