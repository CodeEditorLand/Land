# Editor Core: Workbench Adaptation

How **Land** adapts the VS Code workbench to run inside a `Tauri` WebView. It
covers the `Wind` service layer architecture, workbench variant system, command
dispatch, and the VS Code API coverage split across `Mountain`, `Cocoon`, and
`Sky`/`Wind`.

---

## Table of Contents

1. [Workbench Architecture](#workbench-architecture)
2. [Wind Service Layer](#wind-service-layer)
3. [Service Composition and Layer Stacks](#service-composition-and-layer-stacks)
4. [Workbench Variants](#workbench-variants)
5. [Command Dispatch System](#command-dispatch-system)
6. [Editor Service Architecture](#editor-service-architecture)
7. [VS Code API Coverage Strategy](#vs-code-api-coverage-strategy)
8. [Related Documentation](#related-documentation)

---

## Workbench Architecture&#x2001;🏗️

The VS Code workbench is the core UI framework that renders the editor
interface. In VS Code's Electron architecture, the workbench runs in the
renderer process and communicates with the main process via Electron IPC.
**Land** replaces this IPC layer with `Tauri` commands and events while keeping
the workbench UI code substantially unchanged.

### Architecture Comparison

| Aspect            | VS Code (Electron)           | Land (Tauri)                       |
| ----------------- | ---------------------------- | ---------------------------------- |
| Main process      | Electron Main                | `Mountain` (`Rust`)                |
| Renderer process  | Electron Renderer            | `Tauri` WebView                    |
| IPC mechanism     | Electron ipcRenderer/ipcMain | `Tauri` invoke/event               |
| Preload           | electron preload.js          | `Wind` `Preload.ts`                |
| Extension host    | Child Node process           | `Cocoon` (Node sidecar via `gRPC`) |
| File system       | Node.js fs module            | `Mountain` native `Rust` fs        |
| Native dialogs    | Electron dialog API          | `Tauri` dialog plugin              |
| Window management | Electron BrowserWindow       | `Tauri` Window                     |

### Workbench Loading Sequence

```mermaid
sequenceDiagram
    participant WebView as Tauri WebView
    participant Preload as Preload.ts
    participant Bundle as Workbench Bundle
    participant Wind as Wind AppLayer
    participant Runtime as Effect-TS Runtime
    participant Workbench as VS Code Workbench

    WebView->>Preload: Load index.html (Astro page)
    Preload->>Preload: Execute synchronously
    Preload-->>WebView: Dispatch land-preload-ready
    WebView->>Bundle: Load from @codeeditorland/output
    Bundle->>Wind: Create AppLayer composing all services
    Wind->>Runtime: Convert Layer to Effect-TS runtime
    Runtime->>Workbench: Instantiate new Workbench(...)
    Workbench->>Workbench: Workbench.startup()
    Workbench->>UI: Render Activity Bar
    Workbench->>UI: Render Side Bar
    Workbench->>UI: Render Editor Part
    Workbench->>UI: Render Status Bar
    Workbench->>UI: Render Panel
    UI->>Wind: Interact via Effect-TS interfaces
```

---

## Wind Service Layer&#x2001;🧩

`Wind` provides ~45 `Effect-TS` services (spanning 59 directories under
`Effect/`, including a `Generated/` layer of upstream VS Code service wrappers)
that replace the VS Code workbench service implementations. Each service follows
a consistent module structure:

```
Wind/Source/Effect/<Service>/
    +-- <Service>.ts            - Barrel re-export module
    +-- Interface/              - Service interface (TypeScript type)
    +-- Tag/                    - Effect-TS service Tag identifier
    +-- Type/                   - Effect-TS Cause subtypes (errors)
    +-- Implementation/         - Concrete implementations (Live, Mock)
    +-- Live.ts                 - Layer export (Layer.succeed)
```

> **Note:** Some directories (e.g., `WorkbenchActivity/`) follow a flatter
> layout where `Implementation/` contains the bridge shape and live
> implementation, and `index.ts` replaces `<Service>.ts` as the barrel. The
> `Generated/` directory holds auto-generated upstream VS Code service wrappers
> (I<Interface>Upstream.ts).

### Service Catalog

#### Core Infrastructure

| Service       | Tag             | Purpose                                            |
| ------------- | --------------- | -------------------------------------------------- |
| IPC           | `IPC`           | `Tauri` command invocation and event subscription  |
| Configuration | `Configuration` | Read/write settings via `Mountain`                 |
| Environment   | `Environment`   | OS environment variables and paths                 |
| Mountain      | `Mountain`      | `gRPC`-level communication with `Mountain` backend |
| MountainSync  | `MountainSync`  | Synchronous state snapshot from `Mountain`         |
| Log           | `Log`           | Structured logging                                 |

#### Editor Services

| Service           | Tag                 | Purpose                                                |
| ----------------- | ------------------- | ------------------------------------------------------ |
| Editor            | `Editor`            | Text editor creation, focus, layout management         |
| TextModel         | `TextModel`         | Document model creation and management                 |
| TextModelResolver | `TextModelResolver` | Resolve text models from URI references                |
| CodeEditor        | `CodeEditor`        | Monaco editor widget wrapping                          |
| CodeEditorService | `CodeEditorService` | Editor decoration, suggestion, and widget coordination |
| BulkEdit          | `BulkEdit`          | Multi-document text editing                            |
| UndoRedo          | `UndoRedo`          | Undo/redo stack management                             |

#### File System Services

| Service     | Tag           | Purpose                                         |
| ----------- | ------------- | ----------------------------------------------- |
| FileService | `FileService` | File read/write/delete/copy/move via `Mountain` |
| FileDialog  | `FileDialog`  | Native OS file dialogs via `Tauri`              |
| Workspace   | `Workspace`   | Workspace root resolution and folder management |

#### Window and UI Services

| Service      | Tag            | Purpose                                         |
| ------------ | -------------- | ----------------------------------------------- |
| Window       | `Window`       | Window state (fullscreen, maximized, minimized) |
| Dialog       | `Dialog`       | Message boxes, input boxes via `Mountain`       |
| Notification | `Notification` | Toast notifications and progress indicators     |
| Progress     | `Progress`     | Long-running operation progress UI              |
| Views        | `Views`        | View container management (sidebar, panel)      |

#### Clipboard Services

| Service       | Tag             | Purpose                                    |
| ------------- | --------------- | ------------------------------------------ |
| Clipboard     | `Clipboard`     | System clipboard read/write via `Mountain` |
| LiveClipboard | `LiveClipboard` | Real-time clipboard monitoring             |

#### Terminal Services

| Service         | Tag               | Purpose                                     |
| --------------- | ----------------- | ------------------------------------------- |
| Terminal        | `Terminal`        | Integrated terminal creation and management |
| TerminalProcess | `TerminalProcess` | PTY process lifecycle via `Mountain`        |

#### Extension Integration Services

| Service             | Tag                   | Purpose                                         |
| ------------------- | --------------------- | ----------------------------------------------- |
| ExtensionManagement | `ExtensionManagement` | Extension install/uninstall/list via `Mountain` |
| ExtensionScanner    | `ExtensionScanner`    | Scan filesystem for installed extensions        |
| ExtensionsWorkbench | `ExtensionsWorkbench` | Extensions view in sidebar                      |

#### Storage Services

| Service       | Tag             | Purpose                                         |
| ------------- | --------------- | ----------------------------------------------- |
| Storage       | `Storage`       | Key-value storage (global and workspace scoped) |
| StorageClient | `StorageClient` | Remote storage synchronization                  |
| SecretStorage | `SecretStorage` | OS keychain-backed secrets                      |

#### Other Services

| Service       | Tag             | Purpose                                    |
| ------------- | --------------- | ------------------------------------------ |
| CustomEditor  | `CustomEditor`  | Custom (webview-based) editor support      |
| Keybinding    | `Keybinding`    | Keyboard shortcut resolution               |
| SCM           | `SCM`           | Source Control Management integration      |
| Search        | `Search`        | File search and text search via `Mountain` |
| Task          | `Task`          | Task execution and management              |
| Timeline      | `Timeline`      | File timeline (local history)              |
| Webview       | `Webview`       | Webview panel management                   |
| Accessibility | `Accessibility` | Screen reader support via OS APIs          |
| Lifecycle     | `Lifecycle`     | Application lifecycle events               |

---

## Service Composition and Layer Stacks&#x2001;🧩

`Wind` services compose into Layer stacks using `Effect-TS`'s Layer system. Each
Layer is a collection of service implementations wired together through
`Effect-TS`'s dependency injection.

### Layer Stack Architecture

```mermaid
graph TB
    Sky[Sky entry point<br/>index.astro] --> Preload[Wind Preload Install.ts]
    Preload --> Layers[Effect/Layers/index.ts]

    Layers --> Tauri[Tauri/Tauri.ts<br/>TauriLiveLayer]
    Layers --> Electron[Electron/Electron.ts<br/>ElectronLiveLayer]
    Layers --> Test[Test/Test.ts<br/>TestLayer]

    Tauri --> Config[ConfigurationLive]
    Tauri --> Sandbox[SandboxLive]
    Tauri --> IPC[IPCLive]
    Tauri --> Mountain[MountainLive + MountainSyncLive]
    Tauri --> Editor[EditorLive]
    Tauri --> File[FilesLive]
    Tauri --> Terminal[TerminalLive]
    Tauri --> Clipboard[ClipboardLive]
    Tauri --> Dialog["DialogLive (via Mountain IPC)"]
    Tauri --> Window[ActivityBarLive, PanelLive, SidebarLive, StatusBarLive]
    Tauri --> Services[... 37 service layers via Layer.mergeAll]

    Electron --> ElectronImpl["Layer.empty.pipe(Layer.provideMerge(...))"]
    Test --> Mock[All mock implementations]
```

### Layer Resolution

The active layer is determined at build time through environment variables:

```
Wind/Source/Effect/Layers/index.ts
    |
    +---> Re-exports TauriBaseLayer, TauriLiveLayer, TauriDevLayer from ./Tauri.ts
    +---> Re-exports ElectronBaseLayer, ElectronLiveLayer, ElectronDevLayer from ./Electron.ts
    +---> Re-exports TestLayer, TestWithTelemetryLayer from ./Test.ts
    +---> Sky pages import Install() from Wind/Source/Function/Install.ts
    +---> Install.ts delegates to ./Install/Function/Install.ts
```

### Layer Composition

Each layer stack uses `Layer.mergeAll` (Tauri) or
`Layer.empty.pipe(Layer.provideMerge(...))` (Electron/Test) to compose services.
Individual services use `Layer.succeed` to wrap a concrete implementation
object:

```typescript
// Tauri layer - Layer.mergeAll: flat composition
export const TauriLiveLayer = Layer.mergeAll(
	SandboxLive,
	ConfigurationWithSyncLive,
	EditorLive,
	FilesLive,
	TerminalLive,
	// ... all ~37 service layers
);

// Electron layer - .pipe(Layer.provideMerge): chain composition
export const ElectronLiveLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(IPCElectronLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationWithSyncLive))
	.pipe(Layer.provideMerge(MountainLive));

// Individual service pattern:
export const LiveEditorServiceLayer = Layer.succeed(
	EditorTag,
	makeEditorService(),
);
```

`Effect-TS`'s compile-time dependency tracking ensures that no service can be
used without its dependencies being satisfied by the Layer stack. A missing
dependency produces a `TypeScript` type error.

### TierIPC Routing

`TauriMainProcessService` reads the `TierIPC` env var (from `.env.Land` via
`turbo.json` `globalEnv`) to select the IPC backend at runtime. It also supports
per-subsystem overrides (`TierTerminal`, `TierSCM`, `TierStorage`, etc.) so
individual channels can be routed independently.

| Value          | Behaviour                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `Mountain`     | Default. All `channel.call()` invocations route to Mountain via Tauri `MountainIPCInvoke`.       |
| `NodeDeferred` | Mountain first; if Mountain returns `undefined` or has no handler, falls through to Cocoon gRPC. |
| `Node`         | All calls bypass Mountain and go directly to Cocoon via the `cocoon:request` gRPC bridge.        |

Per-subsystem tier variables (all default to `Mountain` unless noted):

| Variable               | Default    | Channels governed                                   |
| ---------------------- | ---------- | --------------------------------------------------- |
| `TierTerminal`         | `Mountain` | `terminal`, `localPty`                              |
| `TierSCM`              | `Mountain` | `git` (localGit)                                    |
| `TierDebug`            | `Mountain` | `extensionHostStarter`, `extensionhostdebugservice` |
| `TierLanguageFeatures` | `Mountain` | `language`, `languages`                             |
| `TierSearch`           | `Mountain` | `search`                                            |
| `TierOutputChannel`    | `Mountain` | `output`                                            |
| `TierNativeHost`       | `Mountain` | `nativeHost`                                        |
| `TierTreeView`         | `Mountain` | `tree`                                              |
| `TierStorage`          | `Mountain` | `storage`                                           |
| `TierModel`            | `Mountain` | `model`, `textFile`, `file`                         |
| `TierTasks`            | `Node`     | `tasks`                                             |
| `TierAuth`             | `Node`     | `auth`                                              |
| `TierEncryption`       | `Mountain` | `encryption`                                        |
| `TierWebSocket`        | `Disabled` | Mist WebSocket transport (S6, not yet active)       |

### ManagedRuntime

`Wind/Source/Effect/LandWorkbench/LandWorkbenchRuntime.ts` provides a
module-singleton `ManagedRuntime` wrapping `LandWorkbenchLayer`:

- Initialized eagerly via IIFE at module load time - initialization cost is paid
  once during Sky bundle evaluation, not deferred to the first call.
- Stored on `globalThis.__CEL_WIND_RUNTIME__` so multiple Sky chunks that import
  this module share a single runtime instance.
- `LandWorkbenchRuntime.Get()` returns the pre-warmed runtime; service lookups
  are sub-5 ms after initialization.
- `LandWorkbenchRuntime.Dispose()` tears down the runtime and clears the global
  slot (used on window unload).

---

## Workbench Variants&#x2001;🚀

**Land** supports multiple workbench variants selected at build time:

| Variant               | Feature Coverage          | Build Profile (shorthand) | Use Case                                   |
| --------------------- | ------------------------- | ------------------------- | ------------------------------------------ |
| **Browser**           | 70-80%                    | `debug`                   | Quick development, limited native features |
| **Mountain**          | 80-90%                    | `debug-mountain`          | Daily development, `Tauri` native features |
| **Electron**          | 95%+                      | `debug-electron`          | Maximum VS Code compatibility              |
| **Electron+Rest**     | 95%+                      | `debug-electron-rest`     | Same as Electron + `OXC` compiler          |
| **Electron Minimal**  | No built-in extensions    | `debug-electron-minimal`  | Minimal footprint debugging                |
| **Mountain Only**     | Core services, no Cocoon  | `debug-mountain-only`     | Mountain without extension host            |
| **Cocoon Headless**   | No Wind preload           | `debug-cocoon-headless`   | Cocoon subprocess only, no workbench UI    |
| **Kernel**            | Pure Mountain             | `debug-kernel`            | No built-ins, no Cocoon, no Wind           |
| **Electron Compiled** | Single-binary embedded    | `debug-electron-compiled` | Single-binary deploy with debug symbols    |
| **Mountain Compiled** | Single-binary embedded    | `debug-mountain-compiled` | Single-binary (Mountain variant)           |
| **Electron Bundled**  | Vite/Astro bundled        | `debug-electron-bundled`  | Workbench compiled through Vite/Rollup     |
| **Browser Bundled**   | Vite/Astro bundled        | `debug-browser-bundled`   | Browser workbench bundled                  |
| **Sessions**          | Window/Session management | `debug-sessions-bundled`  | Multi-window session support               |
| **Workbench**         | Base workbench only       | `debug-workbench-bundled` | Minimal UI for testing                     |
| **Bundled All**       | All four bundled variants | `debug-bundled-all`       | All workbenches in one Rollup pass         |

### Variant Selection Logic

`Sky`'s `index.astro` entry point selects the active workbench at build time via
environment variable booleans (not `TierWorkbench`):

```typescript
// From Sky/Source/pages/index.astro - environment detection
const Bundle = process.env["Bundle"] === "true";
const Mountain = process.env["Mountain"] === "true";
const Electron = process.env["Electron"] === "true";
const BrowserProxy = process.env["BrowserProxy"] === "true";

// Determine workbench type
const WorkbenchType =
	Electron || Mountain
		? "Electron"
		: BrowserProxy
			? "BrowserProxy"
			: "Browser"; // Default, not null
```

`Mountain` maps to the Electron workbench (same workbench shape, different IPC
backend). `BrowserProxy` uses its own proxy-backed layout. Unused variants are
tree-shaken by `Vite` and do not enter the production module graph.

For bundled builds, `process.env["Boot"]` and `process.env["Pack"]` gate which
variants are bundled through Vite/Astro (see `Bundled/<Variant>/Layout.astro`).

---

## Command Dispatch System&#x2001;🎮

**Land** implements the VS Code command system across all three layers:

### Command Registry Structure

```
Command Registration:
    Wind (UI commands)      -- registered in Wind services
    Mountain (native)       -- registered as Tauri command handlers
    Cocoon (extensions)     -- registered via vscode.commands.registerCommand
```

### Command Execution Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Wind as Wind CommandService
    participant Tauri as Tauri invoke
    participant Mountain as Mountain CommandHandler
    participant Cocoon as Cocoon CommandRouter

    User->>Wind: Trigger command (palette, keybinding, programmatic)
    Wind->>Wind: Is it a UI command?
    alt UI command
        Wind->>Wind: Execute directly in Effect-TS
    else Native or extension command
        Wind->>Tauri: invoke('commands:execute')
        Tauri->>Mountain: Route to CommandHandler
        Mountain->>Mountain: Is it a native command?
        alt Native command
            Mountain->>Mountain: Execute Rust handler
        else Extension command
            Mountain->>Cocoon: gRPC command request
            Cocoon->>Cocoon: Execute extension command
            Cocoon-->>Mountain: gRPC response
        end
        Mountain-->>Tauri: Result
        Tauri-->>Wind: Result
    end
    Wind-->>User: Command result
```

### Command Categories

| Category        | Registered In | Examples                                                                     |
| --------------- | ------------- | ---------------------------------------------------------------------------- |
| Native editor   | `Wind`        | `cursorMove`, `type`, `replacePreviousChar`                                  |
| Window/UI       | `Mountain`    | `workbench.action.toggleSidebar`, `workbench.action.terminal.toggleTerminal` |
| File operations | `Mountain`    | `workbench.action.files.save`, `workbench.action.files.openFile`             |
| Extension       | `Cocoon`      | `editor.action.formatDocument`, `git.commit`                                 |

---

## Editor Service Architecture&#x2001;✏️

The editor service in `Wind` integrates the VS Code CodeEditor widget (based on
Monaco) with `Tauri`'s WebView and `Mountain`'s native capabilities:

### Text Model Management

```
User opens file
    |
    v
Wind EditorService
    |
    +---> TextModelService resolves URI
    +---> IFileService.readFile() via Tauri -> Mountain
    +---> Content returned as Uint8Array
    +---> TextModel created with content
    +---> Language mode detected from file extension
    +---> Editor widget instantiated with TextModel
    |
    v
Editor renders in Sky UI
```

### Editor Change Lifecycle

```
User types in editor
    |
    v
CodeEditor widget fires onDidChangeTextContent
    |
    v
Wind TextModel marks model as dirty
    |
    v
Dirty state propagates to:
    +---> Tab indicator change (tab shows unsaved dot)
    +---> FileService save provider pipeline (see Workflow/SavingAFileWithSaveParticipants.md)
    +---> Autosave timer (if configured)
```

---

## VS Code API Coverage Strategy&#x2001;🔬

**Land** uses a dual-track strategy for VS Code API coverage:

### Track A: Stock Node (Maximum Compatibility)

The `Cocoon` extension host loads unmodified VS Code `extHost*.ts` source files.
The `ExtHostContext`/`MainContext` RPC glue that normally runs in Electron's
main process is shimmed by `Cocoon` to work over `gRPC`.

Coverage: All APIs that the stock implementation handles in-process are
immediately compatible.

### Track B: Rust Native (Performance)

For I/O-heavy APIs, the `Cocoon` `vscode` shim routes operations through `gRPC`
to `Mountain` for native `Rust` execution. This provides:

- Faster filesystem operations (native syscalls vs Node.js fs)
- Direct OS integration (clipboard, dialogs, keychain)
- Native terminal PTY (`portable-pty` crate vs `node-pty`)
- Zero-copy buffer handling

### Coverage Matrix

The authoritative coverage matrix is at
`Documentation/GitHub/VSCode-API-Coverage-Matrix.md`. Status symbols:

| Status        | Meaning                                               |
| ------------- | ----------------------------------------------------- |
| Working       | Activation + feature render path confirmed end-to-end |
| Partial       | RPC wired but UI render gap, or missing sub-method    |
| Stubbed       | Registration accepted but no effect                   |
| Not attempted | No implementation started                             |
| Lifted        | Pure-function stateless implementation already landed |

---

## Related Documentation&#x2001;📋

- [Architecture](Architecture.md) - System architecture overview
- [BuildPipeline](BuildPipeline.md) - Build pipeline
- [Polyfills](Polyfills.md) - Compatibility shims and initialization layers
- [RustInfrastructure](RustInfrastructure.md) - `Rust` backend components
- [InterComponentProtocol](InterComponentProtocol.md) - `gRPC` protocol
  specification
- [VSCode-API-Coverage-Matrix](VSCode-API-Coverage-Matrix.md) - Comprehensive
  API status
- [Workflow/ApplicationStartupAndHandshake](Workflow/ApplicationStartupAndHandshake.md)
- [Workflow/CreatingAndInteractingWithAWebviewPanel](Workflow/CreatingAndInteractingWithAWebviewPanel.md)

---

**Project Maintainers:** Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues)
