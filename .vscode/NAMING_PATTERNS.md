# Naming Patterns & Color Coding Guide

## Overview

This document defines the comprehensive naming conventions and color coding
system used throughout the CodeEditorLand monorepo's Rhai-powered build system.

---

## 🔠 PascalCase Naming Convention

### Components

| Component Type   | PascalCase Pattern | Example                | Color Code          |
| ---------------- | ------------------ | ---------------------- | ------------------- |
| **Rust Modules** | `ModuleName`       | `EnvironmentResolver`  | 🟦 #1E88E5 (Blue)   |
| **Structs**      | `StructName`       | `ScriptResult`         | 🟩 #43A047 (Green)  |
| **Traits**       | `TraitName`        | `Resolvable`           | 🟪 #8E24AA (Purple) |
| **Enums**        | `EnumName`         | `BuildFlavor`          | 🟧 #FB8C00 (Orange) |
| **Functions**    | `FunctionName`     | `ExecuteProfileScript` | 🟥 #C62828 (Red)    |

---

## 🎨 Color Coding System

### Build Flow States (5 Variants per Row)

| State 1                                                | State 2                               | State 3                                                                            | State 4                                                | State 5          |
| ------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------- |
| 🔵 **ConfigLoading**                                   | 🟢 **ScriptRunning**                  | 🟡 **EnvResolving**                                                                | 🟠 **BuildExecuting**                                  | 🔴 **PostBuild** |
|                                                        |                                       |                                                                                    |                                                        |                  |
| [`.vscode/land-config.json`](.vscode/land-config.json) | [`*.rhai`](.vscode/scripts/profiles/) | [`EnvironmentResolver`](Element/Maintain/Source/Build/Rhai/EnvironmentResolver.rs) | [`Tauri Build`](Element/Mountain/tauri.conf.prod.json) | Bundle/Package   |

---

## 📊 Environment Variable Naming Patterns

| Category            | Pattern                | Example                          | Color      | Scope          |
| ------------------- | ---------------------- | -------------------------------- | ---------- | -------------- |
| **Build Flags**     | `PascalCase`           | `Debug`, `Bundle`, `Clean`       | 🟥 #C62828 | Build System   |
| **Mountain/Cocoon** | `MOUNTAIN_PASCAL_CASE` | `MOUNTAIN_HOST`, `MOUNTAIN_PORT` | 🟦 #1E88E5 | Cocoon         |
| **Air**             | `AIR_PASCAL_CASE`      | `AIR_LOG_FILE`, `AIR_LOG_DIR`    | 🟩 #43A047 | Air            |
| **Grove/VSCode**    | `VSCODE_PASCAL_CASE`   | `VSCODE_APP_ROOT`                | 🟪 #8E24AA | Grove          |
| **Maintain**        | `LAND_PASCAL_CASE`     | `LAND_PROFILE`                   | 🟧 #FB8C00 | Maintain       |
| **Node**            | `NODE_PASCAL_CASE`     | `NODE_ENV`, `NODE_VERSION`       | 🔵 #00ACC1 | Node.js        |
| **Rust**            | `RUST_PASCAL_CASE`     | `RUST_LOG`                       | 🟤 #5D4037 | Rust Toolchain |
| **Tauri**           | `TAURI_PASCAL_CASE`    | `TAURI_SIGNING_PRIVATE_KEY`      | 🟣 #6A1B9A | Tauri          |

---

## 🔄 Build Workflow Tracking (5 Variants)

### Phase 1: Configuration Loading

| Step | Component         | File Reference                                                          | Status   | Color |
| ---- | ----------------- | ----------------------------------------------------------------------- | -------- | ----- |
| 1.1  | Load Config       | [`.vscode/land-config.json`](.vscode/land-config.json)                  | ✓ Loaded | 🟢    |
| 1.2  | Parse JSON5       | [`ConfigLoader.rs`](Element/Maintain/Source/Build/Rhai/ConfigLoader.rs) | ✓ Parsed | 🟢    |
| 1.3  | Validate Profile  | ✓ Valid                                                                 | 🟢       |       |
| 1.4  | Extract Templates | ✓ Extracted                                                             | 🟢       |       |
| 1.5  | Load Rhai Script  | [`.vscode/scripts/profiles/*.rhai`](.vscode/scripts/profiles/)          | ✓ Loaded | 🟢    |

### Phase 2: Script Execution

