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
#   debug                    - Default Browser workbench (70-80% features)
#   debug-mountain           - Mountain workbench (80-90% features) [RECOMMENDED]
#   debug-electron           - Electron workbench (95%+ features)
#   debug-electron-rest      - Electron workbench + Rest OXC compiler (fastest TS)
#   debug-electron-minimal   - Electron without built-in extensions (Atom J1)
#   debug-mountain-only      - Mountain without Cocoon subprocess (Atom N3)
#   debug-electron-compiled  - Electron + resources embedded in single binary
#                              (Compile=true on a debug build). Use when you want
#                              one-file-deploy parity with production while
#                              keeping debug asserts, dev-log tags and symbols.
#                              Removes the Mountain `set_static_application_root`
#                              dev-only fallback: Sky assets are shipped inside
#                              the binary bundle, so `file:read` on
#                              `/Static/Application/**` lands on the embedded
#                              resource table rather than a host file path.
#   debug-mountain-compiled  - Same embedded-resources layout on the Mountain
#                              workbench. Chosen when you want the slim
#                              Mountain workbench plus single-binary deploy.
#   debug-electron-bundled   - Electron workbench compiled through Vite/Astro.
#                              Sky reads Pack, fed Rollup
#                              receives the workbench module as an entry,
#                              CSS goes through Vite's native pipeline. Output
#                              under Sky/Target/Static/Bundled/Electron/.
#                              /Static/Application/ tree still produced.
#   debug-browser-bundled    - Browser workbench compiled through Vite/Astro.
#   debug-sessions-bundled   - Sessions workbench compiled through Vite/Astro.
#   debug-workbench-bundled  - Base workbench compiled through Vite/Astro.
#   debug-bundled-all        - All four workbenches bundled in one Rollup pass.
#
#===============================================================================

set -e

PROFILE="debug"
FLAVOR=""

while [ $# -gt 0 ]; do
	case $1 in
	--profile | -p)
		PROFILE="$2"
		shift 2
		;;
	--flavor | -f)
		FLAVOR="$2"
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
		echo "  debug-electron-compiled - Electron + single-binary embedded resources (debug symbols + Compile=true)"
		echo "  debug-mountain-compiled - Mountain + single-binary embedded resources (debug symbols + Compile=true)"
		echo "  debug-electron-bundled  - Electron workbench compiled through Vite/Astro"
		echo "  debug-browser-bundled   - Browser workbench compiled through Vite/Astro"
		echo "  debug-sessions-bundled  - Sessions workbench compiled through Vite/Astro"
		echo "  debug-workbench-bundled - Base workbench compiled through Vite/Astro"
		echo "  debug-bundled-all       - All four workbenches bundled in one Rollup pass"
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
if [ -n "$FLAVOR" ]; then
	echo "Flavor:  $FLAVOR"
fi
echo "========================================"

# Flavor overlay: source `.env.Land.<flavor>` BEFORE TierEnvironment.sh so
# per-subsystem Tier* values are exported into the shell environment that
# the rest of the build sees (Mountain's build.rs reads via env::var first,
# falling back to the file). Valid flavors: RustOnly, NodeFirst, Full.
if [ -n "$FLAVOR" ]; then
	FLAVOR_FILE=".env.Land.$FLAVOR"
	if [ ! -f "$FLAVOR_FILE" ]; then
		echo "Unknown flavor: $FLAVOR (no such file: $FLAVOR_FILE)"
		echo "Available flavors: RustOnly, NodeFirst, Full"
		exit 1
	fi
	echo "Sourcing flavor overlay: $FLAVOR_FILE"
	set -a
	# shellcheck disable=SC1090
	. "./$FLAVOR_FILE"
	set +a
fi

# Tier-gating fan-out (Plan A Wave 1.5) - shared helper.
# shellcheck disable=SC1091
. Maintain/Script/TierEnvironment.sh

