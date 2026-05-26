<table>
	<tr>
		<td align="left" valign="middle">
			<h3 align="left">Filesystem Footprint&#x2001;📂</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">&#x2001;+&#x2001;</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://Land.PlayForm.Cloud" target="_blank">
					<picture>
						<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Land.svg">
						<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Land.svg">
						<img width="28" alt="Land Logo" src="https://PlayForm.Cloud/Image/GitHub/Land.svg">
					</picture>
				</a>
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://Land.PlayForm.Cloud" target="_blank">Land&#x2001;🏞️</a>
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">&#x2001;+&#x2001;</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">FIDDEE&#x2001;🎻</h3>
		</td>
	</tr>
</table>

---

# **Filesystem Footprint**&#x2001;📂

Every host-filesystem location the editor reads or writes, mapped to its
producing code, with cross-platform resolution and cleanup recipes.

<picture>
	<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/macOS-supported-black?labelColor=black&logoColor=white">
	<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/macOS-supported-white?labelColor=white&logoColor=black">
	<img src="https://img.shields.io/badge/macOS-supported-black?labelColor=black&logoColor=white" alt="macOS">
</picture>&#x2001;<picture>
	<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Linux-partial-black?labelColor=black&logoColor=white">
	<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/Linux-partial-white?labelColor=white&logoColor=black">
	<img src="https://img.shields.io/badge/Linux-partial-black?labelColor=black&logoColor=white" alt="Linux">
</picture>&#x2001;<picture>
	<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Windows-pending-black?labelColor=black&logoColor=white">
	<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/badge/Windows-pending-white?labelColor=white&logoColor=black">
	<img src="https://img.shields.io/badge/Windows-pending-black?labelColor=black&logoColor=white" alt="Windows">
</picture>

---

## Why This Document Exists&#x2001;🎯

Both Land (Tauri shell + workbench wiring) and the bundled VS Code dependency
are ours to modify. That means today's filesystem layout is incidental rather
than required - the doc enumerates what we touch so future work on **cleanup**,
**versioning**, **packaging**, and **encapsulation** has a single source of
truth to start from. The minimum-effect-over-the-system goal demands knowing
exactly where the side effects are.

---

## The Four Ownership Domains&#x2001;🗺️

| Status | Domain                 | Owner             | Path family                              | Survives uninstall? |
| :----- | :--------------------- | :---------------- | :--------------------------------------- | :------------------ |
| 🟢     | Product dotfile        | Land code         | `~/.fiddee/`                             | yes (intentional)   |
| 🟡     | Workbench userdata     | Bundled VS Code   | `<app_data_dir>/<bundle>/`               | yes (intentional)   |
| 🔴     | Webview / OS state     | OS / WKWebView    | `<webview-storage>/`, plist, Saved State | yes (OS rules)      |
| ⚪     | Build / temp / scratch | Toolchain / shell | `<tmp>/land-*`, `Element/*/Target/`      | no, but not pruned  |

Three observations follow from this split and inform every sub-document:

- The bundled VS Code expects a per-instance `app_data_dir`-style root
  (settings, keybindings, profiles). Tauri's `PathResolver` resolves it per-OS -
  so one tree per build profile, OS-specific leaf.
- Land's own product state lives under `~/.fiddee/` (cross-OS), shared across
  every build profile of the editor a user runs.
- The webview half writes through the OS-native webview, so its persisted state
  lands in OS-controlled directories. Land cannot rename those locations but can
  configure what the webview writes into them.

---

## The Bundle-Identifier Story&#x2001;🆔

The Tauri `identifier` is the leaf segment of every per-bundle path. Today's
identifiers encode each Maintain build profile's full configuration matrix into
a single string:

| Profile                  | Identifier                                                                                                                                           |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug-electron-bundled` | `land.editor.binary.development.node.environment.microsoft.vscode.dependency.node.22.bundle.clean.debug.electron.profile.esbuild.compiler.mountain`  |
| `release`                | `land.editor.binary.production.node.environment.microsoft.vscode.dependency.node.22.bundle.clean.compile.electron.profile.esbuild.compiler.mountain` |
| Browser variants         | `...browser.debug.mountain`, `...browser.mountain`, ...                                                                                              |

Source of truth: `Element/Mountain/tauri.conf.json` (per-profile via Maintain
templating).

Two consequences:

- A user who runs both debug and release accumulates two parallel per-bundle
  trees - one tree of caches and logs per profile.
- Mountain's `IPC/DevLog/AppDataPrefix.rs::DetectAppDataPrefix` does a runtime
  `read_dir` of the OS `<app_data_dir>` looking for the directory whose name
  starts with `land.editor.` and contains `mountain`. The match returns its own
  bundle identifier - so when DevLog needs to write a session log, it discovers
  the path rather than hard-coding it. This is what makes the editor robust
  against identifier changes from Maintain regenerating `tauri.conf.json`.

A shorter, stable bundle identifier (e.g. `cloud.fiddee.editor` or
`editor.fiddee.binary`) would fold all profile-specific differences into a
per-profile subdirectory and make uninstall a one-line `rm -rf`. Not done today.

---

## Document Index&#x2001;📑

The footprint splits across six focused documents. Read in order for a full
tour, or jump to whichever matches the task at hand.

| Document                                                                                     | Topic                                                                                | Lines |
| :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :---- |
| [`FilesystemFootprint/UserDotfile.md`](FilesystemFootprint/UserDotfile.md)                   | `~/.fiddee/` tree, `~/.land/` legacy, cross-OS resolution, Cocoon-side mirror        | 160+  |
| [`FilesystemFootprint/PlatformPaths.md`](FilesystemFootprint/PlatformPaths.md)               | Per-OS Library / XDG / AppData paths, OS-managed state, temp-dir conventions         | 280+  |
| [`FilesystemFootprint/PerElement.md`](FilesystemFootprint/PerElement.md)                     | Write-site index by Element (Mountain, Cocoon, Sky, Wind, Output, Air, SideCar, ...) | 240+  |
| [`FilesystemFootprint/EnvironmentVariables.md`](FilesystemFootprint/EnvironmentVariables.md) | Path-shaping env vars catalogued by Element + role                                   | 180+  |
| [`FilesystemFootprint/Cleanup.md`](FilesystemFootprint/Cleanup.md)                           | Per-OS cleanup recipes, archive pattern, what each `rm -rf` removes                  | 200+  |
| [`FilesystemFootprint/Encapsulation.md`](FilesystemFootprint/Encapsulation.md)               | Potential directions for compaction, versioning, self-uninstall, foreign-tool gating | 220+  |

---

## Cross-Cutting Observations&#x2001;🔍

- **Three log destinations.** Mountain session logs land in
  `<app_data_dir>/<bundle>/logs/<ts>/Mountain.dev.log`; workbench logs live in
  `<app_data_dir>/<bundle>/logs/window1/output_*`; per-extension logs in
  `~/.fiddee/logs/<extId>/`. No central rotation, no max-size enforcement.
  `Trace=all` debug sessions of ~200 MB compound quickly.
- **Two userdata bases per profile.** `<app_data_dir>/<bundle>/` (Tauri,
  per-profile, holds machine-id + workbench userdata) coexists with `~/.fiddee/`
  (product, shared across profiles, holds extensions + per-extension storage).
  "Wipe the app's state" requires touching both plus four OS-managed locations.
- **Two extension roots.** `~/.fiddee/extensions/` (primary) and
  `~/.land/extensions/` (legacy). Both scanned; only the former is written.
- **Two FIDDEE roots.** Mountain owns `~/.fiddee/` (dotfile, lowercase). The
  `Air` background daemon writes to `<config_dir>/FIDDEE/` (uppercase, under the
  OS config root). Different conventions; same product. Reconciliation is a
  Branch H encapsulation candidate.
- **Two install identifiers.** `<app_data_dir>/<bundle>/machine-id.txt`
  (Mountain UUID) is separate from the PostHog `distinctId` (Sky-side, lives in
  webview localStorage). Analytics see two identities per install.
- **Backup files accumulate.** Memento corruption recovery writes
  `<state>.json.backup` and `<state>.json.corrupted.<YYYYMMDD_HHMMSS>` siblings
  but never prunes them.
- **Temp-dir leakage.** `<tmp>/land-zsh-integration-<pid>/` accumulates (one per
  integrated-terminal launch); `<tmp>/vine_fallback.proto` is overwritten but
  never removed.
- **Cocoon writes inside the extension bundle dir**
  (`~/.fiddee/extensions/<id>/.storage/`). Removing or version-bumping an
  extension destroys that state - subtle, since Land's three other storage paths
  (`extensionStorage`, `globalStorage`, `logs`) live outside the bundle and
  would survive a reinstall.
- **Bundle identifier explosion.** Each Maintain profile produces its own
  per-bundle tree. A developer running debug, release, and a browser variant
  accumulates three full sets.

---

## Related Documentation&#x2001;📚

- [`EnvironmentVariables.md`](EnvironmentVariables.md) - the canonical
  environment-variable registry. Cross-referenced from
  [`FilesystemFootprint/EnvironmentVariables.md`](FilesystemFootprint/EnvironmentVariables.md).
- [`Building.md`](Building.md) - Maintain build profiles and how they produce
  the bundle identifiers enumerated above.
- [`BuildMatrix.md`](BuildMatrix.md) - the matrix of (profile, target, level)
  combinations that map to bundle identifier suffixes.
- [`Workflow/ApplicationStartupAndHandshake.md`](Workflow/ApplicationStartupAndHandshake.md)
    - the boot sequence inside which `AppLifecycle::Dirs` runs.

### Key source files&#x2001;🦴

| Concern                              | File                                                                              |
| :----------------------------------- | :-------------------------------------------------------------------------------- |
| Dotfile atom (Rust)                  | `Element/Mountain/Source/IPC/WindServiceHandlers/Utilities/FiddeeRoot.rs`         |
| Dotfile atom (Cocoon TS mirror)      | `Element/Cocoon/Source/Platform/FiddeeRoot.ts`                                    |
| Userdata seeder                      | `Element/Mountain/Source/Binary/Main/AppLifecycle.rs`                             |
| Userdata base resolver               | `Element/Mountain/Source/IPC/WindServiceHandlers/Utilities/UserdataDir/Ensure.rs` |
| Bundle-identifier runtime discoverer | `Element/Mountain/Source/IPC/DevLog/AppDataPrefix.rs`                             |
| Extension scan-path classifier       | `Element/Mountain/Source/ExtensionManagement/Scanner.rs::IsUserExtensionScanPath` |
| Per-extension storage seeder         | `Element/Cocoon/Source/Services/Handler/Extension/Host/ActivateExtension.ts`      |
| Per-extension in-bundle storage      | `Element/Cocoon/Source/Services/Extension/Context.ts`                             |
| Session log destination              | `Element/Mountain/Source/IPC/DevLog/WriteToFile.rs::ResolveLogDirectory`          |
| Air daemon root                      | `Element/Air/Source/Updates/mod.rs` (uses `<config_dir>/FIDDEE/`)                 |

Update this index and the relevant sub-document when adding any new path,
renaming a leaf, or retiring a location.
