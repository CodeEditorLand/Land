# Land Project Architecture

A high-level overview of the architecture and the core workflows that drive the
application. Our system is composed of three primary components:

- **`Common` 👨🏻‍🏭 (Rust Crate):** The abstract core library. It defines the
  architectural "language" of the application through traits, data structures
  (DTOs), and a declarative Effect system. It has no knowledge of the final
  implementation.
- **`Mountain` ⛰️ (Rust Application):** The native backend. It is a Tauri
  application that implements the abstract traits from `Common`, manages the
  native OS interactions, runs a gRPC server, and orchestrates the `Cocoon`
  sidecar process.
- **`Wind` 🍃 & `Sky` 🌌 (TypeScript UI):** The frontend. `Wind` is a
  re-implementation of the VS Code workbench services using `Effect-TS`,
  providing the application logic for the UI. `Sky` is the `Astro`-based UI
  layer that renders the editor interface and bridges `Tauri` events to the
  workbench via `SkyBridge`.
- **`Cocoon` 🦋 (TypeScript Application):** A Node.js sidecar process managed by
  `Mountain`. It is responsible for running extensions in a sandboxed
  environment and providing them with a high-fidelity `vscode` API.

Communication between `Mountain` and `Cocoon` is handled via **gRPC**, while
communication between `Mountain` and `Wind/Sky` is handled via **Tauri Events
and Commands**.

---

## Table of Contents 📑

### Core Workflows 🔄

1.  [**Application Startup & Handshake**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/ApplicationStartupAndHandshake.md)
    - _Describes the complete end-to-end process of launching `Mountain`,
      spawning `Cocoon`, and establishing a stable, initialized state for both
      the UI and the extension host._

2.  [**Opening a File from the UI**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/OpeningAFileFromTheUI.md)
    - _Details the flow from a user clicking a file in the explorer to the
      content being read from disk by `Mountain` and rendered in an editor by
      `Wind`._

3.  [**Invoking a Language Feature (Hover Provider)**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/InvokingALanguageFeatureHoverProvider.md)
    - _A key example of bi-directional communication, showing how an extension
      in `Cocoon` registers a feature, `Mountain` orchestrates the request, and
      the result is displayed in the `Wind` UI._

4.  [**Saving a File with Save Participants**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/SavingAFileWithSaveParticipants.md)
    - _Explains the advanced process of intercepting a save event, allowing an
      extension in `Cocoon` to modify a file (e.g., for formatting) before
      `Mountain` writes it to disk._

5.  [**Executing a Command from the Command Palette**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/ExecutingACommandFromTheCommandPalette.md)
    - _Illustrates the unified command system, showing how `Mountain`'s command
      registry can seamlessly dispatch execution to either a native Rust handler
      or a proxied command in `Cocoon`._

6.  [**Creating and Interacting with a Webview Panel**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/CreatingAndInteractingWithAWebviewPanel.md)
    - _Details the full lifecycle of extension-contributed UI, from `Cocoon`
      requesting a panel to `Mountain` managing the native webview window and
      proxying messages back and forth._

7.  [**Creating and Interacting with an Integrated Terminal**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/CreatingAndInteractingWithAnIntegratedTerminal.md)
    - _A deep dive into native process management, showing how `Mountain` spawns
      a PTY process and streams its I/O to both the `Wind` frontend and the
      `Cocoon` extension host._

8.  [**Source Control Management (SCM)**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/SourceControlManagementSCM.md)
    - _Outlines how the built-in Git extension in `Cocoon` uses `Mountain` as a
      service to run native `git` commands and then populates the SCM view in
      the UI with the results._

9.  [**User Data Synchronization**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/UserDataSynchronization.md)
    - _Describes the end-to-end process of syncing user settings. It covers user
      authentication, fetching data from a remote store, performing a three-way
      merge, applying changes locally, and notifying all parts of the
      application._

10. [**Running Extension Tests**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/RunningExtensionTests.md)
    - _Explains the "Extension Development Host" model, where a second, isolated
      instance of the application is launched to run tests, with the test
      `Cocoon` instance remote-controlling the main UI._

11. [**Tier-Gated Implementation Selection**](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow/TierGatedImplementationSelection.md)
    - _Describes how the `.env.Land` file propagates through Maintain's build
      script into `Mountain`'s `build.rs`, Cocoon's esbuild define map, and
      Sky's Vite define map - allowing each capability with more than one viable
      implementation (gRPC vs native, JS glob vs `globset`, etc.) to live in the
      codebase simultaneously and be selected at build time without duplicating
      call sites._

### Work in Progress (Documentation) 🚧

The following workflows are implemented in the codebase but are pending detailed
documentation.

