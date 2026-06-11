# Land Environment Variables Reference

This document catalogs every `.env` variable used across the Land codebase,
organized by domain, with descriptions of defaults, production overrides,
sourcing behavior, and consumer mapping.

---

## 1. Overview

Land uses a **multi-file `.env` system** rather than a single monolithic
environment file. The system is designed around tier-gating: environment
variables control which implementation variants (tiers) are compiled into
Mountain and activated at runtime by Cocoon, Wind, Sky, and Output.

### Naming Convention

All variables follow a strict naming convention:

- **Single-word PascalCase verbs** (e.g., `ProductVersion`, `TierFileSystem`,
  `Capture`)
- **No `LAND_` prefix** -- variables are named for what they _do_, not where
  they come from. This keeps them concise when used as Cargo feature flags, Vite
  `define` keys, and `std::env::var` lookups.
- **One variable per line**, `KEY=value` format, shell-sourced by
  `bash -c 'source ...'` in `TierEnvironment.sh`.

### Multi-File Design

The `.env` system is split into six domains, each with up to three files:

| File Suffix   | Purpose                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- |
| _(none)_      | Development defaults -- checked in, active during local development                     |
| `.Sample`     | Clean template for fresh clones; used as fallback when the dev file is absent or empty  |
| `.Production` | Overrides applied when `NODE_ENV=production` or `Profile` contains the string "release" |

This design allows:

- **Safe local overrides** without touching checked-in production values
- **Clean clones** that work immediately via the `.Sample` fallback
- **Release pipelines** that automatically swap in production overlays without
  modifying dev files
- **Bisecting** -- developers can disable all Land shims via `Disable=true` in
  any file

---

## 2. File Hierarchy

There are 18 environment files across 6 domains:

### Core (`.env.Land`)

| File       | Path                   | Purpose                                                            |
| ---------- | ---------------------- | ------------------------------------------------------------------ |
| Dev        | `.env.Land`            | Product identity, tier-gating defaults, network ports              |
| Sample     | `.env.Land.Sample`     | Clean template with all tier defaults                              |
| Production | `.env.Land.Production` | Production product identity (e.g., `ProductCommit` set to git SHA) |

### Node (`.env.Land.Node`)

| File       | Path                        | Purpose                                                    |
| ---------- | --------------------------- | ---------------------------------------------------------- |
| Dev        | `.env.Land.Node`            | Node.js runtime config (binary path override, min version) |
| Sample     | `.env.Land.Node.Sample`     | Template for Node.js runtime defaults                      |
| Production | `.env.Land.Production.Node` | Production Node.js overrides                               |

### Extensions (`.env.Land.Extensions`)

| File       | Path                              | Purpose                                                                    |
| ---------- | --------------------------------- | -------------------------------------------------------------------------- |
| Dev        | `.env.Land.Extensions`            | Extension directory roots, dev/dev-load behavior, dependency install flags |
| Sample     | `.env.Land.Extensions.Sample`     | Template for extension directory defaults                                  |
| Production | `.env.Land.Production.Extensions` | Production extension layout overrides                                      |

### PostHog (`.env.Land.PostHog`)

| File       | Path                           | Purpose                                                        |
| ---------- | ------------------------------ | -------------------------------------------------------------- |
| Dev        | `.env.Land.PostHog`            | PostHog project key, endpoint, OTLP config, telemetry switches |
| Sample     | `.env.Land.PostHog.Sample`     | Template with default telemetry settings                       |
| Production | `.env.Land.Production.PostHog` | Production telemetry (keys redacted, toggles disabled)         |

### Diagnostics (`.env.Land.Diagnostics`)

| File       | Path                               | Purpose                                                                                 |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| Dev        | `.env.Land.Diagnostics`            | Debug-only knobs (DevTools, smoke tests, log tracing, disk logging, master kill switch) |
| Sample     | `.env.Land.Diagnostics.Sample`     | Template with all knobs disabled                                                        |
| Production | `.env.Land.Production.Diagnostics` | Production overrides (most knobs hard-disabled)                                         |

### Bundled (`.env.Land.Bundled`)

| File       | Path                           | Purpose                                           |
| ---------- | ------------------------------ | ------------------------------------------------- |
| Dev        | `.env.Land.Bundled`            | Workbench bundle layout (`Pack` and `Boot` flags) |
| Sample     | `.env.Land.Bundled.Sample`     | Template for bundled workbench defaults           |
| Production | `.env.Land.Production.Bundled` | Production bundle layout overrides                |

---

## 3. Sourcing Cascade

The sourcing cascade is orchestrated by `Maintain/Script/TierEnvironment.sh`.
Each file is `source`-ed in order, so later files override earlier ones for the
same key.

### Sourcing Order

```
Step  ┌──────────────────────────────┐
  1   │ .env.Land                    │  Core dev defaults
      │ └─ fallback: .env.Land.Sample│  (used if dev file absent)
  2   │ .env.Land.Production         │  Core prod overlay (if NODE_ENV=production or Profile contains "release")
  3   │ .env.Land.Node               │  Node runtime dev defaults
      │ └─ fallback: .env.Land.Node.Sample
  4   │ .env.Land.Production.Node    │  Node runtime prod overlay
  5   │ .env.Land.Extensions         │  Extension dirs dev defaults
      │ └─ fallback: .env.Land.Extensions.Sample
  6   │ .env.Land.Production.Extensions│ Extension dirs prod overlay
  7   │ .env.Land.PostHog            │  PostHog/OTLP dev defaults
      │ └─ fallback: .env.Land.PostHog.Sample
  8   │ .env.Land.Production.PostHog │  PostHog/OTLP prod overlay
  9   │ .env.Land.Diagnostics        │  Debug knobs dev defaults
      │ └─ fallback: .env.Land.Diagnostics.Sample
 10   │ .env.Land.Production.Diagnostics│ Debug knobs prod overlay
 11   │ .env.Land.Bundled            │  Bundle layout dev defaults
      │ └─ fallback: .env.Land.Bundled.Sample
 12   │ .env.Land.Production.Bundled │  Bundle layout prod overlay
      └──────────────────────────────┘
```

