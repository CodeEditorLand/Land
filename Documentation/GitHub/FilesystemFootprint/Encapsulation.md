<table>
	<tr>
		<td align="left" valign="middle">
			<h3 align="left">
				Encapsulation Directions&#x2001;🚧
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				&#x2001;+&#x2001;
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://Land.PlayForm.Cloud" target="_blank">
					Land&#x2001;🏞️
				</a>
			</h3>
		</td>
	</tr>
</table>

---

# **Encapsulation Directions** 🚧

Potential refactors that would shrink Land's filesystem footprint, simplify
cleanup, or unblock versioning. Each option is feasible because both Land and
the bundled VS Code dependency are ours to modify. None are decided plans; all
should be costed against the current [`PerElement.md`](PerElement.md) and
[`PlatformPaths.md`](PlatformPaths.md) before implementation.

[← Back to Filesystem Footprint index](../FilesystemFootprint.md)

---

## At-a-Glance Roadmap 🗺️

| ID  | Direction                                    | Effort | Impact                                             | Risk                           |
| :-- | :------------------------------------------- | :----- | :------------------------------------------------- | :----------------------------- |
| A   | Single product root (`~/.fiddee/<profile>/`) | L      | One-line uninstall                                 | Tauri/WKWebView sandboxing     |
| B   | Stable short bundle identifier               | M      | Eliminates per-profile path explosion              | Existing-install migration     |
| C   | Log rotation + retention                     | S      | Bounds disk growth from `Trace=`                   | Low                            |
| D   | Versioned userdata schema                    | M      | Safe forward / backward migrations                 | Low                            |
| E   | Tier parity for every location               | S      | Portable / sandboxed installs                      | Low                            |
| F   | Self-uninstall command                       | S      | One-step user-facing cleanup                       | Low                            |
| G   | Foreign-tool probe tier-gate                 | S      | Stops creating `.claude/agents`, `.copilot/agents` | Low                            |
| H   | Cocoon `.storage` move out-of-bundle         | S      | Storage survives extension reinstall               | Low (in-host migration needed) |
| I   | PostHog distinctId unification               | S      | One analytics identity per install                 | Low                            |
| J   | FIDDEE root reconciliation (Air vs Mountain) | M      | One product root across daemon + editor            | Air daemon migration           |
| K   | OS keychain enumeration                      | M      | Cleanup recipes can clear secrets too              | Per-OS API surface             |

S ≤ 1 day, M = 1 - 5 days, L = 1 - 2 weeks.

---

## A. Single Product Root (`~/.fiddee/<profile>/`) 🏞️

**Move every per-bundle path under `~/.fiddee/<profile>/`.** Replace Tauri's
`app_data_dir()` / `app_cache_dir()` / `app_log_dir()` calls with an internal
resolver that returns `~/.fiddee/<profile>/data/`, `~/.fiddee/<profile>/cache/`,
`~/.fiddee/<profile>/logs/`. Cocoon storage paths fold in naturally as
`~/.fiddee/<profile>/extensionStorage/` etc.

Webview-managed paths (`Library/WebKit/<bundle>/` and equivalents) stay where
the OS puts them - Land cannot rename those. Everything else is ours.

**Win:** Uninstall becomes `rm -rf ~/.fiddee` plus a documented short list of
OS-managed cleanups.

**Risk:** Tauri's webview bridge expects `app_data_dir` to be the OS-blessed
location for some sandboxing-related operations. Needs an experiment to confirm
WKWebView still gets its keychain-equivalents when the userdata moves.

**Touches:**

- `Element/Mountain/Source/Binary/Main/AppLifecycle.rs` (userdata seeder).
- `Element/Mountain/Source/IPC/WindServiceHandlers/Utilities/UserdataDir/*`.
- `Element/Mountain/Source/IPC/DevLog/AppDataPrefix.rs` (path discoverer).
- `Element/Mountain/Source/ProcessManagement/InitializationData.rs` (machine-id
  resolver).

---

## B. Stable Short Bundle Identifier 🆔

Stop encoding the build matrix into the Tauri `identifier`. Use a single
identifier like `cloud.fiddee.editor` and represent the profile as a
subdirectory or env var. Per-profile separation is preserved via
`~/.fiddee/<profile>/` (option A) rather than via separate Library trees.

**Win:** Today the bundle identifier is 130 characters. Profile churn (rebuilds,
variant switches) accumulates per-profile Library trees that must be enumerated
for cleanup. A single identifier collapses that.

**Risk:** Existing-install migration is a one-shot Maintain script that walks
all `land.editor.*mountain*` paths and moves contents into the new layout.
Workbench userdata needs careful handling so settings don't reset.

**Touches:**

- `Element/Mountain/tauri.conf.json` (per-profile template).
- `Element/Maintain/Source/Build/*` (identifier composer).
- A one-shot migration tool in `Maintain/Migration/`.