# Telemetry fan-out: dual PostHog + OTLP emit. Honors `Disable=true` as a
# master kill switch, otherwise reads `.env.Land.PostHog`. The helpers
# defined here (LandCapture / LandCapturePhaseBegin / LandCapturePhaseEnd)
# stay in scope for every step below, including the trailing
# `Maintain -- pnpm tauri build --debug` invocation.
# shellcheck disable=SC1091
. Maintain/Script/PostHogCapture.sh

# Mark the build start. Each downstream phase (route manifest, profile
# marker, clean, tauri build) wraps its body with PhaseBegin / PhaseEnd
# so dashboards see per-phase duration and the OTLP trace shows a
# parent / child waterfall.
LandCapture "land:build:start" \
	"profile" "$PROFILE" \
	"trace_filter" "${Trace:-all}" \
	"record" "${Record:-0}" \
	"capture" "${Capture:-true}"

# Route manifest: scan Mountain Rust tracks + Cocoon StockLift + Node
# Fallbacks, emit a typed TypeScript set the runtime consults to skip
# Mountain RTTs for methods no Rust handler exists for. Also writes a
# human-readable coverage report under Element/Cocoon/Source/Generated/.
# Idempotent - safe to run on every build, fast (<500 ms).
LandCapturePhaseBegin "route-manifest"
# shellcheck disable=SC1091
sh Maintain/Script/GenerateRouteManifest.sh
LandCapturePhaseEnd "route-manifest" "profile" "$PROFILE"

# Product identity fan-out: read Element/Sky/Public/product.json
# (generated by ResolveProductConfig.sh inside TierEnvironment.sh)
# and write typed constants + copies to every Element that needs them.
# Idempotent - safe to run on every build, fast (<1 s).
LandCapturePhaseBegin "resolve-identity"
# shellcheck disable=SC1091
sh Maintain/Script/ResolveIdentity.sh
LandCapturePhaseEnd "resolve-identity"

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
	# paths both observe `Skip=true` and skip
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
	export Skip=true
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
	export Spawn=false
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
	export Render=false
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
	export Skip=true
	export Spawn=false
	export Render=false
	;;
debug-electron-compiled)
	# Debug-symbols-and-tags binary with every Sky/Output asset embedded
	# via Tauri's resource table. `Compile=true` flips the three
	# downstream pipelines (Wind ESBuild target, Output plugin set,
	# Mountain Scheme fallback) into their production-parity layout so
	# the running binary serves `/Static/Application/**` from the bundled
	# resource map. No `set_static_application_root` fallback is taken.
	#
	# Matches `release-electron` output shape but preserves:
	#   Debug=true  → debug_assertions on, dev-log sinks wired,
	#   Level=debug → verbose LandFix + DEV:* tag emission,
	#   NODE_ENV=development on the JS side for readable source maps.
	#
	# Use when you need one-file-deploy validation (e.g. verifying
	# resource-path resolution outside a dev workspace) without losing
	# the debug diagnostic surface.
	echo "Using Electron workbench + single-binary embedded resources (debug)"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=true
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	;;
debug-mountain-compiled)
	# Mountain-workbench variant of `debug-electron-compiled`. Same
	# embedded-resource layout, lighter workbench surface (~80-90%
	# features instead of 95%+). Use for the smallest single-binary
	# debug artifact that still ships the full Sky asset tree.
	echo "Using Mountain workbench + single-binary embedded resources (debug)"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=true
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	;;
debug-electron-bundled)
	# Vite/Astro-native bundle of vs/code/electron-browser/workbench/.
	# Sky reads Pack, wires the workbench module as a
	# Rollup input, and lets Vite handle CSS extraction + chunk dedup.
	# Output lands under Sky/Target/Static/Bundled/Electron/. The
	# existing /Static/Application/ tree is still produced unchanged so
	# both layouts can be benchmarked side-by-side.
	echo "Using Electron workbench bundled through Vite/Astro (debug)"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export Pack="electron"
	export Boot=true
	;;
