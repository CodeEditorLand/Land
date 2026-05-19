#!/usr/bin/env sh

#===============================================================================
# Release/Build.sh - Release Build Script with Profile Support
#===============================================================================
#
# This script runs the release build with configurable profiles.
# It reads configuration from .vscode/land-config.json.
#
# Usage:
#   sh Maintain/Release/Build.sh                    # Default production profile
#   sh Maintain/Release/Build.sh --profile release  # Full release with signing
#   sh Maintain/Release/Build.sh --profile web      # Web-only release
#
# Available profiles:
#   production       - Production build with Mountain workbench (default)
#   release          - Full release with packaging and signing
#   release-electron - Electron workbench + Rest OXC (full desktop, gRPC proxy)
#   release-electron-minimal - release-electron without built-in extensions (Atom J4)
#   release-mountain-only - Mountain without Cocoon subprocess (Atom N3 mirror)
#   release-electron-bundled  - Electron workbench compiled through Vite/Astro
#   release-browser-bundled   - Browser workbench compiled through Vite/Astro
#   release-sessions-bundled  - Sessions workbench compiled through Vite/Astro
#   release-workbench-bundled - Base workbench compiled through Vite/Astro
#   release-bundled-all       - All four workbenches bundled in one pass
#   web-browser      - Web browser deployment (no Tauri)
#
#===============================================================================

set -e

PROFILE="production"

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
			echo "  --profile, -p <name>  Build profile to use (default: production)"
			echo "  --help, -h            Show this help message"
			echo ""
			echo "Available profiles:"
			echo "  production       - Production build with Mountain workbench (default)"
			echo "  release          - Full release with packaging and signing"
			echo "  release-electron         - Electron workbench + Rest OXC (full desktop)"
			echo "  release-electron-minimal - Electron without built-in extensions (Atom J4)"
			echo "  release-mountain-only    - Mountain without Cocoon subprocess (Atom N mirror)"
			echo "  release-cocoon-headless  - Electron + Cocoon, no Wind preload (Atom N3b)"
			echo "  release-kernel           - Pure Mountain: no built-ins, no Cocoon, no Wind (Atom N3c)"
			echo "  release-electron-bundled  - Electron workbench compiled through Vite/Astro"
			echo "  release-browser-bundled   - Browser workbench compiled through Vite/Astro"
			echo "  release-sessions-bundled  - Sessions workbench compiled through Vite/Astro"
			echo "  release-workbench-bundled - Base workbench compiled through Vite/Astro"
			echo "  release-bundled-all       - All four workbenches bundled in one pass"
			echo "  web-browser              - Web browser deployment (no Tauri)"
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
echo "Land Release Build"
echo "========================================"
echo "Profile: $PROFILE"
echo "========================================"

# Pin production-mode env BEFORE sourcing TierEnvironment.sh so the
# `.env.Land.Production.<Domain>` overlay chain fires. The per-profile
# case-statements below also `export NODE_ENV=production` for explicitness;
# this top-level export is what makes the overlay chain trip.
export NODE_ENV=production
export Profile="$PROFILE"

# Tier-gating fan-out (Plan A Wave 1.5) - shared helper. Sourcing happens
# AFTER `NODE_ENV=production` is set so `LandIsProduction=true` and the
# `.env.Land.Production.<Domain>` overlays load correctly.
# shellcheck disable=SC1091
. Maintain/Script/TierEnvironment.sh

# Telemetry helper (PostHog + OTLP). Production overlays force `Capture=false`
# so every emit short-circuits to no-op, but the helpers still need to be
# in scope so per-phase calls below don't error on `command not found`.
# shellcheck disable=SC1091
. Maintain/Script/PostHogCapture.sh

# Build-start emit (no-op in prod due to Capture=false; useful in canary
# / license-activation builds that flip Capture=true via local edit).
LandCapture "land:build:start" \
	"profile" "$PROFILE" \
	"node_env" "${NODE_ENV:-}" \
	"capture" "${Capture:-true}" \
	"land_is_production" "${LandIsProduction:-false}"

