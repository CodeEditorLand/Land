#!/usr/bin/env sh

#===============================================================================
# Maintain/Integration/SmokeProfiles.sh — Atom N4
#===============================================================================
#
# Boots each shippable profile variant in sequence, captures `Mountain.dev.log`
# for a short window (default 20 s), then greps the log for the canonical
# signatures that prove that profile's invariant. Reports go/no-go per profile.
#
# This is intentionally NOT a full end-to-end test: it doesn't open a workspace
# or click buttons. It validates that the gating environment variables flow
# through every layer (Build.sh → Sky Step 13 → Mountain Scanner → Mountain
# CocoonManagement → Sky Bootstrap.ts) and that the expected log signatures
# emit.
#
# Requires: a successful build of the corresponding profile. See Batch B in
# `.claude/plans/Consolidation-20260422.md` for the profile matrix.
#
# Usage:
#   sh Maintain/Integration/SmokeProfiles.sh                    # all profiles
#   sh Maintain/Integration/SmokeProfiles.sh --profile kernel   # one only
#   sh Maintain/Integration/SmokeProfiles.sh --window 40        # longer capture
#===============================================================================

set -e

PROFILE_FILTER=""
WINDOW_SECONDS="20"

while [ $# -gt 0 ]; do
	case $1 in
	--profile | -p)
		PROFILE_FILTER="$2"
		shift 2
		;;
	--window | -w)
		WINDOW_SECONDS="$2"
		shift 2
		;;
	--help | -h)
		echo "Usage: $0 [--profile <name>] [--window <seconds>]"
		echo ""
		echo "Smoke-tests each shippable profile. Without --profile, runs all."
		echo "Profiles: full, minimal, mountain-only, cocoon-headless, kernel"
		exit 0
		;;
	*)
		echo "Unknown option: $1"
		exit 1
		;;
	esac
done

BINARY="Element/Mountain/Target/debug/DevelopmentNodeEnvironment_MicrosoftVSCodeDependency_22NodeVersion_Bundle_Clean_Debug_Mountain"
LOG_ROOT="$HOME/Library/Application Support/land.editor.binary.development.node.environment.microsoft.vscode.dependency.node.22.bundle.clean.debug.mountain/logs"

if [ ! -x "$BINARY" ]; then
	echo "[SmokeProfiles] binary not found: $BINARY"
	echo "[SmokeProfiles] run a build first (e.g. Maintain/Debug/Build.sh --profile debug-electron)"
	exit 1
fi

RunProfile() {
	ProfileName="$1"
	EnvLine="$2"
	ExpectedSignatures="$3"
	ForbiddenSignatures="$4"

	if [ -n "$PROFILE_FILTER" ] && [ "$PROFILE_FILTER" != "$ProfileName" ]; then
		return 0
	fi

	echo ""
	echo "================================================================"
	echo "[SmokeProfiles] $ProfileName — env: $EnvLine"
	echo "================================================================"

	# Launch + tail window, then SIGTERM.
	env $EnvLine LAND_DEV_LOG=short NODE_ENV=development TAURI_ENV_DEBUG=true \
		"$BINARY" >/tmp/smoke_${ProfileName}.stdout 2>&1 &
	PID=$!

	Elapsed=0
	while [ "$Elapsed" -lt "$WINDOW_SECONDS" ]; do
		if ! kill -0 "$PID" 2>/dev/null; then break; fi
		sleep 2
		Elapsed=$((Elapsed + 2))
	done

	kill "$PID" 2>/dev/null || true
	wait "$PID" 2>/dev/null || true

	# Find the just-written log session.
	LogSession=$(ls -t "$LOG_ROOT" 2>/dev/null | head -1)
	if [ -z "$LogSession" ]; then
		echo "[SmokeProfiles] $ProfileName: FAIL — no log session produced"
		return 1
	fi
	LogFile="$LOG_ROOT/$LogSession/Mountain.dev.log"

	echo "[SmokeProfiles] $ProfileName log: $LogFile"

	Missing=""
	IFS="|"
	for Signature in $ExpectedSignatures; do
		if ! grep -q "$Signature" "$LogFile" 2>/dev/null; then
			Missing="$Missing\n  missing: $Signature"
		fi
	done

	Forbidden=""
	for Signature in $ForbiddenSignatures; do
		if [ -z "$Signature" ]; then continue; fi
		if grep -q "$Signature" "$LogFile" 2>/dev/null; then
			Forbidden="$Forbidden\n  forbidden: $Signature"
		fi
	done
	unset IFS

	if [ -z "$Missing" ] && [ -z "$Forbidden" ]; then
		echo "[SmokeProfiles] $ProfileName: PASS"
		return 0
	fi

	echo "[SmokeProfiles] $ProfileName: FAIL"
	[ -n "$Missing" ] && printf "%b\n" "$Missing"
	[ -n "$Forbidden" ] && printf "%b\n" "$Forbidden"
	return 1
}