debug-browser-bundled)
	# Vite/Astro-native bundle of vs/code/browser/workbench/.
	echo "Using Browser workbench bundled through Vite/Astro (debug)"
	export Browser=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export Pack="browser"
	export Boot=true
	;;
debug-sessions-bundled)
	# Vite/Astro-native bundle of vs/sessions/browser/.
	echo "Using Sessions workbench bundled through Vite/Astro (debug)"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export Pack="sessions"
	export Boot=true
	;;
debug-workbench-bundled)
	# Vite/Astro-native bundle of the base vs/workbench module.
	echo "Using base workbench bundled through Vite/Astro (debug)"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export Pack="workbench"
	export Boot=true
	;;
debug-bundled-all)
	# Bundle all four workbench entry shapes in one Rollup pass.
	echo "Bundling all four workbenches through Vite/Astro (debug)"
	export Electron=true
	export Bundle=true
	export Clean=true
	export Compile=false
	export Compiler=esbuild
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"
	export Pack="electron browser sessions workbench"
	export Boot=true
	;;
*)
	echo "Unknown profile: $PROFILE"
	echo "Available profiles: debug, debug-mountain, debug-electron, debug-electron-rest, debug-electron-minimal, debug-mountain-only, debug-cocoon-headless, debug-kernel, debug-electron-compiled, debug-mountain-compiled, debug-electron-bundled, debug-browser-bundled, debug-sessions-bundled, debug-workbench-bundled, debug-bundled-all"
	exit 1
	;;
esac

# Profile-flip Output-cache cleanup - shared helper.
LandCapturePhaseBegin "profile-marker"
# shellcheck disable=SC1091
. Maintain/Script/ProfileMarker.sh
LandCapturePhaseEnd "profile-marker"

# Generated-artefact cleanup. Sourced unconditionally; the helper
# is a no-op when Clean is unset / false. When Clean=true the
# helper wipes:
#   - Wind/Source/Effect/Generated/         (Wind codegen)
#   - Wind/Source/Effect/<X>BridgeShapeGenerated.ts
#   - Cocoon/Source/Generated/              (Cocoon codegen)
#   - Sky/Source/Function/Generated/        (Sky channel codegen)
#   - Mountain/Source/Vine/Generated/       (tonic-prost output)
#   - Mountain/Source/IPC/Generated/
#   - Air/Source/Vine/Generated/
#   - Grove/Source/Protocol/Generated/
# and bumps the mtime of every `.proto` under `Element/` so
# `cargo:rerun-if-changed=Proto/<X>.proto` triggers each crate's
# build.rs (which re-emits Generated/ via tonic-prost-build).
LandCapturePhaseBegin "clean-generated" "clean" "${Clean:-false}"
# shellcheck disable=SC1091
. Maintain/Script/CleanGenerated.sh
LandCapturePhaseEnd "clean-generated"

echo ""
echo "Starting build..."
echo ""

LandCapturePhaseBegin "tauri-build" "profile" "$PROFILE"
if ./Target/release/Maintain -- pnpm tauri build --debug; then
	LandCapturePhaseEnd "tauri-build" "profile" "$PROFILE" "ok" "true"
	LandCapture "land:build:complete" \
		"profile" "$PROFILE" \
		"ok" "true"
else
	BUILD_EXIT=$?
	LandCapturePhaseEnd "tauri-build" "profile" "$PROFILE" "ok" "false" "exit_code" "$BUILD_EXIT"
	LandCapture "land:build:error" \
		"profile" "$PROFILE" \
		"exit_code" "$BUILD_EXIT"
	exit "$BUILD_EXIT"
fi

# Re-sign the debug .app with the correct entitlements so file pickers,
# Cocoon JIT, and extension helper spawns work when launching from Finder.
# shellcheck disable=SC1091
BundleLevel=debug sh Maintain/Script/SignBundle.sh
