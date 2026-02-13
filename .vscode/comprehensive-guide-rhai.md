# 📘 Rhai-Based Build System Comprehensive Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Configuration System](#configuration-system)
4. [Profile System](#profile-system)
5. [Rhai Scripts](#rhai-scripts)
6. [Naming Conventions](#naming-conventions)
7. [Color Coding](#color-coding)
8. [Workflow Tracking](#workflow-tracking)
9. [Bundler Integration](#bundler-integration)
10. [User Distribution](#user-distribution)
11. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Building with a Profile

```bash
# Using pnpm scripts (recommended)
pnpm build:debug
pnpm build:production
pnpm build:release
pnpm build:swc
pnpm build:oxc

# Or directly with Maintain binary
./Target/release/Maintain --profile debug -- pnpm tauri build --debug
```

### Creating a Custom Profile

1. Add to [`.vscode/land-config.json`](.vscode/land-config.json)
2. Create Rhai script in `.vscode/scripts/profiles/`
3. Add pnpm script to [`package.json`](package.json)
4. Document in [`NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md)

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    LAND CONFIGURATION SYSTEM                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐     ┌─────────────────────────────┐  │
│  │  package.json       │     │  .vscode/land-config.json  │  │
│  │  (pnpm scripts)     │────▶│  (Single Source of Truth)   │  │
│  └────────────────────┘     └─────────────┬───────────────┘  │
│                                        │                     │
│                                        ▼                     │
│  ┌────────────────────┐     ┌─────────────────────────────┐  │
│  │  Shell Scripts      │     │  Rhai Scripts (*.rhai)      │  │
│  │  (Legacy Support)   │────▶│  (Dynamic Configuration)    │  │
│  └────────────────────┘     └─────────────┬───────────────┘  │
│                                        │                     │
│                                        ▼                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │        MAINTAIN BUILD CRATE (Rust + Rhai)               │ │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐   │ │
│  │  │ConfigLoader  │  │ScriptRunner │  │EnvResolver   │   │ │
│  │  └──────────────┘  └─────────────┘  └──────────────┘   │ │
│  └────────────────────────────────┬────────────────────────┘ │
│                                   │                           │
│                                   ▼                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              FINAL BUILD EXECUTION                       │ │
│  │         (Tauri Build with Resolved Env Vars)            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration System

### File Structure

| File                                                   | Type  | Purpose                                                   |
| ------------------------------------------------------ | ----- | --------------------------------------------------------- |
| [`.vscode/land-config.json`](.vscode/land-config.json) | JSON5 | Primary configuration - profiles, templates, env prefixes |
| [`package.json`](package.json)                         | JSON  | pnpm scripts for workspace integration                    |
| [`Cargo.toml`](Cargo.toml)                             | TOML  | Rust workspace dependencies                               |
| [`.env.example`](.env.example)                         | ENV   | Environment variable template                             |

### Configuration Hierarchy

```
1. land-config.json (templates)
       │
       ├───> Profile static env vars
       │          │
       │          └───> Rhai script dynamic vars
       │                     │
       └───> Current process env (optional)
                           │
                           ▼
                     Final Environment
```

---

## 📦 Profile System

### Available Profiles

| Profile                | Color      | Description        | Use Case                | Rhai Script                                                                    |
| ---------------------- | ---------- | ------------------ | ----------------------- | ------------------------------------------------------------------------------ |
| **Debug**              | 🔵 #00ACC1 | Development builds | Local development       | [`debug-profile.rhai`](.vscode/scripts/profiles/debug-profile.rhai)            |
| **Production**         | 🟢 #43A047 | Release builds     | Production deployment   | [`production-profile.rhai`](.vscode/scripts/profiles/production-profile.rhai)  |
| **Release**            | 🟣 #6A1B9A | Full packaging     | Distribution            | [`release-profile.rhai`](.vscode/scripts/profiles/release-profile.rhai)        |
| **BundlerPreparation** | 🟡 #F9A825 | Bundler setup      | Pre-bundle config       | [`bundler-preparation.rhai`](.vscode/scripts/bundler/bundler-preparation.rhai) |
| **SWCBundle**          | 🟠 #FB8C00 | SWC bundler        | High-performance builds | [`swc-bundle.rhai`](.vscode/scripts/bundler/swc-bundle.rhai)                   |
| **OXCBundle**          | 🟤 #5D4037 | OXC bundler        | Next-gen toolchain      | [`oxc-bundle.rhai`](.vscode/scripts/bundler/oxc-bundle.rhai)                   |

### Profile Creation Checklist

For each new profile:

- [ ] Define in [`land-config.json`](.vscode/land-config.json) → `profiles`
      section
- [ ] Create Rhai script in `.vscode/scripts/profiles/` or
      `.vscode/scripts/bundler/`
- [ ] Implement `GetEnvVars()` function (required)
- [ ] Implement `PreBuildHook()` function (recommended)
- [ ] Implement `PostBuildHook()` function (recommended)
- [ ] Implement `ValidateEnvironment()` function (optional)
- [ ] Add color code in [`NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md)
- [ ] Add to [`package.json`](package.json) scripts
- [ ] Test build execution
- [ ] Document cross-references

---

## 🧪 Rhai Scripts

### Script Structure

```rhai
//=============================================================================//
// Rhai Script: [ProfileName] Profile Configuration
//=============================================================================//
// Profile: [ProfileName]
//
// Description: [Brief description]
//
// Color: [🎨 Color Code]
// Use Case: [Primary use scenario]
//
// File References:
// - Config: .vscode/land-config.json
// - Related: ../../Element/Maintain/Source/Build/Rhai/*.rs
//=============================================================================//

/// Get environment variables for this profile.
fn GetEnvVars() {
    let vars = new_map();

    // TODO: Add environment variables
    vars["EXAMPLE_VAR"] = "value";

    vars
}

/// Pre-build hook - executed before build starts.
fn PreBuildHook() {
    print("=== Starting [ProfileName] Build ===");
    true  // Return false to abort build
}

/// Post-build hook - executed after build completes.
fn PostBuildHook(result) {
    if result.success == true {
        print("=== [ProfileName] Build Completed ===");
    }
    result
}

/// Validate environment requirements.
fn ValidateEnvironment() {
    true  // Return false if environment is invalid
}

export GetEnvVars, PreBuildHook, PostBuildHook, ValidateEnvironment;
```

### Script File Locations

| Type                 | Location                    | Examples                                    |
| -------------------- | --------------------------- | ------------------------------------------- |
| **Build Profiles**   | `.vscode/scripts/profiles/` | debug-profile.rhai, production-profile.rhai |
| **Bundler Profiles** | `.vscode/scripts/bundler/`  | swc-bundle.rhai, oxc-bundle.rhai            |
| **Custom Profiles**  | `.vscode/scripts/custom/`   | _(user-defined)_                            |

---

## 📝 Naming Conventions

### PascalCase for Rhai Functions

| Function Type      | Pattern                 | Example                                                                   |
| ------------------ | ----------------------- | ------------------------------------------------------------------------- |
| Environment getter | `GetEnvVars()`          | [`GetEnvVars()`](.vscode/scripts/profiles/debug-profile.rhai:47)          |
| Pre-build hook     | `PreBuildHook()`        | [`PreBuildHook()`](.vscode/scripts/profiles/debug-profile.rhai:55)        |
| Post-build hook    | `PostBuildHook()`       | [`PostBuildHook()`](.vscode/scripts/profiles/debug-profile.rhai:69)       |
| Validator          | `ValidateEnvironment()` | [`ValidateEnvironment()`](.vscode/scripts/profiles/debug-profile.rhai:83) |

### Environment Variable Naming

| Category        | Pattern                | Example                          | Color      |
| --------------- | ---------------------- | -------------------------------- | ---------- |
| Build Flags     | `PascalCase`           | `Debug`, `Bundle`, `Clean`       | 🟥 #C62828 |
| Mountain/Cocoon | `MOUNTAIN_PASCAL_CASE` | `MOUNTAIN_HOST`, `MOUNTAIN_PORT` | 🟦 #1E88E5 |
| Air             | `AIR_PASCAL_CASE`      | `AIR_LOG_FILE`, `AIR_LOG_DIR`    | 🟩 #43A047 |
| Grove/VSCode    | `VSCODE_PASCAL_CASE`   | `VSCODE_APP_ROOT`                | 🟪 #8E24AA |
| Maintain        | `LAND_PASCAL_CASE`     | `LAND_PROFILE`                   | 🟧 #FB8C00 |
| Node            | `NODE_PASCAL_CASE`     | `NODE_ENV`, `NODE_VERSION`       | 🔵 #00ACC1 |
| Rust            | `RUST_PASCAL_CASE`     | `RUST_LOG`                       | 🟤 #5D4037 |
| Tauri           | `TAURI_PASCAL_CASE`    | `TAURI_SIGNING_PRIVATE_KEY`      | 🟣 #6A1B9A |
| Bundler         | `BUNDLER_PASCAL_CASE`  | `BUNDLER_TYPE`, `SWC_TARGET`     | 🟡 #F9A825 |

---

## 🎨 Color Coding

### Build Flow States (5 Variants)

| Phase 1              | Phase 2                 | Phase 3            | Phase 4      | Phase 5           |
| -------------------- | ----------------------- | ------------------ | ------------ | ----------------- |
| 🔵 **Configuration** | 🟢 **Script Execution** | 🟡 **Environment** | 🟠 **Build** | 🔴 **Post-Build** |
| Loading              |                         | Resolution         |              |                   |

See [`NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md) for complete color
tables.

---

## 🔄 Workflow Tracking

### Complete Build Workflow (5 Phases × 5 Steps)

```
Phase 1: Configuration Loading (🔵)
├── 1.1 Load Config (.vscode/land-config.json)       ✓
├── 1.2 Parse JSON5 (ConfigLoader.rs)                ✓
├── 1.3 Validate Profile                           ✓
├── 1.4 Extract Templates                          ✓
└── 1.5 Load Rhai Script (*.rhai)                  ✓

Phase 2: Script Execution (🟢)
├── 2.1 Create Engine (Rhai/mod.rs)                 ✓
├── 2.2 Register Functions                         ✓
├── 2.3 Compile Script                             ✓
├── 2.4 Execute GetEnvVars()                       ✓
└── 2.5 Execute PreBuildHook()                     ✓

Phase 3: Environment Resolution (🟡)
├── 3.1 Merge Templates (EnvironmentResolver.rs)    ✓
├── 3.2 Merge Profile Env                          ✓
├── 3.3 Merge Script Env                           ✓
├── 3.4 Expand Variables (${VAR})                  ✓
└── 3.5 Apply to Process                           ✓

Phase 4: Build Execution (🟠)
├── 4.1 Run Tauri Build                            ✓
├── 4.2 Pre-Bundle Steps                           ✓
├── 4.3 Compile Assets                             ✓
├── 4.4 Create Bundle                              ✓
└── 4.5 Sign Package                               ✓

Phase 5: Post-Build (🔴)
├── 5.1 Execute PostBuildHook()                    ✓
├── 5.2 Validate Artifacts                         ✓
├── 5.3 Clean Up                                   ✓
├── 5.4 Report Results                             ✓
└── 5.5 Restore Files                              ✓
```

---

## 📦 Bundler Integration

### Supported Bundlers

| Bundler | Language | Status   | Profile                                                 | Performance   |
| ------- | -------- | -------- | ------------------------------------------------------- | ------------- |
| **SWC** | Rust     | ✅ Ready | [`swc-bundle`](.vscode/scripts/bundler/swc-bundle.rhai) | ⚡ Ultra-fast |
| **OXC** | Rust     | ✅ Ready | [`oxc-bundle`](.vscode/scripts/bundler/oxc-bundle.rhai) | ⚡⚡ Next-gen |

### Bundler Preparation

Use the bundler preparation script to configure your build system:

```bash
pnpm prepare:bundler
```

Script:
[`.vscode/scripts/bundler/bundler-preparation.rhai`](.vscode/scripts/bundler/bundler-preparation.rhai)

### Bundler Comparison

| Feature      | SWC       | OXC         | Notes                  |
| ------------ | --------- | ----------- | ---------------------- |
| Speed        | ⚡⚡⚡    | ⚡⚡⚡⚡    | OXC slightly faster    |
| TypeScript   | ✅        | ✅          | Both support TS        |
| JSX/TSX      | ✅        | ✅          | Both support JSX       |
| Minification | ✅        | ✅          | Both have minifiers    |
| Tree Shaking | ✅        | ✅          | Both support it        |
| Source Maps  | ✅        | ✅          | Both support it        |
| Linter       | ❌        | ✅          | OXC includes linter    |
| Formatter    | ❌        | ✅          | OXC includes formatter |
| Ecosystem    | 🟢 Mature | 🟡 Emerging | SWC more established   |

---

## 👥 User Distribution

### Distributing Rhai Scripts to Users

Users can receive a folder of Rhai scripts to customize their builds:

```bash
# User receives
.vscode/
├── land-config.json # Their configuration
└── scripts/
├── profiles/ # Build profiles
│ ├── debug-profile.rhai
│ └── custom-profile.rhai
└── bundler/ # Bundler profiles
└── swc-bundle.rhai
```

### User Workflow

1. **Receive Scripts** - Copy `.vscode/scripts/` to their workspace
2. **Modify Config** - Update [`land-config.json`](.vscode/land-config.json)
3. **Run Build** - Execute with
   `./Target/release/Maintain --profile custom -- pnpm tauri build`

### Custom Profile Template

See [`NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md) → Placeholder Template
section

---

## 🔧 Troubleshooting

### Common Issues

| Issue                   | Solution                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Script not found        | Check path in [`land-config.json`](.vscode/land-config.json) → `rhai_script`          |
| Environment var not set | Verify [`GetEnvVars()`](.vscode/scripts/profiles/debug-profile.rhai:47) returns map   |
| Build fails             | Check [`PreBuildHook()`](.vscode/scripts/profiles/debug-profile.rhai:55) return value |
| Profile not recognized  | Add to [`land-config.json`](.vscode/land-config.json) → `profiles`                    |
| Color code not showing  | Update [`NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md) table                       |

### Debug Commands

```bash
# Check configuration
cat .vscode/land-config.json

# Validate Rhai script syntax
./Target/release/Maintain --profile debug --dry-run

# Verbose logging
RUST_LOG=trace ./Target/release/Maintain --profile debug -- pnpm tauri build
```

---

## 📚 References

### Core Documentation

| Document          | Path                                                                                     | Purpose               |
| ----------------- | ---------------------------------------------------------------------------------------- | --------------------- |
| **Configuration** | [`.vscode/land-config.json`](.vscode/land-config.json)                                   | Main configuration    |
| **Patterns**      | [`.vscode/NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md)                               | Naming & color coding |
| **Rhai API**      | [`Element/Maintain/Source/Build/Rhai/mod.rs`](Element/Maintain/Source/Build/Rhai/mod.rs) | Rust Rhai integration |

### Script Files

| Module                  | Path                                                                                  | Responsibility       |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| **ConfigLoader**        | [`ConfigLoader.rs`](Element/Maintain/Source/Build/Rhai/ConfigLoader.rs)               | Load & parse configs |
| **ScriptRunner**        | [`ScriptRunner.rs`](Element/Maintain/Source/Build/Rhai/ScriptRunner.rs)               | Execute Rhai scripts |
| **EnvironmentResolver** | [`EnvironmentResolver.rs`](Element/Maintain/Source/Build/Rhai/EnvironmentResolver.rs) | Resolve env vars     |

---

## ✅ Quick Reference

### Build Commands

```bash
# Debug build
pnpm build:debug

# Production build
pnpm build:production

# Release build
pnpm build:release

# SWC bundler
pnpm build:swc

# OXC bundler
pnpm build:oxc
```

### File Locations

| What          | Where                                                                        |
| ------------- | ---------------------------------------------------------------------------- |
| Configuration | [`.vscode/land-config.json`](.vscode/land-config.json)                       |
| Profiles      | `.vscode/scripts/profiles/*.rhai`                                            |
| Bundlers      | `.vscode/scripts/bundler/*.rhai`                                             |
| Rust Modules  | [`Element/Maintain/Source/Build/Rhai/`](Element/Maintain/Source/Build/Rhai/) |
| Naming Guide  | [`.vscode/NAMING_PATTERNS.md`](.vscode/NAMING_PATTERNS.md)                   |
| pnpm Scripts  | [`package.json`](package.json)                                               |

---

_Last Updated: 2025-02-13_ _Version: 1.0.0_ _Status: ✅ Complete_