# Route manifest: scan Mountain Rust tracks + Cocoon StockLift + Node
# Fallbacks, emit a typed TypeScript set the runtime consults to skip
# Mountain RTTs for methods no Rust handler exists for. Also writes a
# human-readable coverage report under Element/Cocoon/Source/Generated/.
# Idempotent - safe to run on every build, fast (<500 ms).
# shellcheck disable=SC1091
sh Maintain/Script/GenerateRouteManifest.sh

# Product identity fan-out: read Element/Sky/Public/product.json
# (generated by ResolveProductConfig.sh inside TierEnvironment.sh)
# and write typed constants + copies to every Element that needs them.
# Idempotent - safe to run on every build, fast (<1 s).
# shellcheck disable=SC1091
sh Maintain/Script/ResolveIdentity.sh

# ===========================================================================
# TEMP: Rest compiler disabled for every profile - we're testing the Output
# Element consuming VS Code's `out/` (dev) and `out-build/` (prod) directly,
# without the OXC transform layer. `unset` wipes any inherited `Compiler=Rest`
# from the caller's shell; the `release-electron` profile's hardcoded
# `Compiler=Rest` is swapped to `Compiler=esbuild` below with a matching
# TEMP marker, and the `production` branch's optional Stage 3 Rest block
# now skips because `$Compiler` is never "Rest". Restore by deleting this
# block and reverting the per-profile change.
# ===========================================================================
unset Compiler

