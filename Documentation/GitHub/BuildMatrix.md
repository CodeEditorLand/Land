# Build Matrix & Environment Variables

Every build configuration variant, environment variable,
and how they propagate across all Elements in the Land monorepo.

---

## Build Variant Profiles

Land ships multiple build profiles that gate features, performance tiers, and
runtime behavior at compile time. Each profile combines a set of `.env.Land*`
files that are read by every Element's build system.

| Profile                       | Files Loaded                                              | Purpose                                   |
| :---------------------------- | :-------------------------------------------------------- | :---------------------------------------- |
| **Development**               | `.env.Land`                                               | Default local development                 |
| **Development + Bundled**     | `.env.Land + .env.Land.Bundled`                           | Development with pre-compiled workbench   |
| **Development + Extensions**  | `.env.Land + .env.Land.Extensions`                        | Development with extension installation   |
| **Development + Node**        | `.env.Land + .env.Land.Node`                              | Development with specific Node.js version |
| **Development + PostHog**     | `.env.Land + .env.Land.PostHog`                           | Development with telemetry enabled        |
| **Development + Diagnostics** | `.env.Land + .env.Land.Diagnostics`                       | Development with debug tracing            |
| **Production**                | `.env.Land.Production`                                    | Production build (all tiers locked down)  |
| **Production + Bundled**      | `.env.Land.Production + .env.Land.Production.Bundled`     | Production with bundled workbench         |
| **Production + Extensions**   | `.env.Land.Production + .env.Land.Production.Extensions`  | Production with extension skip/mute       |
| **Production + Node**         | `.env.Land.Production + .env.Land.Production.Node`        | Production with specific Node.js version  |
| **Production + PostHog**      | `.env.Land.Production + .env.Land.Production.PostHog`     | Production with telemetry                 |
| **Production + Diagnostics**  | `.env.Land.Production + .env.Land.Production.Diagnostics` | Production with trace/record              |

Each Element consumer reads from the same `.env.Land*` files. If a tier flag
flips, every Element picks up the change through its own build system.

| Element      | Language     | Build System            | How It Reads Env Vars                                  |
| :----------- | :----------- | :---------------------- | :----------------------------------------------------- |
| **Mountain** | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **Common**   | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **Echo**     | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **Grove**    | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **Maintain** | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **Mist**     | Rust         | `Cargo`                 | `rustc-env` + `--cfg` feature flags                    |
| **Rest**     | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **SideCar**  | Rust         | `build.rs` + `Cargo`    | `rustc-env` + `--cfg` feature flags                    |
| **Air**      | Rust         | `Cargo`                 | `rustc-env` + `--cfg` feature flags                    |
| **Vine**     | Proto + Rust | `prost-build` + `Cargo` | Port numbers baked into generated stubs via `build.rs` |
| **Cocoon**   | TypeScript   | ESBuild                 | `define` substitution in bootstrap                     |
| **Wind**     | TypeScript   | Vite                    | `import.meta.env` resolution                           |
| **Sky**      | TypeScript   | Astro + Vite            | Runtime `__LandTiers` injection                        |
| **Output**   | TypeScript   | ESBuild                 | `define` substitution                                  |
| **Worker**   | TypeScript   | ESBuild                 | `define` substitution                                  |

---

## Environment Variables Reference

### Product Identity

Variables that define the application's name, version, and identity. Shared
across all Elements as the single source of truth for product metadata.

| Variable                       | Default        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| :----------------------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProductApplicationName`       | `land`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductCommit`                | `dev`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductDataFolderName`        | `.land`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductEmbedderIdentifier`    | `land-desktop` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductNameLong`              | `Land Editor`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductNameShort`             | `Land`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductQuality`               | `development`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductServerApplicationName` | `land-server`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductUrlProtocol`           | `land`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ProductVersion`               | `1.118.0`      | Land version and tier-gating flags. Single source of truth consumed by every Element: Mountain's `build.rs` (Rust feature activation + `rustc-env` exposure), Cocoon's Bootstrap (`esbuild` `define` substitution), Wind's `vite.config.ts` (`import.meta.env` resolution), Sky's `astro.config.ts` (runtime `__LandTiers` injection). When a tier value changes in `.env.Land`, every Element picks it up through its own build system. See: [TierGatedImplementationSelection.md](Workflow/TierGatedImplementationSelection.md) for the full cross-Element propagation workflow. |

### Network

Port bindings for Mountain and Cocoon gRPC servers. Override to run multiple
concurrent sessions.

| Variable              | Default | Description                                    |
| :-------------------- | :------ | :--------------------------------------------- |
| `NetworkCocoonPort`   | `50052` |                                                |
| `NetworkMountainPort` | `50051` | Network ports (override for parallel sessions) |

### Transport

Tier flags that gate how Elements communicate with each other.