### Key Rules

1. **Overlay conditional**: Production overlays are only sourced when
   `NODE_ENV=production` or the `Profile` variable contains the substring
   `release`. For all development profiles, only the dev files (steps 1, 3, 5,
   7, 9, 11) are loaded.

2. **Fallback chain**: If a dev file (e.g., `.env.Land`) is absent or empty, the
   corresponding `.Sample` file is sourced as a fallback.

3. **Last-write-wins**: Since all files are shell-sourced into the same
   environment, identical keys in later files silently override earlier values.
   For example, `Trace=all` in `.env.Land.PostHog` is overridden by `Trace=`
   (empty) in `.env.Land.Production.PostHog`.

4. **Absent files skipped**: Files that do not exist on disk are silently
   skipped. No error is raised.

5. **Build-time vs runtime**: Variables set during the sourcing cascade are
   available at:
    - **Build time**: Read by `Mountain/build.rs` for `cargo:rustc-env`,
      `cargo:rustc-cfg`, and esbuild/Vite `define` substitutions.
    - **Runtime**: Read by Mountain (Rust `std::env::var`), Cocoon (esbuild
      constants), Wind (`import.meta.env`), and Sky
      (`__LandTiers`/`__LandProduct`).

---

## 4. Variables by Domain

### 4.1 Core

| Variable                       | Default        | Production Override        | Domain | Description                                                                                                                                                                                       | Read By                                                |
| ------------------------------ | -------------- | -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ProductVersion`               | `1.118.0`      | Set by release pipeline    | Core   | Product version string; must satisfy every built-in extension's `engines.vscode` range                                                                                                            | Mountain build.rs, Sky product.json                    |
| `ProductCommit`                | `dev`          | Actual git SHA at tag time | Core   | Set by release pipeline to the commit SHA at tag time                                                                                                                                             | Mountain build.rs                                      |
| `ProductQuality`               | `development`  | `stable`                   | Core   | Flips Wind's productService into release-channel mode; gates inline NLS source-map probe                                                                                                          | Mountain build.rs, Wind productService                 |
| `ProductNameShort`             | `Land`         | (same)                     | Core   | Short product name                                                                                                                                                                                | Mountain build.rs, Cocoon, Sky                         |
| `ProductNameLong`              | `Land Editor`  | (same)                     | Core   | Long/full product name                                                                                                                                                                            | Mountain build.rs, Cocoon, Sky                         |
| `ProductApplicationName`       | `land`         | (same)                     | Core   | Application executable name                                                                                                                                                                       | Mountain build.rs, Cocoon                              |
| `ProductDataFolderName`        | `.land`        | (same)                     | Core   | User data folder name (e.g., `~/.land`)                                                                                                                                                           | Mountain build.rs                                      |
| `ProductUrlProtocol`           | `land`         | (same)                     | Core   | Custom URL protocol scheme (`land://...`)                                                                                                                                                         | Mountain build.rs                                      |
| `ProductServerApplicationName` | `land-server`  | (same)                     | Core   | Server application name                                                                                                                                                                           | Mountain build.rs                                      |
| `ProductEmbedderIdentifier`    | `land-desktop` | (same)                     | Core   | Embedder identifier for Tauri                                                                                                                                                                     | Mountain build.rs                                      |
| `NetworkMountainPort`          | `50051`        | (same)                     | Core   | gRPC port for Mountain RPC service                                                                                                                                                                | Mountain build.rs, Cocoon, Vine (stub generation)      |
| `NetworkCocoonPort`            | `50052`        | (same)                     | Core   | gRPC port for Cocoon RPC service                                                                                                                                                                  | Mountain build.rs, Cocoon, Vine (stub generation)      |
| `TierRemoteProcedureCall`      | `gRPC`         | (same)                     | Core   | RPC transport: `gRPC` or `SharedMemory`                                                                                                                                                           | Mountain build.rs (feature gate), Cocoon               |
| `TierHTTPProxy`                | `HandRolled`   | (same)                     | Core   | HTTP proxy: `HandRolled` or `Hyper`                                                                                                                                                               | Mountain build.rs (feature gate), Cocoon               |
| `TierLogger`                   | `Standard`     | (same)                     | Core   | Logger backend: `Standard` or `Ring`                                                                                                                                                              | Mountain build.rs (feature gate), Cocoon               |
| `TierFileSystem`               | `Layer2`       | (same)                     | Core   | File system implementation: `Layer2`, `Layer3`, or `Layer4`                                                                                                                                       | Mountain build.rs (feature gate), Cocoon               |
| `TierFindFiles`                | `Layer3`       | (same)                     | Core   | File search: `Layer3` or `Layer4`                                                                                                                                                                 | Mountain build.rs (feature gate), Cocoon               |
| `TierGlob`                     | `JavaScript`   | (same)                     | Core   | Glob matching: `JavaScript` or `Native`                                                                                                                                                           | Mountain build.rs (feature gate), Cocoon               |
| `TierFileWatcher`              | `Layer4`       | (same)                     | Core   | File watcher: `Layer4` (native notify) or `Stub` (drops all registrations)                                                                                                                        | Mountain build.rs (feature gate), Cocoon               |
| `TierSchemeAssets`             | `Embedded`     | (same)                     | Core   | Asset scheme handler: `Embedded`, `Hybrid`, or `FileSystem`                                                                                                                                       | Mountain build.rs (feature gate), Cocoon               |
| `TierConfiguration`            | `Cache`        | (same)                     | Core   | Configuration service: `Cache` or `Eager`                                                                                                                                                         | Mountain build.rs (feature gate), Cocoon               |
| `TierDiagnostics`              | `Full`         | (same)                     | Core   | Diagnostics propagation: `Full` or `Delta`                                                                                                                                                        | Mountain build.rs (feature gate), Cocoon               |
| `TierClipboard`                | `Layer3`       | (same)                     | Core   | Clipboard: `Layer3`, `Layer4`, or `Layer5`                                                                                                                                                        | Mountain build.rs (feature gate), Cocoon               |
| `TierOpenExternal`             | `Layer3`       | (same)                     | Core   | Open external links: `Layer3` or `Layer4`                                                                                                                                                         | Mountain build.rs (feature gate), Cocoon               |
| `TierDocumentMirror`           | `Full`         | (same)                     | Core   | Document mirror mode: `Full` or `Lazy`                                                                                                                                                            | Mountain build.rs, Cocoon                              |
| `TierExtensionActivation`      | `Parallel8`    | (same)                     | Core   | Extension activation concurrency: `Sequential`, `Parallel4`, `Parallel8`, or `Parallel16`                                                                                                         | Mountain build.rs, Cocoon                              |
| `TierExtensionScan`            | `Sequential`   | (same)                     | Core   | Extension scan: `Sequential` or `Parallel`                                                                                                                                                        | Mountain build.rs (feature gate), Cocoon               |
| `TierModuleCache`              | `Simple`       | (same)                     | Core   | Module caching: `Simple`, `Off`, or `Shared`                                                                                                                                                      | Mountain build.rs, Cocoon                              |
| `TierTelemetry`                | `Synchronous`  | (same)                     | Core   | Telemetry transport: `Synchronous`, `Batched`, or `Off`                                                                                                                                           | Mountain build.rs, Cocoon                              |
| `TierIPC`                      | `Mountain`     | (same)                     | Core   | IPC routing tier: `Mountain` (all calls to native backend), `NodeDeferred` (Mountain first, Cocoon fallback on miss), `Node` (all calls to Cocoon Node.js). Runtime switch - no rebuild required. | Wind `TauriMainProcessService.ts`, Output `Service.ts` |

