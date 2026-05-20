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
#   .env.Land.Node        - Pick, Require
#   .env.Land.Extensions  - Ship, Lodge, Extend, Probe, Skip, Mute, Wire,
#                           Install
#   .env.Land.PostHog     - Authorize, Beam, Report, Throttle, Buffer,
#                           Batch, Cap, Replay, Ask, Brand, OTLPEndpoint,
#                           OTLPEnabled, Capture, Trace, Record
#   .env.Land.Diagnostics - Inspect, Smoke, Trace, Record (debug-only
#                           knobs - DevTools auto-open, the smoke-test
#                           harness gate, dev-log tag selection, and
#                           the dev-log file sink toggle).
#   .env.Land.Bundled     - Pack, Boot (workbench bundle layout)
# Overlays cascade: real > .Sample > absent. Absent files are silently
# skipped so a fresh clone still builds with just the root `.env.Land`.
#
# Production overlay chain: when the build is launched in production
# mode (`NODE_ENV=production` OR `Profile=*release*`), each overlay is
# followed by its `.env.Land.Production.<Domain>` sibling so prod-
# appropriate values win last:
#   .env.Land                → .env.Land.Production
#   .env.Land.Bundled.Sample → .env.Land.Production.Bundled
#   .env.Land.Node           → .env.Land.Production.Node
#   .env.Land.Extensions     → .env.Land.Production.Extensions
#   .env.Land.PostHog        → .env.Land.Production.PostHog
#   .env.Land.Diagnostics    → .env.Land.Production.Diagnostics
# Each `.env.Land.Production.<Domain>` overlay declares one purpose: telemetry off
# (`Capture=false`), polyfills on (`Disable=false`), bundled layouts
# packed (`Pack="electron browser sessions workbench"`, `Boot=true`),
# diagnostic knobs off (`Trace=`, `Record=0`), `phc_` key + `Brand`
# distinct-id stripped from the build env. Belt-and-braces alongside
# the per-element `cfg!(debug_assertions)` / `import.meta.env.DEV` /
# `process.env.NODE_ENV` tree-shake gates.
# ---------------------------------------------------------------------------
TierEnvDirectory=""
if [ -n "$TierEnvFile" ]; then
	TierEnvDirectory="$(dirname "$TierEnvFile")"
fi

# Production-mode detection. Triggers the `.env.Land.Production.<Domain>` overlay
# chain. Either `NODE_ENV=production` (the JS / esbuild / Vite
# convention) or a Build.sh `Profile` containing `release` flips this
# on. The result is exported so the spawned cargo / pnpm / astro
# subprocesses can read `LandIsProduction` directly without having to
# re-derive the predicate.
LandIsProduction="false"
if [ "${NODE_ENV:-}" = "production" ]; then
	LandIsProduction="true"
fi
case "${Profile:-}" in
*release* | *Release*) LandIsProduction="true" ;;
esac
export LandIsProduction

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

# Production-overlay sourcing. Called immediately after each dev
# overlay so the `.env.Land.Production.<Domain>` values override dev defaults when
# `LandIsProduction=true`. Absence is silent - dev builds skip every
# call to this helper without needing a separate code path.
SourceProductionOverlayIfActive() {
	[ "$LandIsProduction" = "true" ] || return 0
	OverlayBase="$1"
	for Dir in "$TierEnvDirectory" "." ".."; do
		[ -z "$Dir" ] && continue
		if [ -f "$Dir/$OverlayBase" ]; then
			set -a
			# shellcheck disable=SC1090
			. "$Dir/$OverlayBase"
			set +a
			echo "Production overlay sourced: $Dir/$OverlayBase"
			return 0
		fi
	done
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

	if [ "$LandIsProduction" = "true" ]; then
		echo "----------------------------------------"
		echo "Production overlay chain ACTIVE (NODE_ENV=${NODE_ENV:-} Profile=${Profile:-})"
		echo "  Each .env.Land.<X> is followed by .env.Land.Production.<X>"
		echo "----------------------------------------"
	fi

	# Root .env.Land → .env.Land.Production (overrides ProductCommit /
	# ProductQuality plus any tier flags the prod build pins).
	SourceProductionOverlayIfActive ".env.Land.Production"

	SourceOverlayIfPresent ".env.Land.Node"
	SourceProductionOverlayIfActive ".env.Land.Production.Node"

	SourceOverlayIfPresent ".env.Land.Extensions"
	SourceProductionOverlayIfActive ".env.Land.Production.Extensions"

	SourceOverlayIfPresent ".env.Land.PostHog"
	SourceProductionOverlayIfActive ".env.Land.Production.PostHog"

	SourceOverlayIfPresent ".env.Land.Diagnostics"
	SourceProductionOverlayIfActive ".env.Land.Production.Diagnostics"

	# Bundled cascade: `.env.Land.Bundled` (if present) → profile-level
	# `export Pack=…` in Build.sh wins last. The profile cases run AFTER
	# this script returns, so they override anything set here. In
	# production mode, `.env.Land.Production.Bundled` runs after the dev
	# Bundled overlay, then the release-Build.sh case-statement (if it
	# sets Pack=…) wins last.
	SourceOverlayIfPresent ".env.Land.Bundled"
	SourceProductionOverlayIfActive ".env.Land.Production.Bundled"

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
	LandRuntimeKeys="Pick Require Ship Lodge Extend Probe Skip Mute Wire Install Authorize Beam Report Throttle Buffer Batch Cap Replay Ask Brand OTLPEndpoint OTLPEnabled Capture Inspect Smoke Trace Record Disable DisableUIFixes Pack Boot LandIsProduction"
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
