#!/usr/bin/env sh

#===============================================================================
# Debug/Build.sh - Debug Build Script with Profile Support
#===============================================================================
#
# This script runs the debug build with configurable profiles.
# It reads configuration from .vscode/land-config.json.
#
# Usage:
#   sh Maintain/Debug/Build.sh                    # Default debug profile
#   sh Maintain/Debug/Build.sh --profile mountain # Debug with Mountain workbench
#   sh Maintain/Debug/Build.sh --profile electron # Debug with Electron workbench
#
# Available profiles:
#   debug               - Default Browser workbench (70-80% features)
#   debug-mountain      - Mountain workbench (80-90% features) [RECOMMENDED]
#   debug-electron      - Electron workbench (95%+ features)
#   debug-electron-rest - Electron workbench + Rest OXC compiler (fastest TS)
#   debug-electron-minimal - Electron without built-in extensions (Atom J1)
#   debug-mountain-only - Mountain without Cocoon subprocess (Atom N3)
#
#===============================================================================

set -e

PROFILE="debug"

while [ $# -gt 0 ]; do
	case $1 in
	--profile | -p)
		PROFILE="$2"
		shift 2
		;;
	--help | -h)
		echo "Usage: $0 [OPTIONS]"
		echo ""
		echo "Options:"
		echo "  --profile, -p <name>  Build profile to use (default: debug)"
		echo "  --help, -h            Show this help message"
		echo ""
		echo "Available profiles:"
		echo "  debug                   - Browser workbench (70-80% features)"
		echo "  debug-mountain          - Mountain workbench (80-90% features) [RECOMMENDED]"
		echo "  debug-electron          - Electron workbench (95%+ features)"
		echo "  debug-electron-rest     - Electron + Rest OXC compiler (fastest TS)"
		echo "  debug-electron-minimal  - Electron without built-in extensions (Atom J1)"
		echo "  debug-mountain-only     - Mountain without Cocoon subprocess (Atom N3)"
		echo "  debug-cocoon-headless   - Mountain + Cocoon, Wind preload disabled (Atom N3b)"
		echo "  debug-kernel            - Pure Mountain: no built-ins, no Cocoon, no Wind (Atom N3c)"
		exit 0
		;;
	*)
		echo "Unknown option: $1"
		echo "Use --help for usage information"
		exit 1
		;;
	esac
done

echo "========================================"
echo "Land Debug Build"
echo "========================================"
echo "Profile: $PROFILE"
echo "========================================"

# Tier-gating fan-out (Plan A Wave 1.5) - shared helper.
# shellcheck disable=SC1091
. Maintain/Script/TierEnvironment.sh

# ===========================================================================
# TEMP: Rest compiler disabled for every profile - we're testing the Output
# Element consuming VS Code's `out/` (dev) and `out-build/` (prod) directly,
# without the OXC transform layer. `unset` wipes any inherited `Compiler=Rest`
# from the caller's shell; the per-profile `Compiler=Rest` lines below are
# swapped to `Compiler=esbuild` with matching TEMP markers. Restore by
# deleting this block and reverting those two line changes.
# ===========================================================================
unset Compiler

case $PROFILE in
debug)
	echo "Using Browser workbench (default debug)"
	export Browser=true
	export Bundle=false
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	;;
debug-mountain)
	echo "Using Mountain workbench (RECOMMENDED)"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	;;
debug-electron)
	echo "Using Electron workbench"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	;;
debug-electron-rest)
	echo "Using Electron workbench + Rest OXC compiler"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	# TEMP: Rest compiler disabled (see kill-switch above). Restore with
	# `export Compiler=Rest` to re-enable the OXC transform.
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"

	# Build Rest compiler if binary is missing - only needed when the
	# Rest path is actually active. With `Compiler=esbuild` this is a
	# no-op; gate the cargo build so the temporary kill-switch doesn't
	# pay for an unused compiler.
	if [ "$Compiler" = "Rest" ] && [ ! -f "Element/Rest/Target/release/Rest" ]; then
		echo ""
		echo "Building Rest OXC compiler (first time only)..."
		cargo build -p Rest --release 2>&1 | tail -5
		echo ""
	fi
	;;
debug-electron-minimal)
	# Atom J1: ship without any bundled built-in extensions.
	# Sky's astro.config.ts Step 13 and Mountain's Scanner fallback
	# paths both observe `LAND_SKIP_BUILTIN_EXTENSIONS=true` and skip
	# the copy + scan. Useful when embedding Land inside a host app
	# that wants a kernel editor.
	echo "Using Electron workbench (minimal - no built-in extensions)"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export LAND_SKIP_BUILTIN_EXTENSIONS=true
	;;
debug-mountain-only)
	# Atom N3: Mountain without Cocoon. Extension host is never
	# spawned; extension-related IPC calls return the empty-state
	# envelope. Useful for integration tests that exercise the
	# native layer in isolation.
	echo "Using Mountain workbench without Cocoon"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export LAND_SPAWN_COCOON=false
	;;
debug-cocoon-headless)
	# Atom N3b: Mountain + Cocoon, but the webview's Wind preload
	# is disabled - the workbench loads native VS Code services only.
	# Verifies Mountain↔Cocoon works without a Wind consumer; useful
	# for isolating regressions in the Effect-TS service layer.
	echo "Using Mountain + Cocoon, Wind preload disabled"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export LAND_ENABLE_WIND=false
	;;
debug-kernel)
	# Atom J4b / N3c: smallest viable shippable surface. No built-in
	# extensions, no Cocoon, no Wind. Pure Mountain + bare VS Code
	# workbench. Use for the lowest-footprint embedded Land binary.
	echo "Using Mountain kernel (no built-ins, no Cocoon, no Wind)"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export LAND_SKIP_BUILTIN_EXTENSIONS=true
	export LAND_SPAWN_COCOON=false
	export LAND_ENABLE_WIND=false
	;;
*)
	echo "Unknown profile: $PROFILE"
	echo "Available profiles: debug, debug-mountain, debug-electron, debug-electron-rest, debug-electron-minimal, debug-mountain-only, debug-cocoon-headless, debug-kernel"
	exit 1
	;;
esac

# Profile-flip Output-cache cleanup - shared helper.
# shellcheck disable=SC1091
. Maintain/Script/ProfileMarker.sh

echo ""
echo "Starting build..."
echo ""

./Target/release/Maintain -- pnpm tauri build --debug