### 4.2 Node

| Variable  | Default   | Production Override | Domain | Description                                                                                                                                       | Read By              |
| --------- | --------- | ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `Pick`    | _(empty)_ | (empty)             | Node   | Absolute path to a Node.js binary override. If set and the file exists, it is used unconditionally. Example: `/opt/homebrew/opt/node@22/bin/node` | Cocoon spawn         |
| `Require` | `20`      | (same)              | Node   | Minimum Node.js major version required by Cocoon. Cocoon needs >= 20 for `AbortSignal` and `structuredClone`.                                     | Cocoon version check |

### 4.3 Extensions

| Variable  | Default   | Production Override                                                                      | Domain     | Description                                                                                                                                      | Read By                            |
| --------- | --------- | ---------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `Ship`    | _(empty)_ | Auto-resolves to Tauri bundle's `Resources` directory                                    | Extensions | Built-in extension source directory. In dev, resolves to `Element/Sky/Target/Static/Application/extensions`.                                     | Mountain runtime (`std::env::var`) |
| `Lodge`   | _(empty)_ | Auto-resolves to `$HOME/.land/extensions` (Unix) / `%APPDATA%\Land\extensions` (Windows) | Extensions | User extension install root. VS Code equivalent: `~/.vscode/extensions`                                                                          | Mountain runtime (`std::env::var`) |
| `Extend`  | _(empty)_ | (empty)                                                                                  | Extensions | Additional extension paths. Colon-separated on macOS/Linux, semicolon-separated on Windows. Matches `--extensions-dir`.                          | Mountain runtime (`std::env::var`) |
| `Probe`   | _(empty)_ | (empty)                                                                                  | Extensions | Development extensions root. Matches `--extensionDevelopmentPath`. Extensions here always load regardless of enablement state.                   | Mountain runtime (`std::env::var`) |
| `Skip`    | `false`   | (same)                                                                                   | Extensions | Skip built-in extensions (`--disable-extensions`). When `true`, only user and dev extensions load.                                               | Output pipeline                    |
| `Mute`    | `false`   | (same)                                                                                   | Extensions | Mute all extensions (built-in, user, dev). For kernel-only debugging with no extension host.                                                     | Output pipeline                    |
| `Wire`    | `true`    | `false`                                                                                  | Extensions | Auto-install built-in extensions' runtime dependencies (`npm install --production` at copy time). Off in prod because built-ins are pre-bundled. | Cocoon, Output                     |
| `Install` | `true`    | `true`                                                                                   | Extensions | Auto-install runtime dependencies for user-installed extensions (same as Wire, applied to user tree).                                            | Cocoon                             |

### 4.4 PostHog (Telemetry)

