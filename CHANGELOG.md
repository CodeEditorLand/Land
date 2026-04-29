# Changelog

All notable changes to Land (Monorepo) are documented here in our voice -
what we built, why we built it, what shipped. Format adapted from
[Keep a Changelog](https://keepachangelog.com/).

Land is our top-level monorepo. Under `Element/` we keep every component
we ship (Mountain, Cocoon, Wind, Sky, Air, Echo, Rest, Output, Worker,
Grove, Common, Vine, Mist, Maintain, SideCar) as a git submodule.
`Dependency/` holds our vendored Tauri ecosystem fork plus the VS Code
source we lift from. Each Element keeps its own CHANGELOG; this file
weaves them together.

## [v2.2] - Bundled-Electron Profile: Correctness Pass

We brought the bundled-electron profile to correctness parity with the
unbundled path and started landing the architectural patches that will
take us past it. The headline number: we drove the Cocoon→Mountain
circuit-breaker cascade from **17,134 rejections per session** to
**zero** in the same workspace.

### Bundled-electron rebuild - the substrate

Switching to a Vite-bundled VS Code workbench exposed three classes of
bug we hadn't seen on the unbundled path: marker-string drift after
esbuild rewrote single quotes to double quotes, Rollup tree-shaking
dropped side-effect-only contribution imports, and the Mountain → Sky
event race amplified because the 25 MB bundle takes ≈1500 ms to boot
while Cocoon starts activating extensions inside 600 ms. We worked
through them all.

### IPC reliability

- We widened the benign-404 classifier on both sides of the gRPC
  bridge. Mountain's `LooksLike404` predicate now matches `no such file
  or directory`, `entity not found`, `os error 2`, `path is outside of
  the registered workspace`, `permission denied for operation`, and
  `workspace is not trusted`, so Rust's `std::io::Error` formatting
  stops tripping the breaker on extension probes. Mountain stamps
  JSON-RPC code `-32004` for benign 404s; Cocoon classifies on code
  first and falls back to the regex.
- We made `GetURLFromURIComponentsDTO` accept three URI shapes - plain
  string, `{external}` object, and `{scheme, path}` components - so
  diagnostic-publish storms from rust-analyzer stop dropping on the
  floor.
- We canonicalized both sides of `IsPathAllowedForAccess`'s
  `starts_with` comparison so workspace folders mounted under
  `/Volumes/...` on macOS stop rejecting their own descendants, and
  surfaced a reject-detail log line under the `vfs` tag for future
  diagnostics.
- We short-circuited the Promise-protocol probes (`then`, `catch`,
  `finally`, `constructor`, `valueOf`, `toString`, `toJSON`,
  `@@iterator`, `@@asyncIterator`) in our channel proxy so each
  workbench wake stops invoking `<channel>:then` and logging
  `Unknown IPC command`.

### File-watching, file-reading, search

- We taught `FileWatcherProvider` to treat watch-on-absent-path as a
  deferred no-op instead of an error, so the optional config dirs
  every workspace probes (`~/.roo/skills-*`, `.vscode/settings.json`
  in fresh workspaces) stop counting against the breaker. Same
  provider now accepts `Value::Number(N)` for the handle so Cocoon's
  numeric `NextProviderHandle()` doesn't collapse 136 watcher handles
  into a single empty-string entry.
- We replaced our `BuildOpenTextDocument` shim with one that decodes
  Mountain's `Vec<u8>` JSON-array body to a UTF-8 string and exposes
  the full TextDocument API (`positionAt`, `offsetAt`, `lineAt`,
  `getWordRangeAtPosition`, `validateRange`, `validatePosition`). The
  npm extension's `readScripts` calls `positionAt` once per script
  entry; it was throwing `is not a function`, which `getScripts`
  wrapped as a user-visible "failed to parse the file" error.
- We fixed the search panel showing zero matches despite the Rust
  searcher returning 466 files / 2560 line-matches. The workbench's
  `ITextSearchMatch` interface evolved to `{previewText,
  rangeLocations}` and our mapper still emitted the older
  `{preview: {text, matches}, ranges}` shape, so the result
  accumulator dropped every match.

### Workbench accessor and sidebar contributions

- We fixed our `ExposeWorkbenchAccessor` Output transform on two axes.
  Its import markers used single quotes (`'../../nls.js'`) but
  esbuild emits double quotes post-bundle, so `Source.includes(...)`
  always returned false and the entire `__CEL_SERVICES__` patch was
  silently skipped - that's why search retries exhausted, the SCM
  bridge was null, the sidebar came up empty. We also wrapped each
  `instantiationService.invokeFunction(...)` in a per-key `try-IIFE`
  so a single failed lookup degrades that key to `null` instead of
  taking down the whole `__CEL_SERVICES__` literal.
- We extended our extension-scanner shim so the user-extensions path
  retries on empty result with the same exponential backoff
  (`100/200/400/800/1500 ms`) the system path already had. The
  attach-pending tree views from gitlens, clangd, and the dependency
  inspector were stuck because the workbench's view registry never
  saw user extensions' `contributes.views`: the scanner returned 0
  user extensions on the first call (Mountain's scan hadn't finished
  yet) and the workbench cached that.

### Mountain → Sky event race

- We added a replay handler that drains tree-view registrations, SCM
  providers, extension-registered commands, and per-terminal output
  buffers when the renderer bridge installs. The renderer invokes it
  at the end of bridge install, so events Mountain emitted during
  Cocoon's ~600 ms activation cascade still reach listeners that
  install ~1500 ms later. We also added an `Identifier` field to
  `SourceControlManagementProviderDTO` so SCM replay re-emits with the
  original provider id (`git`, `github`, `hg`, …) instead of a
  hardcoded fallback.

### Terminal - channel-listen bridge

- We landed our first channel-event bridge in the workbench's IPC
  proxy. `localPty.onProcessData`, `onProcessReady`, and
  `onProcessExit` now route to `sky://terminal/{data,create,exit}`
  Tauri events with payload-shape remappers. Without this, the
  workbench's terminal subscribed to channel events that our proxy
  was returning no-op disposables for, so xterm never received PTY
  output even though the reader task was emitting hundreds of times
  per session. We also wrote a per-terminal 64 KB ring buffer in
  the terminal provider so the shell's first prompt and zsh MOTD
  survive the boot race and replay into late listeners.
- We dropped the `tree:getChildren` timeout from 5000 ms to 1500 ms
  so a slow extension's hung tree-data-provider stops eating five
  seconds of perceived UI responsiveness, and added a parent-PID
  watchdog in Cocoon: it polls `process.kill(ppid, 0)` every 2 s
  and self-exits with code 130 on `ESRCH`, so a force-quit on
  Mountain doesn't orphan Cocoon and require the next boot's port
  sweep.

## [v2.1] - Workbench Lift, Search End-to-End, SCM/Debug/Custom-Editor

We brought the bundled VS Code workbench up in our Tauri webview, end-to-end.
Mountain compiled clean, the Cocoon extension host attached over gRPC, all
113 of our test extensions scanned, the workbench rendered, and we kept
chasing the gaps until search, SCM, debug, and custom editors all worked.

### What we shipped

- **Mountain.** We split `WindServiceHandlers` into 24 domain modules and
  `CocoonService` into 15 submodules, landed 18 CocoonService handlers and
  14 language-feature RPC methods, and rolled the `dev_log!` macro across
  170 files so every IPC arm tags into a tag-filterable stream.
- **Cocoon.** We split `GRPCServerService` into 7 dedicated handlers and
  the `vscode` API shim into 10 namespaces (`Window`, `Workspace`,
  `Languages`, `Commands`, `Env`, `Scm`, `Debug`, `Tasks`, `Authentication`,
  `Extensions`), wired workspace events, and added document-content
  mirroring so extensions reading `vscode.workspace.openTextDocument`
  see the same bytes the editor does.
- **Wind.** We finalised 24 IPC channel routes and 5 streaming `listen()`
  subscriptions, all verified end-to-end against Mountain.
- **Sky.** We disabled workspace-trust prompts across our five build
  profiles (the prompt flow assumes Electron's window-managed dialogs)
  and wired the telemetry bridges to OpenTelemetry locally and PostHog
  for opt-in product analytics.
- **Common.** We grew the `ProviderType` enum to 33 variants covering
  every contribution point we forward, and finished the PascalCase
  rename so every Rust identifier in the workspace matches our project
  convention.

### Search, SCM, debug, custom editor

We took these from "renders empty" to "fully working" inside this
sprint window:

- **Search panel** populates from a real walk: 8775 files / 139895
  line-matches in 3.2 s on the Land workspace. We exposed the bundled
  `URI` constructor on the workbench accessor so result rows carry
  real URI instances (the panel's dedup map calls `uri.with(...)`,
  which a POJO can't satisfy), enabled `line_number(true)` on the
  ripgrep-flavour searcher so every match carries a line number, and
  reshaped the find-files cache into an LRU keyed on
  `(folders, include, exclude, cap, flags)`.
- **SCM** ships a single stable provider handle per repo. We aligned
  Cocoon's sequential handle allocator with Mountain's marker maps so
  `register_scm_resource_group` and `update_scm_group` notifications
  resolve into the same provider entry instead of warning "unknown
  provider handle: N" for every group update. The git extension reads
  configuration without `undefined`, status, refs and diffs all
  arrive, and 36 SCM providers register cleanly across the monorepo's
  submodules.
- **Debug + custom editors.** We finished the wire shapes for
  `$resolveCustomEditor`, the `sky://command/*` family, and the debug
  configuration provider, then audited every Cocoon↔Mountain DTO
  boundary for `camelCase` consistency end-to-end.
- **DualTrack.** We added the `LAND_DEFER_RUST*` environment knobs so
  any method, any domain, or all traffic can be A/B-routed between
  Mountain (Rust) and Cocoon (Node) at runtime - useful for isolating
  whether a regression sits in our Rust path or upstream's Node one.
- **Effect-TS Proxy fallback.** We wrapped all 10 `vscode.*` namespaces
  in a heuristic Proxy so any future API the workbench reaches for that
  we haven't shimmed yet surfaces as an audit log line under
  `[VSCODE-API-GAP]` instead of a `TypeError` that crashes the host.
  The classifier infers the right shape from the property name:
  `requestResourceTrust` returns `true`, `onDid…` returns a noop
  disposable, `register…` returns a disposable, `is…`/`has…`/`should…`
  returns `false`, `create…`/`get…`/`make…` returns `undefined`.

### Reliability fixes we landed in the same window

- **Extension type filtering and post-install activation.** Three
  bugs converged on the Extensions sidebar's "install succeeded but
  nothing happened" symptom. Our `getInstalled` handler was dropping
  the `ExtensionType` filter (0=System, 1=User), so every call
  returned the full list marked `type: 0, isBuiltin: true` and
  VSIX-installed extensions never appeared under Installed with an
  Uninstall action. The post-install path wasn't firing
  `onStartupFinished` after `$deltaExtensions`, so extensions with
  that activation event registered but stayed dormant. And the IPC
  switch wasn't routing `extensions:scanSystemExtensions` /
  `extensions:scanUserExtensions` to `getInstalled` with the right
  type filter. We fixed all three together: VSIX extensions show up
  under Installed, activate immediately, and the sidebar refresh
  works on first install.
- **Manifest fields always emitted, VSIX preview without extraction.**
  The workbench's trusted-publishers migration calls
  `manifest.publisher.toLowerCase()` unconditionally at boot. We were
  suppressing empty fields via `skip_serializing_if`, so a
  publisher-less manifest crashed the renderer with `TypeError:
  undefined is not an object`. We dropped the guard on `Name`,
  `Version`, and `Publisher`, then injected explicit `"unknown"`
  fallbacks at the IPC envelope so the renderer always sees a
  string. We also added an `extensions:getManifest` handler that
  reads `extension/package.json` straight from a `.vsix` archive,
  enabling the Install-from-VSIX preview dialog without disk
  extraction.
- **Eager log initialization.** We moved log-file creation to binary
  startup so a session log exists before any panic, preserving
  post-mortem evidence. We also fixed the binary-signature splitter
  so PascalCase segments like `ElectronProfile` produce
  `electron.profile` and logs land in the right app-data directory.
- **Atomic shutdown guard.** Mountain's graceful shutdown was running
  twice: `app_handle.exit(0)` at the end of the first pass made Tauri
  re-deliver `ExitRequested { code: Some(0) }`, the shutdown task
  re-entered, tried to SIGKILL an already-dead Cocoon, and logged
  spurious tcp-connect errors. An atomic guard in the Tauri entry
  blocks the second pass.
- **Static asset path resolution.** We extended path resolution to
  accept both `/Static/Application/` (absolute) and
  `Static/Application/` (relative) forms. The WKWebView WASM loader
  (used by `vscode-oniguruma` → `onig.wasm`) strips the leading
  slash before reaching our `file:read` handler, which used to fail
  with `ENOENT` and broke TextMate syntax highlighting for every
  grammar.
- **Build identifiers.** We landed a two-step rename - first to a
  verbose profile-tagged binary name, then back to the clean
  `Mountain` identifier - to align our Cargo and Tauri config with
  the new build pipeline. Same window: we updated the `posthog-rs`
  0.5 API call (`api_endpoint()` → `host()`) and migrated `sha2`
  0.11's removed `LowerHex` impl to `hex::encode()` in our session-id
  hash, and added `vscode-file://vscode-app` to the CSP `img-src`
  list so VS Code's internal file protocol resolves images.

---

## [v2.0] - Q1 2026: Editor Launch Sprint

### Added

- Mountain: 351 .rs files, 70+ gRPC RPCs, 24 IPC domain modules, terminal PTY,
  secret storage, TLS, AES-256-GCM encryption, OpenTelemetry, PostHog
- Cocoon: 7 Effect-TS layers (2,325 lines), MountainGRPCClient (1,206 lines, 70+
  RPCs), ModuleInterceptor (493 lines), 13 interfaces
- Wind: TauriMainProcessService (232 lines), Preload.ts, Bootstrap/Types/ (30+
  VS Code type mirrors), DevLog.ts
- Sky: Astro 6 migration, TypeScript 6, Vite 8
- Common: Transport Registry, crate renamed to CommonLibrary
- Output: source compilation (4,287 .js files, 169MB), 6 polyfill modules
  (~5,200 lines), ESBuild dual-compiler pattern
- Rest: SWC → OXC migration (7 modules),  suite (3,800 lines)
- Air: 73 Rust modules, DNS resolver, 35 TODOs closed
- Maintain: Build.rs split (5,008 lines across 55 files), Rhai scripting

## [v1.3] - Q4 2025: Dependency Maintenance

### Changed

- Effect-TS 3.19.x, Astro 5.15-5.16, TypeScript 5.9.x
- Cloudflare Workers types, Wrangler 4.x maintained
- All components in stabilization mode

## [v1.2] - Q3 2025: Full Stack Integration

### Added

- Mountain: 556 commits (464 in June), all core modules, gRPC handlers,
  WebSocket, terminal, storage, diagnostics, configuration
- Cocoon: 647 commits, 229K lines in June, Effect-TS 3.17.x
- Wind: 537 commits, 226K lines in June, Effect-TS services
- Common: 7,418 lines of Rust in June
- Echo: work-stealing scheduler API refinement

## [v1.1] - Q2 2025: Architecture Buildout

### Added

- Cocoon created (291 commits, 32,982 lines)
- Wind: Effect-TS pivot on May 30, 370 .ts files in April
- Sky: Tauri workbench bootstrap, 37 keyboard layouts
- Worker: service worker with caching + CSS transpilation
- Grove, Mist: architecture planning
- NLnet NGI0 Commons Fund announced

## [v1.0] - Q1 2025: Integration Phase

### Changed

- Astro 4 → 5 migration, TypeScript 5.7 → 5.8, Vite 6.x
- Mountain: ApplicationState reorganization (app_state → ApplicationState), 12
  DTOs, Knowledge.dot graph
- Turborepo + pnpm workspace stabilized

## [v0.2] - Q4 2024: Architecture Solidification

### Added

- Output element: 32K+ .js files from VS Code source compilation
- Mountain: Android Gradle project scaffold, mobile schema (11,162 lines),
  Cargo.toml feature flags (AirIntegration, ExtensionHostCocoon, etc.)
- VS Code module tree fully imported via submodules

## [v0.1] - Q3 2024: Rapid Development

### Added

- Mountain: 168 commits, 28K lines Rust, Tauri 2.x, gRPC scaffolding
- Sky: 600 commits, Astro + React, Firebase
- Wind: 166 commits, Monaco editor, SCSS
- Echo: 334 commits, Sequence-based task scheduler (crossbeam-deque)
- Rest: created September 14 (33 files, SWC compiler)

### Changed

- Mountain schema reduction: 8,467 → ~1,000 lines (78%)

## [v0.0] - Q2 2024: Project Inception

### Added

- Monorepo structure with Element/ and Dependency/ as git submodules
  (.gitmodules: ignore = all)
- Cargo.toml workspace: Common, Echo, Maintain, Mountain, Air, Grove, Mist,
  Rest, SideCar, tauri-plugin-localhost
- pnpm-workspace.yaml: Dependency/{Biome,Microsoft,OXC,Rolldown,SWC,Tauri,
  Vercel}/NPM/**, Element/**, !**/Target/**
- turbo.json: Turborepo task definitions with global env passthrough
  (ANDROID_HOME, JAEGER_VERSION, API keys, Apple signing, etc.)
- CI/CD pipeline: GitHub Actions, Dependabot
- PascalCase naming convention adopted project-wide
- Biome formatter (TypeScript), rustfmt nightly (Rust)
- Mountain: Tauri scaffold (June), Sky: Astro 4 (April), Common: Workers library
  (April)
