# Quick Start: Cargo CLI for Build System

## Important Note on Package Names

The build system uses PascalCase naming convention. The package is named
`Maintain` in
[`Element/Maintain/Cargo.toml`](https://github.com/CodeEditorLand/Maintain/tree/Current/Cargo.toml#L38).

## CLI Overview

The Land Build System CLI provides a configuration-driven build system that
enables triggering builds directly with Cargo instead of shell scripts. It reads
configuration from
[`.vscode/land-config.json`](https://github.com/CodeEditorLand/Land/tree/main/.vscode/land-config.json#L1)
and supports multiple build profiles.

```
Usage: Maintain [OPTIONS] [-- <BUILD_ARGS>...] [COMMAND]
```

## Available Commands

### `build` - Execute a build with the specified profile

```bash
# Basic usage
Maintain build --profile <PROFILE>

# With overrides
Maintain build --profile debug-mountain --verbose

# Dry run (preview without building)
Maintain build --profile debug --dry-run

# With additional build args
Maintain build --profile production -- --additional-arg
```

**Options:**

- `-p, --profile <PROFILE>` - Build profile to use (required)
- `--dry-run` - Enable dry-run mode (show config without building)
- `-v, --verbose` - Enable verbose output
- `-c, --config <CONFIG>` - Configuration file path (default:
  `.vscode/land-config.json`)
- `-w, --workbench <WORKBENCH>` - Override workbench type
- `-n, --node-version <NODE_VERSION>` - Override Node.js version
- `-e, --environment <ENVIRONMENT>` - Override Node.js environment
- `-d, --dependency <DEPENDENCY>` - Override dependency source

### `list-profiles` - List all available build profiles

```bash
# Basic list
Maintain list-profiles

# Show detailed information
Maintain list-profiles --verbose
```

**Options:**

- `-v, --verbose` - Show detailed information for each profile
- `-c, --config <CONFIG>` - Configuration file path
- `-w, --workbench <WORKBENCH>` - Override workbench type
- `-n, --node-version <NODE_VERSION>` - Override Node.js version
- `-e, --environment <ENVIRONMENT>` - Override Node.js environment
- `-d, --dependency <DEPENDENCY>` - Override dependency source
- `--dry-run` - Enable dry-run mode

### `show-profile` - Show details for a specific profile

```bash
# Show profile details
Maintain show-profile debug-mountain

# With verbose output
Maintain show-profile production --verbose
```

**Arguments:**

- `<PROFILE>` - Profile name to show (required)

**Options:**

- `-v, --verbose` - Enable verbose output
- `-c, --config <CONFIG>` - Configuration file path
- `-w, --workbench <WORKBENCH>` - Override workbench type
- `-n, --node-version <NODE_VERSION>` - Override Node.js version
- `-e, --environment <ENVIRONMENT>` - Override Node.js environment
- `-d, --dependency <DEPENDENCY>` - Override dependency source
- `--dry-run` - Enable dry-run mode

### `validate-profile` - Validate a build profile

```bash
# Validate a profile
Maintain validate-profile debug-mountain

# Validate with verbose output
Maintain validate-profile production --verbose
```

**Arguments:**

- `<PROFILE>` - Profile name to validate (required)

**Options:**

- `-v, --verbose` - Enable verbose output
- `-c, --config <CONFIG>` - Configuration file path
- `-w, --workbench <WORKBENCH>` - Override workbench type
- `-n, --node-version <NODE_VERSION>` - Override Node.js version
- `-e, --environment <ENVIRONMENT>` - Override Node.js environment
- `-d, --dependency <DEPENDENCY>` - Override dependency source
- `--dry-run` - Enable dry-run mode

### `resolve` - Show current environment variable resolution

```bash
# Show resolution in table format
Maintain resolve --profile debug-mountain

# Show in JSON format
Maintain resolve --profile production --format json

# Show as environment variables
Maintain resolve --profile release --format env
```

**Options:**

- `-p, --profile <PROFILE>` - Profile name to resolve (required)
- `-f, --format <FORMAT>` - Output format: `table` (default), `json`, or `env`
- `-v, --verbose` - Enable verbose output
- `-c, --config <CONFIG>` - Configuration file path
- `-w, --workbench <WORKBENCH>` - Override workbench type
- `-n, --node-version <NODE_VERSION>` - Override Node.js version
- `-e, --environment <ENVIRONMENT>` - Override Node.js environment
- `-d, --dependency <DEPENDENCY>` - Override dependency source
- `--dry-run` - Enable dry-run mode

### Global Options

These options are available across all commands:

- `-c, --config <CONFIG>` - Configuration file path (default:
  `.vscode/land-config.json`)
- `-w, --workbench <WORKBENCH>` - Override workbench type
- `-n, --node-version <NODE_VERSION>` - Override Node.js version
- `-e, --environment <ENVIRONMENT>` - Override Node.js environment
- `-d, --dependency <DEPENDENCY>` - Override dependency source
- `--dry-run` - Enable dry-run mode (show config without building)
- `-v, --verbose` - Enable verbose output
- `-h, --help` - Print help
- `-V, --version` - Print version

## Recommended Usage Patterns

### Using Cargo Run

```bash
# List all available profiles
cargo run --bin Maintain -- list-profiles

# Show profile details
cargo run --bin Maintain -- show-profile debug-mountain

# Execute a build
cargo run --bin Maintain -- build --profile debug-mountain

# Dry run (show config without building)
cargo run --bin Maintain -- build --profile debug --dry-run

# Validate a profile
cargo run --bin Maintain -- validate-profile debug-mountain

# Resolve environment variables
cargo run --bin Maintain -- resolve --profile debug --format json

# With overrides
cargo run --bin Maintain -- build --profile debug --workbench Mountain --node-version 22
```

### Using Built Binary

**IMPORTANT:** You must rebuild the binary after making changes to the CLI code:

```bash
# Build the binary
cargo build --bin Maintain --release

# Run the built binary directly
./Target/release/Maintain list-profiles
./Target/release/Maintain build --profile debug-mountain
./Target/release/Maintain build --profile production --verbose

# Get help
./Target/release/Maintain --help
./Target/release/Maintain build --help
```

### Using Profile Shortcut

The `-p` flag provides a shortcut for the `build` command:

```bash
# Both are equivalent
./Target/release/Maintain build --profile debug-mountain
./Target/release/Maintain -p debug-mountain

# With options
./Target/release/Maintain -p debug-mountain --verbose --dry-run
```

### Legacy Mode (Backward Compatible)

Legacy mode only activates when the first argument after `--` is a build command
(like `pnpm`, `cargo`, `npm`), not a CLI flag (like `list-profiles`,
`--profile`, etc.).

```bash
# Legacy mode (backward compatible)
./Target/release/Maintain -- pnpm tauri build --debug
./Target/release/Maintain -- cargo build --release
```

**Note:** The new CLI mode takes precedence. Legacy mode is only for backward
compatibility.

## Profile Aliases

Short aliases are available for quick access to common profiles:

| Alias | Full Profile |
| ----- | -------------- |
| `d` | debug |
| `dm` | debug-mountain |
| `de` | debug-electron |
| `p` | production |
| `r` | release |
| `w` | web-browser |

## Example Usage

```bash
# Quick debug build with recommended workbench
cargo run --bin Maintain -- -p dm

# Production build with verbose output
cargo run --bin Maintain -- -p production -v

# See what a profile does before building
cargo run --bin Maintain -- show-profile dm

# Validate a profile configuration
cargo run --bin Maintain -- validate-profile dm

# Profile with overrides
cargo run --bin Maintain -- -p debug -w Mountain -n 22 -e development

# Dry run to preview configuration
cargo run --bin Maintain -- -p debug --dry-run

# Show environment variables for a profile
cargo run --bin Maintain -- resolve --profile production --format env
```

## Available Profiles

Run `list-profiles` to see all available profiles:

```bash
cargo run --bin Maintain -- list-profiles
```

Output shows profiles organized by type:

- **Debug Profiles**: `debug`, `debug-electron`, `debug-mountain` (RECOMMENDED)
- **Release Profiles**: `production`, `release`, `web-browser`
- **Bundler Profiles**: `bundler-preparation`, `oxc-bundle`, `swc-bundle`

## Troubleshooting

### Package Not Found Error

If you get "package not found" errors, use `--bin` instead of `--package`:

Incorrect:

```bash
cargo run --package Maintain -- list-profiles # ❌ Won't work
```

Correct:

```bash
cargo run --bin Maintain -- list-profiles # ✅ Works
```

### Configuration Not Found

If you see "Failed to load configuration", ensure:

1. The file
   [`.vscode/land-config.json`](https://github.com/CodeEditorLand/Land/tree/main/.vscode/land-config.json#L1)
   exists
2. The file has valid JSON5 format
3. The file contains the `version` field at the root level

### Profile Not Found

If a profile is not found:

1. Run `list-profiles` to see available profiles
2. Check for typos in the profile name
3. Use profile aliases (e.g., `dm` instead of `debug-mountain`)

### Binary Not Updated

If changes to CLI code aren't reflected:

```bash
# Rebuild the binary
cargo build --bin Maintain --release
```

## Advanced Usage

### Multiple Build Args

Pass additional arguments to the build command:

```bash
./Target/release/Maintain build --profile production -- --target universal-apple-darwin
```

### Profile Resolution Chain

The CLI resolves profiles in this order:

1. Check if the profile name is an alias → resolve to full name
2. Look up the profile in configuration
3. Apply profile environment variables
4. Apply CLI overrides (workbench, node-version, etc.)

### Environment Variable Overrides

Override any environment variable from the command line:

```bash
# Override workbench
./Target/release/Maintain -p debug -w Mountain

# Override Node.js version
./Target/release/Maintain -p production -n 22

# Override environment
./Target/release/Maintain -p debug -e development

# Override dependency source
./Target/release/Maintain -p release -d Microsoft/VSCode

# Combine multiple overrides
./Target/release/Maintain -p debug -w Mountain -n 22 -e development
```

## Getting Help

```bash
# Main help
./Target/release/Maintain --help

# Command-specific help
./Target/release/Maintain build --help
./Target/release/Maintain list-profiles --help
./Target/release/Maintain show-profile --help
./Target/release/Maintain validate-profile --help
./Target/release/Maintain resolve --help
```
