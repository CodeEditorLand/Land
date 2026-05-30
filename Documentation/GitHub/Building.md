# Building Land 🏗️

This document provides comprehensive, step-by-step instructions for building the
**Land** code editor from source. It covers the complete two-step build process,
prerequisites, environment configuration, and element-specific build notes.

---

## Prerequisites 📦

Before building, ensure you have the following installed:

- **Rust** (1.95.0+ - workspace MSRV for all Rust elements) -
  [rustup.rs](https://rustup.rs/)
- **Node.js** (v24 required for building the Editor submodule) -
  [nodejs.org](https://nodejs.org/)
- **pnpm** (package manager) - `npm install -g pnpm`
- **Git** (with LFS support) - `git lfs install`
- **Protocol Buffer compiler** (optional, only if modifying `.proto` files)

Use `nvm` to install and select the required Node version:

```sh
nvm install 24
nvm use 24
```

> [!NOTE]
>
> Node 24 is required specifically to compile the VS Code Editor submodule (Step
> 1 below). The pinned version is tracked in
> `Dependency/Microsoft/Dependency/Editor/.nvmrc`.

---

## Build Overview 📋

The Land build is a **two-step linear flow**. Do NOT pull submodules recursively

- each submodule is managed independently on its own branch.

1. **Compile VS Code Source** - Build the VS Code platform code that `Cocoon`
   consumes. This runs in `Dependency/Microsoft/Dependency/Editor`.
2. **Build Land Application** - Compile the native Rust backend (`Mountain`) and
   bundle the TypeScript frontend (`Wind` + `Sky`) into a runnable Tauri
   application.

---

## Step 1: Compile VS Code Source 📦

The VS Code source is vendored as a Git submodule in
`Dependency/Microsoft/Dependency/Editor`. **This step is mandatory - Land cannot
build without it.** `Cocoon` (the extension host) and `Output` (the platform
bundle) both consume the compiled output produced here.

> [!IMPORTANT]
>
> You must be on **Node 24** for this step. The submodule's `.nvmrc` pins the
> exact version (`24.15.0`). Switch before running any of the commands below.

```sh
cd Dependency/Microsoft/Dependency/Editor

# Switch to the required Node version (reads .nvmrc automatically)
nvm use 24

# Reset to the expected upstream commit and clean all generated files
git fetch --all
git reset --hard Parent/main
git clean -dfx

# Install dependencies and compile
pnpm install
pnpm run compile
pnpm run compile-extensions-build
```

> [!IMPORTANT]
>
> The `compile-extensions-build` step produces the `out-<platform>` directories
> that `Rest` bundles into `@codeeditorland/output`. Without it, `Cocoon` will
> fail to locate the VS Code platform code at runtime.

---

## Step 2: Build Land Application 🚀

Return to the repository root and invoke the build script with the desired
profile.

```sh
cd Land # back to repository root

# For a debug build with bundled electron
export Trace=all Record=1 Disable=false
./Maintain/Debug/Build.sh --profile debug-electron-bundled

# For a production build
export Trace= Record= Disable=
./Maintain/Debug/Build.sh --profile production-electron-bundled
```

### Build Profiles

The `Build.sh` script accepts several profiles that control feature flags and
optimization levels. See
[`BuildMatrix.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/BuildMatrix.md)
for the full matrix of environment variables and tier configurations.

| Profile                         | Description                       |
| :------------------------------ | :-------------------------------- |
| `debug-electron-bundled`        | Full bundled Electron debug build |
| `debug-electron-unbundled`      | Electron debug without bundling   |
| `production-electron-bundled`   | Optimized production release      |
| `production-electron-unbundled` | Production without bundled assets |

---

## Environment Variables 🔧

Land uses a tier-gated system of environment variables to control build and
runtime behavior. All variables are read from `.env.Land*` files in the
repository root. Copy `.env.Land.example` to `.env.Land` to customize your local
environment.

For a complete reference, see
[`EnvironmentVariables.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/EnvironmentVariables.md).

Common variables:

| Variable                  | Default   | Description                              |
| :------------------------ | :-------- | :--------------------------------------- |
| `ProductVersion`          | `1.118.0` | Land version and feature tier gate       |
| `Bundle`                  | (unset)   | Set to `true` to trigger `Rest` bundling |
| `NetworkMountainPort`     | `50051`   | gRPC port for `Mountain` backend         |
| `NetworkCocoonPort`       | `50052`   | gRPC port for `Cocoon` extension host    |
| `TierFileSystem`          | `Layer2`  | Filesystem implementation tier           |
| `TierFileWatcher`         | `Layer4`  | File watching implementation tier        |
| `TierRemoteProcedureCall` | `gRPC`    | IPC transport mechanism                  |

---

## Build Artifacts 📁

After a successful build, artifacts are placed in:

```
Land/
├── Element/
│   ├── Mountain/Target/...        # Native Tauri app bundle
│   ├── Air/Target/...             # Background daemon binary
│   ├── Output/Target/...          # Bundled JavaScript platform code
│   ├── Cocoon/Compiled/...        # Built extension host
│   └── Sky/Target/...             # UI static assets
└── Maintain/Debug/Build.sh        # Build orchestration script
```

---

## Running the Application ▶️

```sh
# From the repository root
cd Land
./Element/Mountain/Target/ < platform > / < configuration > /Mountain
```

Or use the `Build.sh` script's `--run` flag to launch immediately after
building:

```sh
./Maintain/Debug/Build.sh --profile debug-electron-bundled --run
```

---

## Element-Specific Build Instructions 🗺️

Each Element may have additional build details. Refer to the specific README for
element-specific workflows:

| Element   | Build Instructions                                                                                                                   |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `Air`     | [`Element/Air/README.md`](https://github.com/CodeEditorLand/Air/tree/Current/README.md) - Background daemon build & daemon lifecycle |
| `Grove`   | [`Element/Grove/README.md`](https://github.com/CodeEditorLand/Grove/tree/Current/README.md) - Native Rust/WASM extension host build  |
| `Mist`    | [`Element/Mist/README.md`](https://github.com/CodeEditorLand/Mist/tree/Current/README.md) - DNS server build & testing               |
| `Rest`    | [`Element/Rest/README.md`](https://github.com/CodeEditorLand/Rest/tree/Current/README.md) - CLI compiler usage                       |
| `SideCar` | [`Element/SideCar/README.md`](https://github.com/CodeEditorLand/SideCar/tree/Current/README.md) - Download tool for runtime binaries |
| `Sky`     | [`Element/Sky/README.md`](https://github.com/CodeEditorLand/Sky/tree/Current/README.md) - Astro UI development                       |
| `Wind`    | [`Element/Wind/README.md`](https://github.com/CodeEditorLand/Wind/tree/Current/README.md) - Effect-TS service layer                  |
| `Cocoon`  | [`Element/Cocoon/README.md`](https://github.com/CodeEditorLand/Cocoon/tree/Current/README.md) - Extension host details               |

---

## Troubleshooting 🔍

### Compilation errors in `Dependency/Editor`

If the VS Code compilation fails, ensure you have cleaned the directory properly
and are on Node 24:

```sh
cd Dependency/Microsoft/Dependency/Editor
nvm use 24
git clean -dfx
rm -rf node_modules
pnpm install
pnpm run compile
```

### `Rest` binary not found

Set `REST_BINARY_PATH` to point to the compiled `rest` binary:

```sh
export REST_BINARY_PATH=/path/to/rest
```

### Missing environment variables

The build reads `.env.Land` from the repository root. If variables appear
missing, verify the file exists and is formatted correctly. See
[`EnvironmentVariables.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/EnvironmentVariables.md)
for syntax.

### Port conflicts

If `NetworkMountainPort` or `NetworkCocoonPort` are already in use (from a
previous run), kill the orphaned processes or change the port numbers in
`.env.Land`.

---

## Rebuilding & Clean 🧹

To perform a clean rebuild:

```sh
# Clean Rust artifacts
cd Element/Mountain
cargo clean

# Clean TypeScript builds
cd Element/Sky
rm -rf .tina .astro Target

# Clean VS Code recompilation
cd Dependency/Microsoft/Dependency/Editor
git clean -dfx
rm -rf node_modules out

# Rebuild everything
cd Land
./Maintain/Debug/Build.sh --profile debug-electron-bundled
```

---

## CI/CD & Automation 🤖

The build script is used by CI pipelines. See `Maintain/.GitHub/Workflows/` for
pre-configured GitHub Actions definitions. All CI builds set environment
variables via `.env.Land.CI` and use `--profile production-electron-bundled`.

---

## Further Reading 📖

- [`Documentation/GitHub/Workflow/`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Workflow)
    - Detailed component interaction workflows
- [`Documentation/GitHub/BuildMatrix.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/BuildMatrix.md)
    - Full build variant matrix
- [`Documentation/GitHub/EnvironmentVariables.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/EnvironmentVariables.md)
    - Complete env var reference
- [`Land/README.md`](https://github.com/CodeEditorLand/Land/tree/Current/README.md)
    - Project overview and quick start

---

**Project Maintainers**: Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Land) |
[Report an Issue](https://github.com/CodeEditorLand/Land/issues)
