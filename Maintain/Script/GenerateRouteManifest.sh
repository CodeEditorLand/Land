#!/usr/bin/env sh

#===============================================================================
# Maintain/Script/GenerateRouteManifest.sh
#===============================================================================
#
# Scans the three routing tiers and emits:
#   - Element/Cocoon/Source/Generated/RouteManifest.ts
#   - Element/Cocoon/Source/Generated/RouteManifest.Report.md (coverage report)
#
# The manifest is consumed by `Services/DualTrack.ts` at runtime to
# skip Mountain's gRPC round-trip for methods Mountain doesn't handle,
# and to raise a typed Tier-4 "not available" error for methods no
# tier covers.
#
# Run manually:
#   sh Maintain/Script/GenerateRouteManifest.sh
#
# Wired into the build pipeline via `pnpm run prepublishOnly` - the
# per-Element `prepublishOnly` scripts invoke this before tsc so the
# emitted manifest is in tree when Cocoon compiles.
#
# Sources scanned:
#
#   1. Mountain tier-1 methods
#      - Element/Mountain/Source/Track/Effect/CreateEffectForRequest/*.rs
#        Extract every `"<Name>" =>` arm in each domain's CreateEffect().
#
#   2. Stock VS Code tier-2 lifts
#      - Element/Cocoon/Source/Services/Handler/VscodeAPI/StockLift.ts
#        Extract every `export function X(` and `export { X as Y }`.
#
#   3. Cocoon bespoke tier-3 fallbacks
#      - Element/Cocoon/Source/Services/Handler/VscodeAPI/**/*Fallback.ts
#        Extract the exported function name.
#
# Tier-4 (unavailable) is computed as: extension-host expected methods
# that appear in NONE of tiers 1-3. A future enhancement; today the
# tier-4 set is empty.
#===============================================================================

set -e

RepoRoot="$(cd "$(dirname "$0")/../.." && pwd)"
MountainEffectDir="$RepoRoot/Element/Mountain/Source/Track/Effect/CreateEffectForRequest"
CocoonStockLiftFile="$RepoRoot/Element/Cocoon/Source/Services/Handler/VscodeAPI/StockLift.ts"
CocoonFallbackGlob="$RepoRoot/Element/Cocoon/Source/Services/Handler/VscodeAPI"
ManifestOutput="$RepoRoot/Element/Cocoon/Source/Generated/RouteManifest.ts"
ReportOutput="$RepoRoot/Element/Cocoon/Source/Generated/RouteManifest.Report.md"

mkdir -p "$(dirname "$ManifestOutput")"

echo "========================================"
echo "Route manifest generation"
echo "========================================"
echo "Mountain tracks: $MountainEffectDir"
echo "Stock lifts:     $CocoonStockLiftFile"
echo "Cocoon bespoke:  $CocoonFallbackGlob (**/*Fallback.ts)"
echo "Manifest output: $ManifestOutput"
echo "Report output:   $ReportOutput"
echo ""

# ---------------------------------------------------------------------------
# Tier 1: Mountain Rust method names
# ---------------------------------------------------------------------------
# Each Track/Effect file has arms like:
#   "FileSystem.ReadFile" => { ... }
#   "Workspace.FindTextInFiles" => { ... }
# Extract everything between the first `"` of a line that ends with `=>`.
# Falls through cleanly if a file has no match arms (header-only module).

MountainMethodsTmp="$(mktemp)"
if [ -d "$MountainEffectDir" ]; then
	# shellcheck disable=SC2016
	grep -rhE '^\s*"[A-Za-z$\.:_]+"(\s*\|\s*"[A-Za-z$\.:_]+")*\s*=>' "$MountainEffectDir" 2>/dev/null \
		| sed -E 's/^\s*//' \
		| grep -oE '"[A-Za-z$\.:_]+"' \
		| tr -d '"' \
		| sort -u > "$MountainMethodsTmp" || true
fi
MountainCount=$(wc -l < "$MountainMethodsTmp" | tr -d ' ')
echo "[scan] Mountain: $MountainCount methods"

# ---------------------------------------------------------------------------
# Tier 2: StockLift exports
# ---------------------------------------------------------------------------

StockExportsTmp="$(mktemp)"
if [ -f "$CocoonStockLiftFile" ]; then
	# Matches `export function Name(`, `export const Name =`, and
	# `export { X as Y }` (takes Y as the effective export name).
	{
		grep -oE '^export (function|const|class) [A-Z][A-Za-z0-9]+' "$CocoonStockLiftFile" 2>/dev/null \
			| awk '{print $NF}'
		grep -oE 'as [A-Z][A-Za-z0-9]+' "$CocoonStockLiftFile" 2>/dev/null \
			| awk '{print $2}'
		grep -oE 'export \{ [A-Z][A-Za-z0-9]+' "$CocoonStockLiftFile" 2>/dev/null \
			| awk '{print $NF}'
	} | sort -u > "$StockExportsTmp" || true
fi
StockCount=$(wc -l < "$StockExportsTmp" | tr -d ' ')
echo "[scan] StockLift: $StockCount exports"

# ---------------------------------------------------------------------------
# Tier 3: Cocoon bespoke Fallback files
# ---------------------------------------------------------------------------

BespokeTmp="$(mktemp)"
if [ -d "$CocoonFallbackGlob" ]; then
	find "$CocoonFallbackGlob" -name '*Fallback.ts' 2>/dev/null \
		| while read -r FallbackFile; do
			grep -oE '^export (async function|function) [A-Za-z][A-Za-z0-9]+' "$FallbackFile" \
				| awk '{print $NF}'
		done | sort -u > "$BespokeTmp" || true
