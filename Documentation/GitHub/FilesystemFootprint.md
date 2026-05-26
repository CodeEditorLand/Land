# Land / FIDDEE Filesystem Footprint

This document enumerates every host-filesystem location the running editor reads
from or writes to. It is the source of truth for cleanup, versioning, packaging,
and encapsulation work. Both Land (Tauri shell + workbench wiring) and the
bundled VS Code dependency are ours to modify, so the document also calls out
where today's layout is incidental rather than required.

---

## Table of Contents

1. [Overview](#overview)
2. [The bundle-identifier story](#the-bundle-identifier-story)
3. [The user-dotfile root - `~/.fiddee/`](#the-user-dotfile-root---fiddee)
4. [Legacy fan-out - `~/.land/extensions/`](#legacy-fan-out---landextensions)
5. [Tauri-resolved Library paths - `~/Library/Application Support/<bundle>/` and siblings](#tauri-resolved-library-paths---libraryapplication-supportbundle-and-siblings)
6. [OS-managed Library paths](#os-managed-library-paths)
7. [Temp-directory writes](#temp-directory-writes)
8. [Foreign-tool directories Land creates](#foreign-tool-directories-land-creates)
9. [Webview-persisted state - localStorage / cookies / IndexedDB](#webview-persisted-state---localstorage--cookies--indexeddb)
10. [Build-time artefacts (developer-only)](#build-time-artefacts-developer-only)
11. [Path-shaping environment variables](#path-shaping-environment-variables)
12. [Write-site index](#write-site-index)
13. [Lifecycle and growth](#lifecycle-and-growth)
14. [Today's cleanup recipe](#todays-cleanup-recipe)
15. [Cross-cutting observations](#cross-cutting-observations)
16. [Potential expansion - encapsulation directions](#potential-expansion---encapsulation-directions)
17. [Versioning sketch](#versioning-sketch)
18. [Related documentation](#related-documentation)

---

## Overview

State the running editor produces splits across four ownership domains:

| Domain                 | Owner             | Path family                                      | Survives uninstall? |
| ---------------------- | ----------------- | ------------------------------------------------ | ------------------- |
| Product dotfile        | Land code         | `~/.fiddee/`                                     | yes (intentional)   |
| Workbench userdata     | Bundled VS Code   | `~/Library/Application Support/<bundle>/`        | yes (intentional)   |
| Webview / system state | OS / WKWebView    | `~/Library/WebKit/<bundle>/`, plist, Saved State | yes (OS rules)      |
| Build / temp / scratch | Toolchain / shell | `<tmp>/land-*`, `Element/*/Target/`              | no, but not pruned  |

Three observations follow from this split and inform every entry below.

- The bundled VS Code expects a per-instance `app_data_dir`-style root
  (settings, keybindings, profiles). Land lets Tauri resolve that root, so it
  lives under `~/Library/Application Support/<bundle>/` (macOS) - one tree per
  build profile.
- Land's own product state - extensions, recents, per-extension storage - lives
  under `~/.fiddee/`, shared across every build profile of the editor a user
  runs.
- The webview half (Sky workbench) writes through WKWebView, so its persisted
  state lands in OS-controlled directories (`Library/WebKit`,
  `Library/HTTPStorages`, `Library/Preferences/<bundle>.plist`,
  `Library/Saved Application State`). Land cannot rename those locations but can
  configure what the webview writes into them.

Each section below pins the producing code so the doc is regenerable from the
source on demand.

## The bundle-identifier story

The Tauri `identifier` is what every `PathResolver` call uses as the leaf
segment of `~/Library/Application Support/<id>/`, `~/Library/Caches/<id>/`,
`~/Library/Logs/<id>/`, and `~/Library/Preferences/<id>.plist`. Today's
identifiers are long because each Maintain build profile encodes its full
configuration matrix into the value. Examples observed in the wild:

| Profile                  | Identifier                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug-electron-bundled` | `land.editor.binary.development.node.environment.microsoft.vscode.dependency.node.22.bundle.clean.debug.electron.profile.esbuild.compiler.mountain`  |
| `release`                | `land.editor.binary.production.node.environment.microsoft.vscode.dependency.node.22.bundle.clean.compile.electron.profile.esbuild.compiler.mountain` |
| Browser variants         | `...browser.debug.mountain`, `...browser.mountain`, ...                                                                                              |

Source of truth: `Element/Mountain/tauri.conf.json` (per-profile via Maintain
templating).

Two consequences:

- A user who runs both debug and release accumulates two parallel Library
  trees - one tree of caches and logs per profile.
- Inversely, Mountain's `IPC/DevLog/AppDataPrefix.rs::DetectAppDataPrefix` does
  a runtime `read_dir` of `~/Library/Application Support/` looking for the
  directory whose name starts with `land.editor.` and contains `mountain`. The
  match returns its own bundle identifier - so when DevLog needs to write a
  session log, it discovers the path rather than hard-coding it. This is what
  makes the editor robust against identifier changes from Maintain regenerating
  `tauri.conf.json`.

A shorter, stable bundle identifier (e.g. `cloud.fiddee.editor` or
`editor.fiddee.binary`) would fold all profile-specific differences into a
per-profile subdirectory and make uninstall a one-line `rm -rf`. Not done today.

## The user-dotfile root - `~/.fiddee/`

Centralised by
`Element/Mountain/Source/IPC/WindServiceHandlers/Utilities/FiddeeRoot.rs`
(`DOTFILE_NAME = ".fiddee"`). Every Land call site resolves sub-paths through
this atom so future renames touch a single file.

| Path                                                 | Producer                                                                                                             | Purpose                                                                                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~/.fiddee/extensions/<publisher>.<name>-<version>/` | `ExtensionManagement/VsixInstaller.rs::InstallVsix`                                                                  | Primary user-extension root. VSIX archive extraction target. Sets `chmod 755` on platform binaries (`HealExecutableBits`).                                                    |
| `~/.fiddee/extensions/<id>/.storage/`                | `Cocoon/Source/Services/Extension/Context.ts:495`                                                                    | Per-extension persistent state. Written **inside** the extension's own directory. Survives the extension's own version bump as long as the extension reads back the same key. |
| `~/.fiddee/extensionStorage/<extId>/`                | `Cocoon/Source/Services/Handler/Extension/Host/ActivateExtension.ts:51`                                              | Per-extension workspace-scoped storage path passed to `context.storageUri`. mkdir'd at activation.                                                                            |
| `~/.fiddee/globalStorage/<extId>/`                   | `Cocoon/.../ActivateExtension.ts:52` + `Extension/Context.ts:495` (override: `VSCODE_COCOON_GLOBAL_STORAGE`)         | Per-extension global storage path passed to `context.globalStorageUri`. mkdir'd at activation.                                                                                |
| `~/.fiddee/logs/<extId>/`                            | `Cocoon/.../ActivateExtension.ts:53`                                                                                 | Per-extension log directory passed to `context.logUri`. mkdir'd at activation.                                                                                                |
| `~/.fiddee/workspaces/RecentlyOpened.json`           | `Mountain/.../Utilities/RecentlyOpened.rs::Mutate` + `State/WorkspaceState/WorkspaceDelta.rs::PersistRecentlyOpened` | Up to 50 most-recent workspace folder URIs with labels. Pretty-printed JSON.                                                                                                  |
| `~/.fiddee/data/`                                    | (planned)                                                                                                            | Not yet wired. Reserved for the background daemon's persistent data.                                                                                                          |

Total typical footprint after a few months of use, dominated by the extensions:
1-5 GB depending on which language servers are installed.

## Legacy fan-out - `~/.land/extensions/`

Added to the scan-path registry on 2026-05-26
(`Binary/Extension/ScanPathConfigure.rs` T3 fix) and recognised by
`Scanner::IsUserExtensionScanPath`. The path is **read-only** - new VSIX
installs land under `~/.fiddee/extensions/`, never here. Existing installs in
`~/.land/extensions/` are still scanned and activated until the user (or a
future migration step) moves them.

The legacy path is documented because:

1. Many pre-rename installs still live there and removing the scan would break
   them.
2. Cleanup recipes that target only `~/.fiddee/` will miss legacy installs.

Retirement plan (deferred): one-shot migration that moves `~/.land/extensions/*`
→ `~/.fiddee/extensions/`, then removes the scan path.

## Tauri-resolved Library paths - `~/Library/Application Support/<bundle>/` and siblings

Resolved at runtime via `tauri::path::PathResolver`. **Per-profile** (one tree
per Maintain bundle identifier). These are the locations the bundled VS Code
expects under `--user-data-dir` semantics.

Seeded on first boot by `Binary/Main/AppLifecycle.rs:300-450` (creates every
directory below + writes default JSON files). Subsequent boots only fill new
entries.

### `app_data_dir()` -> `~/Library/Application Support/<bundle>/`

| Path                                                                                 | Producer                                                                   | Purpose                                                                                                                          |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `machine-id.txt`                                                                     | `ProcessManagement/InitializationData.rs::get_or_generate_machine_id`      | Stable per-install UUID. Surfaced to extensions as `vscode.env.machineId`. Generated once with `Uuid::new_v4()`, then persisted. |
| `User/settings.json`                                                                 | `AppLifecycle.rs:441` (seeds `{}`), then user / workbench edits            | VS Code user settings.                                                                                                           |
| `User/keybindings.json`                                                              | `AppLifecycle.rs:442` (seeds `[]`)                                         | Keybinding overrides.                                                                                                            |
| `User/tasks.json`                                                                    | `AppLifecycle.rs:443` (seeds `{}`)                                         | Tasks definitions.                                                                                                               |
| `User/extensions.json`                                                               | `AppLifecycle.rs:444` (seeds `[]`)                                         | Extension recommendations.                                                                                                       |
| `User/mcp.json`                                                                      | `AppLifecycle.rs:445` (seeds `{}`)                                         | MCP server registry.                                                                                                             |
| `User/globalStorage/`                                                                | VS Code workbench + Mountain `StorageProvider.rs`                          | Per-extension `Memento`-backed globalState. JSON-per-extension.                                                                  |
| `User/workspaceStorage/<workspaceId>/`                                               | VS Code workbench                                                          | Per-workspace state.                                                                                                             |
| `User/workspaceStorage/vscode-chat-images/`                                          | (chat panels)                                                              | Inline chat image cache.                                                                                                         |
| `User/profiles/__default__profile__/`                                                | Workbench profile system                                                   | Profile-scoped settings overlay.                                                                                                 |
| `User/snippets/`                                                                     | Workbench                                                                  | User-defined snippets.                                                                                                           |
| `User/prompts/`                                                                      | (chat surfaces)                                                            | Saved chat prompts.                                                                                                              |
| `User/extensions/`                                                                   | (workbench dependency expectation)                                         | mkdir'd but Land routes installs to `~/.fiddee/extensions/`.                                                                     |
| `User/caches/`                                                                       | Workbench                                                                  | Misc workbench caches.                                                                                                           |
| `CachedConfigurations/defaults/__default__profile__-configurationDefaultsOverrides/` | Workbench configuration system                                             | Computed defaults overlay cache.                                                                                                 |
| `logs/<YYYYMMDDTHHMMSS>/Mountain.dev.log`                                            | `IPC/DevLog/WriteToFile.rs::ResolveLogDirectory` (via `AppDataPrefix::Fn`) | Per-session timestamped Rust-side log. **Not pruned today.**                                                                     |
| `logs/window1/output_*`                                                              | Workbench `LogService`                                                     | Per-window workbench-side log files. Seeded directory is `logs/window1/` only; workbench creates the timestamped files inside.   |

The hard-coded fallback `~/Library/Application Support/Land/` in
`Utilities/UserdataDir.rs:30` is only reached when the OnceLock `BASE_DIR` is
not set, which would mean `AppLifecycle::Dirs` hasn't run. Under normal launch
the bundle-identifier-qualified path wins.

### `app_log_dir()` -> `~/Library/Logs/<bundle>/`

Tauri's PathResolver default. Today the editor writes its main session log to
`app_data_dir/logs/<ts>/Mountain.dev.log` (above), not into `app_log_dir`. The
`app_log_dir` path is still created by macOS for crash-report relay and
occasional Tauri internal writes.

### `app_cache_dir()` -> `~/Library/Caches/<bundle>/`

Tauri runtime + webview asset caches. Largest single bucket after extensions
(200+ MB after a few sessions). Not pruned by the application.

### `app_config_dir()` -> `~/Library/Application Support/<bundle>/` (macOS only)

macOS folds `app_config_dir` into `app_data_dir`. Producers:

- `Environment/ConfigurationProvider/Loading.rs`, `UpdateValue.rs`,
  `InspectValue.rs` - settings.json reads / writes (overlap with
  `User/settings.json` above).
- `Environment/KeybindingProvider.rs` - keybindings.json reads / writes.

On Linux these would split (`~/.config/<bundle>/` vs
`~/.local/share/<bundle>/`); the code is portable through Tauri's resolver, only
the destination changes.

## OS-managed Library paths

These are created and managed by macOS / Tauri / WKWebView. Land does not
control the path, but its presence is a side effect of running.

| Path                                                     | Owner                   | Purpose                                                                                              |
| -------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `~/Library/Preferences/<bundle>.plist`                   | macOS NSUserDefaults    | Window position, recent docs, Tauri-set defaults. Cocoa-managed binary plist.                        |
| `~/Library/WebKit/<bundle>/`                             | WKWebView               | Webview-side localStorage, IndexedDB, ServiceWorker caches. 50-400 MB typical.                       |
| `~/Library/HTTPStorages/<bundle>/`                       | URLSession              | HTTP cookies and credentials (when URLSession is used). Empty if the webview handles all networking. |
| `~/Library/Saved Application State/<bundle>.savedState/` | AppKit                  | Window restoration data when `NSQuitAlwaysKeepsWindows` is enabled.                                  |
| `~/Library/Logs/DiagnosticReports/<bundle>*.crash`       | macOS diagnostic engine | Crash reports (system-managed, written on crash only).                                               |
| `~/Library/Logs/<bundle>/`                               | Tauri PathResolver      | Created by `app_log_dir()`; usually empty in our setup.                                              |

These survive an
`rm -rf ~/.fiddee && rm -rf '~/Library/Application Support/<bundle>'`. A
complete uninstall must enumerate all five.

## Temp-directory writes

`std::env::temp_dir()` on macOS resolves to `$TMPDIR` (a per-user
`/var/folders/<XX>/T/`). Three writers leak into it today, none of which are
pruned by the editor.

| Path                                        | Producer                                                                                    | Lifetime                                                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<tmp>/land-zsh-integration-<pid>/.zshrc`   | `Environment/Terminal/ShellIntegration.rs:98`                                               | Per integrated-terminal launch. Process-scoped name, but the file lingers after the shell exits. macOS sweeps `$TMPDIR` infrequently; user accumulates one directory per terminal launch. |
| `<tmp>/vine_fallback.proto`                 | `Cocoon/Services/Mountain/Client/Service.ts:556` and `Services/gRPC/Server/Service.ts:1663` | Per gRPC client init when the bundled proto resource is missing. Overwritten on each init; not deleted.                                                                                   |
| `<tmp>/land-editor-logs/<YYYYMMDDTHHMMSS>/` | `IPC/DevLog/WriteToFile.rs:84`                                                              | **Fallback only.** Used when `AppDataPrefix::Fn()` cannot resolve a bundle identifier. Normally empty.                                                                                    |

`Element/Sky/Source/Function/Sky/Bridge.ts` does not write to disk directly; the
`localStorage` keys it sets are persisted by WebKit under
`~/Library/WebKit/<bundle>/` (see
[Webview-persisted state](#webview-persisted-state---localstorage--cookies--indexeddb)).

## Foreign-tool directories Land creates

`Binary/Main/AppLifecycle.rs:393` pre-creates two directories that belong to
other tools, so that VS Code's startup `stat` probes don't log errors:

- `~/.claude/agents/` - Claude Code's agent directory.
- `~/.copilot/agents/` - GitHub Copilot's agent directory.

Land does not write to either path - only `mkdir -p`. If the user does not have
those tools installed, these dirs nonetheless persist after Land's first boot.
Worth either gating behind a tier flag or making the workbench probe
failure-tolerant.

## Webview-persisted state - localStorage / cookies / IndexedDB

Sky writes via the WebKit storage APIs; the actual filesystem destination is
WKWebView's per-bundle storage tree (`~/Library/WebKit/<bundle>/`). Keys
observed:

| Key                  | Producer                                                                                                | Purpose                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `Disable`            | `Workbench/Bundled/Electron/Entry.ts`, `Sky/Bridge.ts`, `Sky/Function/SmokeTest/Auto/Diagnose/Input.ts` | UI-fix toggle. Survives reload.                                            |
| `Smoke`              | `Sky/Function/SmokeTest/Run/Command/Catalog/Smoke/Test.ts`                                              | Sticky smoke-test flag.                                                    |
| `PostHog distinctId` | `Workbench/Electron/Post/Hog/Bridge.ts`                                                                 | Per-install PostHog telemetry identifier (separate from `machine-id.txt`). |
| Workbench-internal   | VS Code workbench (LocalStorageService)                                                                 | Editor state, layout, opened editors, ...                                  |

The workbench writes a large amount of internal state through localStorage and
IndexedDB. None of it is enumerable from the source without runtime
introspection.

## Build-time artefacts (developer-only)

Not part of the user-install footprint, but cleared with the same intent during
fresh-build flows.

| Path                                                     | Purpose                                                                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Element/Mountain/Target/`                               | Rust build output (Cargo). Hundreds of MB to several GB depending on profile count.                                          |
| `Element/Mountain/Target/debug/extensions.manifest.json` | PreBake cache (built-in extension manifests). Re-emitted by `Maintain/Build/Manifest/PreBake.ts` on every build.             |
| `Element/Mountain/Target/Resources/extensions/`          | Bundled built-in extensions copied into the `.app`'s Resources tree. Read-only at runtime.                                   |
| `Element/Mountain/Target/<profile>/.../*.app`            | Built bundle. `Maintain/Script/SignBundle.sh` re-signs in place.                                                             |
| `Element/Sky/Target/`                                    | Astro / Vite build output (workbench + webview assets).                                                                      |
| `Element/<Other>/Target/`                                | Per-Element TypeScript compile output.                                                                                       |
| `Element/Mountain/Cargo.toml.Backup`                     | Build-script residue (Maintain wrappers rewrite + restore; sometimes the restore leaves a trailing diff). Open hygiene item. |

## Path-shaping environment variables

These let an operator redirect locations above without code changes. Names
follow the Land convention (single-word PascalCase verbs, no `LAND_` prefix -
see `EnvironmentVariables.md`).

| Var                            | Effect                                                                                                                                       | Read by                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Lodge`                        | Replaces `~/.fiddee/extensions` with an arbitrary absolute path.                                                                             | `Binary/Extension/ScanPathConfigure.rs:200`, `ExtensionManagement/Scanner.rs::IsUserExtensionScanPath` |
| `Extend`                       | Appends extra extension scan paths. POSIX `:`-separated, Windows `;`.                                                                        | `Binary/Extension/ScanPathConfigure.rs:245`                                                            |
| `MountainDir`                  | Override the Mountain element root for nested builds.                                                                                        | `Maintain/*/Build.sh`                                                                                  |
| `HOME` / `USERPROFILE`         | Fallback when `dirs::home_dir()` returns `None`.                                                                                             | `FiddeeRoot.rs:27`, `Utilities/UserdataDir.rs:25`, `IPC/DevLog/AppDataPrefix.rs:101`                   |
| `Record`                       | Gates whether `IPC/DevLog/WriteToFile.rs` writes to disk at all.                                                                             | `IPC/DevLog/WriteToFile.rs`                                                                            |
| `Trace`                        | Defines the dev-log tag filter. Indirectly controls log volume + therefore size.                                                             | `IPC/DevLog/*`                                                                                         |
| `VSCODE_COCOON_GLOBAL_STORAGE` | Override globalStorage root in Cocoon-side activation.                                                                                       | `Cocoon/Source/Services/Extension/Context.ts:491`                                                      |
| `ZDOTDIR`                      | Overridden per integrated-terminal launch with the temp dir from `ShellIntegration.rs:98`. The original is preserved in `LAND_ORIG_ZDOTDIR`. | `Environment/Terminal/ShellIntegration.rs`                                                             |

`Lodge` is today the only override for a user-state location. `app_data_dir`,
`app_log_dir`, `app_cache_dir` cannot be redirected without Tauri-level config
changes.

## Write-site index

A view of "which file writes where" for engineers tracing back from a path to
its producer.

| Producer                                                                                     | Writes                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppLifecycle.rs::Dirs` (Mountain)                                                           | All `~/Library/Application Support/<bundle>/User/*` seed dirs, default JSON files (`settings`, `keybindings`, `tasks`, `extensions`, `mcp`), `~/.claude/agents`, `~/.copilot/agents` |
| `IPC/WindServiceHandlers/Utilities/UserdataDir/Ensure.rs` (Mountain)                         | Same seed set as a fallback (idempotent with `AppLifecycle::Dirs`)                                                                                                                   |
| `InitializationData.rs::get_or_generate_machine_id` (Mountain)                               | `<app_data_dir>/machine-id.txt`                                                                                                                                                      |
| `IPC/DevLog/WriteToFile.rs` (Mountain)                                                       | `<app_data_dir>/logs/<ts>/Mountain.dev.log` or `<tmp>/land-editor-logs/<ts>/` fallback                                                                                               |
| `Utilities/RecentlyOpened.rs::Mutate`, `WorkspaceDelta.rs::PersistRecentlyOpened` (Mountain) | `~/.fiddee/workspaces/RecentlyOpened.json`                                                                                                                                           |
| `ApplicationState/Internal/Persistence/MementoSaver.rs` (Mountain)                           | `<app_data_dir>/...memento.json` (global memento)                                                                                                                                    |
| `ApplicationState/Internal/Persistence/MementoLoader/AttemptMementoRecovery.rs` (Mountain)   | `<memento>.json.backup` corruption-recovery sibling                                                                                                                                  |
| `ApplicationState/Internal/Persistence/MementoLoader/CreateCorruptedBackup.rs` (Mountain)    | `<memento>.json.corrupted.<YYYYMMDD_HHMMSS>` timestamped corruption snapshot                                                                                                         |
| `RunTime/Shutdown/SaveApplicationState.rs` (Mountain)                                        | Final global memento JSON flush on shutdown                                                                                                                                          |
| `Environment/StorageProvider.rs` (Mountain)                                                  | `<app_data_dir>/User/globalStorage/<extId>/state.json` per extension                                                                                                                 |
| `Environment/ConfigurationProvider/UpdateValue.rs` + `Loading.rs` (Mountain)                 | `<app_config_dir>/User/settings.json`                                                                                                                                                |
| `Environment/KeybindingProvider.rs` (Mountain)                                               | `<app_config_dir>/User/keybindings.json`                                                                                                                                             |
| `Environment/Terminal/ShellIntegration.rs` (Mountain)                                        | `<tmp>/land-zsh-integration-<pid>/.zshrc` (per-launch)                                                                                                                               |
| `ExtensionManagement/VsixInstaller.rs` (Mountain)                                            | `~/.fiddee/extensions/<id>/...` (VSIX extraction with executable-bit healing)                                                                                                        |
| `Cocoon/.../ActivateExtension.ts:51-53`                                                      | `~/.fiddee/extensionStorage/<extId>/`, `~/.fiddee/globalStorage/<extId>/`, `~/.fiddee/logs/<extId>/`                                                                                 |
| `Cocoon/.../Extension/Context.ts:495`                                                        | `~/.fiddee/extensions/<id>/.storage/` (in-bundle dir) + globalStorage                                                                                                                |
| `Cocoon/.../Mountain/Client/Service.ts:558`, `gRPC/Server/Service.ts:1664`                   | `<tmp>/vine_fallback.proto`                                                                                                                                                          |
| Sky workbench bundle (`Bridge.ts`, PostHog bridge, smoke-test bridge)                        | WKWebView localStorage / IndexedDB (under `~/Library/WebKit/<bundle>/`)                                                                                                              |

## Lifecycle and growth

### First boot

- `AppLifecycle::Dirs` mkdir's the full `<app_data_dir>/User/*` tree, the
  `~/.claude/agents` + `~/.copilot/agents` probe dirs, and seeds five empty JSON
  defaults.
- `get_or_generate_machine_id` writes `machine-id.txt` with a fresh UUID.
- `FiddeeRoot::Fn()` is resolved lazily; sub-paths are created on first use
  (extensions install, recently-opened write).
- WKWebView creates `~/Library/WebKit/<bundle>/` on first webview load; macOS
  creates `~/Library/Preferences/<bundle>.plist` on first NSUserDefaults read.

### Steady-state growth

- Extension installs: `~/.fiddee/extensions/<id>/` (and per-id
  `extensionStorage`, `globalStorage`, `logs` siblings).
- Logging: a fresh `<app_data_dir>/logs/<ts>/` directory per session (when
  `Record=1`). Sizes range from kilobytes (`Trace=` unset) to ~200 MB
  (`Trace=all` in our recent debug runs).
- Webview: localStorage / IndexedDB grow with workbench history, recent files,
  opened editors, chat messages, and extension webviews (Roo, Continue, GitLens
  hover state).
- Cache: `~/Library/Caches/<bundle>/` grows with WKWebView's resource cache and
  Tauri internal caches.

### Corruption-recovery side effects

When `MementoLoader` cannot deserialise a memento JSON:

1. `CreateCorruptedBackup.rs` writes `<file>.json.corrupted.<YYYYMMDD_HHMMSS>`
   (timestamped, so multiple corruption events accumulate).
2. `AttemptMementoRecovery.rs` may additionally write `<file>.json.backup`.
3. The original is then replaced with a fresh memento.

Useful for forensics but never pruned. Long-running installs will accumulate
`.corrupted.*` files alongside their mementos.

### Shutdown

`RunTime/Shutdown/SaveApplicationState.rs` flushes the global memento. No
`logs/<ts>/` rotation, no temp-dir cleanup. Whatever the process wrote during
its session remains in place for the next launch.

## Today's cleanup recipe

A complete state wipe today requires removing every path the editor writes. The
2026-05-26 cleanup walked the following:

```bash
# Per-profile Library trees (one per Maintain bundle identifier)
rm -rf "$HOME/Library/Application Support/"land.editor*
rm -rf "$HOME/Library/Caches/"land.editor*
rm -rf "$HOME/Library/Logs/"land.editor*
rm -rf "$HOME/Library/WebKit/"land.editor*
rm -rf "$HOME/Library/WebKit/vanilla.editor.land"
rm -f "$HOME/Library/Preferences/"land.editor*.plist
# Plus, when present:
# rm -rf "$HOME/Library/Application Support/Land"    # legacy hard-coded fallback
# rm -rf "$HOME/Library/Saved Application State/"land.editor*
# rm -rf "$HOME/Library/HTTPStorages/"land.editor*

# Product dotfile root (extensions + per-extension storage + recents)
rm -rf "$HOME/.fiddee"

# Legacy extensions root
rm -rf "$HOME/.land"

# Temp-dir leftovers (best-effort; macOS otherwise sweeps weekly)
rm -rf /var/folders/*/T/land-zsh-integration-* 2> /dev/null
rm -rf /var/folders/*/T/land-editor-logs 2> /dev/null
rm -f /var/folders/*/T/vine_fallback.proto 2> /dev/null

# Foreign-tool dirs Land pre-creates (only if Land is the sole creator)
# rmdir "$HOME/.claude/agents" "$HOME/.copilot/agents" 2>/dev/null

# In-tree developer artefacts
cd Land && find Element -maxdepth 2 -name Target -prune -exec rm -rf {} +
```

The 2026-05-26 archive copy preserved everything in column-1 plus the dotdirs to
`/Volumes/CORSAIR/Archive/ApplicationSupport/2026-05-26-fresh/`.

## Cross-cutting observations

- **Three log destinations.** `<app_data_dir>/logs/<ts>/Mountain.dev.log`
  (Mountain), `<app_data_dir>/logs/window1/output_*` (workbench),
  `~/.fiddee/logs/<extId>/` (per-extension via `context.logUri`). No central
  rotation, no max-size enforcement. Long-`Trace=all` debug sessions of ~200 MB
  per session compound quickly.
- **Two userdata bases per profile.** `~/Library/Application Support/<bundle>/`
  (Tauri, per-profile, holds machine-id + workbench userdata) coexists with
  `~/.fiddee/` (product, shared across profiles, holds extensions +
  per-extension storage). "Wipe the app's state" therefore requires touching
  both, plus four OS-managed locations.
- **Two extension roots.** `~/.fiddee/extensions/` (primary) +
  `~/.land/extensions/` (legacy). Both scanned; only the former is written.
- **Backup files accumulate.** `<state>.json.backup` and
  `<state>.json.corrupted.<ts>` are written but never pruned.
- **Temp-dir leakage.** `land-zsh-integration-<pid>` directories accumulate (one
  per integrated-terminal launch); `vine_fallback.proto` is overwritten in place
  but never removed.
- **Cocoon writes inside the extension bundle dir**
  (`~/.fiddee/extensions/<id>/.storage/`). Removing or version-bumping an
  extension destroys that state - subtle, since Land's three other storage paths
  (`extensionStorage`, `globalStorage`, `logs`) live outside the bundle and
  would survive a reinstall.
- **Bundle identifier explosion.** Each Maintain profile produces its own
  Library tree. A developer who runs debug, release, and a browser variant
  accumulates three full sets.
- **PostHog distinctId vs machineId.** Two separate per-install identifiers.
  `machine-id.txt` is generated server-side, durable across boots; the PostHog
  distinctId is generated by `Workbench/Electron/Post/Hog/Bridge.ts` and lives
  in WKWebView localStorage. Wipe one without the other and analytics will see
  two installs.

## Potential expansion - encapsulation directions

Each option is feasible because both Land and the bundled VS Code dependency are
ours to modify. None are decided plans; all should be costed against the work
above before implementation.

### A. Single product root (`~/.fiddee/<profile>/`)

Move `<app_data_dir>`, `<app_cache_dir>`, `<app_log_dir>`, and all Cocoon
storage paths under `~/.fiddee/<profile>/`. Replace Tauri's `app_data_dir()`
calls with an internal resolver that returns `~/.fiddee/<profile>/data/`,
`~/.fiddee/<profile>/cache/`, `~/.fiddee/<profile>/logs/`. Webview-managed paths
(Library/WebKit etc.) stay where macOS puts them. Uninstall becomes
`rm -rf ~/.fiddee` + a documented OS-managed cleanup script for the four sticky
Library entries.

Risks: Tauri's webview bridge expects `app_data_dir` to be the OS-blessed
location for some sandboxing-related operations. Needs an experiment to confirm
WKWebView still gets its keychain-equivalents when the userdata moves.

### B. Stable, short bundle identifier (`cloud.fiddee.editor`)

Stop encoding the build matrix into the Tauri identifier. Use a single
identifier and represent the profile as a subdirectory or env var. Per-profile
separation is preserved via `~/.fiddee/<profile>/` (option A) rather than via
separate Library trees. Reduces "uninstall =
`rm -rf <bundle> && rm -rf <bundle> && ...`" to a single path. Existing-install
migration is a one-shot Maintain script.

### C. Log rotation and retention

A single `~/.fiddee/<profile>/logs/<ts>/` tree (option A) opens the door to:

- Boot-time pruning of sessions older than `LogRetention=<days>`.
- Size-bounded ring buffers via the existing `IPC/DevLog/AppDataPrefix.rs`
  infrastructure.
- Per-tag retention overrides (e.g. keep `breaker` and `lifecycle` longer than
  `ipc-verbose`).

`Record=1` + `Trace=all` debug sessions today leave behind 200 MB per run
forever. The fix is mechanical once the log root is single-source.

### D. Versioned userdata schema

Stamp `~/Library/Application Support/<bundle>/User/.schema-version` (or
`~/.fiddee/<profile>/data/.schema-version`). Boot-time migrations move data
forward; backward-incompatible changes write to `User-v(N+1)/` and leave the
older snapshot for rollback. Today the userdata directory has no version marker,
so future format changes (e.g. mcp.json shape) have no recourse but in-place
rewrite.

### E. Tier parity for every location

`Lodge` lets operators redirect the user-extensions root. Add equivalent
overrides for every location:

| Existing                  | Proposed                               |
| ------------------------- | -------------------------------------- |
| `Lodge` (extensions root) | already done                           |
| -                         | `Lair` (workbench userdata root)       |
| -                         | `Hive` (logs root)                     |
| -                         | `Cache` (cache root)                   |
| -                         | `Storage` (per-extension storage root) |

Pair with the `EnvironmentVariables.md` registry. Useful for portable installs
(USB-stick FIDDEE) and for CI runners that should not accumulate state.

### F. Self-uninstall command

`fiddee --uninstall` (or a menu item) that walks this document's tables and
removes every path it owns, optionally archiving to `~/.fiddee-archive-<ts>/`
first. Matches the procedure the user ran on 2026-05-26 by hand. Could be wired
today.

### G. Foreign-tool probe tier-gate

`TierForeignToolProbe=Off` would stop `AppLifecycle::Dirs` from pre-creating
`~/.claude/agents` and `~/.copilot/agents`. Workbench-side, make the missing-dir
probe failure-tolerant so the create-on-startup is no longer needed. Default
tier value: `On` for backwards-compatible boot behaviour.

### H. Cocoon `.storage` move out-of-bundle

The current `~/.fiddee/extensions/<id>/.storage/` location ties per-extension
storage to the extension's own directory - reinstalls or version bumps destroy
it. Move to `~/.fiddee/extensionData/<id>/.storage/` (parallel to the existing
`extensionStorage` sibling) so storage survives extension lifecycle events.

### I. PostHog distinctId unification

Read `machine-id.txt` and use it as the PostHog distinctId, so analytics see one
identity per install. Avoid the divergence that today exists between Mountain's
`machineId` and Sky's `distinctId`.

## Versioning sketch

When the time comes to add versioning, the natural points are:

1. **`.schema-version` markers** at the root of each owned tree:
   `~/.fiddee/.schema-version`, `<app_data_dir>/User/.schema-version`,
   `<app_data_dir>/.machine-id-version`. Version-aware migrations run at boot
   when the marker is missing or stale.
2. **Per-document version fields** on every JSON file we write: `settings.json`,
   `keybindings.json`, `tasks.json`, `mcp.json`, `RecentlyOpened.json`, every
   memento file. Cheap to add today (write a `_v` key, ignore on read for now),
   expensive to retrofit later.
3. **Forward-compat shape rules**: anything we add to a JSON document is
   optional with a sane default; anything we remove from a document goes through
   a migration step.
4. **Rollback snapshots** stored under a versioned path (`User-v3/`, `User-v4/`)
   so a downgrade is plausible. Bounded by `RetainPreviousSchemaVersions=<N>`
   env var.

The combination of A (single product root) + D (schema versions) makes the
versioning story straightforward; without A, versioning has to be replicated
across all eight ownership domains.

## Related documentation

- `Land/Documentation/GitHub/EnvironmentVariables.md` - the canonical
  environment-variable registry. Add the proposed `Lair` / `Hive` / `Cache` /
  `Storage` / `TierForeignToolProbe` / `LogRetention` keys there if implemented.
- `Land/Documentation/GitHub/Building.md` - covers Maintain build profiles and
  how they produce the bundle identifiers enumerated above.
- `Land/Documentation/GitHub/Workflow/ApplicationStartupAndHandshake.md` - the
  boot sequence inside which `AppLifecycle::Dirs` runs.
- `Land/Element/Mountain/Source/IPC/WindServiceHandlers/Utilities/FiddeeRoot.rs` -
  the dotfile atom.
- `Land/Element/Mountain/Source/Binary/Main/AppLifecycle.rs` - the userdata
  seeder.
- `Land/Element/Mountain/Source/IPC/DevLog/AppDataPrefix.rs` - the runtime
  bundle-identifier discoverer.

Update this document when adding any new path, renaming a leaf, or retiring a
location. The write-site index is the most regenerable section - re-run the
source greps at the top of each tier-table entry when in doubt.
