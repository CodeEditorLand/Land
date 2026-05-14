# Build Matrix & Environment Variables

This document describes every build configuration variant, environment variable,
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

| Element      | Language   | Build System         | How It Reads Env Vars               |
| :----------- | :--------- | :------------------- | :---------------------------------- |
| **Mountain** | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **Common**   | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **Echo**     | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **Grove**    | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **Maintain** | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **Mist**     | Rust       | `Cargo`              | `rustc-env` + `--cfg` feature flags |
| **Rest**     | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **SideCar**  | Rust       | `build.rs` + `Cargo` | `rustc-env` + `--cfg` feature flags |
| **Air**      | Rust       | `Cargo`              | `rustc-env` + `--cfg` feature flags |
| **Cocoon**   | TypeScript | ESBuild              | `define` substitution in bootstrap  |
| **Wind**     | TypeScript | Vite                 | `import.meta.env` resolution        |
| **Sky**      | TypeScript | Astro + Vite         | Runtime `__LandTiers` injection     |
| **Output**   | TypeScript | ESBuild              | `define` substitution               |
| **Worker**   | TypeScript | ESBuild              | `define` substitution               |

---

## Environment Variables Reference

### Product Identity

Variables that define the application's name, version, and identity. Shared
across all Elements as the single source of truth for product metadata.