case $PROFILE in
	production)
		echo "Using Mountain workbench (production)"
		export Mountain=true
		export Bundle=false
		export Clean=true
		export Compile=true
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=8192"
		export RUST_LOG=info

		export Compiler="${Compiler:-esbuild}"
		if [ "$Compiler" = "Rest" ]; then
			echo "Using Rest compiler"
			export Compiler=Rest
		else
			echo "Using esbuild compiler"
			export Compiler=esbuild
		fi

		if [ "$Compiler" = "Rest" ]; then
			echo ""
			echo "Stage 3: Rest compilation of VSCode output"
			echo "=========================================="

			if [ "$NODE_ENV" = "development" ]; then
				VSCodeSourceDir="Dependency/Microsoft/Dependency/Editor/out"
			else
				VSCodeSourceDir="Dependency/Microsoft/Dependency/Editor/out-build"
			fi

			RestOutputDir="Target/Rest/Microsoft/VSCode"
			mkdir -p "$RestOutputDir"

			if [ ! -d "$VSCodeSourceDir" ]; then
				echo "[Rest] Warning: VSCode source directory not found: $VSCodeSourceDir"
				echo "[Rest] Skipping Rest compilation - ensure VSCode is built first"
			else
				echo "[Rest] Compiling from: $VSCodeSourceDir"
				echo "[Rest] Output directory: $RestOutputDir"

				if command -v Rest > /dev/null 2>&1; then
					Rest compile \
						--input "$VSCodeSourceDir" \
						--output "$RestOutputDir" \
						--target es2024 \
						--module commonjs \
						${REST_OPTIONS:+ $REST_OPTIONS}

					if [ $? -eq 0 ]; then
						echo "[Rest] Compilation successful"
					else
						echo "[Rest] Compilation failed - falling back to esbuild"
						export Compiler=esbuild
					fi
				else
					echo "[Rest] 'Rest' command not found - falling back to esbuild"
					echo "[Rest] Install @codeeditorland/rest or set REST_BINARY_PATH"
					export Compiler=esbuild
				fi
			fi
		fi
		;;
	release)
		echo "Using Mountain workbench (full release)"
		export Mountain=true
		export Bundle=false
		export Clean=true
		export Compile=true
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=8192"
		export RUST_LOG=warn

		export Compiler="${Compiler:-esbuild}"
		if [ "$Compiler" = "Rest" ]; then
			echo "Using Rest compiler"
			export Compiler=Rest
		else
			echo "Using esbuild compiler"
			export Compiler=esbuild
		fi
		;;
	release-electron)
		echo "Using Electron workbench + Rest OXC (full desktop, gRPC proxy)"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=true
		# TEMP: Rest compiler disabled (see kill-switch above). Restore with
		# `export Compiler=Rest` to re-enable the OXC transform.
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info

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
	release-electron-minimal)
		# Atom J4: release-electron with zero bundled built-in extensions.
		# Sky Step 13 + Mountain Scanner observe `Skip`
		# and skip the copy + scan. Kernel distribution surface.
		echo "Using Electron workbench (minimal - no built-in extensions)"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Skip=true
		;;
	release-mountain-only)
		# Atom N mirror: release Mountain without the Cocoon subprocess.
		# Extension-related IPC returns the empty-state envelope; binary
		# footprint is the smallest shippable shape.
		echo "Using Mountain workbench without Cocoon (release)"
		export Mountain=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Spawn=false
		;;
	release-cocoon-headless)
		# Atom N3b release mirror: Mountain + Cocoon, no Wind preload.
		# Useful for headless server deployments that want the extension
		# host online but do not render the Effect-TS service layer.
		echo "Using Electron + Cocoon, Wind preload disabled (release)"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Render=false
		;;
	release-kernel)
		# Atom J4b / N3c release mirror: smallest shippable binary.
		# No built-in extensions, no Cocoon, no Wind. Pure Mountain.
		echo "Using Mountain kernel (release - no built-ins, no Cocoon, no Wind)"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Skip=true
		export Spawn=false
		export Render=false
		;;
	release-electron-bundled)
		# Vite/Astro-native bundle of vs/code/electron-browser/workbench/.
		# Sky reads Pack, wires the workbench module as a
		# Rollup input, and lets Vite handle CSS extraction + chunk dedup.
		# Output lands under Sky/Target/Static/Bundled/Electron/. The
		# existing /Static/Application/ tree is still produced unchanged.
		echo "Using Electron workbench bundled through Vite/Astro"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Pack="electron"
		export Boot=true
		;;
	release-browser-bundled)
		# Vite/Astro-native bundle of vs/code/browser/workbench/.
		echo "Using Browser workbench bundled through Vite/Astro"
		export Browser=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=warn
		export Pack="browser"
		export Boot=true
		;;
	release-sessions-bundled)
		# Vite/Astro-native bundle of vs/sessions/browser/.
		echo "Using Sessions workbench bundled through Vite/Astro"
		export Mountain=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Pack="sessions"
		export Boot=true
		;;
	release-workbench-bundled)
		# Vite/Astro-native bundle of the base vs/workbench module.
		echo "Using base workbench bundled through Vite/Astro"
		export Mountain=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Pack="workbench"
		export Boot=true
		;;
	release-bundled-all)
		# Bundle all four workbench entry shapes in one Rollup pass.
		# First build is heavy (each variant pulls a ~97-module graph);
		# the four single-variant profiles exist precisely so each can be
		# benchmarked in isolation.
		echo "Bundling all four workbenches through Vite/Astro"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=true
		export Compiler=esbuild
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=16384"
		export RUST_LOG=info
		export Pack="electron browser sessions workbench"
		export Boot=true
		;;
	web-browser)
		echo "Using Browser workbench (web-only)"
		export Browser=true
		export Bundle=false
		export Clean=true
		export Compile=true
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=8192"
		export RUST_LOG=warn

		export Compiler="${Compiler:-esbuild}"
		if [ "$Compiler" = "Rest" ]; then
			echo "Using Rest compiler"
			export Compiler=Rest
		else
			echo "Using esbuild compiler"
			export Compiler=esbuild
		fi
		;;
	*)
		echo "Unknown profile: $PROFILE"
		echo "Available profiles: production, release, release-electron, release-electron-minimal, release-mountain-only, release-cocoon-headless, release-kernel, release-electron-bundled, release-browser-bundled, release-sessions-bundled, release-workbench-bundled, release-bundled-all, web-browser"
		exit 1
		;;
esac

# Profile-flip Output-cache cleanup - shared helper.
# shellcheck disable=SC1091
. Maintain/Script/ProfileMarker.sh

echo ""
echo "Starting release build..."
echo ""

./Target/release/Maintain -- pnpm tauri build

# Re-sign the release .app. When a real Apple Developer ID is present
# `pnpm tauri build` already applies entitlements; re-signing with ad-hoc
# here is a no-op on notarised builds but ensures CI / unsigned dev machines
# still produce a working bundle (file pickers, JIT, extension helpers).
# shellcheck disable=SC1091
BundleLevel=release sh Maintain/Script/SignBundle.sh