| Variable    | Default                                            | Production Override | Domain  | Description                                                                                                              | Read By               |
| ----------- | -------------------------------------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `Authorize` | `phc_mvbuxcLutfZctCVwnC4TTksmtNPPVgcx7gX96tTuCKk4` | _(empty)_           | PostHog | PostHog project key (`phc_` prefix = public client-side key)                                                             | Sky telemetry service |
| `Beam`      | `https://eu.i.posthog.com`                         | (same)              | PostHog | PostHog region endpoint. Use `https://us.i.posthog.com` for US Cloud.                                                    | Sky telemetry service |
| `Report`    | `true`                                             | `false`             | PostHog | Master switch for telemetry across all tiers                                                                             | Sky telemetry service |
| `Throttle`  | `5`                                                | (same)              | PostHog | Sky-side rate limit (max bursts)                                                                                         | Sky telemetry service |
| `Buffer`    | `3000`                                             | (same)              | PostHog | Buffer size in milliseconds for batching events                                                                          | Sky telemetry service |
| `Batch`     | `20`                                               | (same)              | PostHog | Batch size for PostHog event submission                                                                                  | Sky telemetry service |
| `Cap`       | `7`                                                | (same)              | PostHog | Global cap on Sky `$exception` captures per 10-second window                                                             | Sky telemetry service |
| `Replay`    | `false`                                            | (same)              | PostHog | Session recording toggle                                                                                                 | Sky telemetry service |
| `Ask`       | `false`                                            | (same)              | PostHog | PostHog surveys toggle                                                                                                   | Sky telemetry service |
| `Brand`     | `nikola`                                           | _(empty)_           | PostHog | Distinct-ID seed (e.g., GitHub username). Empty = auto-generated per-process.                                            | Sky telemetry service |
| `Capture`   | `true`                                             | `false`             | PostHog | Master telemetry kill switch. `false` short-circuits BOTH PostHog and OTLP everywhere.                                   | Sky telemetry service |
| `Trace`     | `all`                                              | _(empty)_           | PostHog | Span filter. Comma-separated list of element/tag names, or `all`. Examples: `all`, `mountain,cocoon,ipc,extension-host`. | Mountain runtime, Sky |

### 4.5 OTLP (OpenTelemetry)

| Variable       | Default                 | Production Override | Domain | Description                                                                                  | Read By                      |
| -------------- | ----------------------- | ------------------- | ------ | -------------------------------------------------------------------------------------------- | ---------------------------- |
| `OTLPEndpoint` | `http://127.0.0.1:4318` | (same)              | OTLP   | OTLP collector endpoint (Jaeger all-in-one HTTP receiver)                                    | OTLP exporter                |
| `OTLPEnabled`  | `true`                  | `false`             | OTLP   | OTLP exporter toggle                                                                         | OTLP exporter                |
| `Record`       | `0`                     | `0`                 | OTLP   | Mirror PostHog batches + OTLP payloads to per-session NDJSON log file. Set to `1` to enable. | OTLP exporter, Sky telemetry |

### 4.6 Diagnostics

| Variable          | Default   | Production Override | Domain      | Description                                                                                                                                                                                                                                  | Read By                  |
| ----------------- | --------- | ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `Inspect`         | _(unset)_ | _(unset)_           | Diagnostics | Auto-open Mountain's WKWebView DevTools at boot. macOS steals first-responder focus. Commonly set to `1` to enable.                                                                                                                          | Mountain runtime         |
| `Smoke`           | _(unset)_ | _(unset)_           | Diagnostics | Run boot-time smoke harness against Wind's CommandCatalog. Three gates OR'd: build-time `Smoke=1`, URL `?Smoke=1`, or `localStorage.setItem("Smoke","1")`.                                                                                   | Mountain runtime, Wind   |
| `Trace`           | _(unset)_ | _(unset)_           | Diagnostics | Dev-log tag selection. Comma-separated or `all`. Common tags: `lifecycle`, `ipc`, `extensions`, `tree-view`, `terminal`, `grpc`, `cocoon`, `scheme-assets`, `window`, `sky-emit`, `dual-track`. Unset = tag-free output.                     | Mountain runtime         |
| `Record`          | `0`       | `0`                 | Diagnostics | Persist Mountain dev log to disk at `<app-data>/logs/<timestamp>/Mountain.dev.log`. Set to `1` to enable.                                                                                                                                    | Mountain runtime         |
| `Disable`         | `false`   | `false`             | Diagnostics | Master kill switch. Skips every Land shim/polyfill/connection. Output transforms dropped, Cocoon/Air spawn skipped, CloseRequested intercept disabled, SkyBridge not installed. Also controllable via `localStorage.setItem("Disable","1")`. | Output, Mountain, Cocoon |
| `DisableUIFixes`  | _(unset)_ | _(unset)_           | Diagnostics | When set to `true`, skips only UI/rendering/CSS/animation transforms. All wire patches, IPC, extensions, rewrites, and overlays remain active. Narrower than `Disable=true`.                                                                 | Output, Sky              |
| `DebugServer`     | _(unset)_ | _(unset)_           | Diagnostics | Start Mountain's HTTP debug server. `1` = Mountain only on `127.0.0.1:9933`. `both` = Mountain `:9933` + Cocoon `:9934`.                                                                                                                     | Mountain runtime         |
| `DebugServerPort` | `9933`    | _(unset)_           | Diagnostics | Port for Mountain's HTTP debug server (default `9933`).                                                                                                                                                                                      | Mountain runtime         |
| `HotReload`       | _(unset)_ | _(unset)_           | Diagnostics | Enable hot reload in dev mode. Set to `true` to activate. Used by `Maintain/Debug/Run.sh`.                                                                                                                                                   | Debug/Run.sh             |
| `Watch`           | _(unset)_ | _(unset)_           | Diagnostics | Enable file watching in dev mode. Set to `true` to activate file-change-triggered rebuilds.                                                                                                                                                  | Debug/Run.sh             |
| `LiveReloadPort`  | `3001`    | _(unset)_           | Diagnostics | Port for the live-reload server started by `Debug/Run.sh` (default `3001`).                                                                                                                                                                  | Debug/Run.sh             |

### 4.7 Bundled