fi
BespokeCount=$(wc -l < "$BespokeTmp" | tr -d ' ')
echo "[scan] Cocoon bespoke: $BespokeCount Fallback exports"

# ---------------------------------------------------------------------------
# Emit the TS manifest
# ---------------------------------------------------------------------------

JsonSet() {
	# Convert a newline-separated list into a TypeScript Set literal:
	#   foo\nbar\n → new Set<string>(["foo","bar"])
	InputFile="$1"
	if [ ! -s "$InputFile" ]; then
		printf 'new Set<string>()'
		return
	fi
	printf 'new Set<string>(['
	# shellcheck disable=SC2002
	cat "$InputFile" | awk 'NR>1{printf ","} {printf "\"%s\"", $0}'
	printf '])'
}

Timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$ManifestOutput" <<EOF
// GENERATED FILE - do NOT edit by hand.
//
// Module:       Generated/RouteManifest
// Regenerated:  Maintain/Script/GenerateRouteManifest.sh (invoked on every build)
// Purpose:      three sets of method / function names representing the
//               four-tier routing hierarchy:
//
//   MountainMethods       tier 1. Rust handlers scanned from
//                         Element/Mountain/Source/Track/Effect/CreateEffectForRequest/<Domain>.rs
//   StockLiftExports      tier 2. Pure functions lifted from stock
//                         VS Code via Element/Cocoon/Source/Services/Handler/VscodeAPI/StockLift.ts
//   BespokeCocoonMethods  tier 3. Hand-rolled Node fallbacks
//                         discovered in files named <Method>Fallback.ts under the VscodeAPI tree.
//
// Tier 4 (unavailable) is implicit: any method not in tiers 1-3 MUST
// throw Services.DualTrack.NotImplementedError via MarkUnavailable().
//
// File uses // (line comments) rather than a TSDoc /** ... */ block
// because documentation strings that include glob patterns with the
// two-asterisk-slash sequence would prematurely close a block comment
// and break esbuild parsing (the build failure this very file caused
// on first emission).
//
// Generated: ${Timestamp}

/** Mountain-side RPC method names known to have a Rust handler. */
export const MountainMethods: ReadonlySet<string> = $(JsonSet "$MountainMethodsTmp");

/** StockLift exports (tier 2). */
export const StockLiftExports: ReadonlySet<string> = $(JsonSet "$StockExportsTmp");

/** Cocoon bespoke Node fallback exports (tier 3). */
export const BespokeCocoonMethods: ReadonlySet<string> = $(JsonSet "$BespokeTmp");

/** Summary counts - used by DualTrack for boot-time banner. */
export const RouteManifestSummary = {
	mountain: ${MountainCount},
	stockLift: ${StockCount},
	bespoke: ${BespokeCount},
	generatedAt: "${Timestamp}",
} as const;
EOF

echo ""
echo "[emit] manifest → $ManifestOutput"

# ---------------------------------------------------------------------------
# Emit the human-readable coverage report
# ---------------------------------------------------------------------------

{
	echo "# Route Manifest - coverage report"
	echo ""
	echo "_Generated ${Timestamp}_"
	echo ""
	echo "## Totals"
	echo ""
	echo "| Tier | Count | Source |"
	echo "|---|---:|---|"
	echo "| 1 - Mountain (Rust) | ${MountainCount} | \`Track/Effect/CreateEffectForRequest/*.rs\` |"
	echo "| 2 - Stock VS Code | ${StockCount} | \`StockLift.ts\` |"
	echo "| 3 - Cocoon bespoke | ${BespokeCount} | \`*Fallback.ts\` |"
	echo ""
	echo "## Tier 1 methods (Mountain-handled)"
	echo ""
	if [ -s "$MountainMethodsTmp" ]; then
		awk '{print "- `"$0"`"}' "$MountainMethodsTmp"
	else
		echo "_none_"
	fi
	echo ""
	echo "## Tier 2 exports (stock VS Code lifted)"
	echo ""
	if [ -s "$StockExportsTmp" ]; then
		awk '{print "- `StockLift."$0"`"}' "$StockExportsTmp"
	else
		echo "_none_"
	fi
	echo ""
	echo "## Tier 3 exports (Cocoon bespoke Node)"
	echo ""
	if [ -s "$BespokeTmp" ]; then
		awk '{print "- `"$0"`"}' "$BespokeTmp"
	else
		echo "_none_"
	fi
	echo ""
	echo "## Progressive migration hint"
	echo ""
	echo "- Methods that appear in tiers 2 or 3 but NOT in tier 1 are"
	echo "  candidates to re-implement in Mountain Rust for performance."
	echo "- Hand-rolled tier-3 functions are candidates to replace with"
	echo "  stock-VS-Code lifts (tier 2) if a pure stock equivalent exists."
	echo "- The \`dual-track\` dev-log tag at runtime shows which tier"
	echo "  each real dispatch took. Compare against this manifest to"
	echo "  find mismatches (e.g. manifest says tier 1 but dispatch took"
	echo "  tier 3 - manifest is stale, rerun this script)."
} > "$ReportOutput"

echo "[emit] report   → $ReportOutput"
echo ""
echo "========================================"
echo "Route manifest generation complete"
echo "========================================"
echo "Tier 1 (Mountain):     ${MountainCount} methods"
echo "Tier 2 (StockLift):    ${StockCount} exports"
echo "Tier 3 (Cocoon):       ${BespokeCount} fallbacks"
echo "Total routed:          $((MountainCount + StockCount + BespokeCount))"
echo "========================================"

# Cleanup
rm -f "$MountainMethodsTmp" "$StockExportsTmp" "$BespokeTmp"
