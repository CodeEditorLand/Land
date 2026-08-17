# Changelog

All notable changes to Land (Monorepo) are documented here in our voice - what
we built, why we built it, what shipped. Format adapted from
[Keep a Changelog](https://keepachangelog.com/).

## How to read this changelog

Land is our top-level monorepo. Under
[`Element/`](https://github.com/CodeEditorLand/Land/tree/Current/Element) we
keep every component we ship (Mountain, Cocoon, Wind, Sky, Air, Echo, Rest,
Output, Worker, Grove, Common, Vine, Mist, Maintain, SideCar) as a git
submodule.

[`Dependency/`](https://github.com/CodeEditorLand/Land/tree/Current/Dependency)
holds our vendored Tauri ecosystem fork plus the VS Code source we lift from.
Each Element keeps its own CHANGELOG; this file weaves them together.

Releases are listed newest first. Each entry is headed by its version and a
one-line theme, so scanning the h2 level alone tells you the arc of the
project.

| Release | Theme                                                       |
| ------- | ----------------------------------------------------------- |
| v2.2    | Bundled-Electron Profile: Correctness Pass                   |
| v2.1    | Workbench Lift, Search End-to-End, SCM/Debug/Custom-Editor   |
| v2.0    | Editor Launch                                                |
| v1.3    | Dependency Maintenance                                       |
| v1.2    | Full-Stack Integration                                       |
| v1.1    | Architecture Buildout                                        |
| v1.0    | Integration Phase                                            |
| v0.2    | Architecture Solidification                                  |
| v0.1    | Rapid Development                                            |
| v0.0    | Project Inception                                            |

> [!NOTE]
>
> Where an entry names a source file, the link resolves to that Element's own
> repository on the `Current` branch, not to a path inside this one.

## [v2.2] - Bundled-Electron Profile: Correctness Pass

We brought the bundled-electron profile to correctness parity with the unbundled
path and started landing the architectural patches that will take us past it.
The headline number: we drove the Cocoon→Mountain circuit-breaker cascade from
**17,134 rejections per session** to **zero** in the same workspace.

### Bundled-electron rebuild - the substrate

Switching to a Vite-bundled VS Code workbench exposed three classes of bug we
hadn't seen on the unbundled path: marker-string drift after esbuild rewrote
single quotes to double quotes, Rollup tree-shaking dropped side-effect-only
contribution imports, and the Mountain → Sky event race amplified because the 25
MB bundle takes ≈1500 ms to boot while Cocoon starts activating extensions
inside 600 ms. We worked through them all.

### IPC reliability

- We widened the benign-404 classifier on both sides of the gRPC bridge.
  Mountain's `LooksLike404` predicate now matches `no such file or directory`,
  `entity not found`, `os error 2`,
  `path is outside of the registered workspace`,
  `permission denied for operation`, and `workspace is not trusted`, so Rust's
  `std::io::Error` formatting stops tripping the breaker on extension probes.
  Mountain stamps JSON-RPC code `-32004` for benign 404s; Cocoon classifies on
  code first and falls back to the regex.
- We made `GetURLFromURIComponentsDTO` accept three URI shapes - plain string,
  `{external}` object, and `{scheme, path}` components - so diagnostic-publish
  storms from rust-analyzer stop dropping on the floor.
- We canonicalized both sides of `IsPathAllowedForAccess`'s `starts_with`
  comparison so workspace folders mounted under `/Volumes/...` on macOS stop
  rejecting their own descendants, and surfaced a reject-detail log line under
  the `vfs` tag for future diagnostics.
- We short-circuited the Promise-protocol probes (`then`, `catch`, `finally`,
  `constructor`, `valueOf`, `toString`, `toJSON`, `@@iterator`,
  `@@asyncIterator`) in our channel proxy so each workbench wake stops invoking
  `<channel>:then` and logging `Unknown IPC command`.

The classifier itself lives in
[`Source/Vine/Server/MountainVinegRPCService.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Vine/Server/MountainVinegRPCService.rs),
and the allow-list check it guards lives in
[`Source/Environment/Utility/PathSecurity.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Environment/Utility/PathSecurity.rs).

```rs
let ErrorCode = if LooksLike404 { -32004 } else { -32000 };
```

> [!NOTE]
>
> That single line is the whole contract - a benign miss is coded `-32004` so
> Cocoon can classify on the code before it ever reaches the regex.

### File-watching, file-reading, search

- We taught `FileWatcherProvider` to treat watch-on-absent-path as a deferred
  no-op instead of an error, so the optional config dirs every workspace probes
  (`~/.roo/skills-*`, `.vscode/settings.json` in fresh workspaces) stop counting
  against the breaker. Same provider now accepts `Value::Number(N)` for the
  handle so Cocoon's numeric `NextProviderHandle()` doesn't collapse 136 watcher
  handles into a single empty-string entry.
- We replaced our `BuildOpenTextDocument` shim with one that decodes Mountain's
  `Vec<u8>` JSON-array body to a UTF-8 string and exposes the full TextDocument
  API (`positionAt`, `offsetAt`, `lineAt`, `getWordRangeAtPosition`,
  `validateRange`, `validatePosition`). The npm extension's `readScripts` calls
  `positionAt` once per script entry; it was throwing `is not a function`, which
  `getScripts` wrapped as a user-visible "failed to parse the file" error.
- We fixed the search panel showing zero matches despite the Rust searcher
  returning 466 files / 2560 line-matches. The workbench's `ITextSearchMatch`
  interface evolved to `{previewText, rangeLocations}` and our mapper still
  emitted the older `{preview: {text, matches}, ranges}` shape, so the result
  accumulator dropped every match.

The watcher backing implementation is
[`Source/Environment/FileWatcherProvider.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Environment/FileWatcherProvider.rs);
the document shim it feeds is in Cocoon's Workspace namespace.

```rs
//! Native filesystem notifications are delegated to the `notify` crate, which
//! picks up inotify on Linux, FSEvents on macOS, and ReadDirectoryChangesW
//! on Windows.
```

> [!NOTE]
>
> The provider's own header comment states the platform backends, which is why
> an absent path has to be deferred rather than raised.

### Workbench accessor and sidebar contributions

- We fixed our `ExposeWorkbenchAccessor` Output transform on two axes. Its
  import markers used single quotes (`'../../nls.js'`) but esbuild emits double
  quotes post-bundle, so `Source.includes(...)` always returned false and the
  entire `__CEL_SERVICES__` patch was silently skipped - that's why search
  retries exhausted, the SCM bridge was null, the sidebar came up empty. We also
  wrapped each `instantiationService.invokeFunction(...)` in a per-key
  `try-IIFE` so a single failed lookup degrades that key to `null` instead of
  taking down the whole `__CEL_SERVICES__` literal.
- We extended our extension-scanner shim so the user-extensions path retries on
  empty result with the same exponential backoff (`100/200/400/800/1500 ms`) the
  system path already had. The attach-pending tree views from gitlens, clangd,
  and the dependency inspector were stuck because the workbench's view registry
  never saw user extensions' `contributes.views`: the scanner returned 0 user
  extensions on the first call (Mountain's scan hadn't finished yet) and the
  workbench cached that.

The transform is
[`Source/Plugin/Transform/Expose/Workbench/Accessor.ts`](https://github.com/CodeEditorLand/Output/tree/Current/Source/Plugin/Transform/Expose/Workbench/Accessor.ts).

```ts
const DesktopMainImportMarker = "import { localize } from '../../nls.js';";
```

> [!NOTE]
>
> This is the marker whose quote style drifted under esbuild, which is what
> made the whole accessor patch silently no-op.

### Mountain → Sky event race

- We added a replay handler that drains tree-view registrations, SCM providers,
  extension-registered commands, and per-terminal output buffers when the
  renderer bridge installs. The renderer invokes it at the end of bridge
  install, so events Mountain emitted during Cocoon's ~600 ms activation cascade
  still reach listeners that install ~1500 ms later. We also added an
  `Identifier` field to `SourceControlManagementProviderDTO` so SCM replay
  re-emits with the original provider id (`git`, `github`, `hg`, …) instead of a
  hardcoded fallback.

The DTO carrying that field is
[`Source/SourceControlManagement/DTO/SourceControlManagementProviderDTO.rs`](https://github.com/CodeEditorLand/Common/tree/Current/Source/SourceControlManagement/DTO/SourceControlManagementProviderDTO.rs).

```rs
#[serde(default)]
pub Identifier:String,
```

> [!NOTE]
>
> `serde(default)` is what lets the new field land without breaking replay of
> DTOs serialised before it existed.

### Terminal - channel-listen bridge

- We landed our first channel-event bridge in the workbench's IPC proxy.
  `localPty.onProcessData`, `onProcessReady`, and `onProcessExit` now route to
  `sky://terminal/{data,create,exit}` Tauri events with payload-shape remappers.
  Without this, the workbench's terminal subscribed to channel events that our
  proxy was returning no-op disposables for, so xterm never received PTY output
  even though the reader task was emitting hundreds of times per session. We
  also wrote a per-terminal 64 KB ring buffer in the terminal provider so the
  shell's first prompt and zsh MOTD survive the boot race and replay into late
  listeners.
- We dropped the `tree:getChildren` timeout from 5000 ms to 1500 ms so a slow
  extension's hung tree-data-provider stops eating five seconds of perceived UI
  responsiveness, and added a parent-PID watchdog in Cocoon: it polls
  `process.kill(ppid, 0)` every 2 s and self-exits with code 130 on `ESRCH`, so
  a force-quit on Mountain doesn't orphan Cocoon and require the next boot's
  port sweep.

The event names the bridge targets are declared in
[`Source/IPC/SkyEvent.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/IPC/SkyEvent.ts).

```ts
TerminalData: "sky://terminal/data",
TerminalExit: "sky://terminal/exit",
```

> [!NOTE]
>
> These are the concrete Tauri event topics the PTY reader publishes to and
> xterm subscribes from.

## [v2.1] - Workbench Lift, Search End-to-End, SCM/Debug/Custom-Editor

We brought the bundled VS Code workbench up in our Tauri webview, end-to-end.
Mountain compiled clean, the Cocoon extension host attached over gRPC, all 113
of our test extensions scanned, the workbench rendered, and we kept chasing the
gaps until search, SCM, debug, and custom editors all worked.

### What we shipped

- **Mountain.** We split `WindServiceHandlers` into 24 domain modules and
  `CocoonService` into 15 submodules, landed 18 CocoonService handlers and 14
  language-feature RPC methods, and rolled the `dev_log!` macro across 170 files
  so every IPC arm tags into a tag-filterable stream.
- **Cocoon.** We split `GRPCServerService` into 7 dedicated handlers and the
  `vscode` API shim into 10 namespaces (`Window`, `Workspace`, `Languages`,
  `Commands`, `Env`, `Scm`, `Debug`, `Tasks`, `Authentication`, `Extensions`),
  wired workspace events, and added document-content mirroring so extensions
  reading `vscode.workspace.openTextDocument` see the same bytes the editor
  does.
- **Wind.** We finalised 24 IPC channel routes and 5 streaming `listen()`
  subscriptions, all verified end-to-end against Mountain.
- **Sky.** We disabled workspace-trust prompts across our five build profiles
  (the prompt flow assumes Electron's window-managed dialogs) and wired the
  telemetry bridges to OpenTelemetry locally and PostHog for opt-in product
  analytics.
- **Common.** We grew the `ProviderType` enum to 33 variants covering every
  contribution point we forward, and finished the PascalCase rename so every
  Rust identifier in the workspace matches our project convention.

Those handler trees are
[`Source/IPC/WindServiceHandlers`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/WindServiceHandlers)
and
[`Source/RPC/CocoonService`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/RPC/CocoonService).

```rs
pub enum ProviderType {
	Completion = 0,
	Hover = 1,
```

> [!NOTE]
>
> Each variant is a contribution point Cocoon can forward, which is why the
> enum grows every time a language feature lands.

### Search, SCM, debug, custom editor

We took these from "renders empty" to "fully working" inside this sprint window:

- **Search panel** populates from a real walk: 8775 files / 139895 line-matches
  in 3.2 s on the Land workspace. We exposed the bundled `URI` constructor on
  the workbench accessor so result rows carry real URI instances (the panel's
  dedup map calls `uri.with(...)`, which a POJO can't satisfy), enabled
  `line_number(true)` on the ripgrep-flavour searcher so every match carries a
  line number, and reshaped the find-files cache into an LRU keyed on
  `(folders, include, exclude, cap, flags)`.
- **SCM** ships a single stable provider handle per repo. We aligned Cocoon's
  sequential handle allocator with Mountain's marker maps so
  `register_scm_resource_group` and `update_scm_group` notifications resolve
  into the same provider entry instead of warning "unknown provider handle: N"
  for every group update. The git extension reads configuration without
  `undefined`, status, refs and diffs all arrive, and 36 SCM providers register
  cleanly across the monorepo's submodules.
- **Debug + custom editors.** We finished the wire shapes for
  `$resolveCustomEditor`, the `sky://command/*` family, and the debug
  configuration provider, then audited every Cocoon↔Mountain DTO boundary for
  `camelCase` consistency end-to-end.
- **DualTrack.** We added the `LAND_DEFER_RUST*` environment knobs so any
  method, any domain, or all traffic can be A/B-routed between Mountain (Rust)
  and Cocoon (Node) at runtime - useful for isolating whether a regression sits
  in our Rust path or upstream's Node one.
- **Effect-TS Proxy fallback.** We wrapped all 10 `vscode.*` namespaces in a
  heuristic Proxy so any future API the workbench reaches for that we haven't
  shimmed yet surfaces as an audit log line under `[VSCODE-API-GAP]` instead of
  a `TypeError` that crashes the host. The classifier infers the right shape
  from the property name: `requestResourceTrust` returns `true`, `onDid…`
  returns a noop disposable, `register…` returns a disposable,
  `is…`/`has…`/`should…` returns `false`, `create…`/`get…`/`make…` returns
  `undefined`.

The deferral logic now lives in
[`Source/Services/Dual/Track.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Services/Dual/Track.ts),
and the heuristic Proxy in
[`Source/Services/Handler/VscodeAPI/Wrap/Namespace/With/Heuristics.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Services/Handler/VscodeAPI/Wrap/Namespace/With/Heuristics.ts).

```ts
export const IsRustDeferralEnabled = (Method: string): boolean => {
```

> [!NOTE]
>
> Every cross-process shim call passes through this predicate, which is what
> makes the Rust and Node paths switchable without a rebuild.

### Reliability fixes we landed in the same window

- **Extension type filtering and post-install activation.** Three bugs converged
  on the Extensions sidebar's "install succeeded but nothing happened" symptom.
  Our `getInstalled` handler was dropping the `ExtensionType` filter (0=System,
  1=User), so every call returned the full list marked
  `type: 0, isBuiltin: true` and VSIX-installed extensions never appeared under
  Installed with an Uninstall action. The post-install path wasn't firing
  `onStartupFinished` after `$deltaExtensions`, so extensions with that
  activation event registered but stayed dormant. And the IPC switch wasn't
  routing `extensions:scanSystemExtensions` / `extensions:scanUserExtensions` to
  `getInstalled` with the right type filter. We fixed all three together: VSIX
  extensions show up under Installed, activate immediately, and the sidebar
  refresh works on first install.
- **Manifest fields always emitted, VSIX preview without extraction.** The
  workbench's trusted-publishers migration calls
  `manifest.publisher.toLowerCase()` unconditionally at boot. We were
  suppressing empty fields via `skip_serializing_if`, so a publisher-less
  manifest crashed the renderer with `TypeError: undefined is not an object`. We
  dropped the guard on `Name`, `Version`, and `Publisher`, then injected
  explicit `"unknown"` fallbacks at the IPC envelope so the renderer always sees
  a string. We also added an `extensions:getManifest` handler that reads
  `extension/package.json` straight from a `.vsix` archive, enabling the
  Install-from-VSIX preview dialog without disk extraction.
- **Eager log initialization.** We moved log-file creation to binary startup so
  a session log exists before any panic, preserving post-mortem evidence. We
  also fixed the binary-signature splitter so PascalCase segments like
  `ElectronProfile` produce `electron.profile` and logs land in the right
  app-data directory.
- **Atomic shutdown guard.** Mountain's graceful shutdown was running twice:
  `app_handle.exit(0)` at the end of the first pass made Tauri re-deliver
  `ExitRequested { code: Some(0) }`, the shutdown task re-entered, tried to
  SIGKILL an already-dead Cocoon, and logged spurious tcp-connect errors. An
  atomic guard in the Tauri entry blocks the second pass.
- **Static asset path resolution.** We extended path resolution to accept both
  `/Static/Application/` (absolute) and `Static/Application/` (relative) forms.
  The WKWebView WASM loader (used by `vscode-oniguruma` → `onig.wasm`) strips
  the leading slash before reaching our `file:read` handler, which used to fail
  with `ENOENT` and broke TextMate syntax highlighting for every grammar.
- **Build identifiers.** We landed a two-step rename - first to a verbose
  profile-tagged binary name, then back to the clean `Mountain` identifier - to
  align our Cargo and Tauri config with the new build pipeline. Same window: we
  updated the `posthog-rs` 0.5 API call (`api_endpoint()` → `host()`) and
  migrated `sha2` 0.11's removed `LowerHex` impl to `hex::encode()` in our
  session-id hash, and added `vscode-file://vscode-app` to the CSP `img-src`
  list so VS Code's internal file protocol resolves images.

The channel name for the VSIX reader is registered in
[`Source/IPC/Channel.rs`](https://github.com/CodeEditorLand/Common/tree/Current/Source/IPC/Channel.rs).

```rs
ExtensionsGetManifest                         => "extensions:getManifest",
```

> [!NOTE]
>
> That mapping is what lets the preview dialog read a manifest without ever
> extracting the archive to disk.

---

## [v2.0] - Editor Launch

We took the editor from "compiles" to "boots and renders," landing the first
end-to-end run of the workbench in our Tauri webview against a live Cocoon
extension host.

- **Mountain.** We grew to 351 Rust files, exposed 70+ gRPC RPCs, and organised
  the IPC surface into 24 domain modules. We landed the terminal PTY substrate,
  secret storage with AES-256-GCM, TLS, and the first OpenTelemetry + PostHog
  telemetry plumbing.
- **Cocoon.** We composed 7 Effect-TS layers (~2,325 lines) - Tracer, Telemetry,
  Mountain client, vscode-API factory, extension-host, bootstrap, transport -
  and wrote the gRPC client (~1,206 lines) fronting all 70+ RPCs the Rust side
  serves. The `ModuleInterceptor` (~493 lines) became our `require('vscode')`
  entry point so every extension module loads through one shim, and we settled
  on 13 service interfaces as the stable contract.
- **Wind.** We delivered our first `TauriMainProcessService` (the
  `IMainProcessService` replacement that swaps Electron's IPC for our
  Tauri-backed channel proxy), the renderer-side `Preload.ts`, and a
  `Bootstrap/Types/` directory mirroring 30+ VS Code interfaces we rely on at
  the type boundary. Added `DevLog.ts` so the renderer emits the same
  tag-filtered stream as the Rust side.
- **Sky.** We migrated to Astro 6, TypeScript 6, and Vite 8.
- **Common.** We renamed the crate to `CommonLibrary` and shipped the Transport
  Registry abstraction that lets us swap between gRPC, WebSocket, and in-process
  transports without touching call sites.
- **Output.** We compiled the VS Code source tree to 4,287 JS files (~169 MB),
  wrote 6 polyfill modules (~5,200 lines) for browser APIs the workbench expects
  but WKWebView omits, and adopted an ESBuild dual-compiler pattern so the
  bundled and unbundled paths share the same transform pipeline.
- **Rest.** We migrated from SWC to OXC across 7 transform modules and grew the
  regression suite to ~3,800 lines so each rewrite the bundler does is
  shape-checked before it lands.
- **Air.** We got 73 Rust modules into shape, including the DNS resolver and 35
  closed TODOs from the prior cycle.
- **Maintain.** We split `Build.rs` across 5,008 lines / 55 files and replaced
  the inline build-script glue with Rhai-driven configuration so build profiles
  can be tuned without rebuilding the build tool itself.

The service that replaced Electron's IPC is
[`Source/Service/TauriMainProcessService.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Service/TauriMainProcessService.ts).

```ts
 * Drop-in replacement for VS Code's ElectronIPCMainProcessService.
 * Routes channel.call() through Tauri invoke to Mountain's WindServiceHandlers.
```

> [!NOTE]
>
> The module header states the swap exactly: same channel API, Tauri transport
> underneath.

## [v1.3] - Dependency Maintenance

We held the platform steady while we planned the next push. We rolled Effect-TS
to 3.19.x, Astro to 5.15-5.16, and TypeScript to 5.9.x; kept the Cloudflare
Workers types and Wrangler 4.x in lock-step; and otherwise stayed in
stabilisation mode across every component.

## [v1.2] - Full-Stack Integration

We shipped the heaviest single quarter of the project so far. Mountain gained
556 commits (464 in a single month) and put every core module in place - gRPC
handlers, WebSocket, terminal, storage, diagnostics, configuration.

Cocoon landed 647 commits and roughly 229K lines on top of Effect-TS 3.17.x.
Wind landed 537 commits and ~226K lines wiring its Effect-TS services to
Mountain. Common added 7,418 lines of Rust DTOs and trait surfaces. Echo's
work-stealing scheduler reached the API refinement we'd been targeting, with
priority lanes still on the roadmap for a later cycle.

## [v1.1] - Architecture Buildout

We brought the extension-host into existence. Cocoon was created from scratch
(291 commits, ~32,982 lines) as the Effect-TS-driven sidecar that replaces
Electron's utility-process model. Wind pivoted to Effect-TS at the end of May;
we ended the quarter with 370 TypeScript files.

Sky stood up the Tauri-hosted workbench bootstrap and shipped keyboard layouts
for 37 locales. The Worker element gained service- worker caching plus
on-the-fly CSS transpilation. Grove and Mist moved from concept into
architecture planning, ready to be implemented the moment the rest of the stack
stabilised. We also publicly announced our funding
from the NLnet NGI0 Commons Fund this quarter.

## [v1.0] - Integration Phase

We migrated Astro 4 → 5, TypeScript 5.7 → 5.8, and pulled Vite to 6.x across
every package. Mountain's `ApplicationState` reorganisation landed (renaming
`app_state` → `ApplicationState`, normalising 12 DTOs, and exporting a
`Knowledge.dot` dependency graph we still generate from CI). The Turborepo +
pnpm workspace stabilised - clean incremental builds, predictable cache keys, no
more "rebuilds the world" surprises.

## [v0.2] - Architecture Solidification

We brought Output into the project: ~32K+ JS files lifted from the VS Code
source tree, ready for the transform pipeline we'd build out in the next cycle.
Mountain gained the Android Gradle scaffolding and an 11,162-line mobile schema,
plus the `Cargo.toml` feature-flag family (`AirIntegration`,
`ExtensionHostCocoon`, …) that controls what we link in per profile. We finished
importing the VS Code module tree as proper git submodules under `Dependency/`.

## [v0.1] - Rapid Development

We laid down the bones. Mountain: 168 commits, ~28K lines of Rust, Tauri 2.x
scaffold, the first gRPC scaffolding. Sky: 600 commits covering Astro + React +
Firebase. Wind: 166 commits, Monaco editor mounted, SCSS-based styling. Echo:
334 commits delivering a sequence-based task scheduler on top of
`crossbeam-deque`. Rest was created on September 14 (33 files, the first
SWC-driven compiler shape). We also did our biggest schema reduction in Mountain
in the same window: 8,467 → ~1,000 lines (a 78 % cut).

## [v0.0] - Project Inception

We set up the monorepo. `Element/` and `Dependency/` as git submodules with
`.gitmodules: ignore = all` so a stray `git add .` doesn't convert submodule
gitlinks to trees. The `Cargo.toml` workspace covered Common, Echo, Maintain,
Mountain, Air, Grove, Mist, Rest, SideCar, plus `tauri-plugin-localhost`.

The `pnpm-workspace.yaml` covered
`Dependency/{Biome,Microsoft,OXC, Rolldown,SWC,Tauri,Vercel}/NPM/**`,
`Element/**`, and `!**/Target/**`. We adopted the `turbo.json` task definitions
with global env passthrough (`ANDROID_HOME`, `JAEGER_VERSION`, our shared API
keys, Apple signing identifiers, …), wired GitHub Actions and Dependabot, and
adopted PascalCase as the project-wide naming convention.

We chose Biome as our TypeScript formatter and rustfmt-nightly as our Rust
formatter. Mountain's Tauri scaffold landed in June, Sky's Astro 4 baseline in
April, and Common's first Workers library shape went up in April too.