| Variable | Default   | Production Override                   | Domain  | Description                                                                                                                                                                                                                                                                                                                | Read By           |
| -------- | --------- | ------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `Pack`   | _(empty)_ | `electron browser sessions workbench` | Bundled | Space-separated list of workbench variants for bundled Vite/Astro tree. Valid: `electron`, `browser`, `sessions`, `workbench`. Empty = no bundled tree (dynamic-import path used). Profile-level overrides in `Build.sh`: `debug-electron-bundled` -> `Pack="electron"`, `debug-browser-bundled` -> `Pack="browser"`, etc. | Sky, Vite builder |
| `Boot`   | `false`   | `true`                                | Bundled | When `true`, `index.astro` renders bundled Layout for active workbench. When `false`, dynamic-import path is used.                                                                                                                                                                                                         | Sky, Astro build  |

### 4.8 Build-Shim

These variables are **not stored in `.env` files**. They are exported by
`Build.sh` during the build process and consumed by various consumers.

| Variable           | Default                                             | Production Override            | Domain     | Description                                                                                                                                                                                    | Read By                             |
| ------------------ | --------------------------------------------------- | ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `Profile`          | Build profile name (e.g., `debug-electron-bundled`) | Varies                         | Build-Shim | Build profile name. Passed to `TierEnvironment.sh` to determine production overlay sourcing.                                                                                                   | `TierEnvironment.sh`, Build scripts |
| `Pack`             | Set by profile case statements                      | Set by profile case statements | Build-Shim | Workbench pack. Overridden per-profile in `Build.sh` case statements.                                                                                                                          | Build scripts                       |
| `Boot`             | Set by profile case statements                      | Set by profile case statements | Build-Shim | Boot mode. Overridden per-profile in `Build.sh` case statements.                                                                                                                               | Build scripts                       |
| `Browser`          | `true` for browser profiles                         | `true` for browser profiles    | Build-Shim | `"true"` when building a browser profile.                                                                                                                                                      | Build scripts                       |
| `Mountain`         | `true` for mountain profiles                        | `true` for mountain profiles   | Build-Shim | `"true"` when building a Mountain profile.                                                                                                                                                     | Build scripts                       |
| `Electron`         | `true` for electron profiles                        | `true` for electron profiles   | Build-Shim | `"true"` when building an Electron profile.                                                                                                                                                    | Build scripts                       |
| `Bundle`           | Bundle info string                                  | Varies                         | Build-Shim | Bundle metadata for the current build.                                                                                                                                                         | Build scripts                       |
| `Compiler`         | `rest` or `esbuild`                                 | Varies                         | Build-Shim | Compiler label for the current build pipeline.                                                                                                                                                 | Output, Build scripts               |
| `LandIsProduction` | Auto-set by `TierEnvironment.sh`                    | `true`                         | Build-Shim | `"true"` or `"false"`. Auto-set by `TierEnvironment.sh` based on `NODE_ENV` and `Profile`.                                                                                                     | Build scripts                       |
| `NODE_ENV`         | _(unset)_                                           | `production`                   | Build-Shim | Triggers production overlay chain when set to `production`.                                                                                                                                    | `TierEnvironment.sh`, Node.js       |
| `BundleLevel`      | `debug`                                             | `release`                      | Build-Shim | Passed to `Maintain/Script/SignBundle.sh` to select the Tauri build output directory (`Target/debug/` or `Target/release/`). Set to `debug` for debug builds, `release` for production builds. | `SignBundle.sh`                     |
| `CopyToDesktop`    | _(unset)_                                           | _(unset)_                      | Build-Shim | When set to any non-empty value, copies the signed `.app` bundle to `~/Desktop` after signing. Convenience shortcut for quick launch from Finder.                                              | `SignBundle.sh`                     |
| `MountainDir`      | `Element/Mountain`                                  | (same)                         | Build-Shim | Override the Mountain element root directory. Default is `Element/Mountain`. Used by `SignBundle.sh` to locate `Entitlements.plist` and the Tauri bundle output.                               | `SignBundle.sh`                     |

---

## 5. Tier-Gating Feature Mapping

Tier values from `.env.Land` are translated by `TierEnvironment.sh` into Cargo
feature flags passed to Mountain's `build.rs`. The mapping is as follows:

| Environment Variable      | Value          | Cargo Feature Activated               |
| ------------------------- | -------------- | ------------------------------------- |
| `TierRemoteProcedureCall` | `SharedMemory` | `TierRemoteProcedureCallSharedMemory` |
| `TierHTTPProxy`           | `Hyper`        | `TierHTTPProxyHyper`                  |
| `TierLogger`              | `Ring`         | `TierLoggerRing`                      |
| `TierFileSystem`          | `Layer4`       | `TierFileSystemLayer4`                |
| `TierFindFiles`           | `Layer4`       | `TierFindFilesLayer4`                 |
| `TierGlob`                | `Native`       | `TierGlobNative`                      |
| `TierFileWatcher`         | `Layer4`       | `TierFileWatcherLayer4`               |
| `TierSchemeAssets`        | `Hybrid`       | `TierSchemeAssetsHybrid`              |
| `TierConfiguration`       | `Eager`        | `TierConfigurationEager`              |
| `TierDiagnostics`         | `Delta`        | `TierDiagnosticsDelta`                |
| `TierClipboard`           | `Layer4`       | `TierClipboardLayer4`                 |
| `TierOpenExternal`        | `Layer4`       | `TierOpenExternalLayer4`              |
| `TierExtensionScan`       | `Parallel`     | `TierExtensionScanParallel`           |

### Notes

- **Default values do not activate features**. The Cargo features listed above
  are only enabled when the variable is explicitly set to the non-default value.
  For example, `TierFileSystem=Layer2` (the default) does not activate any
  feature; only `TierFileSystem=Layer4` activates `TierFileSystemLayer4`.
- **Layer3 and Layer5 values** (e.g., `TierClipboard=Layer3`,
  `TierFileSystem=Layer3`) are implementation choices embedded in Mountain's
  code paths but do not correspond to Cargo features in the current mapping.