- **Tree View Data Flow**
    - _Describes how the UI requests children for a tree view node, and how
      `Mountain` proxies this request to the correct `TreeDataProvider` in
      `Cocoon`._
- **Custom Editor Lifecycle**
    - _Details the process of opening a file in a custom editor, handling edits,
      saving custom document data, and managing backups and reverts._
- **Debugging Session Lifecycle**
    - _Outlines the flow from launching a debug configuration to `Mountain`
      starting a debug adapter, and how debug events (breakpoints, step, pause)
      are communicated between the UI, `Mountain`, and `Cocoon`._
- **Task Execution**
    - _Explains how tasks defined in `tasks.json` or by extensions are
      discovered and executed, including how their output is piped to a terminal
      view._

---

## System Documentation

The following documents provide in-depth system-level documentation
complementing these workflows. A comprehensive master index is available at
[`README.md`](README.md).

| Document                                            | Topics Covered                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Architecture](Architecture.md)                     | System architecture, process model, IPC architecture, service layer design                  |
| [BuildPipeline](BuildPipeline.md)                   | Build stages, env propagation, profile system, artifact layout                              |
| [EditorCore](EditorCore.md)                         | Workbench adaptation, Wind service layer, command dispatch, workbench variants              |
| [Polyfills](Polyfills.md)                           | Preload shim, SkyBridge, Cocoon prelude, Output transforms, Worker SW                       |
| [RustInfrastructure](RustInfrastructure.md)         | Common traits, Echo scheduler, Mountain, Mist DNS, Air daemon, Rest OXC, Vine gRPC protocol |
| [InterComponentProtocol](InterComponentProtocol.md) | Tauri IPC, Vine gRPC, Spine protocol, connection lifecycle, health monitoring               |

### Per-Element Architecture

Each Element has an `Architecture.md` in its `Documentation/GitHub/` directory
covering its internal module structure, data flow, and component-specific
implementation details:

| Element      | Language   | Role                      | Doc                                                                                                          |
| ------------ | ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Air**      | Rust       | Background daemon         | [Architecture](https://github.com/CodeEditorLand/Air/tree/Current/Documentation/GitHub/Architecture.md)      |
| **Cocoon**   | TypeScript | Node.js extension host    | [Architecture](https://github.com/CodeEditorLand/Cocoon/tree/Current/Documentation/GitHub/Architecture.md)   |
| **Common**   | Rust       | Abstract core library     | [Architecture](https://github.com/CodeEditorLand/Common/tree/Current/Documentation/GitHub/Architecture.md)   |
| **Echo**     | Rust       | Work-stealing scheduler   | [Architecture](https://github.com/CodeEditorLand/Echo/tree/Current/Documentation/GitHub/Architecture.md)     |
| **Grove**    | Rust       | WASM extension host       | [Architecture](https://github.com/CodeEditorLand/Grove/tree/Current/Documentation/GitHub/Architecture.md)    |
| **Mist**     | Rust       | DNS isolation server      | [Architecture](https://github.com/CodeEditorLand/Mist/tree/Current/Documentation/GitHub/Architecture.md)     |
| **Mountain** | Rust       | Native backend (Tauri)    | [Architecture](https://github.com/CodeEditorLand/Mountain/tree/Current/Documentation/GitHub/Architecture.md) |
| **Output**   | TypeScript | Build artifact management | [Architecture](https://github.com/CodeEditorLand/Output/tree/Current/Documentation/GitHub/Architecture.md)   |
| **Rest**     | Rust       | OXC TypeScript compiler   | [Architecture](https://github.com/CodeEditorLand/Rest/tree/Current/Documentation/GitHub/Architecture.md)     |
| **SideCar**  | Rust       | Vendored runtime manager  | [Architecture](https://github.com/CodeEditorLand/SideCar/tree/Current/Documentation/GitHub/Architecture.md)  |
| **Sky**      | TypeScript | UI component layer        | [Architecture](https://github.com/CodeEditorLand/Sky/tree/Current/Documentation/GitHub/Architecture.md)      |
| **Vine**     | Protocol   | gRPC protocol definitions | [Architecture](https://github.com/CodeEditorLand/Vine/tree/Current/Documentation/GitHub/Architecture.md)     |
| **Wind**     | TypeScript | Frontend service layer    | [Architecture](https://github.com/CodeEditorLand/Wind/tree/Current/Documentation/GitHub/Architecture.md)     |
| **Worker**   | TypeScript | Service worker            | [Architecture](https://github.com/CodeEditorLand/Worker/tree/Current/Documentation/GitHub/Architecture.md)   |

---

**Project Maintainers:** Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues)