| Variable                  | Default      | Description                                                                                                                                                                                                                                     |
| :------------------------ | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TierHTTPProxy`           | `HandRolled` |                                                                                                                                                                                                                                                 |
| `TierIPC`                 | `Mountain`   | IPC routing tier for Wind and Output `TauriMainProcessService`. `Mountain` = all calls to native backend; `NodeDeferred` = Mountain first, Cocoon fallback on miss; `Node` = all calls to Cocoon Node.js. Runtime switch - no rebuild required. |
| `TierLogger`              | `Standard`   |                                                                                                                                                                                                                                                 |
| `TierRemoteProcedureCall` | `gRPC`       | Transport + communication                                                                                                                                                                                                                       |
| `TierSchemeAssets`        | `Embedded`   |                                                                                                                                                                                                                                                 |

### File System & Search

Tier flags controlling native file operations, search, and watchers.

| Variable          | Default      | Description                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :---------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TierFileSystem`  | `Layer2`     | File system + search                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `TierFileWatcher` | `Layer4`     | Layer4 forwards `createFileSystemWatcher` to Mountain's native `notify`-crate backend in Environment/FileWatcherProvider.rs (FSEvents / inotify / ReadDirectoryChangesW, per-handle debounce, glob-to-regex filter). `Stub` drops every watch registration and blinds TypeScript / ESLint / Tailwind (and every other LSP-driven) extension to disk mutations. Keep Layer4 as the default; flip to Stub only for isolation debugging. |
| `TierFindFiles`   | `Layer3`     |                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `TierGlob`        | `JavaScript` |                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### VS Code API Surface

Tier flags gating VS Code API compatibility layers.

| Variable             | Default  | Description         |
| :------------------- | :------- | :------------------ |
| `TierClipboard`      | `Layer3` |                     |
| `TierConfiguration`  | `Cache`  | VS Code API surface |
| `TierDiagnostics`    | `Full`   |                     |
| `TierDocumentMirror` | `Full`   |                     |
| `TierOpenExternal`   | `Layer3` |                     |

### Lifecycle & Concurrency

Tier flags controlling extension activation strategy and module caching.

| Variable                  | Default      | Description             |
| :------------------------ | :----------- | :---------------------- |
| `TierExtensionActivation` | `Parallel8`  | Lifecycle + concurrency |
| `TierExtensionScan`       | `Sequential` |                         |
| `TierModuleCache`         | `Simple`     |                         |

### Telemetry

Telemetry mode selection.

| Variable        | Default       | Description |
| :-------------- | :------------ | :---------- |
| `TierTelemetry` | `Synchronous` | Telemetry   |

### Build-Shim

Variables exported by build scripts (not stored in `.env` files).

