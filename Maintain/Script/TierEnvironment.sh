#!/usr/bin/env sh

#===============================================================================
# Maintain/Script/TierEnvironment.sh - Tier-gating + Product-identity fan-out
#===============================================================================
#
# Source this file from Maintain/Debug/Build.sh and Maintain/Release/Build.sh
# to resolve .env.Land (or .env.Land.Sample), export every Tier*, Product*,
# and Network* env var, and derive downstream blobs:
#
#   CargoFeatures        - comma-joined Rust features for cargo build
#   CocoonEsbuildDefine  - JSON object of __LandTier_*__, __LandProduct_*__,
#                          and __LandNetwork_*__ replacements that Cocoon's
#                          TargetConfig.ts merges into esbuild
#
# Every Element (Mountain, Wind, Cocoon, Sky, Echo, Air, Rest) sees the same
# tier + product set so no Element can drift from the others. Atom I5 added
# Product* and Network* propagation on top of the original Tier-only fan-out.
#===============================================================================

TierEnvFile="${Land_Env_File:-}"
if [ -z "$TierEnvFile" ]; then
	if [ -f ".env.Land" ]; then
		TierEnvFile=".env.Land"
	elif [ -f "../.env.Land" ]; then
		TierEnvFile="../.env.Land"
	elif [ -f ".env.Land.Sample" ]; then
		TierEnvFile=".env.Land.Sample"
	elif [ -f "../.env.Land.Sample" ]; then
		TierEnvFile="../.env.Land.Sample"
	fi
fi

# ---------------------------------------------------------------------------
# Domain-specific overlays - sourced AFTER the root `.env.Land` so they
# compose cleanly. Each overlay owns one concern:
#   .env.Land.Node       - Pick, Require
#   .env.Land.Extensions - Ship, Lodge, Extend, Probe, Skip, Mute, Wire,
#                          Install
#   .env.Land.PostHog    - Authorize, Beam, Report, Throttle, Buffer,
#                          Batch, Cap, Replay, Ask, Brand
# Overlays cascade: real > .Sample > absent. Absent files are silently
# skipped so a fresh clone still builds with just the root `.env.Land`.
# ---------------------------------------------------------------------------
TierEnvDirectory=""
if [ -n "$TierEnvFile" ]; then
	TierEnvDirectory="$(dirname "$TierEnvFile")"
fi

SourceOverlayIfPresent() {
	OverlayBase="$1"
	OverlayCandidate=""
	for Dir in "$TierEnvDirectory" "." ".."; do
		[ -z "$Dir" ] && continue
		if [ -f "$Dir/$OverlayBase" ]; then
			OverlayCandidate="$Dir/$OverlayBase"
			break
		fi
		if [ -f "$Dir/${OverlayBase}.Sample" ]; then
			OverlayCandidate="$Dir/${OverlayBase}.Sample"
			break
		fi
	done
	if [ -n "$OverlayCandidate" ]; then
		set -a
		# shellcheck disable=SC1090
		. "$OverlayCandidate"
		set +a
		echo "Overlay sourced: $OverlayCandidate"
	fi
}

if [ -n "$TierEnvFile" ] && [ -f "$TierEnvFile" ]; then
	set -a
	# shellcheck disable=SC1090
	. "$TierEnvFile"
	set +a
	echo "Tier set (from $TierEnvFile):"
	env | grep '^Tier' | sort
	echo "Product set:"
	env | grep '^Product' | sort
	echo "Network set:"
	env | grep '^Network' | sort

	SourceOverlayIfPresent ".env.Land.Node"
	SourceOverlayIfPresent ".env.Land.Extensions"
	SourceOverlayIfPresent ".env.Land.PostHog"

	# Display the resolved runtime overlays - the single-word PascalCase
	# verbs the .env.Land.{Node,Extensions,PostHog} overlays own. Pinned
	# allow-list (not a regex sweep) so unrelated PascalCase env vars
	# the OS / dev environment exports don't pollute the diagnostic
	# block. The legacy `^LAND_*` sweep was retired together with the
	# LAND_ → PascalCase migration of the overlay files.
	#
	# `if [ -n ... ]; then ... fi` instead of `[ -z ] && continue` -
	# Build.sh runs under `set -e` and the `&&`-form trips errexit on
	# the iteration where Value is empty (`printenv` exits non-zero
	# when the var is unset, the command substitution captures empty,
	# `[ -z "" ]` returns 0, `&&` reaches `continue`, `continue` does
	# its thing, and the iteration's exit status becomes the inverted
	# test outcome - which dash interprets as a failure under -e and
	# silently aborts the sourced script. The if-form avoids the
	# &&-chain entirely.
	LandRuntimeKeys="Pick Require Ship Lodge Extend Probe Skip Mute Wire Install Authorize Beam Report Throttle Buffer Batch Cap Replay Ask Brand"
	LandRuntimeVars=""
	for Key in $LandRuntimeKeys; do
		Value=$(printenv "$Key" 2>/dev/null || true)
		if [ -n "$Value" ]; then
			LandRuntimeVars="${LandRuntimeVars}${Key}=${Value}
