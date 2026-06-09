<table>
	<tr>
		<td align="left" valign="middle">
			<h3 align="left">
				User Dotfile&#x2001;🏞️
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				&#x2001;+&#x2001;
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://editor.land" target="_blank">
					<picture>
						<source media="(prefers-color-scheme: dark)" srcset="https://editor.land/Dark/Image/GitHub/Land.svg" />
						<source media="(prefers-color-scheme: light)" srcset="https://editor.land/Image/GitHub/Land.svg" />
						<img width="28" alt="Land Logo" src="https://editor.land/Image/GitHub/Land.svg" />
					</picture>
				</a>
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://editor.land" target="_blank">
					Land&#x2001;🏞️
				</a>
			</h3>
		</td>
	</tr>
</table>

---

# **User Dotfile** 🏞️

The `~/.fiddee/` tree - Land's primary product-owned filesystem domain.

[← Back to Filesystem Footprint index](../FilesystemFootprint.md)

---

## At a Glance 🗺️

`~/.fiddee/` is centralised by **one atom**: `FiddeeRoot::Fn` (Rust) +
`FiddeeRoot()` (TypeScript). Every Land call site resolves sub-paths through
this atom so future renames touch a single file per Element.

| Source of truth     | File                                                                      |
| :------------------ | :------------------------------------------------------------------------ |
| Rust (Mountain)     | `Element/Mountain/Source/IPC/WindServiceHandlers/Utilities/FiddeeRoot.rs` |
| TypeScript (Cocoon) | `Element/Cocoon/Source/Platform/FiddeeRoot.ts`                            |
| Constant            | `DOTFILE_NAME = ".fiddee"`                                                |

---

## Cross-OS Resolution 🌐

The dotfile root resolves to the user's home directory with `.fiddee` appended:

| OS         | Resolves to                                           |
| :--------- | :---------------------------------------------------- |
| 🍎 macOS   | `$HOME/.fiddee/` → `/Users/<user>/.fiddee/`           |
| 🐧 Linux   | `$HOME/.fiddee/` → `/home/<user>/.fiddee/`            |
| 🪟 Windows | `%USERPROFILE%\.fiddee\` → `C:\Users\<user>\.fiddee\` |

`dirs::home_dir()` is the primary resolver; if it returns `None`, the code falls
back to `$HOME` then `$USERPROFILE` env vars (Windows uses the latter). A final
fallback to a relative `.fiddee` keeps callers receiving a valid `PathBuf`.

---

## Sub-Directory Map 🗂️

| Path                                           | Producer                                                                               | Purpose                                                                                                                    |
| :--------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `.fiddee/extensions/<publisher>.<name>-<ver>/` | `ExtensionManagement/VsixInstaller.rs::InstallVsix`                                    | Primary user-extension root. VSIX archive extraction target. Sets `chmod 755` on platform binaries (`HealExecutableBits`). |
| `.fiddee/extensions/<id>/.storage/`            | `Cocoon/Source/Services/Extension/Context.ts:495`                                      | Per-extension persistent state written **inside** the extension's own directory. Lost on reinstall or version bump.        |
| `.fiddee/extensionStorage/<extId>/`            | `Cocoon/Source/Services/Handler/Extension/Host/ActivateExtension.ts:51`                | Per-extension workspace-scoped storage path passed to `context.storageUri`. `mkdir`'d at activation.                       |
| `.fiddee/globalStorage/<extId>/`               | `Cocoon/.../ActivateExtension.ts:52` + `Extension/Context.ts:495` (env override below) | Per-extension global storage path passed to `context.globalStorageUri`. `mkdir`'d at activation.                           |
| `.fiddee/logs/<extId>/`                        | `Cocoon/.../ActivateExtension.ts:53`                                                   | Per-extension log directory passed to `context.logUri`. `mkdir`'d at activation.                                           |
| `.fiddee/workspaces/RecentlyOpened.json`       | `Mountain/.../Utilities/RecentlyOpened.rs` + `State/WorkspaceState/WorkspaceDelta.rs`  | Up to 50 most-recent workspace folder URIs with labels. Pretty-printed JSON.                                               |
| `.fiddee/data/`                                | (planned)                                                                              | Reserved for the background daemon's persistent data. Not yet wired.                                                       |

Typical footprint after a few months of use, dominated by extensions: **1 - 5
GB** depending on which language servers are installed.

---

## Storage-Path Override 🎛️

Cocoon respects one env var that re-roots part of the tree:

| Variable                       | Effect                                                               | Default                         |
| :----------------------------- | :------------------------------------------------------------------- | :------------------------------ |
| `VSCODE_COCOON_GLOBAL_STORAGE` | Replaces the globalStorage root resolution in `Extension/Context.ts` | `${FiddeeRoot()}/globalStorage` |

`Lodge` (the user-extensions override) and `Extend` (additional scan paths) do
**not** apply to the storage sub-trees - only to the extensions root. See
[`EnvironmentVariables.md`](EnvironmentVariables.md) for the full registry.

---

## Cocoon-Side Mirror 🪞

`Element/Cocoon/Source/Platform/FiddeeRoot.ts` exists so Node-side code does not
call back into Rust to resolve the path. The TypeScript implementation mirrors
the Rust resolution exactly:

```typescript
// Cocoon/Source/Platform/FiddeeRoot.ts
export default function FiddeeRoot(): string {
	const Home = process.env.HOME ?? process.env.USERPROFILE;
	if (Home) return `${Home}/.fiddee`;
	return ".fiddee";
}
```

Drift between the two implementations would manifest as Cocoon writing per-
extension storage to a different location than Mountain expects when scanning.
Keep them lockstep; the docstring on each file references the other.

---

## Legacy Fan-Out 🦴

| Path                  | Status                                             | Producer                                                                   |
| :-------------------- | :------------------------------------------------- | :------------------------------------------------------------------------- |
| `~/.land/extensions/` | 🟡 read-only scan, never written (additive legacy) | Scanned by `Binary/Extension/ScanPathConfigure.rs:227` (T3 2026-05-26 fix) |

Added to the scan-path registry on 2026-05-26 and recognised by
`Scanner::IsUserExtensionScanPath`. **Read-only** - new VSIX installs land under
`~/.fiddee/extensions/`, never here. Existing installs in `~/.land/extensions/`
are still scanned and activated until the user (or a future migration step)
moves them.

The legacy path is documented because:

1. Many pre-rename installs still live there and removing the scan would break
   them.
2. Cleanup recipes targeting only `~/.fiddee/` will miss legacy installs.

Retirement plan (deferred): one-shot migration that moves `~/.land/extensions/*`
→ `~/.fiddee/extensions/`, then removes the scan path.

---

## Lifecycle 📅

- **First boot:** `FiddeeRoot::Fn()` is resolved lazily. Sub-paths are created
  on first use (e.g. first extension activation creates the per-extension
  storage triple).
- **Extension install:** `VsixInstaller::InstallVsix` extracts archives to
  `.fiddee/extensions/<id>/`, then runs `HealExecutableBits` on `bin/`,
  `server/`, `tools/`, etc. to promote `0o644` → `0o755` on ELF / Mach-O /
  shebang files. One-shot per boot per path.
- **Extension activation:** Cocoon `ActivateExtension.ts` mkdir's the three
  sibling storage roots (`extensionStorage/<extId>`, `globalStorage/<extId>`,
  `logs/<extId>`). Then `Extension/Context.ts` mkdir's the in-bundle `.storage/`
  inside the extension's own directory.
- **Recently-opened update:** `WorkspaceDelta::PersistRecentlyOpened` updates
  `.fiddee/workspaces/RecentlyOpened.json` whenever a workspace folder is added.
  Truncated to 50 entries; pretty-printed.

---

## Open Questions ❓

- The `.fiddee/extensions/<id>/.storage/` location ties per-extension storage to
  the extension's own directory. Reinstalls or version bumps destroy that
  state - subtle, since the three sibling roots (`extensionStorage`,
  `globalStorage`, `logs`) live outside the bundle and survive lifecycle events.
  Encapsulation candidate: move to `.fiddee/extensionData/<id>/.storage/`
  parallel to the existing siblings. See [`Encapsulation.md`](Encapsulation.md)
  §H.
- `.fiddee/data/` is reserved but not yet wired. The background-daemon flow may
  bypass it entirely (Air uses `<config_dir>/FIDDEE/` instead - see
  [`PerElement.md`](PerElement.md) §Air for the divergence).

---

## See Also 📚

- [`PlatformPaths.md`](PlatformPaths.md) - per-OS Library / XDG / AppData paths
  that coexist with `~/.fiddee/`.
- [`PerElement.md`](PerElement.md) - which Element writes which sub-path.
- [`EnvironmentVariables.md`](EnvironmentVariables.md) - `Lodge`, `Extend`,
  `VSCODE_COCOON_GLOBAL_STORAGE` references.
- [`Cleanup.md`](Cleanup.md) - per-OS recipes that include `~/.fiddee/`.