| Variable        | Default            | Description                                                                                                                                                                                                                                     |
| :-------------- | :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BundleLevel`   | `debug`            | Passed to `Maintain/Script/SignBundle.sh` to select the Tauri output directory (`Target/debug/` or `Target/release/`). Set to `debug` by `Debug/Build.sh` and `release` by `Release/Build.sh`. Also sets the ad-hoc re-sign identity correctly. |
| `CopyToDesktop` | _(unset)_          | When set to any non-empty value, copies the signed `.app` to `~/Desktop` after signing. Convenience shortcut for quick Finder launch.                                                                                                           |
| `MountainDir`   | `Element/Mountain` | Override the Mountain element root. Used by `SignBundle.sh` to locate `Entitlements.plist` and the Tauri bundle output directory.                                                                                                               |

> After `tauri build`, `Maintain/Script/SignBundle.sh` re-signs the `.app`
> bundle with `xattr -cr` + `codesign`. This step runs automatically via
> `BundleLevel=debug sh Maintain/Script/SignBundle.sh` at the end of
> `Debug/Build.sh` (and the release equivalent). It is also triggered by
> `beforeBundleCommand` hooks in `tauri.conf.json` for production builds.

---

## File Mapping

Which `.env.Land*` file each variable originates from:

| Variable                       | Files                                                         |
| :----------------------------- | :------------------------------------------------------------ |
| `Ask`                          | `PostHog`, `Production.PostHog`                               |
| `Authorize`                    | `Production.PostHog`                                          |
| `Batch`                        | `PostHog`, `Production.PostHog`                               |
| `Beam`                         | `Production.PostHog`                                          |
| `Boot`                         | `Bundled`, `Production.Bundled`                               |
| `BundleLevel`                  | Build-Shim (exported by `Debug/Build.sh`, `Release/Build.sh`) |
| `Brand`                        | `PostHog`, `Production.PostHog`                               |
| `Buffer`                       | `PostHog`, `Production.PostHog`                               |
| `Cap`                          | `PostHog`, `Production.PostHog`                               |
| `Capture`                      | `PostHog`, `Production.PostHog`                               |
| `Disable`                      | `Production.Diagnostics`                                      |
| `Install`                      | `Extensions`, `Production.Extensions`                         |
| `Mute`                         | `Production.Extensions`                                       |
| `NetworkCocoonPort`            | `Core`, `Production`                                          |
| `NetworkMountainPort`          | `Core`, `Production`                                          |
| `OTLPEnabled`                  | `PostHog`, `Production.PostHog`                               |
| `OTLPEndpoint`                 | `PostHog`, `Production.PostHog`                               |
| `Pack`                         | `Bundled`, `Production.Bundled`                               |
| `ProductApplicationName`       | `Core`, `Production`                                          |
| `ProductCommit`                | `Core`, `Production`                                          |
| `ProductDataFolderName`        | `Core`, `Production`                                          |
| `ProductEmbedderIdentifier`    | `Core`, `Production`                                          |
| `ProductNameLong`              | `Core`, `Production`                                          |
| `ProductNameShort`             | `Core`, `Production`                                          |
| `ProductQuality`               | `Core`, `Production`                                          |
| `ProductServerApplicationName` | `Core`, `Production`                                          |
| `ProductUrlProtocol`           | `Core`, `Production`                                          |
| `ProductVersion`               | `Core`, `Production`                                          |
| `Record`                       | `PostHog`, `Production.Diagnostics`, `Production.PostHog`     |
| `Replay`                       | `PostHog`, `Production.PostHog`                               |
| `Report`                       | `PostHog`, `Production.PostHog`                               |
| `Require`                      | `Node`, `Production.Node`                                     |
| `Skip`                         | `Production.Extensions`                                       |
| `Throttle`                     | `PostHog`, `Production.PostHog`                               |
| `TierClipboard`                | `Core`, `Production`                                          |
| `TierConfiguration`            | `Core`, `Production`                                          |
| `TierDiagnostics`              | `Core`, `Production`                                          |
| `TierDocumentMirror`           | `Core`, `Production`                                          |
| `TierExtensionActivation`      | `Core`, `Production`                                          |
| `TierExtensionScan`            | `Core`, `Production`                                          |
| `TierFileSystem`               | `Core`, `Production`                                          |
| `TierFileWatcher`              | `Core`, `Production`                                          |
| `TierFindFiles`                | `Core`, `Production`                                          |
| `TierGlob`                     | `Core`, `Production`                                          |
| `TierHTTPProxy`                | `Core`, `Production`                                          |
| `TierIPC`                      | `Core`, `Production`                                          |
| `TierLogger`                   | `Core`, `Production`                                          |
| `TierModuleCache`              | `Core`, `Production`                                          |
| `TierOpenExternal`             | `Core`, `Production`                                          |
| `TierRemoteProcedureCall`      | `Core`, `Production`                                          |
| `TierSchemeAssets`             | `Core`, `Production`                                          |
| `TierTelemetry`                | `Core`, `Production`                                          |
| `Trace`                        | `PostHog`, `Production.Diagnostics`, `Production.PostHog`     |
| `Wire`                         | `Production.Extensions`                                       |

---

## How Build Variants Affect Each Element

Not every Element needs to understand the full build matrix. Each Element only
needs to know where it fits:

| Element      | Relevant Tier Flags                    | Build Impact                                                                                  |
| :----------- | :------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Air**      | None directly                          | Reads ProductVersion for update checks                                                        |
| **Cocoon**   | TierExtensionActivation                | Affects extension loading strategy                                                            |
| **Common**   | TierRemoteProcedureCall, TierLogger    | Defines transport and logging traits                                                          |
| **Echo**     | None directly                          | Fixed scheduler implementation                                                                |
| **Grove**    | None directly                          | Future: inherits transport from Common                                                        |
| **Maintain** | ProductQuality, ProductVersion         | Build orchestration uses quality/version                                                      |
| **Mist**     | NetworkMountainPort                    | DNS server binds to configured port                                                           |
| **Mountain** | All Tier\* flags                       | Gates feature implementations via Cargo features                                              |
| **Output**   | TierSchemeAssets, TierIPC              | Determines asset bundling strategy; TierIPC selects IPC routing in TauriMainProcessService    |
| **Rest**     | None directly                          | Compiler is always active                                                                     |
| **SideCar**  | Require (Node version)                 | Downloads correct Node.js binary                                                              |
| **Sky**      | Pack, Boot, ProductQuality             | Selects workbench variant at build time                                                       |
| **Vine**     | NetworkMountainPort, NetworkCocoonPort | Port numbers baked into generated gRPC stubs                                                  |
| **Wind**     | TierConfiguration, TierLogger, TierIPC | Uses tiers for service layer behavior; TierIPC selects IPC routing in TauriMainProcessService |
| **Worker**   | None directly                          | Fixed service worker implementation                                                           |

---

**Project Maintainers:** Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues)
