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
		echo "  debug               - Browser workbench (70-80% features)"
		echo "  debug-mountain      - Mountain workbench (80-90% features) [RECOMMENDED]"
		echo "  debug-electron      - Electron workbench (95%+ features)"
		echo "  debug-electron-rest - Electron + Rest OXC compiler (fastest TS)"
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
	export Compiler=Rest
	export Debug=true
	export Level=debug
	export Dependency=Microsoft/VSCode
	export NODE_ENV=development
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=16384"

	# Build Rest compiler if binary is missing
	if [ ! -f "Element/Rest/Target/release/Rest" ]; then
		echo ""
		echo "Building Rest OXC compiler (first time only)..."
		cargo build -p Rest --release 2>&1 | tail -5
		echo ""
	fi
	;;
*)
	echo "Unknown profile: $PROFILE"
	echo "Available profiles: debug, debug-mountain, debug-electron, debug-electron-rest"
	exit 1
	;;
esac

# When Electron flag changes, Output must rebuild to include/exclude
# workbench.desktop.main.js and electron-browser paths.
# Clean Output's compiled config + target to force fresh entry discovery.
if [ "$Electron" = "true" ]; then
	if [ ! -f "Element/Output/Target/Microsoft/VSCode/vs/workbench/workbench.desktop.main.js" ]; then
		echo "Cleaning Output cache (Electron=true, desktop workbench missing)..."
		rm -rf Element/Output/Configuration Element/Output/Target/Microsoft
	fi
fi

echo ""
echo "Starting build..."
echo ""

./Target/release/Maintain -- pnpm tauri build --debug