OverallStatus=0

# Full profile — everything on
RunProfile "full" \
	"" \
	"Extension scan complete. Found|Cocoon handshake complete|vscode API shim critical symbols OK" \
	"LAND_SKIP_BUILTIN_EXTENSIONS=true|Skipping spawn (LAND_SPAWN_COCOON=false)" ||
	OverallStatus=1

# Minimal — no built-in extensions
RunProfile "minimal" \
	"LAND_SKIP_BUILTIN_EXTENSIONS=true" \
	"LAND_SKIP_BUILTIN_EXTENSIONS=true|Found 0 extensions|Cocoon handshake complete" \
	"Step 13: Copied [0-9]+ built-in" ||
	OverallStatus=1

# Mountain-only — no Cocoon
RunProfile "mountain-only" \
	"LAND_SPAWN_COCOON=false" \
	"Skipping spawn (LAND_SPAWN_COCOON=false)|Extension scan complete" \
	"Cocoon handshake complete|vscode API shim critical symbols OK" ||
	OverallStatus=1

# Cocoon-headless — Wind preload off (logged via performance mark, not in Mountain.dev.log)
RunProfile "cocoon-headless" \
	"LAND_ENABLE_WIND=false" \
	"Cocoon handshake complete|Extension scan complete" \
	"" ||
	OverallStatus=1

# Kernel — all three off
RunProfile "kernel" \
	"LAND_SKIP_BUILTIN_EXTENSIONS=true LAND_SPAWN_COCOON=false LAND_ENABLE_WIND=false" \
	"Skipping spawn (LAND_SPAWN_COCOON=false)|Found 0 extensions" \
	"Cocoon handshake complete" ||
	OverallStatus=1

echo ""
echo "================================================================"
if [ "$OverallStatus" -eq 0 ]; then
	echo "[SmokeProfiles] All profiles PASSED"
else
	echo "[SmokeProfiles] One or more profiles FAILED"
fi
echo "================================================================"

# -----------------------------------------------------------------------------
# Shippable-surface footprint report (Atom J1-J4 visible output)
#
# Profiles only differ in env flags, but the resulting `.app` bundle size
# changes with `LAND_SKIP_BUILTIN_EXTENSIONS` (Sky Step 13 skips ~93
# extensions, ~200 MB), and Mountain's extension scan observable total
# changes independently. Print both so a pasted report lets reviewers
# gauge the cost of each build.
# -----------------------------------------------------------------------------
echo ""
echo "================================================================"
echo "[SmokeProfiles] Shippable-surface footprint"
echo "================================================================"

APP_BUNDLE="Element/Mountain/Target/debug/bundle/macos/DevelopmentNodeEnvironment_MicrosoftVSCodeDependency_22NodeVersion_Bundle_Clean_Debug_Mountain.app"
SKY_EXTENSIONS="Element/Sky/Target/Static/Application/extensions"

if [ -d "$APP_BUNDLE" ]; then
	BundleSize=$(du -sh "$APP_BUNDLE" 2>/dev/null | awk '{print $1}')
	BundleBytes=$(du -sk "$APP_BUNDLE" 2>/dev/null | awk '{print $1 * 1024}')
	echo "  .app bundle:           $BundleSize (${BundleBytes} bytes)"
else
	echo "  .app bundle:           (not present; run build first)"
fi

if [ -f "$BINARY" ]; then
	BinarySize=$(du -sh "$BINARY" 2>/dev/null | awk '{print $1}')
	echo "  Mountain binary:       $BinarySize"
fi

if [ -d "$SKY_EXTENSIONS" ]; then
	ExtensionCount=$(ls "$SKY_EXTENSIONS" 2>/dev/null | wc -l | tr -d ' ')
	ExtensionBytes=$(du -sh "$SKY_EXTENSIONS" 2>/dev/null | awk '{print $1}')
	echo "  Bundled extensions:    $ExtensionCount dirs ($ExtensionBytes)"
else
	echo "  Bundled extensions:    (none — minimal or kernel profile)"
fi

CocoonBundle="Element/Cocoon/Target/Bootstrap/Implementation/CocoonMain.js"
if [ -f "$CocoonBundle" ]; then
	CocoonSize=$(du -sh "$CocoonBundle" 2>/dev/null | awk '{print $1}')
	echo "  CocoonMain.js:         $CocoonSize"
fi

WindBundle="Element/Wind/Target"
if [ -d "$WindBundle" ]; then
	WindBytes=$(du -sh "$WindBundle" 2>/dev/null | awk '{print $1}')
	echo "  Wind compiled:         $WindBytes"
fi

echo "================================================================"

exit "$OverallStatus"