| Variable                       | Default        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :----------------------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProductApplicationName`       | `land`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductCommit`                | `dev`          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductDataFolderName`        | `.land`        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductEmbedderIdentifier`    | `land-desktop` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductNameLong`              | `Land Editor`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductNameShort`             | `Land`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductQuality`               | `development`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductServerApplicationName` | `land-server`  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductUrlProtocol`           | `land`         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `ProductVersion`               | `1.118.0`      | Land tier-gating flags. Read by: • Mountain's build.rs (Rust feature activation + rustc-env exposure) • Cocoon's Bootstrap (esbuild `define` substitution) • Wind's vite.config.ts (import.meta.env resolution) • Sky's astro.config.ts (runtime \_\_LandTiers injection) Every consumer reads this same file - if a tier flips, every Element picks up the change. Copy this file to `.env.Land` (gitignored) to override per machine. See: Documentation/GitHub/Workflow/TierGatedImplementationSelection.md for the full cross-Element propagation workflow. Product identity + version (Atom I5, single source of truth) |

### Network

Port bindings for Mountain and Cocoon gRPC servers. Override to run multiple
concurrent sessions.

| Variable              | Default | Description                                    |
| :-------------------- | :------ | :--------------------------------------------- |
| `NetworkCocoonPort`   | `50052` |                                                |
| `NetworkMountainPort` | `50051` | Network ports (override for parallel sessions) |

### Transport

Tier flags that gate how Elements communicate with each other.

| Variable                  | Default      | Description               |
| :------------------------ | :----------- | :------------------------ |
| `TierHTTPProxy`           | `HandRolled` |                           |
| `TierLogger`              | `Standard`   |                           |
| `TierRemoteProcedureCall` | `gRPC`       | Transport + communication |
| `TierSchemeAssets`        | `Embedded`   |                           |

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

---

## File Mapping

Which `.env.Land*` file each variable originates from:

| Variable                       | Files                                                     |
| :----------------------------- | :-------------------------------------------------------- |
| `Ask`                          | `PostHog`, `Production.PostHog`                           |
| `Authorize`                    | `Production.PostHog`                                      |
| `Batch`                        | `PostHog`, `Production.PostHog`                           |
| `Beam`                         | `Production.PostHog`                                      |
| `Boot`                         | `Bundled`, `Production.Bundled`                           |
| `Brand`                        | `PostHog`, `Production.PostHog`                           |
| `Buffer`                       | `PostHog`, `Production.PostHog`                           |
| `Cap`                          | `PostHog`, `Production.PostHog`                           |
| `Capture`                      | `PostHog`, `Production.PostHog`                           |
| `Disable`                      | `Production.Diagnostics`                                  |
| `Install`                      | `Extensions`, `Production.Extensions`                     |
| `Mute`                         | `Production.Extensions`                                   |
| `NetworkCocoonPort`            | `Core`, `Production`                                      |
| `NetworkMountainPort`          | `Core`, `Production`                                      |
| `OTLPEnabled`                  | `PostHog`, `Production.PostHog`                           |
| `OTLPEndpoint`                 | `PostHog`, `Production.PostHog`                           |
| `Pack`                         | `Bundled`, `Production.Bundled`                           |
| `ProductApplicationName`       | `Core`, `Production`                                      |
| `ProductCommit`                | `Core`, `Production`                                      |
| `ProductDataFolderName`        | `Core`, `Production`                                      |
| `ProductEmbedderIdentifier`    | `Core`, `Production`                                      |
| `ProductNameLong`              | `Core`, `Production`                                      |
| `ProductNameShort`             | `Core`, `Production`                                      |
| `ProductQuality`               | `Core`, `Production`                                      |
| `ProductServerApplicationName` | `Core`, `Production`                                      |
| `ProductUrlProtocol`           | `Core`, `Production`                                      |
| `ProductVersion`               | `Core`, `Production`                                      |
| `Record`                       | `PostHog`, `Production.Diagnostics`, `Production.PostHog` |
| `Replay`                       | `PostHog`, `Production.PostHog`                           |
| `Report`                       | `PostHog`, `Production.PostHog`                           |
| `Require`                      | `Node`, `Production.Node`                                 |
| `Skip`                         | `Production.Extensions`                                   |
| `Throttle`                     | `PostHog`, `Production.PostHog`                           |
| `TierClipboard`                | `Core`, `Production`                                      |
| `TierConfiguration`            | `Core`, `Production`                                      |
| `TierDiagnostics`              | `Core`, `Production`                                      |
| `TierDocumentMirror`           | `Core`, `Production`                                      |
| `TierExtensionActivation`      | `Core`, `Production`                                      |
| `TierExtensionScan`            | `Core`, `Production`                                      |
| `TierFileSystem`               | `Core`, `Production`                                      |
| `TierFileWatcher`              | `Core`, `Production`                                      |
| `TierFindFiles`                | `Core`, `Production`                                      |
| `TierGlob`                     | `Core`, `Production`                                      |
| `TierHTTPProxy`                | `Core`, `Production`                                      |
| `TierLogger`                   | `Core`, `Production`                                      |
| `TierModuleCache`              | `Core`, `Production`                                      |
| `TierOpenExternal`             | `Core`, `Production`                                      |
| `TierRemoteProcedureCall`      | `Core`, `Production`                                      |
| `TierSchemeAssets`             | `Core`, `Production`                                      |
| `TierTelemetry`                | `Core`, `Production`                                      |
| `Trace`                        | `PostHog`, `Production.Diagnostics`, `Production.PostHog` |
| `Wire`                         | `Production.Extensions`                                   |

---

## How Build Variants Affect Each Element

Not every Element needs to understand the full build matrix. Each Element only
needs to know where it fits:

| Element      | Relevant Tier Flags                 | Build Impact                                     |
| :----------- | :---------------------------------- | :----------------------------------------------- |
| **Air**      | None directly                       | Reads ProductVersion for update checks           |
| **Cocoon**   | TierExtensionActivation             | Affects extension loading strategy               |
| **Common**   | TierRemoteProcedureCall, TierLogger | Defines transport and logging traits             |
| **Echo**     | None directly                       | Fixed scheduler implementation                   |
| **Grove**    | None directly                       | Future: inherits transport from Common           |
| **Maintain** | ProductQuality, ProductVersion      | Build orchestration uses quality/version         |
| **Mist**     | NetworkMountainPort                 | DNS server binds to configured port              |
| **Mountain** | All Tier\* flags                    | Gates feature implementations via Cargo features |
| **Output**   | TierSchemeAssets                    | Determines asset bundling strategy               |
| **Rest**     | None directly                       | Compiler is always active                        |
| **SideCar**  | Require (Node version)              | Downloads correct Node.js binary                 |
| **Sky**      | Pack, Boot, ProductQuality          | Selects workbench variant at build time          |
| **Wind**     | TierConfiguration, TierLogger       | Uses tiers for service layer behavior            |
| **Worker**   | None directly                       | Fixed service worker implementation              |