---

## C. Log Rotation and Retention 🪵

A single `~/.fiddee/<profile>/logs/<ts>/` tree (option A) opens the door to:

- Boot-time pruning of sessions older than `LogRetention=<days>`.
- Size-bounded ring buffers via the existing `IPC/DevLog/AppDataPrefix.rs`
  infrastructure.
- Per-tag retention overrides (e.g. keep `breaker` and `lifecycle` longer than
  `ipc-verbose`).

Today `Record=1` + `Trace=all` debug sessions leave behind ~200 MB per run
forever. The fix is mechanical once the log root is single-source.

**Touches:**

- `Element/Mountain/Source/IPC/DevLog/*`.
- One new boot hook to prune-on-start.
- New env vars: `LogRetention`, `LogMaxSize`, `LogPruneOnBoot` (registry entries
  in [`../EnvironmentVariables.md`](../EnvironmentVariables.md)).

---

## D. Versioned Userdata Schema 🔢

Stamp `~/.fiddee/<profile>/data/.schema-version` (or
`<app_data_dir>/<bundle>/User/.schema-version` in the pre-A layout). Boot-time
migrations move data forward; backward-incompatible changes write to
`User-vN+1/` and leave the older snapshot for rollback.

Today the userdata directory has no version marker, so future format changes
(e.g. `mcp.json` shape, settings categorisation) have no recourse but in-place
rewrite.

**Per-document version fields** complement this: every JSON the editor writes
should grow a top-level `_v` key. Cheap to add today (write the key, ignore on
read for now), expensive to retrofit later.

**Touches:**

- `Element/Mountain/Source/Binary/Main/AppLifecycle.rs` (boot-time migration
  step).
- New crate `Element/Mountain/Source/Migration/` for schema migrations.
- Optional: `RetainPreviousSchemaVersions=<N>` env var to bound rollback
  snapshot retention.

---

## E. Tier Parity for Every Location 🎚️

`Lodge` and `Extend` let operators redirect the extension paths. Today
`<app_data_dir>`, `<app_log_dir>`, `<app_cache_dir>` cannot be redirected
without Tauri-level config changes.

Add equivalent overrides for every location:

| Existing | Proposed                               |
| :------- | :------------------------------------- |
| `Lodge`  | (already done) extensions root         |
| -        | `Lair` - workbench userdata root       |
| -        | `Hive` - logs root                     |
| -        | `Cache` - cache root                   |
| -        | `Storage` - per-extension storage root |

Pair each with a registry entry in
[`../EnvironmentVariables.md`](../EnvironmentVariables.md). Useful for
**portable installs** (USB-stick FIDDEE) and for CI runners that should not
accumulate state.

---

## F. Self-Uninstall Command 🧼

`fiddee --uninstall` (or a menu item) that walks the
[`PerElement.md`](PerElement.md) tables and removes every path it owns,
optionally archiving to `~/.fiddee-archive-<ts>/` first. Matches the procedure
in [`Cleanup.md`](Cleanup.md) done by hand.

**Bonus:** integrate with option K (keychain enumeration) so the uninstall also
clears OS-keychain entries.

**Touches:**

- New CLI flag handler in
  `Element/Mountain/Source/Binary/Initialize/CliParse.rs`.
- Path enumeration via the centralised resolvers (FiddeeRoot, UserdataDir,
  PathResolver).
- Optional UI surface in the workbench (`File → Uninstall...`).

---

## G. Foreign-Tool Probe Tier-Gate 🌐

`TierForeignToolProbe=Off` would stop `AppLifecycle::Dirs` from pre-creating
`~/.claude/agents` and `~/.copilot/agents`. Workbench-side, make the missing-dir
probe failure-tolerant so the create-on-startup is no longer needed.

Default tier value: `On` for backwards-compatible boot behaviour.

**Touches:**

- `Element/Mountain/Source/Binary/Main/AppLifecycle.rs:393`.
- `Element/Mountain/build.rs` tier registry.
- `Element/Mountain/Source/LandFixTier.rs` runtime banner.
- VS Code Dependency: relax the `stat` probe in `extensions/agent/` or whichever
  path triggers the original error.

---

## H. Cocoon `.storage` Move Out-of-Bundle 📦

The current `~/.fiddee/extensions/<id>/.storage/` location ties per-extension
storage to the extension's own directory - reinstalls or version bumps destroy
it.

**Proposed:** move to `~/.fiddee/extensionData/<id>/.storage/` (parallel to the
existing `extensionStorage` sibling) so storage survives extension lifecycle
events.

**Migration:** one-shot scan on boot; for every
`~/.fiddee/extensions/<id>/.storage/`, move to the new location if the target
doesn't already exist.

**Touches:**

- `Element/Cocoon/Source/Services/Extension/Context.ts:495`.
- New boot-time migration in Cocoon.

---