- **Tier values without feature mappings** (`TierDocumentMirror`,
  `TierExtensionActivation`, `TierModuleCache`, `TierTelemetry`) are read at
  runtime via `std::env::var` and influence behavior without requiring a
  compile-time feature gate.

---

## 6. Consumer Mapping

This table shows which Elements read which variables and through what mechanism.

| Variable                       | Mountain build.rs | Mountain Runtime (Rust) | Cocoon (Node.js)       | Wind (TypeScript/Vite) | Sky (Astro)       | Output (ESBuild) | Build Scripts |
| ------------------------------ | ----------------- | ----------------------- | ---------------------- | ---------------------- | ----------------- | ---------------- | ------------- |
| `ProductVersion`               | `rustc-env`       | -                       | esbuild define         | Vite define            | `__LandProduct`   | -                | Build.sh      |
| `ProductCommit`                | `rustc-env`       | -                       | esbuild define         | Vite define            | `__LandProduct`   | -                | Build.sh      |
| `ProductQuality`               | `rustc-env`       | -                       | esbuild define         | Vite define            | `__LandProduct`   | -                | Build.sh      |
| `ProductNameShort`             | `rustc-env`       | -                       | esbuild define         | Vite define            | `__LandProduct`   | -                | Build.sh      |
| `ProductNameLong`              | `rustc-env`       | -                       | esbuild define         | Vite define            | `__LandProduct`   | -                | Build.sh      |
| `ProductApplicationName`       | `rustc-env`       | -                       | esbuild define         | Vite define            | -                 | -                | Build.sh      |
| `ProductDataFolderName`        | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | Build.sh      |
| `ProductUrlProtocol`           | `rustc-env`       | -                       | -                      | -                      | -                 | -                | Build.sh      |
| `ProductServerApplicationName` | `rustc-env`       | -                       | -                      | -                      | -                 | -                | Build.sh      |
| `ProductEmbedderIdentifier`    | `rustc-env`       | -                       | -                      | -                      | -                 | -                | Build.sh      |
| `NetworkMountainPort`          | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `NetworkCocoonPort`            | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierRemoteProcedureCall`      | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierHTTPProxy`                | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierLogger`                   | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierFileSystem`               | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierFindFiles`                | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierGlob`                     | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierFileWatcher`              | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierSchemeAssets`             | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierConfiguration`            | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierDiagnostics`              | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierClipboard`                | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierOpenExternal`             | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierDocumentMirror`           | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierExtensionActivation`      | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierExtensionScan`            | `rustc-cfg`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierModuleCache`              | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierTelemetry`                | `rustc-env`       | -                       | esbuild define         | -                      | -                 | -                | -             |
| `TierIPC`                      | -                 | `std::env::var`         | -                      | IPC routing selection  | -                 | -                | -             |
| `Pick`                         | -                 | -                       | Spawn binary selection | -                      | -                 | -                | Build.sh      |
| `Require`                      | -                 | -                       | Version check          | -                      | -                 | -                | Build.sh      |
| `Ship`                         | -                 | `std::env::var`         | -                      | -                      | -                 | -                | Build.sh      |
| `Lodge`                        | -                 | `std::env::var`         | -                      | -                      | -                 | -                | Build.sh      |
| `Extend`                       | -                 | `std::env::var`         | -                      | -                      | -                 | -                | Build.sh      |
| `Probe`                        | -                 | `std::env::var`         | -                      | -                      | -                 | -                | Build.sh      |
| `Skip`                         | -                 | -                       | -                      | -                      | -                 | Transform drop   | -             |
| `Mute`                         | -                 | -                       | -                      | -                      | -                 | Transform drop   | -             |
| `Wire`                         | -                 | -                       | Dependency install     | -                      | -                 | Install skip     | -             |
| `Install`                      | -                 | -                       | Dependency install     | -                      | -                 | -                | -             |
| `Authorize`                    | -                 | -                       | -                      | -                      | Telemetry init    | -                | -             |
| `Beam`                         | -                 | -                       | -                      | -                      | Telemetry init    | -                | -             |
| `Report`                       | -                 | -                       | -                      | -                      | Telemetry toggle  | -                | -             |
| `Throttle`                     | -                 | -                       | -                      | -                      | Rate limit        | -                | -             |
| `Buffer`                       | -                 | -                       | -                      | -                      | Batch config      | -                | -             |
| `Batch`                        | -                 | -                       | -                      | -                      | Batch config      | -                | -             |
| `Cap`                          | -                 | -                       | -                      | -                      | Exception cap     | -                | -             |
| `Replay`                       | -                 | -                       | -                      | -                      | Session recording | -                | -             |
| `Ask`                          | -                 | -                       | -                      | -                      | Survey toggle     | -                | -             |
| `Brand`                        | -                 | -                       | -                      | -                      | Distinct ID       | -                | -             |
| `Capture`                      | -                 | -                       | -                      | -                      | Kill switch       | -                | -             |
| `Trace` (PostHog)              | -                 | `std::env::var`         | -                      | -                      | Span filter       | -                | -             |
| `OTLPEndpoint`                 | -                 | -                       | -                      | -                      | Exporter config   | -                | -             |
| `OTLPEnabled`                  | -                 | -                       | -                      | -                      | Exporter toggle   | -                | -             |
| `Record` (OTLP)                | -                 | -                       | -                      | -                      | NDJSON log        | -                | -             |
| `Inspect`                      | -                 | `std::env::var`         | -                      | -                      | -                 | -                | -             |
| `Smoke`                        | -                 | `std::env::var`         | -                      | Smoke harness          | -                 | -                | -             |
| `Trace` (Diagnostics)          | -                 | `std::env::var`         | -                      | -                      | -                 | -                | -             |
| `Record` (Diagnostics)         | -                 | `std::env::var`         | -                      | -                      | -                 | -                | -             |
| `Disable`                      | -                 | `localStorage`          | -                      | -                      | -                 | Transform drop   | -             |
| `DisableUIFixes`               | -                 | -                       | -                      | -                      | -                 | Transform drop   | -             |
| `DebugServer`                  | -                 | `std::env::var`         | -                      | -                      | -                 | -                | -             |
| `DebugServerPort`              | -                 | `std::env::var`         | -                      | -                      | -                 | -                | -             |
| `HotReload`                    | -                 | -                       | -                      | -                      | -                 | -                | Debug/Run.sh  |
| `Watch`                        | -                 | -                       | -                      | -                      | -                 | -                | Debug/Run.sh  |
| `LiveReloadPort`               | -                 | -                       | -                      | -                      | -                 | -                | Debug/Run.sh  |
| `BundleLevel`                  | -                 | -                       | -                      | -                      | -                 | -                | SignBundle.sh |
| `CopyToDesktop`                | -                 | -                       | -                      | -                      | -                 | -                | SignBundle.sh |
| `MountainDir`                  | -                 | `std::env::var`         | -                      | -                      | -                 | -                | SignBundle.sh |
| `Pack` (Bundled)               | -                 | -                       | -                      | -                      | Workbench render  | -                | Build.sh      |
| `Boot` (Bundled)               | -                 | -                       | -                      | -                      | Layout toggle     | -                | Build.sh      |

### How Each Element Consumes Variables

| Element                     | Mechanism             | Details                                                                                                                                                          |
| --------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mountain build.rs**       | `cargo:rustc-env`     | Variables embedded as `rustc-env` are available as compile-time constants via `env!("VAR_NAME")` in Rust code.                                                   |
| **Mountain build.rs**       | `cargo:rustc-cfg`     | Tier feature flags are emitted via `cargo:rustc-cfg=feature="TierFileSystemLayer4"`, enabling `#[cfg(feature = "...")]` conditional compilation.                 |
| **Mountain runtime (Rust)** | `std::env::var`       | Variables read at runtime via `std::env::var("VAR_NAME")`. These reflect the final sourced values and can differ between processes.                              |
| **Cocoon (Node.js)**        | esbuild define        | `TierEnvironment.sh` generates an esbuild `--define` block via `CocoonEsbuildDefine`. Substitution looks like: `--define:process.env.TierFileSystem="'Layer2'"`. |
| **Wind (TypeScript)**       | Vite define           | Vite's `define` config injects `import.meta.env.TierFileSystem` into the Wind TypeScript bundle at build time.                                                   |
| **Sky (Astro)**             | Global + product.json | `__LandTiers` (tier values) and `__LandProduct` (product identity) are injected as Astro globals and used for `product.json` generation.                         |
| **Air (Rust)**              | `std::env::var`       | Reads `ProductVersion` for update channel selection. Other variables may be consumed at runtime as Air services initialize.                                      |
| **Vine (Rust)**             | `build.rs` codegen    | `NetworkMountainPort` and `NetworkCocoonPort` are encoded into the generated gRPC stub constants during `prost-build` codegen via `build.rs`.                    |
| **Output (ESBuild)**        | Transform pipeline    | Variables like `Skip`, `Mute`, `Disable` control which transforms are applied to the ESBuild output pipeline.                                                    |
| **localStorage**            | Runtime override      | `localStorage.setItem("Disable", "1")` and `localStorage.setItem("Smoke", "1")` in DevTools can flip gates at runtime without restarting.                        |

