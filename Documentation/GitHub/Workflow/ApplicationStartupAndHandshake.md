### **Workflow Example #1: Application Startup & Handshake**&#x2001;🚀

**Goal:** To successfully launch the entire Land application, from the native
[`Mountain`](https://github.com/CodeEditorLand/Mountain) backend to the
[`Wind`](https://github.com/CodeEditorLand/Wind) UI and the
[`Cocoon`](https://github.com/CodeEditorLand/Cocoon) extension host. This
workflow details the critical startup sequence, the IPC handshake, and the
initialization of all core services, setting the stage for all other user
interactions.

This is the foundational workflow that enables all others.

```mermaid
sequenceDiagram
    participant User as User
    participant Mountain as Mountain<br/>(Native Backend)
    participant Cocoon as Cocoon<br/>(Extension Host)
    participant VSCode as VSCode<br/>(Workbench UI)

    User->>Mountain: Launch Application
    activate Mountain
    Mountain->>Mountain: Create AppState & AppRuntime
    Mountain->>Mountain: Load Configuration
    Mountain->>Mountain: Scan Extensions
    Mountain->>Mountain: Start gRPC Server
    Mountain->>Cocoon: Spawn Node.js Process (bootstrap-fork.js)
    deactivate Mountain

    activate Cocoon
    Cocoon->>Mountain: $initialHandshake gRPC notification
    deactivate Cocoon

    activate Mountain
    Mountain->>Mountain: Gather InitData from AppState
    Mountain->>Cocoon: initExtensionHost gRPC request
    deactivate Mountain

    activate Cocoon
    Cocoon->>Cocoon: Create InitDataLayer
    Cocoon->>Cocoon: Run FullAppInitialization
    Cocoon->>Cocoon: Install RequireInterceptor
    Cocoon->>Cocoon: Activate Startup Extensions
    deactivate Cocoon

    User->>VSCode: Open Window (index.html)
    activate VSCode
    VSCode->>VSCode: Preload.ts shims window.vscode
    VSCode->>VSCode: Create AppLayer Services
    VSCode->>VSCode: Instantiate Workbench
    VSCode->>VSCode: Render UI Parts (Activity Bar, Sidebar, etc.)
    deactivate VSCode

    Note over Mountain,Cocoon: System Ready for User Interaction
```

---

#### **Phase 1: Native Application Startup ([`Mountain`](https://github.com/CodeEditorLand/Mountain))**

1.  **Application Launch
    ([`Mountain/Source/Binary/Main/Entry.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Binary/Main/Entry.rs#L1))**
    - **Action:** The user launches the Land application. The `main` function in
      `Mountain`'s `main.rs` is executed.
    - Tauri's `Builder` is created, and the `.setup()` hook is configured.
    - Inside the `.setup()` hook:
        - The central `AppState` is created and managed by Tauri.
        - The `MountainEnvironment` (which implements all the `Common` traits)
          is created.
        - The `AppRuntime` (the "engine" for running effects) is created,
          wrapping the environment.
        - A `tokio` background task is spawned to handle post-setup
          initializations.

2.  **Post-Setup Initialization (`Mountain` background task)**
    - **Action:** The background task begins its work.
    - It calls
      [`handlers::config::InitializeConfiguration`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Environment/Rs/Config.rs)
      to load all `settings.json` files from disk into `AppState`.
    - It calls
      [`ExtensionManagement`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ExtensionManagement)
      to find all extensions and load their manifests into `AppState`. If a
      pre-baked `extensions.manifest.json` exists in the bundle (written by
      `Maintain/Build/Manifest/PreBake.ts` during `beforeBundleCommand`),
      Mountain reads it in <50 ms. On first boot (or when the cache is absent),
      it falls back to a parallel `join_all` live scan (~1200 ms) and caches the
      result for subsequent launches.
    - It calls
      **[`vine::server::Initialize`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Vine)**,
      which starts the **gRPC server** to listen for connections from
      `Cocoon`. - It then calls
      **[`handlers::process_management::InitializeCocoon`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement)**.

3.  **Spawning the Sidecar
    ([`ProcessManagement/CocoonManagement.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement/CocoonManagement.rs#L1))**
    - **Action:**
      [`LaunchAndManageCocoonSidecar`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement/CocoonManagement.rs#L1)
      is executed.
    - It constructs a detailed environment for the sidecar, including
      `VSCODE_PARENT_PID` to enable automatic shutdown.
    - It spawns the Node.js process:
      [`node ./Element/Cocoon/Scripts/cocoon/bootstrap-fork.js`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Scripts/cocoon/bootstrap-fork.js#L1).
      **`Cocoon` is now running.**

#### **Phase 2: Sidecar Handshake and UI Launch ([`Cocoon`](https://github.com/CodeEditorLand/Cocoon) & [`Wind`](https://github.com/CodeEditorLand/Wind))**

4.  **`Cocoon` Initialization
    ([`Cocoon/Source/Effect/Bootstrap.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Effect/Bootstrap.ts))**
    - **Action:** The `Cocoon` process runs its bootstrap stages in order:
        1. **Environment** - records Node.js version, platform, arch.
        2. **Configuration** - resolves `MOUNTAIN_GRPC_PORT` (50051) and
           `COCOON_GRPC_PORT` (50052); populates
           `globalThis.__cocoonBootstrapConfig` and `globalThis.__LandTiers`.
        3. **RPCServer** - binds Cocoon's own gRPC server on port 50052. **This
           must complete before Mountain's 30-second gRPC connection budget
           expires.**
        4. **ModuleInterceptor** - installs the `require()` interceptor,
           remapping `electron` to Tauri stubs and patching VS Code bundle
           loading.
        5. **MountainConnection** - TCP-probes Mountain on port 50051, opens the
           gRPC channel, and sends the **`$initialHandshake`** notification to
           signal readiness.
        6. **Extensions** - activates enabled extensions concurrently (up to 8
           in parallel). See step 6 for activation ordering details.
        7. **HealthCheck** - optional final service health sweep.

5.  **`Mountain` Responds to Handshake**
    ([`ProcessManagement`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement))\*\*
    - **Action:** `Mountain`'s gRPC server receives the `$initialHandshake`.
    - This signals `Mountain` to proceed. It calls
      [`InitializationData`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/ProcessManagement/InitializationData.rs),
      gathering all necessary data from `AppState` (workspace info, extension
      lists, configuration, etc.).
    - It sends the **`initExtensionHost` gRPC request back to `Cocoon`**,
      containing this initialization payload.

6.  **`Cocoon` Final Initialization
    ([`Cocoon`](https://github.com/CodeEditorLand/Cocoon))**
    - **Action:** The
      [`initExtensionHost`](https://github.com/CodeEditorLand/Cocoon/tree/Current#L1)
      handler in `Cocoon` fires.
    - It uses the received payload to create and provide the
      [`InitDataLayer`](https://github.com/CodeEditorLand/Cocoon/tree/Current#L1).
    - **It runs `FullAppInitialization`,** resolving the
      [`ExtensionHostProvider`](https://github.com/CodeEditorLand/Cocoon/tree/Current#L1)
      and activating startup extensions (`*` activation event).
    - Extension activation uses **topological ordering**: if extension A
      declares `extensionDependencies: ["B"]`, extension B is activated first.
      An `InProgress` Set prevents circular dependency deadlocks.
    - At this point, workflows like **#3 (Language Features)** and **#6
      (Webviews)** can begin, as extensions register their providers.

7.  **Simultaneously, the UI Loads
    ([`Wind/Source/Preload.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Preload.ts#L1))**
    - **Action:** The main Tauri window opens, loading the `index.html` built by
      [`Sky/Source/pages/Mountain.astro`](https://github.com/CodeEditorLand/Sky/tree/Current/Source/pages/Mountain.astro)).
    - The
      [`Preload.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Preload.ts#L1)
      script executes first, shimming the `window.vscode` global with
      Tauri-backed implementations for `ipcRenderer` and `process`. This is the
      critical bridge that allows the VS Code workbench code to run.

#### **Phase 3: Launching the Workbench ([`Wind`](https://github.com/CodeEditorLand/Wind))**

8.  **UI Application Entry Point
    ([`Wind`](https://github.com/CodeEditorLand/Wind))**
    - **Action:** The main UI script runs.
    - It waits for the DOM to be ready.
    - It creates the master
      **[`AppLayer`](https://github.com/CodeEditorLand/Wind)**, which composes
      all `Wind` services (e.g.,
      [`LiveClipboardService`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Effect/Clipboard/Live.ts),
      [`LiveDialogService`](https://github.com/CodeEditorLand/Wind),
      [`LiveEditorService`](https://github.com/CodeEditorLand/Wind)).
    - It converts this `Layer` into a `Runtime` and resolves the core services.
    - It instantiates the VS Code
      [`Workbench`](https://github.com/CodeEditorLand/Output/tree/Current/Source)
      class: **`new Workbench(...)`**.

9.  **VS Code Workbench Startup
    ([`Workbench`](https://github.com/CodeEditorLand/Output/tree/Current/Source))**
    - **Action:** The `Workbench.startup()` method is called.
    - This kicks off the entire UI rendering lifecycle. It creates all the core
      UI parts: the Activity Bar, Status Bar, Side Bar, Editor Part, etc.
    - As these parts are created, they begin to interact with the `Wind`
      services. For example, the File Explorer will use the `IFileService` to
      list directory contents, which triggers **Workflow #2 (Opening a File)**.
      The Command Palette uses the `ICommandService`, triggering **Workflow #5
      (Executing a Command)**.
    - **The application is now fully initialized and ready for user
      interaction.**