## I. PostHog distinctId Unification 🆔

Read `<app_data_dir>/<bundle>/machine-id.txt` and use it as the PostHog
distinctId, so analytics see one identity per install. Avoid the divergence that
today exists between Mountain's `machineId` (server-generated UUID, durable on
disk) and Sky's distinctId (Sky-generated, lives in webview localStorage).

**Touches:**

- `Element/Sky/Source/Workbench/Electron/Post/Hog/Bridge.ts:60-70` (currently
  generates and stores a fresh distinctId in localStorage).
- Add a `MountainIPCInvoke({method: "system:machineId"})` call that returns
  `machine-id.txt` content; cache in localStorage so the round-trip happens
  once.

---

## J. FIDDEE Root Reconciliation (Air vs Mountain) 🤝

Mountain owns `~/.fiddee/` (dotfile, lowercase). The `Air` background daemon
writes to `<config_dir>/FIDDEE/` (uppercase, under the OS config root - i.e.
`~/Library/Application Support/FIDDEE/` on macOS).

Two products, two roots. Cleanup recipes that target `~/.fiddee/` miss Air's
state and vice versa.

**Proposed:** Air migrates to `~/.fiddee/air/` (or `~/.fiddee/daemon/`) so both
processes share one root. Or - if there's a reason Air needs the OS config dir
specifically (e.g. system-service installation) - have Mountain also write a
pointer file under `<config_dir>/FIDDEE/` so cleanup tools find both roots from
either entry point.

**Touches:**

- `Element/Air/Source/Updates/mod.rs` (configured paths).
- `Element/Air/Source/Authentication/mod.rs` (credentials store path).
- `Element/Air/Source/Downloader/mod.rs` (cache directory).
- Air's configuration file format - new schema version (option D's territory).

---

## K. OS Keychain Enumeration 🔐

`Mountain/Source/Environment/SecretsProvider.rs` writes through the `keyring`
crate, but Land doesn't enumerate the entries it creates. A complete uninstall
requires either user-side `security delete-generic-password` /
`secret-tool clear` / `cmdkey /delete` commands, or per-OS API enumeration.

**Proposed:**

- Maintain a per-extension keychain-service-name registry in
  `~/.fiddee/<profile>/data/secrets-index.json` (subject to option D
  versioning).
- `fiddee --uninstall` (option F) walks the index and removes each entry via the
  platform keyring API.

**Touches:**

- `Element/Mountain/Source/Environment/SecretsProvider.rs` (record service name
  on every write).
- Option F (self-uninstall) implementation.

---

## Sequencing Suggestion 📐

If we tackle these, the natural order is:

1. **C** (log rotation) - cheap, independent.
2. **G** (foreign-tool probe tier-gate) - cheap, independent.
3. **I** (distinctId unification) - cheap, independent.
4. **A** (single product root) - unlocks B, C, D, E.
5. **B** (stable bundle identifier) - depends on A's migration tooling.
6. **D** (versioned userdata schema) - depends on A for the canonical path.
7. **E** (tier parity for every location) - depends on A.
8. **F** (self-uninstall) - depends on A and (ideally) K.
9. **J** (Air / Mountain root reconciliation) - depends on A for the target
   shape.
10. **K** (keychain enumeration) - can ship with F.
11. **H** (Cocoon `.storage` move) - any time; trivially additive.

---

## Versioning Sketch 🔢

Once option A lands, the versioning story becomes straightforward:

1. **`.schema-version` markers** at the root of each owned tree:
   `~/.fiddee/.schema-version`, `~/.fiddee/<profile>/data/.schema-version`,
   `~/.fiddee/<profile>/.machine-id-version`. Version-aware migrations run at
   boot when the marker is missing or stale.
2. **Per-document version fields** on every JSON file Land writes:
   `settings.json`, `keybindings.json`, `tasks.json`, `mcp.json`,
   `RecentlyOpened.json`, every memento file. Add a top-level `_v` key; cheap to
   add today, expensive to retrofit later.
3. **Forward-compat shape rules:** anything Land adds to a JSON document is
   optional with a sane default; anything removed goes through a migration step.
4. **Rollback snapshots** stored under a versioned path (`User-v3/`, `User-v4/`)
   so a downgrade is plausible. Bounded by `RetainPreviousSchemaVersions=<N>`
   env var.

The combination of A (single product root) + D (schema versions) makes the
versioning story straightforward; without A, versioning has to be replicated
across all four ownership domains.

---

## See Also 📚

- [`UserDotfile.md`](UserDotfile.md) - the `~/.fiddee/` tree (option A's target
  shape).
- [`PerElement.md`](PerElement.md) - per-Element write-site inventory.
- [`Cleanup.md`](Cleanup.md) - the manual recipe option F would automate.
- [`../EnvironmentVariables.md`](../EnvironmentVariables.md) - where new env var
  registries land.
