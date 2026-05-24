#!/usr/bin/env sh
#===============================================================================
# CleanGenerated.sh - wipe every generated artefact so the next build
# regenerates from source.
#===============================================================================
#
# Sourced from `Maintain/Debug/Build.sh` (and any sibling that
# exports `Clean=true`). The default `Clean=true` only nukes esbuild
# `outdir` trees - it does NOT touch:
#
#   - `Element/Wind/Source/Effect/Generated/`           (Wind codegen)
#   - `Element/Wind/Source/Effect/<Service>/Implementation/<…>BridgeShapeGenerated.ts`
#   - `Element/Cocoon/Source/Generated/`                (Cocoon codegen)
#   - `Element/<Crate>/Source/<…>/Generated/`           (tonic-prost output)
#   - `Element/<Crate>/Proto/<…>.proto` mtimes          (build.rs rerun-if-changed)
#
# Without this helper, deleting `Source/<…>/Generated/` by hand and
# re-running `cargo build` still produces "Generated/ does not
# exist" errors because `cargo:rerun-if-changed=Proto/X.proto` only
# fires when the proto's mtime advances - cargo doesn't observe the
# Generated/ tree directly. Touching every `.proto` bumps mtimes
# under `Element/` so the next `cargo build` re-runs each crate's
# `build.rs`, which re-emits Generated/ via `tonic-prost-build`.
#
# Idempotent. Safe to run when Clean is unset (no-op).
#
# Activation:
#   Clean=true . Maintain/Script/CleanGenerated.sh
#
# Cooperates with the existing Stage-1 esbuild Clean plugins (which
# wipe `outdir`) - this script handles only the *source-side*
# Generated trees the esbuild Clean plugin can't see.
#===============================================================================

if [ "${Clean:-false}" != "true" ]; then
	return 0 2>/dev/null || exit 0
fi

# Resolve repo root regardless of where the helper was sourced from.
# Fallback to PWD when `BASH_SOURCE` is unavailable (POSIX `sh`).
ScriptDir="$(dirname "${0:-./}")"
RepoRoot="$(cd "$ScriptDir/../.." 2>/dev/null && pwd || echo "$PWD")"

echo "----------------------------------------"
echo "[Clean] Wiping generated artefacts"
echo "----------------------------------------"

# ---------------------------------------------------------------------------
# Source-side TypeScript Generated trees. Wind codegen + Cocoon codegen
# emit here; Stage 2 esbuild compiles them into Target/. Wiping the
# source forces Stage 1b (codegen) to re-run cleanly.
# ---------------------------------------------------------------------------
TsGeneratedRoots="
	$RepoRoot/Element/Wind/Source/Effect/Generated
	$RepoRoot/Element/Cocoon/Source/Generated
	$RepoRoot/Element/Sky/Source/Function/Generated
"
for Path in $TsGeneratedRoots; do
	if [ -d "$Path" ]; then
		echo "[Clean]   rm $Path"
		rm -rf "$Path"
	fi
done

# Wind's bridge-shape generator emits one
# `Effect/<Service>/Implementation/<Service>BridgeShapeGenerated.ts`
# per service. The catalog re-emits these on every codegen run, so
# the wipe just smooths over a half-finished prior run that left a
# stale `<…>Generated.ts` orphaned (decorator removed upstream).
StaleBridgeShapes=$(find "$RepoRoot/Element/Wind/Source/Effect" -type f -name "*BridgeShapeGenerated.ts" 2>/dev/null || true)
if [ -n "$StaleBridgeShapes" ]; then
	echo "$StaleBridgeShapes" | while IFS= read -r File; do
		[ -z "$File" ] && continue
		echo "[Clean]   rm $File"
		rm -f "$File"
	done
fi

