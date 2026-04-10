<table>
	<tr>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://Editor.Land" target="_blank">
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
				<a href="https://Editor.Land" target="_blank">
					Land
				</a>
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				🏞️
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left"> + </h3>
		</td>
		<td align="left" valign="middle" width="190">
			<h3 align="left">
				<a href="https://Tauri.App" target="_blank">
					<picture>
						<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Made/Tauri.svg">
						<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Made/Tauri.svg">
						<img width="160" alt="Made With Tauri" src="https://PlayForm.Cloud/Image/GitHub/Made/Tauri.svg">
					</picture>
				</a>
			</h3>
		</td>
	</tr>
</table>

---

# **Land**&#x2001;🏞️

> **VS Code runs on Electron.** That means a bundled Chromium browser, a Node.js
> runtime, and a single-threaded extension host. Open a medium project: 500 MB
> to 1.5 GB of RAM. Extensions compete on one thread. Updates kill your
> terminals. The RAM is never returned.

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Land/tree/Current/LICENSE)

Land replaces VS Code's Electron stack piece by piece with fifteen independent
elements. Rust and Tauri replace Chromium and Node.js. Effect-TS fibers replace
Promise chains. Typed Tauri IPC replaces Node's untyped JSON pipe. The result:
the same VS Code extension API surface on a leaner native substrate — less RAM,
faster cold start, and structured concurrency that VS Code's single-threaded
extension host cannot offer.