"
		fi
	done
	if [ -n "$LandRuntimeVars" ]; then
		echo "Land runtime set:"
		printf '%s' "$LandRuntimeVars" | sort
	fi
	echo "----------------------------------------"

	CargoFeatures=""
	AddFeature() {
		if [ -z "$CargoFeatures" ]; then CargoFeatures="$1"; else CargoFeatures="$CargoFeatures,$1"; fi
	}
	[ "${TierRemoteProcedureCall:-}" = "SharedMemory" ] && AddFeature TierRemoteProcedureCallSharedMemory
	[ "${TierHTTPProxy:-}" = "Hyper" ] && AddFeature TierHTTPProxyHyper
	[ "${TierLogger:-}" = "Ring" ] && AddFeature TierLoggerRing
	[ "${TierFileSystem:-}" = "Layer4" ] && AddFeature TierFileSystemLayer4
	[ "${TierFindFiles:-}" = "Layer4" ] && AddFeature TierFindFilesLayer4
	[ "${TierGlob:-}" = "Native" ] && AddFeature TierGlobNative
	[ "${TierFileWatcher:-}" = "Layer4" ] && AddFeature TierFileWatcherLayer4
	[ "${TierSchemeAssets:-}" = "Hybrid" ] && AddFeature TierSchemeAssetsHybrid
	[ "${TierConfiguration:-}" = "Eager" ] && AddFeature TierConfigurationEager
	[ "${TierDiagnostics:-}" = "Delta" ] && AddFeature TierDiagnosticsDelta
	[ "${TierClipboard:-}" = "Layer4" ] && AddFeature TierClipboardLayer4
	[ "${TierOpenExternal:-}" = "Layer4" ] && AddFeature TierOpenExternalLayer4
	[ "${TierExtensionScan:-}" = "Parallel" ] && AddFeature TierExtensionScanParallel
	export CargoFeatures

	# Cocoon esbuild `define` blob: every Tier*, Product*, Network* env
	# var becomes a `__Land<Section>_<Capability>__` replacement token.
	# Cocoon's TargetConfig.ts reads CocoonEsbuildDefine and merges it
	# into its esbuild options. Atom I5 extended this from Tier-only to
	# include product identity + version and network ports.
	if command -v node >/dev/null 2>&1; then
		CocoonEsbuildDefine=$(node -e "
const prefixes = [
	{ src: 'Tier', token: 'Tier' },
	{ src: 'Product', token: 'Product' },
	{ src: 'Network', token: 'Network' },
];
const e = Object.fromEntries(
	prefixes.flatMap(({ src, token }) =>
		Object.entries(process.env)
			.filter(([k]) => k.startsWith(src))
			.map(([k, v]) => [\`__Land\${token}_\${k.slice(src.length)}__\`, JSON.stringify(v)]),
	),
);
process.stdout.write(JSON.stringify(e));
")
		export CocoonEsbuildDefine
	fi

	# Generate Sky/Public/product.json from the resolved product env vars
	# so Wind's IWorkbenchConstructionOptions, the workbench's productService,
	# and every runtime fetch of /product.json agree on one source of truth.
	# The script is idempotent - safe to invoke from any Build.sh.
	ResolveScript="$(dirname "$0")/ResolveProductConfig.sh"
	if [ -f "$ResolveScript" ] && [ -x "$ResolveScript" ]; then
		"$ResolveScript"
	elif [ -f "$ResolveScript" ]; then
		sh "$ResolveScript"
	fi
else
	echo "No .env.Land or .env.Land.Sample found - using compiled defaults."
fi