### localStorage Runtime Overrides

The following variables can be toggled at runtime via the browser DevTools
console:

```javascript
// Disable all Land shims/polyfills/connections
localStorage.setItem("Disable", "1");

// Enable boot-time smoke harness
localStorage.setItem("Smoke", "1");
```

Changes take effect on the next application cycle. A restart may be required for
some gates.

---

## 7. Usage Examples

### 7.1 Overriding for Parallel Development Sessions

If you need to run multiple Land instances side-by-side with different tier
configurations, edit the `.Sample` file and point specific sessions at it:

```bash
# Session 1: Default dev (reads .env.Land)
cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand
cargo build -p mountain

# Session 2: Experimental layers
# Temporarily swap .env.Land with a custom file
cp .env.Land .env.Land.backup
cat > .env.Land << 'EOF'
TierFileSystem=Layer4
TierFindFiles=Layer4
TierFileWatcher=Layer4
EOF
cargo build -p mountain

# Restore original
mv .env.Land.backup .env.Land
```

Alternatively, use the `.Sample` file as a clean baseline for experiments:

```bash
# Keep your main .env.Land unchanged, experiment with Sample
cp .env.Land.Sample .env.Land.Experimental
# Edit .env.Land.Experimental with your changes
# The sourcing cascade will fall through to .Sample if no dev file exists
```

### 7.2 Enabling Telemetry Debugging

To debug telemetry flows with PostHog and OTLP:

```bash
# In .env.Land.PostHog:
Authorize=phc_your_key_here
Beam=https://eu.i.posthog.com
Report=true
Capture=true
Trace=all
OTLPEndpoint=http://127.0.0.1:4318
OTLPEnabled=true
Record=1
```

Then run a local Jaeger instance:

```bash
# Jaeger all-in-one with OTLP HTTP receiver on port 4318
docker run -d --name jaeger \
	-p 16686:16686 \
	-p 4318:4318 \
	jaegertracing/all-in-one:latest
```

- **`Record=1`** mirrors PostHog batches and OTLP payloads to NDJSON files at
  `<app-data>/logs/<timestamp>/`. Useful for offline inspection.