| Step | Component                | File Reference                                             | Status    | Color |
| ---- | ------------------------ | ---------------------------------------------------------- | --------- | ----- |
| 2.1  | Create Engine            | [`Rhai/mod.rs`](Element/Maintain/Source/Build/Rhai/mod.rs) | ✓ Created | 🟢    |
| 2.2  | Register Functions       | ✓ Registered                                               | 🟢        |       |
| 2.3  | Compile Script           | ✓ Compiled                                                 | 🟢        |       |
| 2.4  | Execute `GetEnvVars()`   | ✓ Executed                                                 | 🟢        |       |
| 2.5  | Execute `PreBuildHook()` | ✓ Executed                                                 | 🟢        |

### Phase 3: Environment Resolution

| Step | Component                   | File Reference                                                                        | Status   | Color |
| ---- | --------------------------- | ------------------------------------------------------------------------------------- | -------- | ----- |
| 3.1  | Merge Templates             | [`EnvironmentResolver.rs`](Element/Maintain/Source/Build/Rhai/EnvironmentResolver.rs) | ✓ Merged | 🟢    |
| 3.2  | Merge Profile Env           | ✓ Merged                                                                              | 🟢       |       |
| 3.3  | Merge Script Env            | ✓ Merged                                                                              | 🟢       |       |
| 3.4  | Expand Variables (`${VAR}`) | ✓ Expanded                                                                            | 🟢       |       |
| 3.5  | Apply to Process            | ✓ Applied                                                                             | 🟢       |

### Phase 4: Build Execution

| Step | Component        | File Reference                           | Status    | Color |
| ---- | ---------------- | ---------------------------------------- | --------- | ----- |
| 4.1  | Run Tauri Build  | [`Maintain/Debug.sh`](Maintain/Debug.sh) | ✓ Running | 🟡    |
| 4.2  | Pre-Bundle Steps | ✓ Executing                              | 🟡        |       |
| 4.3  | Compile Assets   | ✓ Compiling                              | 🟡        |       |
| 4.4  | Create Bundle    | ✓ Bundling                               | 🟡        |       |
| 4.5  | Sign Package     | ✓ Signing                                | 🟡        |

### Phase 5: Post-Build

| Step | Component                 | File Reference                                                          | Status     | Color |
| ---- | ------------------------- | ----------------------------------------------------------------------- | ---------- | ----- |
| 5.1  | Execute `PostBuildHook()` | [`ScriptRunner.rs`](Element/Maintain/Source/Build/Rhai/ScriptRunner.rs) | ✓ Executed | 🟢    |
| 5.2  | Validate Artifacts        | ✓ Validated                                                             | 🟢         |       |
| 5.3  | Clean Up                  | ✓ Cleaned                                                               | 🟢         |       |
| 5.4  | Report Results            | ✓ Reported                                                              | 🟢         |       |
| 5.5  | Restore Files             | ✓ Restored                                                              | 🟢         |

---

## 📦 Profile Types (5 Variants)

| Profile        | Purpose            | Rhai Script                                                                   | Color      | Use Case              |
| -------------- | ------------------ | ----------------------------------------------------------------------------- | ---------- | --------------------- |
| **Debug**      | Development builds | [`debug-profile.rhai`](.vscode/scripts/profiles/debug-profile.rhai)           | 🔵 #00ACC1 | Local development     |
| **Production** | Release builds     | [`production-profile.rhai`](.vscode/scripts/profiles/production-profile.rhai) | 🟢 #43A047 | Production deployment |
| **Release**    | Full packaging     | [`release-profile.rhai`](.vscode/scripts/profiles/release-profile.rhai)       | 🟣 #6A1B9A | Distribution          |
| **Staging**    | Pre-prod testing   | _(future)_                                                                    | 🟡 #F9A825 | Staging environment   |
| **Custom**     | User-defined       | _(user-provided)_                                                             | 🟧 #FB8C00 | Custom configurations |

---

## 🔗 File Cross-References

### Configuration Files

| File                                                   | Type  | Description          | Referenced By                                                        |
| ------------------------------------------------------ | ----- | -------------------- | -------------------------------------------------------------------- |
| [`.vscode/land-config.json`](.vscode/land-config.json) | JSON5 | Main configuration   | [`ConfigLoader`](Element/Maintain/Source/Build/Rhai/ConfigLoader.rs) |
| [`Cargo.toml`](Cargo.toml)                             | TOML  | Workspace manifest   | All crates                                                           |
| [`.env.example`](.env.example)                         | ENV   | Environment template | Shell scripts                                                        |

### Rhai Scripts