# ---------------------------------------------------------------------------
# Rust crate Generated/ trees populated by `tonic-prost-build`. Two
# critical constraints:
#
#   1. `tonic_prost_build::configure().out_dir("…/Generated")` requires
#      the output directory to *exist* before `.compile_protos()` runs.
#      A missing dir aborts the whole cargo build with
#      `Os { code: 2, kind: NotFound, … }`.
#
#   2. Each `Generated/` directory is a MIX of `tonic-prost-build`-
#      emitted files (`<service>.rs`, e.g. `air.rs` / `vine.rs` /
#      `grove.rs`) AND a hand-authored, git-tracked `mod.rs` that
#      `pub mod <service>;`-declares them. Wiping the directory
#      wholesale deletes the tracked `mod.rs` and breaks the next
#      `cargo build` with `error[E0583]: file not found for module
#      Generated`.
#
# Strategy: do NOT wipe these directories. The `touch` of the matching
# `.proto` below is enough to force `build.rs` to re-run and overwrite
# the generated `<service>.rs` in place. The hand-authored `mod.rs`
# stays untouched.
#
# If you suspect a stale generated file from a removed proto field is
# poisoning the build, blow it away by hand: `rm Element/<crate>/Source/
# <…>/Generated/<service>.rs` (NOT `mod.rs`) before re-running
# Build.sh. This helper deliberately stops short of that scalpel-only
# operation - the cost of a wrong wipe (broken cargo build, manual
# `git checkout` to recover) outweighs the convenience for the rare
# stale-field case.
# ---------------------------------------------------------------------------
RustGeneratedRoots="
	$RepoRoot/Element/Mountain/Source/Vine/Generated
	$RepoRoot/Element/Mountain/Source/IPC/Generated
	$RepoRoot/Element/Air/Source/Vine/Generated
	$RepoRoot/Element/Grove/Source/Protocol/Generated
"
for Path in $RustGeneratedRoots; do
	if [ ! -d "$Path" ]; then
		echo "[Clean]   mkdir $Path  (recovering missing dir)"
		mkdir -p "$Path"
	fi
done

# Bump every `.proto` mtime under `Element/` so cargo's
# rerun-if-changed fires for every crate that depends on one. Skip
# vendored Tauri / Microsoft trees (read-only submodules) and any
# `Target/` / `target/` build outputs.
ProtoFiles=$(find "$RepoRoot/Element" \
	-type f -name "*.proto" \
	-not -path "*/node_modules/*" \
	-not -path "*/Target/*" \
	-not -path "*/target/*" \
	-not -path "*/Documentation/*" \
	-not -path "*/Dependency/*" \
	2>/dev/null || true)
if [ -n "$ProtoFiles" ]; then
	echo "$ProtoFiles" | while IFS= read -r File; do
		[ -z "$File" ] && continue
		echo "[Clean]   touch $File"
		touch "$File"
	done
fi

# ---------------------------------------------------------------------------
# JS-side codegen outputs that live OUTSIDE Source/ (Wind compiles
# `Configuration/Codegen/Codegen.js` from `Source/Codegen/`). Keep
# the directory itself - Build's Clean plugin wipes Configuration/
# wholesale on Stage 1 anyway - but list it here for clarity.
# ---------------------------------------------------------------------------
JsCodegenRoots="
	$RepoRoot/Element/Wind/Configuration/Codegen
	$RepoRoot/Element/Cocoon/Configuration/Codegen
"
for Path in $JsCodegenRoots; do
	if [ -d "$Path" ]; then
		echo "[Clean]   rm $Path"
		rm -rf "$Path"
	fi
done

# ---------------------------------------------------------------------------
# Output's Target/ tree (the patched VS Code source the bundled
# Electron entry imports). Without wiping this, the per-build
# transforms PREPEND their polyfills to the existing patched bytes
# from a prior run - the OLD body keeps running alongside the new
# one. With idempotent markers like `__LAND_WORKBENCH_PAINT_PRIME__`,
# bumping the marker version (e.g. `_V2`) defeats the in-transform
# `Source.includes(Marker)` skip but does nothing about the V1 body
# that's still present and STILL EXECUTING under V1's `Land[Marker]`
# guard. The cleanest cure is to wipe the tree so the next build
# pulls fresh upstream bytes and applies the current polyfills once.
#
# Output's own esbuild Clean plugin handles `Configuration/` and
# `Target/` for the JS pipeline. We wipe an additional path here
# explicitly because the VS Code source-tree transforms write into
# `Target/Microsoft/VSCode/` which the Output `outdir` cleaner
# doesn't always reach in copy-only modes (debug-electron-bundled
# is one).
# ---------------------------------------------------------------------------
OutputVSTargetRoots="
	$RepoRoot/Element/Output/Target
"
for Path in $OutputVSTargetRoots; do
	if [ -d "$Path" ]; then
		echo "[Clean]   rm $Path"
		rm -rf "$Path"
	fi
done

# Sky/Target/Static/Application is the runtime path Mountain serves
# patched VS Code from. If a stale copy lingers from a previous
# build, runtime requests pick up half-V1, half-V2 polyfilled bytes.
# Wipe the VS source tree under it specifically; the Astro build
# will repopulate via the standard pipeline.
SkyVSStaticRoots="
	$RepoRoot/Element/Sky/Target/Static/Application/vs
"
for Path in $SkyVSStaticRoots; do
	if [ -d "$Path" ]; then
		echo "[Clean]   rm $Path"
		rm -rf "$Path"
	fi
done

echo "[Clean] Done"
echo "----------------------------------------"
