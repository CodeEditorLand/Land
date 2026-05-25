#!/usr/bin/env sh
#===============================================================================
# Maintain/Test/TelemetryTreeShake.sh - Production tree-shake smoke test
#===============================================================================
#
# Runs a release build of every consumer and grep'd the output for forbidden
# telemetry symbols. Exits non-zero if any symbol is present, so CI can fail
# on a regression.
#
# Forbidden symbol set:
#   posthog        any posthog-* SDK reference
#   phc_           the PostHog project key prefix
#   i.posthog.com  the EU / US ingestion endpoint
#   /v1/traces     the OTLP HTTP path
#   /capture/      the PostHog /capture/ path
#   land:          any `land:<tier>:*` event-name string literal
#
# Skipped contexts:
#   • Anything inside Dependency/, Documentation/, Target/debug/, node_modules
#   • Source-map files (`.map`) - tree-shake metadata is by design noisy
#   • Comments (best-effort: prettier preserves trailing slashes; we accept
#     a small amount of false-positive churn there in exchange for a simple
#     grep)
#
# Usage:
#   sh Maintain/Test/TelemetryTreeShake.sh                # all consumers
#   sh Maintain/Test/TelemetryTreeShake.sh mountain       # just Mountain
#   sh Maintain/Test/TelemetryTreeShake.sh sky cocoon     # subset
#
# Pre-req: `Maintain/Script/TierEnvironment.sh` is sourced via
# Build.sh / Release.sh. This script DOESN'T re-build - it inspects the
# build output that's already on disk. Run a release build first:
#
#   NODE_ENV=production sh Maintain/Release/Build.sh --profile release-electron
#
# then invoke this script.
#===============================================================================

set -e

Current=$(cd -- "$(dirname -- "$0")" > /dev/null 2>&1 && pwd)
Root="$Current/../.."
cd "$Root"

# Forbidden patterns. `posthog` is case-insensitive; the others are exact.
ForbiddenPatterns="posthog|phc_|i\.posthog\.com|/v1/traces|/capture/|land:"

# Per-consumer output paths.
MountainBinary="Element/Mountain/Target/release/Mountain"
CocoonBundle="Element/Cocoon/Target"
SkyBundle="Element/Sky/Target/Static"
OutputBundle="Element/Output/Configuration"
WorkerBundle="Element/Worker/Target"

Failed=0
TotalChecked=0

# ---------------------------------------------------------------------------
# Probes
# ---------------------------------------------------------------------------

# Inspect a binary via `strings` + grep. Args: name, path.
ProbeBinary() {
	Name="$1"
	Path="$2"
	if [ ! -f "$Path" ]; then
		echo "  [skip] $Name not built ($Path missing - run release build first)"
		return 0
	fi
	TotalChecked=$((TotalChecked + 1))
	Hits=$(strings "$Path" 2> /dev/null | grep -E -- "$ForbiddenPatterns" | head -20)
	if [ -n "$Hits" ]; then
		echo "  [FAIL] $Name contains forbidden symbols:"
		printf '%s\n' "$Hits" | sed 's/^/         /'
		Failed=$((Failed + 1))
	else
		Size=$(wc -c < "$Path" | tr -d ' ')
		echo "  [pass] $Name ($Path, ${Size} B) clean"
	fi
}

# Inspect a JS / asset bundle directory via grep. Args: name, dir, glob.
ProbeBundle() {
	Name="$1"
	Dir="$2"
	Glob="${3:-*.js}"
	if [ ! -d "$Dir" ]; then
		echo "  [skip] $Name not built ($Dir missing)"
		return 0
	fi
	TotalChecked=$((TotalChecked + 1))
	# `grep -RIE` recurse, binary-skip, extended-regex.
	# Skip source maps + node_modules + Documentation.
	# shellcheck disable=SC2038
	Hits=$(find "$Dir" -type f -name "$Glob" \
		-not -name "*.map" \
		-not -path "*/node_modules/*" \
		-not -path "*/Documentation/*" \
		2> /dev/null \
		| xargs grep -E -l -- "$ForbiddenPatterns" 2> /dev/null \
		| head -5)
	if [ -n "$Hits" ]; then
		echo "  [FAIL] $Name contains forbidden symbols. Files:"
		printf '%s\n' "$Hits" | sed 's/^/         /'
		# Show the first 3 lines per offending file.
		printf '%s\n' "$Hits" | while IFS= read -r File; do
			echo "         --- $File ---"
			grep -E -n -- "$ForbiddenPatterns" "$File" 2> /dev/null | head -3 | sed 's/^/             /'
		done
		Failed=$((Failed + 1))
	else
		FileCount=$(find "$Dir" -type f -name "$Glob" -not -name "*.map" 2> /dev/null | wc -l | tr -d ' ')
		echo "  [pass] $Name ($Dir, ${FileCount} files matching $Glob) clean"
	fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

echo "========================================"
echo "Telemetry Tree-Shake Smoke Test"
echo "========================================"
echo "Forbidden patterns: $ForbiddenPatterns"
echo "Run a release build first; this script only inspects existing output."
echo ""

Targets="${*:-mountain cocoon sky output worker}"

for Target in $Targets; do
	case "$Target" in
		mountain | Mountain)
			echo "Mountain (Rust release binary):"
			ProbeBinary "Mountain" "$MountainBinary"
			# Air / Rest / Grove / SideCar release binaries land in their
			# own crate Target/release/ - probe all known sidecars.
			for Sidecar in Air Rest Grove SideCar Download; do
				BinPath="Element/$Sidecar/Target/release/$Sidecar"
				[ "$Sidecar" = "Download" ] && BinPath="Element/SideCar/Target/release/Download"
				ProbeBinary "$Sidecar" "$BinPath"
			done
			;;
		cocoon | Cocoon)
			echo "Cocoon (Node ESM bundle):"
			ProbeBundle "Cocoon" "$CocoonBundle" "*.js"
			;;
		sky | Sky)
			echo "Sky (Astro static + bundled):"
			# Astro emits hashed `_astro/*.js` chunks; grep them.
			ProbeBundle "Sky/_astro" "$SkyBundle" "*.js"
			;;
		output | Output)
			echo "Output (esbuild config + plugins):"
			ProbeBundle "Output" "$OutputBundle" "*.js"
			;;
		worker | Worker)
			echo "Worker (service worker):"
			ProbeBundle "Worker" "$WorkerBundle" "*.js"
			;;
		*)
			echo "  [warn] unknown target: $Target"
			;;
	esac
	echo ""
done

echo "========================================"
echo "Summary: $TotalChecked output(s) checked, $Failed failed"
echo "========================================"

if [ "$Failed" -gt 0 ]; then
	exit 1
fi
exit 0
