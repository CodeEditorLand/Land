# Rhai-Based Dynamic Configuration System

## Overview

This implementation provides a unified, single-source-of-truth configuration
system for the entire CodeEditorLand monorepo using JSON5 for static
configuration and Rhai scripts for dynamic environment variable resolution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│      .vscode/land-config.json (Single Source of Truth)       │
│ ──────────────────────────────────────────────────────────│
│  • Profiles (debug, production, release)                     │
│  • Default templates                                        │
│  • Environment prefixes                                     │
│  • Build commands                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─── Static env vars (templates + profiles)
                      │
                      └─── Rhai scripts (.vscode/scripts/profiles/*.rhai)
                              │
                              ├─── Dynamic env var calculation
                              ├─── Pre/post build hooks
                              └─── Environment validation
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │   Maintain Build Crate (Rust)        │
                    │  ┌───────────────────────────────┐  │
                    │  │ ConfigLoader.rs                │  │
                    │  │   - Parse land-config.json     │  │
                    │  │   - Extract profiles/templates │  │
                    │  └───────────────────────────────┘  │
                    │  ┌───────────────────────────────┐  │
                    │  │ ScriptRunner.rs                │  │
                    │  │   - Execute Rhai scripts       │  │
                    │  │   - Extract env vars           │  │
                    │  │   - Call hooks                 │  │
                    │  └───────────────────────────────┘  │
                    │  ┌───────────────────────────────┐  │
                    │  │ EnvironmentResolver.rs        │  │
                    │  │   - Merge all env sources     │  │
                    │  │   - Expand variables           │  │
                    │  │   - Apply to process env       │  │
                    │  └───────────────────────────────┘  │
                    └─────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │      Final Build Execution           │
                    │  (Tauri build with all env vars)   │
                    └─────────────────────────────────────┘
```

## Files Created

### Configuration Files

1. **`.vscode/land-config.json`**
    - Single source of truth for all build configuration
    - JSON5 format (supports comments and trailing commas)
    - Defines profiles, templates, and build commands

2. **`.vscode/scripts/profiles/debug-profile.rhai`**
    - Debug build configuration script
    - Dynamic env var calculation
    - Pre/post build hooks

3. **`.vscode/scripts/profiles/production-profile.rhai`**
    - Production build configuration script
    - Optimized settings for release

4. **`.vscode/scripts/profiles/release-profile.rhai`**
    - Release build configuration script
    - Full packaging and signing steps

### Rust Modules

1. **`Element/Maintain/Source/Build/Rhai/mod.rs`**
    - Rhai engine initialization
    - Utility function registration
    - Public API exports

2. **`Element/Maintain/Source/Build/Rhai/ConfigLoader.rs`**
    - Load and parse land-config.json
    - Extract profiles and templates
    - Profile validation

3. **`Element/Maintain/Source/Build/Rhai/ScriptRunner.rs`**
    - Execute Rhai scripts
    - Extract env vars from scripts
    - Handle script hooks

4. **`Element/Maintain/Source/Build/Rhai/EnvironmentResolver.rs`**
    - Merge env vars from all sources
    - Variable expansion (${VAR})
    - Apply to process environment

## Usage

### Running a Build with a Profile

```bash
# Using the existing shell script (maintains compatibility)
./Maintain/Debug.sh

# Or manually with the new system
./Target/release/Maintain --profile debug -- pnpm tauri build --debug
```

### Rhai Script Structure

Each Rhai profile script exports the following functions:

```rhai
// Required: Return environment variables as a map
fn get_env_vars() {
    let vars = new_map();
    vars["NODE_ENV"] = "development";
    vars["RUST_LOG"] = "debug";
    vars
}

// Optional: Pre-build validation
fn pre_build_hook() {
    print("Starting build...");
    true  // Return false to abort build
}

// Optional: Post-build handling
fn post_build_hook(result) {
    if result.success == true {
        print("Build completed!");
    }
    result
}

// Optional: Environment validation
fn validate_environment() {
    true  // Return false if environment is invalid
}

// Export functions
export get_env_vars, pre_build_hook, post_build_hook, validate_environment;
```

### Adding a New Profile

1. Add profile to `.vscode/land-config.json`:

```json
{
	"profiles": {
		"custom": {
			"description": "Custom profile",
			"env": {
				"NODE_ENV": "staging",
				"RUST_LOG": "info"
			},
			"rhai_script": "scripts/profiles/custom-profile.rhai"
		}
	}
}
```

2. Create the Rhai script `.vscode/scripts/profiles/custom-profile.rhai`

3. Use the new profile:

```bash
./Target/release/Maintain --profile custom -- pnpm tauri build
```

## Environment Variable Resolution Order

Variables are resolved in this order (later values override earlier ones):

1. **Configuration files** (`.env.example` values)
2. **Templates** (`land-config.json` → `templates.env`)
3. **Profile static env vars** (`land-config.json` → `profiles.XXX.env`)
4. **Rhai script output** (`get_env_vars()` function)
5. **Current process environment** (if preserve_current is true)

## Benefits

1. **Single Source of Truth**: All configuration in one JSON file
2. **Dynamic Scripts**: Rhai scripts compute values without recompiling Rust
3. **Profile-Based**: Easy switching between build configurations
4. **Comments Supported**: JSON5 allows inline documentation
5. **Extensible**: Add profiles{
