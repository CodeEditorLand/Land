# Changelog

All notable changes to Land (Monorepo) are documented here. Format:
[Keep a Changelog](https://keepachangelog.com/).

Land is the top-level monorepo containing Element/ (application components) and
Dependency/ (external dependencies) as git submodules.

<!-- CURSOR
  batch="1"
  last_sha="48be85495f9e1cdde53da0b2027e8a0e414ab991"
  last_element_sha="Mountain:48be85495f9e1cdde53da0b2027e8a0e414ab991"
  last_date="2026-04-22T22:54:51Z"
  next_start="Wind commits 2026-04-22 late - polyfill migration x2, IPC colon-routing fix (sha range: 9bc9877..039f52c)"
-->

## [v2.1] - Q2 2026: Full Workbench Lift

### Status

Mountain builds clean (0 errors). Cocoon gRPC connected. 95 extensions scanned.
VS Code workbench rendering in Tauri webview.

### Completed

- Mountain: 18 CocoonService handlers, 14 LSP feature methods, dev_log macro
  across 170 files, WindServiceHandlers split → 24 modules, CocoonService split
  → 15 submodules
- Cocoon: GRPCServerService split → 7 handlers, VscodeAPI split → 10 namespaces,
  workspace events, document content mirroring
- Wind: 5 listen() events, 24 IPC channels verified
- Sky: workspace trust disabled across 5 profiles, telemetry bridges (OTEL +
  PostHog)
- Common: ProviderType enum → 33 variants, PascalCase enforcement

### Remaining (105 audit items)

- 12 Critical, 36 High, 51 Medium, 6 Low across Mountain/Cocoon/Wind/Sky

---

### 2026-04-22 · Batch 1 (sha: f632a4ac..48be8549)

#### Mountain

- **[fix]** **Extension type filtering and post-install activation** - The
  Extensions sidebar suffered a silent "install succeeded but nothing happened"
  failure across three independent code paths, all fixed together. First,
  `Extensions.rs` was silently dropping the optional `ExtensionType` filter
  that VS Code's `getInstalled(type?)` IPC passes (0=System, 1=User); every
  call returned the full extension list marked as `type: 0, isBuiltin: true`,
  so VSIX-installed extensions never appeared under "Installed" with an Uninstall
  action. The handler now respects the filter and correctly distinguishes
  VSIX-installed extensions from built-ins using the scanner's `isBuiltin`
  field. Second, `Extension.rs` was not firing `onStartupFinished` activation
  events after `$deltaExtensions` added an extension to Cocoon's registry;
  extensions with that activation event (such as `Anthropic.claude-code`)
  registered but never activated - their sidebar contributions and commands
  silently no-oped until the next full workbench restart. The activation burst
  is now fired immediately after registry insertion. Third, `mod.rs` now
  explicitly forwards `extensions:scanSystemExtensions` to `getInstalled(type=0)`
  and `extensions:scanUserExtensions` to `getInstalled(type=1)`, covering the
  case where VS Code's channel client omits the explicit type filter. Combined
  impact: VSIX extensions appear under "Installed" with an Uninstall action,
  activate immediately without a reload, and the Extensions sidebar refresh
  works correctly on first install. `(sha: 48be8549)`

- **[fix]** **Extension manifest fields always present for renderer; log path
  and VSIX preview hardened** - VS Code's `extensions.contribution.ts`
  trusted-publishers migration calls `manifest.publisher.toLowerCase()` at boot
  unconditionally; if the field was absent (previously suppressed by
  `skip_serializing_if = "String::is_empty"` on `ExtensionDescriptionStateDTO`),
  the renderer crashed with `TypeError: undefined is not an object`. The
  serialization guard has been removed from `Name`, `Version`, and `Publisher`
  so these fields are always emitted even when empty. `Extensions.rs` now
  injects explicit `publisher`, `name`, and `version` fallbacks ("unknown") and
  guards against null manifest values by substituting an empty object skeleton
  before the payload reaches the renderer. A new `extensions:getManifest` IPC
  handler reads `extension/package.json` directly from a `.vsix` archive
  without disk extraction, enabling the "Install from VSIX…" preview dialog.
  `Entry.rs` and `DevLog.rs` gain eager log-file initialisation (`InitEager()`)
  called at binary startup so a session log exists before any panic, preserving
  post-mortem evidence; `BinarySignature()` is corrected to properly split
  PascalCase segments (`ElectronProfile` → `electron.profile`) so logs land in
  the correct app-data directory. The benign ENOENT ignore list is expanded to
  suppress spurious warnings for `chatLanguageModels.json`,
  `configurationDefaultsOverrides`, and window log files (`network.log`,
  `renderer.log`, `views.log`, `notebook.rendering.log`). `(sha: c61c0b1e)`

- **[fix]** **Atomic shutdown guard and static asset path resolution** -
  Mountain's graceful shutdown sequence was running twice: `app_handle.exit(0)`
  at the end of the first pass causes Tauri to re-deliver a second
  `ExitRequested { code: Some(0) }` event, which re-entered the shutdown task,
  attempted to SIGKILL an already-dead Cocoon sidecar, and logged spurious
  "tcp connect error" warnings. An atomic guard in `Entry.rs` now blocks the
  second entry, ensuring the shutdown task runs exactly once. Static asset path
  resolution in `Utilities.rs` is extended to handle both `/Static/Application/`
  (absolute) and `Static/Application/` (relative) forms; the webview's WASM
  loader (`vscode-oniguruma` → `onig.wasm`) strips the leading slash before the
  path reaches the `file:read` IPC handler, which previously caused
  `tokio::fs::read` to fail with ENOENT and broke TextMate syntax highlighting
  for all grammars. The benign ENOENT ignore list gains entries for
  `.copilot/agents`, `.vscode/tasks.json`, `/User/tasks.json`, `/User/mcp.json`,
  `vscode-chat-images`, and `/output_<TIMESTAMP>` window log file patterns.
  `(sha: de7ca500)`

- **[build]** **Binary naming simplified; CSP extended for VS Code file
  protocol** - A two-step configuration migration resolved cleanly. The first
  step temporarily renamed the binary, lib, and product identifiers to a verbose
  development profile string
  (`DevelopmentNodeEnvironment_MicrosoftVSCodeDependency_22NodeVersion_Bundle_Clean_Debug_ElectronProfile_Mountain`)
  in `Cargo.toml` and `tauri.conf.json` to align with the build pipeline during
  the transition, added `Binary/node` to `externalBin` for the Node.js sidecar,
  updated the `posthog-rs` 0.5 API by replacing the deprecated `api_endpoint()`
  with `host()` in `PostHogPlugin.rs`, and migrated `sha2` 0.11's removed
  `LowerHex` impl to `hex::encode()` in `ConfigurationBridge.rs` for session ID
  generation. The second step immediately reverted the verbose name back to the
  clean `Mountain` identifier, removed the now-unnecessary `Binary/node`
  `externalBin` reference (Node.js sidecar handling was moved elsewhere),
  updated the Tauri identifier to `land.editor.binary` for consistency, added
  `vscode-file` and `vscode-file://vscode-app` to the `img-src` Content Security
  Policy to support VS Code's internal file protocol, and deleted the temporary
  backup files (`Cargo.toml.Backup`, `tauri.conf.json.Backup`) now that the
  migration is complete. `(sha: f632a4ac, 8a06b856)`

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