| File                                                                          | Profile    | Description        | Used By           |
| ----------------------------------------------------------------------------- | ---------- | ------------------ | ----------------- |
| [`debug-profile.rhai`](.vscode/scripts/profiles/debug-profile.rhai)           | Debug      | Development config | Debug builds      |
| [`production-profile.rhai`](.vscode/scripts/profiles/production-profile.rhai) | Production | Release config     | Production builds |
| [`release-profile.rhai`](.vscode/scripts/profiles/release-profile.rhai)       | Release    | Distribution       | Release builds    |

### Rust Modules

| Module                | Path                                                                                                                     | Responsibility            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `ConfigLoader`        | [`Element/Maintain/Source/Build/Rhai/ConfigLoader.rs`](Element/Maintain/Source/Build/Rhai/ConfigLoader.rs)               | Load & parse JSON5 config |
| `ScriptRunner`        | [`Element/Maintain/Source/Build/Rhai/ScriptRunner.rs`](Element/Maintain/Source/Build/Rhai/ScriptRunner.rs)               | Execute Rhai scripts      |
| `EnvironmentResolver` | [`Element/Maintain/Source/Build/Rhai/EnvironmentResolver.rs`](Element/Maintain/Source/Build/Rhai/EnvironmentResolver.rs) | Merge & resolve env vars  |

---

## 🚀 Integration Points

### pnpm Workspace Scripts

| Script             | Package                        | Profile    | Command                                                                 |
| ------------------ | ------------------------------ | ---------- | ----------------------------------------------------------------------- |
| `build:debug`      | [`package.json`](package.json) | Debug      | `./Target/release/Maintain --profile debug -- pnpm tauri build --debug` |
| `build:production` | [`package.json`](package.json) | Production | `./Target/release/Maintain --profile production -- pnpm tauri build`    |
| `build:release`    | [`package.json`](package.json) | Release    | `./Target/release/Maintain --profile release -- pnpm tauri build`       |

### Shell Script Compatibility

| Shell Script                                 | Rhai Equivalent                                                         | Status       |
| -------------------------------------------- | ----------------------------------------------------------------------- | ------------ |
| [`Maintain/Debug.sh`](Maintain/Debug.sh)     | [`debug-profile.rhai`](.vscode/scripts/profiles/debug-profile.rhai)     | ✓ Compatible |
| [`Maintain/Release.sh`](Maintain/Release.sh) | [`release-profile.rhai`](.vscode/scripts/profiles/release-profile.rhai) | ✓ Compatible |
| [`Maintain/Save.sh`](Maintain/Save.sh)       | _(future custom profile)_                                               | 🔄 Planned   |

---

## 📝 Checklist Standards

### Profile Completeness Checklist

For each profile, verify:

- [ ] Profile defined in [`land-config.json`](.vscode/land-config.json)
- [ ] Rhai script created in
      [`.vscode/scripts/profiles/`](.vscode/scripts/profiles/)
- [ ] `GetEnvVars()` function implemented
- [ ] `PreBuildHook()` function implemented
- [ ] `PostBuildHook()` function implemented
- [ ] `ValidateEnvironment()` function implemented (optional)
- [ ] Documented in workflow table
- [ ] Color code assigned
- [ ] pnpm script registered
- [ ] Shell script compatibility verified

---

## 🔧 Placeholder Template

For new profiles, use this template:

```rhai
//=============================================================================//
// Rhai Script: [ProfileName] Profile Configuration
//=============================================================================//
// Profile: [ProfileName]
//
// Description: [Brief description here]
//
// Color: [🎨 Color Code]
// Use Case: [Primary use scenario]
//
// TODO Checklist:
// [ ] Define profile in land-config.json
// [ ] Implement GetEnvVars()
// [ ] Implement PreBuildHook()
// [ ] Implement PostBuildHook()
// [ ] Add to NAMING_PATTERNS.md
// [ ] Register pnpm script
// [ ] Test build
//=============================================================================//

// TODO: Implement get_env_vars()
fn get_env_vars() {
    let vars = new_map();

    // TODO: Add environment variables
    // vars["EXAMPLE_VAR"] = "value";

    vars
}

// TODO: Implement pre_build_hook()
fn pre_build_hook() {
    print("=== Starting [ProfileName] Build ===");
    true
}

// TODO: Implement post_build_hook()
fn post_build_hook(result) {
    if result.success == true {
        print("=== [ProfileName] Build Completed ===");
    } else {
        print("=== [ProfileName] Build Failed ===");
    }
    result
}

export get_env_vars, pre_build_hook, post_build_hook;
```