- **`Trace=all`** captures spans for all elements. Narrow it down with
  `Trace=mountain,cocoon` to reduce noise.

### 7.3 Using localStorage to Flip Gates at Runtime

No restart required for these gates -- toggle them in the DevTools console:

```javascript
// Enable boot-time smoke test harness
localStorage.setItem("Smoke", "1");

// Disable all Land customizations (shims, polyfills, connections)
localStorage.setItem("Disable", "1");
```

To revert:

```javascript
// Clear the override (or set to "0"/"false")
localStorage.removeItem("Smoke");
localStorage.removeItem("Disable");
```

### 7.4 Disabling All Land Customizations for Bisecting

When bisecting a regression, you may need to run with all Land-specific shims,
polyfills, and connections disabled:

**Method 1: `.env.Land.Diagnostics` file**

```bash
# In .env.Land.Diagnostics or .env.Land.Diagnostics.Sample:
Disable=true
```

**Method 2: localStorage (runtime only)**

```javascript
localStorage.setItem("Disable", "1");
```

When `Disable=true`:

- All Output transforms are dropped
- Cocoon and Air spawn are skipped
- CloseRequested intercept is disabled
- SkyBridge is not installed
- The application falls back to vanilla VS Code behavior

This is ideal for git bisect to determine whether a regression originates in
Land's customization layer or upstream VS Code.

### 7.5 Switching Extension Loading Modes

```bash
# Load only user extensions, skip all built-ins
Skip=true

# Completely mute all extensions (no extension host)
Mute=true

# Load development extensions from a custom path (always loads, regardless of enablement)
Probe=/path/to/my-extension

# Add additional extension directories (colon-separated on macOS/Linux)
Extend=/opt/custom-extensions:/home/user/more-extensions
```

### 7.6 Building for Production

The production overlay chain is triggered automatically:

```bash
export NODE_ENV=production
# or
export Profile=release-electron-bundled
```

This causes `TierEnvironment.sh` to source all `.env.Land.Production.*` overlays
after their dev counterparts. Key differences:

| Variable         | Dev           | Production                            |
| ---------------- | ------------- | ------------------------------------- |
| `ProductQuality` | `development` | `stable`                              |
| `ProductCommit`  | `dev`         | Actual git SHA                        |
| `Wire`           | `true`        | `false`                               |
| `Capture`        | `true`        | `false`                               |
| `Authorize`      | (dev key)     | _(empty)_                             |
| `Report`         | `true`        | `false`                               |
| `OTLPEnabled`    | `true`        | `false`                               |
| `Boot`           | `false`       | `true`                                |
| `Pack`           | _(empty)_     | `electron browser sessions workbench` |

### 7.7 Debugging Cocoon's Node.js Version

```bash
# Force a specific Node.js binary
Pick=/opt/homebrew/opt/node@22/bin/node

# Check your current Node.js version (must be >= Require value)
node --version

# Change the minimum required version
Require=22
```

If Cocoon detects a version below `Require`, it will fail to spawn with a
version mismatch error.

### 7.8 Enabling Persistent Mountain Logging

```bash
# In .env.Land.Diagnostics:
Record=1
```

Mountain's dev log will be written to:

```
<app-data>/logs/<timestamp>/Mountain.dev.log
```

This is separate from the standard application log and includes all tagged
output (if `Trace` is also set).

---

## Appendices

### A. Common Trace Tags

When `Trace` is set (in either PostHog or Diagnostics domain), these are the
most common tag values:

| Tag             | Covers                                          |
| --------------- | ----------------------------------------------- |
| `all`           | Every tag (verbose)                             |
| `lifecycle`     | Application startup, shutdown, window lifecycle |
| `ipc`           | Inter-process communication messages            |
| `extensions`    | Extension loading, activation, deactivation     |
| `tree-view`     | Explorer tree view operations                   |
| `terminal`      | Terminal pane operations                        |
| `grpc`          | gRPC request/response tracing                   |
| `cocoon`        | Cocoon (Node.js) process lifecycle and IPC      |
| `scheme-assets` | Custom asset scheme handler operations          |
| `window`        | Window management and rendering                 |
| `sky-emit`      | Sky framework event emissions                   |
| `dual-track`    | Dual-track rendering pipeline                   |
| `mountain`      | Mountain-specific operations                    |

Combine tags: `Trace=lifecycle,ipc,extensions,grpc`

### B. File Paths Summary

| File                   | Relative Path (from repo root)       |
| ---------------------- | ------------------------------------ |
| Core dev               | `.env.Land`                          |
| Core sample            | `.env.Land.Sample`                   |
| Core production        | `.env.Land.Production`               |
| Node dev               | `.env.Land.Node`                     |
| Node sample            | `.env.Land.Node.Sample`              |
| Node production        | `.env.Land.Production.Node`          |
| Extensions dev         | `.env.Land.Extensions`               |
| Extensions sample      | `.env.Land.Extensions.Sample`        |
| Extensions production  | `.env.Land.Production.Extensions`    |
| PostHog dev            | `.env.Land.PostHog`                  |
| PostHog sample         | `.env.Land.PostHog.Sample`           |
| PostHog production     | `.env.Land.Production.PostHog`       |
| Diagnostics dev        | `.env.Land.Diagnostics`              |
| Diagnostics sample     | `.env.Land.Diagnostics.Sample`       |
| Diagnostics production | `.env.Land.Production.Diagnostics`   |
| Bundled dev            | `.env.Land.Bundled`                  |
| Bundled sample         | `.env.Land.Bundled.Sample`           |
| Bundled production     | `.env.Land.Production.Bundled`       |
| Sourcing script        | `Maintain/Script/TierEnvironment.sh` |

---

_Last updated: May 2026_