📖 [Documentation](https://editor.land/Doc)&#x2001;📦
[Download](https://editor.land/Download)&#x2001;🔧
[Rust API](https://editor.land/Doc/Rust)

---

## Why Land Exists&#x2001;📊

| Pain                | VS Code (Electron)               | Land (Tauri + Effect-TS)                                     |
| :------------------ | :------------------------------- | :----------------------------------------------------------- |
| RAM per window      | 300–400 MB idle                  | Substantially less (no bundled Chromium; uses OS WebView)    |
| Cold start          | 2–4 s                            | Faster (no Chromium init); target <200 ms not yet benchmarked |
| Extension blocking  | One hung Promise freezes all     | Each fiber is independently interruptible                    |
| IPC                 | Untyped JSON pipe                | Typed Tauri IPC → Rust handlers; gRPC (Vine) for Cocoon      |
| Extension isolation | Shared process, no boundary      | Supervised fiber scopes (Grove: WASM sandbox, in progress)   |
| Updates             | Full restart, kills terminals    | Pre-staged by Air between sessions                           |
| Telemetry           | Config toggle, code paths remain | Compile flag: code paths do not exist when off               |
| Distributable size  | 90–150 MB                        | ~3–8 MB (no bundled browser)                                 |
| License             | MIT (with restrictions)          | CC0 public domain, no restrictions                           |

---

## What It Does&#x2001;🔐

- **VS Code extension API compatibility.** Cocoon intercepts `require`/`import`
  and routes VS Code API calls through Effect-TS fibers. Core APIs are
  implemented; the full surface is an ongoing target as the extension host matures.
- **No bundled browser.** Mountain replaces Chromium with the OS's own WebView
  (WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux). No 300 MB base
  footprint.
- **Structured concurrency, not just async.** Effect-TS fibers can be
  interrupted, raced, and supervised. Extensions that block in VS Code can run
  concurrently in Land.
- **Typed at the wire.** Wind uses Tauri IPC to communicate with Mountain's Rust
  handlers. Vine starts every gRPC interface as a `.proto` file — change a
  message field and every consumer breaks at compile time, not in production.
- **Always up to date, never interrupted.** Air pre-downloads and PGP-verifies
  the next version between sessions. No "Restart to Update" prompt.
- **CC0, no restrictions.** Fork it. Ship it. Build commercial products on it.
  No attribution required.

---

## Architecture&#x2001;🏗️

| Element              | Role                                                      | Technology            |
| :------------------- | :-------------------------------------------------------- | :-------------------- |
| [Common][Common]     | Abstract traits, ActionEffect system, DTOs                | Rust                  |
| [Mountain][Mountain] | Native backend: windows, files, processes, gRPC server    | Rust, Tauri 2.0       |
| [Cocoon][Cocoon]     | Extension host: VS Code API on Effect-TS fibers           | TypeScript, Node.js   |
| [Wind][Wind]         | Workbench services: Effect-TS Layers over Tauri IPC       | TypeScript, Effect-TS |
| [Sky][Sky]           | UI components: Astro, instant hot-reload in Tauri         | TypeScript, Astro     |
| [Air][Air]           | Background daemon: pre-staged updates, PGP verification   | Rust                  |
| [Echo][Echo]         | Work-stealing scheduler across all CPU cores              | Rust                  |
| [Vine][Vine]         | gRPC protocol: typed contracts from `.proto` files        | Protobuf, Rust        |
| [Grove][Grove]       | WASM sandbox: capability-based extension isolation        | Rust, WASMtime        |
| [Mist][Mist]         | DNS sandbox: local `*.editor.land` resolution             | Rust                  |
| [Rest][Rest]         | OXC-powered TypeScript compiler, 2–3× faster than esbuild | Rust, OXC             |
| [Output][Output]     | Deterministic build artifacts with checksum verification  | JavaScript            |
| [SideCar][SideCar]   | Node.js binary distribution per target triple             | Rust                  |
| [Worker][Worker]     | Service Worker: auth encryption, offline support          | TypeScript            |
| [Maintain][Maintain] | Build orchestrator: Rhai scripting, deterministic output  | Rust, Rhai            |

---

## System Architecture&#x2001;🏗️

```mermaid
graph LR
    classDef mountain fill:#f9f,stroke:#333,stroke-width:2px;
    classDef cocoon fill:#ccf,stroke:#333,stroke-width:2px;
    classDef wind fill:#9cf,stroke:#333,stroke-width:2px;
    classDef common fill:#cfc,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef ipc fill:#ff9,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef build fill:#ddd,stroke:#666;
    classDef data fill:#eee,stroke:#666;

    subgraph "Build Time Process"
        direction LR
        VSCodeSource["VS Code Source (Dependency/Editor)"]:::build
        RestBuild["JS Bundler (Rest Element)"]:::build
        CocoonBundleJS(Cocoon Runtime JS):::data
        SkyBuildProcess["Sky Build (Sky Element)"]:::build
        SkyAssets(Sky Frontend Assets):::data

        VSCodeSource --> RestBuild;
        VSCodeSource -- Uses UI code --> SkyBuildProcess;
        RestBuild --> CocoonBundleJS;
        SkyBuildProcess --> SkyAssets;
    end

    subgraph "Runtime: **Land** Application"
        subgraph "Native Backend (Rust)"
            Mountain["**Mountain (Tauri App)**"]:::mountain
            CommonCrate[**Common Crate**]:::common
            TrackDispatcher[Track Dispatcher]:::mountain
            VineGRPCServer[Vine gRPC Server]:::mountain
            NativeHandlers["Native Logic Handlers"]:::mountain
            ProcessMgmt["Process Management"]:::mountain

            Mountain -- Uses --> TrackDispatcher
            TrackDispatcher -- Routes to --> NativeHandlers
            Mountain -- Implements traits from --> CommonCrate
            Mountain -- Contains --> VineGRPCServer
            Mountain -- Contains --> ProcessMgmt
        end

        subgraph "UI Frontend (Tauri Webview)"
            WindServices["**Wind (Effect-TS Services)**"]:::wind
            SkyUI["**Sky (UI Components)**"]:::wind
            WindServices -- Drives state of --> SkyUI
        end

        subgraph "Extension Host (Node.js Sidecar)"
            Cocoon[**Cocoon Process**]:::cocoon
            VineGRPCClient[Vine gRPC Client]:::cocoon
            VSCodeAPI[vscode API Shim]:::cocoon
            Extension["Extension Code"]:::cocoon

            Cocoon -- Contains --> VineGRPCClient
            Cocoon -- Provides --> VSCodeAPI
            VSCodeAPI -- Used by --> Extension
        end

        ProcessMgmt -- Spawns & Manages --> Cocoon

        WindServices -- Tauri IPC (Commands & Events) --> TrackDispatcher
        VineGRPCClient -- gRPC (Vine Protocol) <--> VineGRPCServer; class VineGRPCClient,VineGRPCServer ipc;

    end

    CocoonBundleJS -- Loaded by --> Cocoon;
    SkyAssets -- Loaded by --> WindServices;
```

---

## Architectural Workflows&#x2001;📄

Detailed Mermaid-diagrammed workflows live in
[`Documentation/GitHub/Workflow.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow.md):

1. **Application Startup & Handshake** - Mountain launches, spawns Cocoon,
   establishes gRPC connection
2. **Opening a File** - UI click through Wind to Mountain to disk and back
3. **Language Features** - Bidirectional: Cocoon registers provider, Mountain
   proxies requests
4. **Save Participants** - Extensions modify files via gRPC before Mountain
   writes to disk
5. **Command Palette** - Unified dispatch to native Rust handlers or proxied
   extension commands
6. **Webview Panels** - Full lifecycle of extension-contributed UI
7. **Integrated Terminal** - Native PTY via `portable-pty`, xterm.js wired and
   working
8. **SCM / Git** - Cocoon's Git extension uses Mountain to spawn native `git`
   processes
9. **User Data Sync** - Auth, fetch, three-way merge, apply, notify
10. **Extension Tests** - Isolated "Extension Development Host" for test
    execution

---

## Getting Started&#x2001;🚀

```sh
# Clone with submodules
git clone --depth 2 ssh://git@github.com/CodeEditorLand/Land.git

# 1. In ./Land/ - initialize Element submodule
git submodule update --init Element

# 2. In ./Land/Element - initialize all Element submodules
git submodule update --init

# 3. In ./Land/ - initialize Dependency submodule
git submodule update --init Dependency

# 4. In ./Land/Dependency/ - initialize Microsoft dependencies
git submodule update --init Microsoft

# 5. In ./Land/Dependency/Microsoft - initialize Dependency
git submodule update --init Dependency

# 6. In ./Land/Dependency/Microsoft/Dependency - initialize VS Code source
git submodule update --init --depth 2 Editor
```

### Build & Run

```sh
# Install JavaScript dependencies
pnpm install

# Build all TypeScript/JS packages
pnpm run prepublishOnly

# Build Rust workspace
cargo build

# Run the application
pnpm run Run
```

---

## Live Deployments&#x2001;🌐

| Service             | URL                                                                                                    |
| :------------------ | :----------------------------------------------------------------------------------------------------- |
| Website             | [editor.land](https://editor.land)                                                                     |
| Status              | [Status.Editor.Land](https://Status.Editor.Land)                                                       |
| Rust API: Mountain  | [Rust.Documentation.Mountain.Editor.Land](https://Rust.Documentation.Mountain.Editor.Land)             |
| Rust API: Common    | [Rust.Documentation.Common.Editor.Land](https://Rust.Documentation.Common.Editor.Land)                 |
| Rust API: Echo      | [Rust.Documentation.Echo.Editor.Land](https://Rust.Documentation.Echo.Editor.Land)                     |
| Rust API: Air       | [Rust.Documentation.Air.Editor.Land](https://Rust.Documentation.Air.Editor.Land)                       |
| Rust API: SideCar   | [Rust.Documentation.SideCar.Editor.Land](https://Rust.Documentation.SideCar.Editor.Land)               |
| Rust API: Rest      | [Rust.Documentation.Rest.Editor.Land](https://Rust.Documentation.Rest.Editor.Land)                     |
| Rust API: Maintain  | [Rust.Documentation.Maintain.Editor.Land](https://Rust.Documentation.Maintain.Editor.Land)             |
| Rust API: Workspace | [Rust.Documentation.Land.Editor.Land](https://Rust.Documentation.Land.Editor.Land)                     |
| Knowledge Base      | [Knowledge.Editor.Land](https://Knowledge.Editor.Land)                                                 |
| Auth Worker         | [codeeditorland-auth.playform.workers.dev](https://codeeditorland-auth.playform.workers.dev)           |
| Download Worker     | [codeeditorland-download.playform.workers.dev](https://codeeditorland-download.playform.workers.dev)   |
| Status Worker       | [codeeditorland-status.playform.workers.dev](https://codeeditorland-status.playform.workers.dev)       |
| Analytics Worker    | [codeeditorland-analytics.playform.workers.dev](https://codeeditorland-analytics.playform.workers.dev) |

---

## License&#x2001;⚖️

CC0 1.0 Universal. Public domain. No restrictions.
[LICENSE](https://github.com/CodeEditorLand/Land/tree/Current/LICENSE)

---

## Changelog&#x2001;📜

See
[`CHANGELOG.md`](https://github.com/CodeEditorLand/Land/tree/Current/CHANGELOG.md)
for a history of changes.

---

[Air]: https://github.com/CodeEditorLand/Air
[Cocoon]: https://github.com/CodeEditorLand/Cocoon
[Common]: https://github.com/CodeEditorLand/Common
[Echo]: https://github.com/CodeEditorLand/Echo
[Editor]: https://github.com/CodeEditorLand/Editor
[Grove]: https://github.com/CodeEditorLand/Grove
[Maintain]: https://github.com/CodeEditorLand/Maintain
[Mist]: https://github.com/CodeEditorLand/Mist
[Mountain]: https://github.com/CodeEditorLand/Mountain
[Output]: https://github.com/CodeEditorLand/Output
[Rest]: https://github.com/CodeEditorLand/Rest
[SideCar]: https://github.com/CodeEditorLand/SideCar
[Sky]: https://github.com/CodeEditorLand/Sky
[Vine]: https://github.com/CodeEditorLand/Vine
[Wind]: https://github.com/CodeEditorLand/Wind
[Worker]: https://github.com/CodeEditorLand/Worker

## Funding & Acknowledgements 🙏🏻

**Land** 🏞️ is proud to be an open-source endeavor. Our journey is significantly
supported by the organizations and projects that believe in the future of
open-source software.

This project is funded through
[NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://NLnet.NL/project/Land).

<table>
	<thead>
		<tr>
			<th align="left">
			<strong>Land</strong>
			</th>
			<th align="left">
			<strong>PlayForm</strong>
			</th>
			<th align="left">
			<strong>NLnet</strong>
			</th>
			<th align="left">
			<strong>NGI0 Commons Fund</strong>
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://Editor.Land">
					<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://PlayForm.Cloud">
					<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL">
					<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL/commonsfund">
					<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund">
				</a>
			</td>
		</tr>
	</tbody>
</table>

### Technology Acknowledgements 🙌🏻

This project would not be possible without the incredible work of the
open-source community. We are especially grateful for the following foundational
technologies and projects:

- [**Tauri**](https://tauri.app/): For providing a secure, performant, and
  resource-efficient framework for building our native desktop application with
  a web frontend.
- [**Microsoft Visual Studio Code**](https://github.com/microsoft/vscode): For
  open-sourcing their workbench UI and platform code, which provides the
  foundation for our user interface and extension host compatibility.
- [**Effect-TS**](https://www.effect.website/): For enabling us to build a
  robust, type-safe, and declarative application with a powerful structured
  concurrency and dependency management system in TypeScript.
- [**Rust**](https://www.rust-lang.org/): For the performance, safety, and
  modern tooling that powers our entire native backend.
- [**Tokio**](https://tokio.rs/) &
  [**Tonic**](https://github.com/hyperium/tonic): For providing the asynchronous
  runtime and gRPC framework that are the backbone of our high-performance IPC.
- [**Astro**](https://astro.build/): For its content-driven approach that allows
  us to build a fast and modern user interface for the `Sky` component.
- [**xterm.js**](https://xtermjs.org/): For the terminal emulator powering the
  integrated terminal, with fixes merged upstream from our work on Land.
- [**portable-pty**](https://github.com/wez/wezterm/tree/main/pty): For the
  cross-platform PTY backend that drives the integrated terminal in Mountain.
- [**PNPM**](https://pnpm.io/): For efficient and reliable management of our
  JavaScript dependencies.
- and many many more... <!-- TODO: Add a full list -->

We extend our sincere gratitude to the maintainers and contributors of these and
all the other dependencies we use. ❤️

---

**Project Maintainers**: Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues) |
[Security Policy](https://github.com/CodeEditorLand/Land/security/policy)
