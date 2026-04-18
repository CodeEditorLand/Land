# Changelog

All notable changes to Land (Monorepo) are documented here. Format:
[Keep a Changelog](https://keepachangelog.com/).

Land is the top-level monorepo containing Element/ (application components) and
Dependency/ (external dependencies) as git submodules.

## [v2.1] — Q2 2026: Full Workbench Lift

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

## [v2.0] — Q1 2026: Editor Launch Sprint

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
- Rest: SWC → OXC migration (7 modules), test suite (3,800 lines)
- Air: 73 Rust modules, DNS resolver, 35 TODOs closed
- Maintain: Build.rs split (5,008 lines across 55 files), Rhai scripting

## [v1.3] — Q4 2025: Dependency Maintenance

### Changed

- Effect-TS 3.19.x, Astro 5.15-5.16, TypeScript 5.9.x
- Cloudflare Workers types, Wrangler 4.x maintained
- All components in stabilization mode

## [v1.2] — Q3 2025: Full Stack Integration

### Added

- Mountain: 556 commits (464 in June), all core modules, gRPC handlers,
  WebSocket, terminal, storage, diagnostics, configuration
- Cocoon: 647 commits, 229K lines in June, Effect-TS 3.17.x
- Wind: 537 commits, 226K lines in June, Effect-TS services
- Common: 7,418 lines of Rust in June
- Echo: work-stealing scheduler API refinement

## [v1.1] — Q2 2025: Architecture Buildout

### Added

- Cocoon created (291 commits, 32,982 lines)
- Wind: Effect-TS pivot on May 30, 370 .ts files in April
- Sky: Tauri workbench bootstrap, 37 keyboard layouts
- Worker: service worker with caching + CSS transpilation
- Grove, Mist: architecture planning
- NLnet NGI0 Commons Fund announced

## [v1.0] — Q1 2025: Integration Phase

### Changed

- Astro 4 → 5 migration, TypeScript 5.7 → 5.8, Vite 6.x
- Mountain: ApplicationState reorganization (app_state → ApplicationState), 12
  DTOs, Knowledge.dot graph
- Turborepo + pnpm workspace stabilized

## [v0.2] — Q4 2024: Architecture Solidification

### Added

- Output element: 32K+ .js files from VS Code source compilation
- Mountain: Android Gradle project scaffold, mobile schema (11,162 lines),
  Cargo.toml feature flags (AirIntegration, ExtensionHostCocoon, etc.)
- VS Code module tree fully imported via submodules

## [v0.1] — Q3 2024: Rapid Development

### Added

- Mountain: 168 commits, 28K lines Rust, Tauri 2.x, gRPC scaffolding
- Sky: 600 commits, Astro + React, Firebase
- Wind: 166 commits, Monaco editor, SCSS
- Echo: 334 commits, Sequence-based task scheduler (crossbeam-deque)
- Rest: created September 14 (33 files, SWC compiler)

### Changed

- Mountain schema reduction: 8,467 → ~1,000 lines (78%)

## [v0.0] — Q2 2024: Project Inception

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
