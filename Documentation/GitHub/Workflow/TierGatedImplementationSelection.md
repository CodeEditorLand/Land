### **Workflow Example #11: Tier-Gated Implementation Selection** 🎚️

**Goal:** Every capability that has more than one viable implementation
("file-system access via gRPC vs native tokio", "glob compilation in JavaScript
vs `globset` in Rust", "extension-host IPC routed to Mountain Rust vs Cocoon
Node.js") lives in the codebase simultaneously. The active path is selected
through a single configuration file - `.env.Land` - so we never duplicate call
sites and never regress the default tier. This workflow documents how that file
propagates through the build tools into `Mountain`, `Cocoon`, `Wind`, and `Sky`,
and how each Element reads the resolved tier at run time.

The system is the foundation we use to test upgrades, keep fallback paths warm,
and bisect regressions to a specific implementation tier.

```mermaid
sequenceDiagram
    participant DevFile as .env.Land<br/>(or .env.Land.Sample)
    participant Flavor as .env.Land.<Flavor><br/>(RustOnly / NodeFirst / Full)
    participant BuildSh as Maintain/Debug/Build.sh
    participant TierSh as Maintain/Script/TierEnvironment.sh
    participant Cargo as Cargo / Mountain/build.rs
    participant ESBuild as Cocoon ESBuild<br/>(CocoonEsbuildDefine)
    participant Vite as Sky Vite<br/>(astro.config.ts)
    participant Mountain as Mountain<br/>(Rust binary)
    participant Cocoon as Cocoon<br/>(Node sidecar)
    participant Wind as Wind / Sky<br/>(webview)

    DevFile->>BuildSh: Base tier set
    Flavor->>BuildSh: Optional overlay via --flavor <name>
    BuildSh->>TierSh: Source helpers
    TierSh->>TierSh: set -a; . .env.Land; set +a<br/>(sweeps every Tier* / Product* / Network*)
    TierSh->>Cargo: Tier* env exported
    TierSh->>ESBuild: CocoonEsbuildDefine = JSON of every Tier* in env
    TierSh->>Vite: Tier* env exported
    TierSh->>BuildSh: CargoFeatures = comma-joined feature list

    Cargo->>Cargo: build.rs::PropagateTierGating()<br/>emit cargo:rustc-env + cargo:rustc-cfg
    ESBuild->>ESBuild: Inject __LandTier_<Name>__ defines
    Vite->>Vite: Substitute import.meta.env.Tier*

    Note over Mountain,Wind: Build complete - every Element<br/>has the resolved tier burned in.

    Mountain->>Mountain: LandFixTier::LogResolvedTiers()<br/>prints two-line runtime banner
    Cocoon->>Cocoon: Utility/Tier.ts default export<br/>prints runtime banner
    Wind->>Wind: Utility/Tier.ts default export<br/>prints runtime banner

    Note over Mountain,Wind: All three banners must agree -<br/>mismatch indicates config drift.
```

---

#### **Phase 1: Authoring the Tier Set (`.env.Land`)**

1. **Canonical source of truth
   ([`Land/.env.Land.Sample`](https://github.com/CodeEditorLand/Land/tree/Current/.env.Land.Sample))**
    - Every capability participating in tier gating has exactly one row in
      `.env.Land.Sample` in the form `Tier<Capability>=<Value>`.
    - The sample file is committed and represents the compiled-in defaults. A
      per-machine `.env.Land` (gitignored on shipping builds, committed in this
      repo for the team baseline) may override any line.
    - The current capability set spans **two layers**:

        **Infrastructure tiers** (Cargo-feature-gated, compile-time selection):

        | Domain      | Variable                  | Default       | Other values                            |
        | ----------- | ------------------------- | ------------- | --------------------------------------- |
        | Transport   | `TierRemoteProcedureCall` | `gRPC`        | `SharedMemory`                          |
        | Transport   | `TierHTTPProxy`           | `HandRolled`  | `Hyper`                                 |
        | Transport   | `TierLogger`              | `Standard`    | `Ring`                                  |
        | File system | `TierFileSystem`          | `Layer2`      | `Layer3`, `Layer4`                      |
        | File system | `TierFindFiles`           | `Layer3`      | `Layer4`                                |
        | File system | `TierGlob`                | `JavaScript`  | `Native`                                |
        | File system | `TierFileWatcher`         | `Layer4`      | `Stub`                                  |
        | Assets      | `TierSchemeAssets`        | `FileSystem`  | `Embedded`, `Hybrid`                    |
        | VS Code API | `TierConfiguration`       | `Cache`       | `Eager`                                 |
        | VS Code API | `TierDiagnostics`         | `Full`        | `Delta`                                 |
        | VS Code API | `TierClipboard`           | `Layer3`      | `Layer4`, `Layer5`                      |
        | VS Code API | `TierOpenExternal`        | `Layer3`      | `Layer4`                                |
        | VS Code API | `TierDocumentMirror`      | `Full`        | `Lazy`                                  |
        | Lifecycle   | `TierExtensionActivation` | `Parallel8`   | `Sequential`, `Parallel4`, `Parallel16` |
        | Lifecycle   | `TierExtensionScan`       | `Sequential`  | `Parallel`                              |
        | Lifecycle   | `TierModuleCache`         | `Simple`      | `Off`, `Shared`                         |
        | Telemetry   | `TierTelemetry`           | `Synchronous` | `Batched`, `Off`                        |

        **Per-subsystem routing tiers** (runtime-readable, baked at compile time
        via `cargo:rustc-env` for every binary so dispatch arms can `env!()`
        them without a `std::env::var` call hot-path):

        | Variable               | Default    | Routes                               |
        | ---------------------- | ---------- | ------------------------------------ |
        | `TierIPC`              | `Mountain` | `Mountain` / `NodeDeferred` / `Node` |
        | `TierTerminal`         | `Mountain` | `Mountain` / `Node`                  |
        | `TierSCM`              | `Mountain` | `Mountain` / `Node`                  |
        | `TierDebug`            | `Mountain` | `Mountain` / `Node`                  |
        | `TierLanguageFeatures` | `Mountain` | `Mountain` / `Node`                  |
        | `TierSearch`           | `Mountain` | `Mountain` / `Node`                  |
        | `TierOutputChannel`    | `Mountain` | `Mountain` / `Node`                  |
        | `TierNativeHost`       | `Mountain` | `Mountain` / `Node`                  |
        | `TierTreeView`         | `Mountain` | `Mountain` / `Node`                  |
        | `TierStorage`          | `Mountain` | `Mountain` / `Node`                  |
        | `TierModel`            | `Mountain` | `Mountain` / `Node`                  |
        | `TierTasks`            | `Node`     | `Mountain` / `Node`                  |
        | `TierAuth`             | `Node`     | `Mountain` / `Node`                  |
        | `TierEncryption`       | `Mountain` | `Mountain` / `Node`                  |
        | `TierExtensionHost`    | `Process`  | `Process` / `WebWorker` / `Disabled` |
        | `TierWebSocket`        | `Disabled` | `Disabled` / `Mountain` / `Mist`     |

        **Notable entries:**

        - **`TierIPC`** is the global IPC routing switch. `Wind`'s
          `TauriMainProcessService.ts` reads this variable at module
          initialisation time (before any IPC call is made) and selects one of
          three dispatch paths:
            - `Mountain` (default) - all calls go directly to Mountain via
              `@tauri-apps/api` `invoke`.
            - `NodeDeferred` - Mountain is tried first; on a miss or `undefined`
              result the call falls through to Cocoon via the `cocoon:request`
              bridge.
            - `Node` - all calls go directly to Cocoon; Mountain is used only
              for window management and PTY.
        - **`TierTasks`** defaults to `Node` because task execution relies on
          Cocoon's `ExtHostTaskService` for provider enumeration and execution.
        - **`TierAuth`** defaults to `Node` because authentication flows go
          through Cocoon's `ExtHostAuthentication` shim.

2. **Naming convention**
    - Variables use `PascalCase` with the `Tier` prefix.
    - Infrastructure values use `Layer2..Layer5` where L2 is a round-trip RPC,
      L3 a native in-language fallback, L4 a pure-Rust implementation, and L5 an
      OS-level integration. For non-layered infrastructure they use descriptive
      labels (`gRPC` / `SharedMemory` / `HandRolled` / `Hyper`).
    - Per-subsystem routing values are always one of `Mountain`, `Node`,
      `Process`, `WebWorker`, `Disabled`, or `Mist`. See the table above for
      which set applies to each variable.

3. **Flavor overlays**
    - Three pre-built tier sets ship at the repo root so you can flip every
      subsystem at once:
        - `.env.Land.RustOnly` - every subsystem routes to Mountain Rust where a
          native implementation exists. Cocoon is still spawned to run extension
          code that needs Node.js APIs.
        - `.env.Land.NodeFirst` - every API surface routes to Cocoon Node.js.
          Mountain becomes a thin IPC pass-through. Useful for upstream-VS-Code
          behaviour validation.
        - `.env.Land.Full` - native Rust where it exists, Mist WebSocket on for
          high-frequency calls. The "ship it" flavor.
    - Source one with `sh Maintain/Debug/Build.sh --flavor RustOnly` (or
      `--flavor NodeFirst` / `Full`). The flag sources the overlay BEFORE
      `TierEnvironment.sh` runs, so every downstream tool sees the overlay
      values as if they came from `.env.Land` directly.

    - **ProductFlavor encoding**: Each flavor overlay sets `ProductFlavor` to a
      10-character code that encodes routing decisions in 5 two-char groups:

        | Group | Encodes                                            | Values                                                              |
        | ----- | -------------------------------------------------- | ------------------------------------------------------------------- |
        | G1    | IPC mode + WebSocket                               | `IW`=IPC Mtn+WS Dis, `IF`=IPC NodeDef+WS Mist, `IN`=IPC Node+WS Dis |
        | G2    | Tasks + Auth + Encryption                          | `TN`=Tasks Node+Auth Node+Enc Mtn, `TA`=all Mountain                |
        | G3    | Terminal + SCM + Debug                             | `MM`=all Mountain, `NN`=all Node                                    |
        | G4    | Search + Language + Output + TreeView + NativeHost | `MM`=all Mountain                                                   |
        | G5    | Storage + Model + FileSystem                       | `MM`=all Mountain                                                   |

        **Flavor reference:**

        | Flavor         | Code         | Identity            |
        | -------------- | ------------ | ------------------- |
        | Default (full) | `IWTNMMMMMM` | `fiddee-IWTNMMMMMM` |
        | RustOnly       | `IWTAMMMMMM` | `fiddee-IWTAMMMMMM` |
        | Node           | `INTNNNNNNN` | `fiddee-INTNNNNNNN` |
        | Full + Mist WS | `IFTNMMMMMM` | `fiddee-IFTNMMMMMM` |

        Set `ProductFlavorLong=true` to use short human-readable names
        (`fiddee-F8`, `fiddee-FR`, `fiddee-FN`, `fiddee-FC`) instead of the
        10-char encoding. The flavor code is appended to every filesystem
        identity (data folder, URL protocol, binary identifier) so each flavor
        runs in complete isolation — no shared state, no collisions.

---

#### **Phase 2: Build-Time Propagation (`Maintain/Debug/Build.sh` → `TierEnvironment.sh`)**

1. **Env file discovery and overlay**
   ([`Land/Maintain/Debug/Build.sh`](https://github.com/CodeEditorLand/Land/tree/Current/Maintain/Debug/Build.sh),
   [`Land/Maintain/Script/TierEnvironment.sh`](https://github.com/CodeEditorLand/Land/tree/Current/Maintain/Script/TierEnvironment.sh))
    - The build script handles `--flavor <name>` first, sourcing
      `.env.Land.<name>` into the current shell (`set -a; . FILE; set +a`).
    - Then it sources `TierEnvironment.sh`, which resolves the base `.env.Land`
      (or falls through to `.env.Land.Sample` when the override file is absent)
      and re-applies any shell-exported `Tier*` so a one-off
      `export TierStorage=Node ./Maintain/Debug/Build.sh ...` always wins.
    - The resolved tier set is echoed before the build starts so CI logs show
      the exact configuration for each run.

2. **Cargo feature derivation**
    - Non-default infrastructure values activate Cargo features named
      `Tier<Capability><Value>` (e.g. `TierFileSystem=Layer4` →
      `--features TierFileSystemLayer4`).
    - Default infrastructure values do NOT activate a feature - the default is
      the always-compiled baseline; only upgrades add to the build.
    - Per-subsystem routing values do NOT map to Cargo features. They are
      compile-time string constants consumed at runtime by
      `mod.rs:: mountain_ipc_invoke` via `env!()` plus a `std::env::var`
      fallback for shell-time overrides.

3. **Cocoon ESBuild define blob**
    - Every `Tier*` env var in the process at build time becomes a
      `__LandTier_<Capability>__` replacement token serialised into
      `$CocoonEsbuildDefine` (a JSON string Node serialises before export).
    - The sweep is a wildcard over `process.env` keys starting with `Tier`, so
      new tiers added to `.env.Land` are picked up automatically with zero
      source changes.

4. **Vite / Astro define**
    - Sky's
      [`astro.config.ts`](https://github.com/CodeEditorLand/Sky/tree/Current/astro.config.ts)
      forwards every `Tier*` env var to the Vite `define` map so the webview
      bundle also carries the baked-in values as `import.meta.env.Tier*`
      substitutions. Same wildcard pattern as the Cocoon sweep; new tiers pass
      through without code changes.

---

#### **Phase 3: `Mountain` - Rust Compile-Time + Runtime Propagation**

1. **`build.rs` tier propagation**
   ([`Land/Element/Mountain/build.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/build.rs))
    - Mountain's build script calls `PropagateTierGating()` once per compile.
    - `EmitTierDefaults()` emits `cargo:rustc-env=Tier<Capability>=<Default>`
      for every infrastructure AND per-subsystem tier, so `env!()` always
      resolves at compile time even when `.env.Land` is absent.
    - The override pass reads the resolved `.env.Land` and re-emits values so
      file entries take precedence over the defaults.
    - For infrastructure tiers it emits `cargo:rustc-cfg=feature="Tier<...>"`
      for every non-default pair that matches a declared feature.
    - It emits `cargo:rerun-if-changed=<envfile>` so touching `.env.Land`
      invalidates the compile.
    - `TierExtensionHost=WebWorker` activates `cargo:rustc-cfg=no_node_host`
      which gates `CocoonManagement.rs` out of the binary entirely.

2. **Feature whitelist**
    - `IsDeclaredTierFeature` mirrors Mountain's
      [`Cargo.toml` `[features]` block](https://github.com/CodeEditorLand/Mountain/tree/Current/Cargo.toml).
    - `IsDefaultTierValue` lists every valid `(Key, Value)` pair (defaults AND
      non-default routing values). Any pair absent from both tables produces a
      `cargo:warning`, so typos in `.env.Land` fail loud at `cargo build` rather
      than silently no-op at runtime.

3. **Runtime dispatch in `mod.rs`**
   ([`Land/Element/Mountain/Source/IPC/WindServiceHandlers/mod.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/WindServiceHandlers/mod.rs))
    - `mountain_ipc_invoke` declares
      `const TIER_<Name>: &str = env!("Tier<Name>", "<default>");` at the top so
      each per-subsystem dispatch arm reads its tier from a compile-time string
      constant.
    - `tier_routes_to_node(BakedConst, EnvKey)` returns whether the resolved
      value (env override first, baked const second) is `"Node"`. Dispatch arms
      gate on this:
        ```rust
        "git:exec" | "git:clone" /* … */
            if tier_routes_to_node(TIER_SCM, "TierSCM") =>
        {
            forward_to_cocoon!("scm", command, Arguments)
        },
        "git:exec" => { Git::HandleExec::Fn(Arguments).await },
        ```
    - The same pattern guards `storage:*`, `debug:*`, every subsystem with a
      native Mountain handler.

4. **Boot banner**
   ([`Land/Element/Mountain/Source/LandFixTier.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/LandFixTier.rs))
    - `LogResolvedTiers()` is called from
      [`Binary::Main::Entry::Fn`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/Binary/Main/Entry.rs)
      before the Tokio runtime spins up.
    - **Two lines** are emitted: the first lists every compile-baked
      infrastructure tier (using `env!()` literals - zero runtime cost), the
      second lists every runtime-readable per-subsystem tier (using
      `std::env::var` with the baked `env!()` fallback - exactly what `mod.rs`
      reads).

---

#### **Phase 4: `Cocoon` - TypeScript Runtime Dispatch**

1. **`CocoonMain.ts` prelude**
   ([`Land/Element/Cocoon/Source/Bootstrap/Implementation/Cocoon/Main.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Bootstrap/Implementation/Cocoon/Main.ts))
    - The very first statements of the bundled Cocoon main file populate
      `globalThis.__LandTiers` from the esbuild-substituted
      `__LandTier_<Capability>__` identifiers, falling through to
      `process.env.Tier<Capability>` and finally the hard-coded defaults.
    - One `declare const __LandTier_<Name>__: string` per tier ensures
      TypeScript checks pass while esbuild's `define` substitutes the literal at
      bundle time.
    - The prelude runs before the `Tier` utility is first imported.

2. **`Utility/Tier.ts` default export**
   ([`Land/Element/Cocoon/Source/Utility/Tier.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Utility/Tier.ts))
    - The module exposes a single `const Tier = { … } as const` object whose
      keys match the capability names. Reads are synchronous and
      side-effect-free.
    - Every per-subsystem tier has a `TierXValue` union type. The `Pick<…>(…)`
      calls resolve from `__LandTiers` first, then `process.env.TierX`, then the
      baked default.
    - On first import it emits the Cocoon runtime banner via `LandFixLog.Info`
      so the boot log documents exactly which tier set this process is using.

3. **Dispatch patterns**
    - **Static dispatch (preferred for infrastructure tiers):**
      `export default Tier.Glob === "Native" ? CompileNative : CompileJavaScript;`
        - esbuild's `define` substitutions dead-code-eliminate the inactive arm
          in production bundles.
    - **Runtime branch (per-subsystem tiers):**
      `if (Tier.Storage === "Node") { … } else { … }` - used when two arms must
      coexist in the same bundle (every subsystem tier is in this category since
      Mountain ↔ Cocoon routing flips at runtime).

---

#### **Phase 5: `Wind` / `Sky` - Webview Dispatch**

1. **`Wind/Source/Utility/Tier.ts`**
   ([`Land/Element/Wind/Source/Utility/Tier.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Utility/Tier.ts))
    - Mirrors Cocoon's module in shape but reads from
      `import.meta.env.Tier<Capability>` (Vite-substituted at build time),
      falling through to `globalThis.__LandTiers` and finally hard-coded
      defaults.
    - Identical type-export set and identical `Pick<…>(…)` table - the only
      differences are the env source (`import.meta.env` vs. `process.env`) and
      the banner (`console.info` vs. `LandFixLog`).

2. **Cross-Element agreement**
    - All three banners - Mountain, Cocoon, Wind - must report identical values
      for each capability. A mismatch means one build tool read a different env
      file or a polyfill failed to populate `globalThis.__LandTiers`; both paths
      are grep-able from the boot log.

---

#### **Phase 6: Adding a New Tier**

1. **Declare the capability**
    - Add a row to `.env.Land.Sample` AND `.env.Land` with the default value.

2. **Bake the default in Mountain**
    - Add `(name, default)` to `EmitTierDefaults()` in `Mountain/build.rs`.
    - Add every legal `(Key, Value)` pair to `IsDefaultTierValue()`.
    - If the new tier should gate a Cargo feature, add the feature name to
      `IsDeclaredTierFeature()` AND the matching entry to
      `Mountain/Cargo.toml [features]`.

3. **Add to `turbo.json`**
    - Add the variable name to `globalEnv` so turbo treats it as a
      cache-invalidating input.

4. **Extend the TypeScript type declarations**
    - Add a `Tier<Capability>Value` union type and a `Pick<…>(…)` call in
      `Element/Cocoon/Source/Utility/Tier.ts`.
    - Mirror the change in `Element/Wind/Source/Utility/Tier.ts`.
    - Add the `declare const __LandTier_<Name>__: string;` line + matching
      `__LandTiers` entry in
      `Element/Cocoon/Source/Bootstrap/Implementation/Cocoon/Main.ts`.

5. **Wire the dispatch arm**
    - In `Mountain/Source/IPC/WindServiceHandlers/mod.rs`, add
      `const TIER_<NAME>: &str = env!("Tier<Name>", "<default>");` near the
      other tier consts, then wrap the relevant command group with
      `if tier_routes_to_node(TIER_<NAME>, "Tier<Name>") => { forward_to_cocoon!(…) }`.

6. **Update flavor overlays**
    - Add the tier (with the correct flavor-specific value) to all three overlay
      files: `.env.Land.RustOnly`, `.env.Land.NodeFirst`, `.env.Land.Full`.

7. **Extend the runtime banner**
    - Add the variable to `LogResolvedTiers()` in
      `Mountain/Source/LandFixTier.rs` so the new capability appears in the boot
      log.

---

#### **Failure Modes**

- **`.env.Land` missing:** `Build.sh` falls back to `.env.Land.Sample`;
  `build.rs` falls back to the `EmitTierDefaults` table; `Utility/Tier.ts` falls
  back to the same defaults. All four paths converge on the same baseline.
- **Typo in `.env.Land`:** Rust build surfaces
  `cargo:warning=Tier<…>=<…> declared in <file> but has no matching Cargo feature`.
  TypeScript accepts the value as an opaque string (union literals at the type
  level only); the banner shows the typo verbatim so it is visible at boot.
- **Banner disagreement:** Compare the three `[LandFix:Tier] …` lines in the
  boot log. If they disagree on a capability, one build tool did not see the
  override - usually because the shell that launched the build did not source
  `.env.Land`. Re-run under `./Maintain/Debug/Build.sh`, which is the sole
  supported entry point.
- **Flavor override surprises:** A `--flavor` arg overrides everything in
  `.env.Land`. Confirm the flavor line in `Build.sh`'s startup banner matches
  what you expect; the resolved tier table is echoed shortly after.
- **`TierWebSocket=Mist` requires `Mist::WebSocket` infrastructure:** Setting
  this without a Mist build will boot the listener but no handlers are
  registered. Check the Mountain boot log for
  `[Lifecycle] [Setup] TierWebSocket=Mist - starting WebSocket transport`.

---

#### **Related Source Files**

| Element   | Path                                                                                                                                                                    | Role                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Repo root | [`.env.Land`](https://github.com/CodeEditorLand/Land/tree/Current/.env.Land)                                                                                            | Active tier set (overrides Sample)           |
| Repo root | [`.env.Land.Sample`](https://github.com/CodeEditorLand/Land/tree/Current/.env.Land.Sample)                                                                              | Canonical default tier set                   |
| Repo root | [`.env.Land.RustOnly`](https://github.com/CodeEditorLand/Land/tree/Current/.env.Land.RustOnly)                                                                          | Flavor overlay: native Rust everywhere       |
| Repo root | [`.env.Land.NodeFirst`](https://github.com/CodeEditorLand/Land/tree/Current/.env.Land.NodeFirst)                                                                        | Flavor overlay: Cocoon Node.js everywhere    |
| Repo root | [`.env.Land.Full`](https://github.com/CodeEditorLand/Land/tree/Current/.env.Land.Full)                                                                                  | Flavor overlay: native + Mist WebSocket      |
| Repo root | [`turbo.json`](https://github.com/CodeEditorLand/Land/tree/Current/turbo.json)                                                                                          | Tier names registered in `globalEnv`         |
| Maintain  | [`Maintain/Debug/Build.sh`](https://github.com/CodeEditorLand/Land/tree/Current/Maintain/Debug/Build.sh)                                                                | `--flavor` arg + env fan-out                 |
| Maintain  | [`Maintain/Release/Build.sh`](https://github.com/CodeEditorLand/Land/tree/Current/Maintain/Release/Build.sh)                                                            | Same flavor support for release builds       |
| Maintain  | [`Maintain/Script/TierEnvironment.sh`](https://github.com/CodeEditorLand/Land/tree/Current/Maintain/Script/TierEnvironment.sh)                                          | Cargo feature derivation + esbuild define    |
| Mountain  | [`Element/Mountain/build.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/build.rs)                                                                         | Cargo feature + `rustc-env` propagation      |
| Mountain  | [`Element/Mountain/Source/LandFixTier.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/LandFixTier.rs)                                               | Runtime banner (both layers)                 |
| Mountain  | [`Element/Mountain/Source/IPC/WindServiceHandlers/mod.rs`](https://github.com/CodeEditorLand/Mountain/tree/Current/Source/IPC/WindServiceHandlers/mod.rs)               | Per-subsystem `tier_routes_to_node` dispatch |
| Cocoon    | [`Element/Cocoon/Source/Utility/Tier.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Utility/Tier.ts)                                                 | Node-side dispatcher                         |
| Cocoon    | [`Element/Cocoon/Source/Bootstrap/Implementation/Cocoon/Main.ts`](https://github.com/CodeEditorLand/Cocoon/tree/Current/Source/Bootstrap/Implementation/Cocoon/Main.ts) | `globalThis.__LandTiers` prelude             |
| Wind      | [`Element/Wind/Source/Utility/Tier.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Utility/Tier.ts)                                                     | Webview-side dispatcher                      |
| Sky       | [`Element/Sky/astro.config.ts`](https://github.com/CodeEditorLand/Sky/tree/Current/astro.config.ts)                                                                     | Vite `define` forwarding (wildcard sweep)    |
