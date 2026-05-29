#!/usr/bin/env sh

#===============================================================================
# Debug/Run.sh - Development Run Script with Hot-Reload Support
#===============================================================================
#
# Usage:
#   sh Maintain/Debug/Run.sh                    # Default debug profile
#   sh Maintain/Debug/Run.sh --profile mountain # Run with Mountain workbench
#   sh Maintain/Debug/Run.sh --profile electron # Run with Electron workbench
#
# Available profiles:
#   debug          - Default Browser workbench with hot-reload
#   debug-mountain - Mountain workbench with hot-reload [RECOMMENDED]
#   debug-electron - Electron workbench with hot-reload
#
# Env vars (PascalCase):
#   HotReload      true/false (default true)
#   Watch          true/false (default true)
#   LiveReloadPort port number (default 3001)
#===============================================================================

set -e

Profile="debug"

while [ $# -gt 0 ]; do
	case $1 in
		--profile | -p)
			Profile="$2"
			shift 2
			;;
		--no-hot-reload)
			export HotReload=false
			shift
			;;
		--no-watch)
			export Watch=false
			shift
			;;
		--port)
			export LiveReloadPort="$2"
			shift 2
			;;
		--help | -h)
			echo "Usage: $0 [OPTIONS]"
			echo ""
			echo "Options:"
			echo "  --profile, -p <name>   Run profile to use (default: debug)"
			echo "  --no-hot-reload        Disable hot-reload"
			echo "  --no-watch             Disable watch mode"
			echo "  --port <port>          Set live-reload port (default: 3001)"
			echo "  --help, -h             Show this help message"
			echo ""
			echo "Available profiles:"
			echo "  debug          - Browser workbench with hot-reload"
			echo "  debug-mountain - Mountain workbench with hot-reload [RECOMMENDED]"
			echo "  debug-electron - Electron workbench with hot-reload"
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
echo "Land Development Run"
echo "========================================"
echo "Profile: $Profile"
echo "Hot-reload: ${HotReload:-true}"
echo "Watch mode: ${Watch:-true}"
echo "Live-reload port: ${LiveReloadPort:-3001}"
echo "========================================"

case $Profile in
	debug)
		echo "Using Browser workbench (default debug)"
		export Browser=true
		export Bundle=true
		export Clean=true
		export Compile=false
		export Debug=true
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=development
		export NODE_VERSION=24
		export NODE_OPTIONS="--max-old-space-size=16384"
		;;
	debug-mountain)
		echo "Using Mountain workbench (RECOMMENDED)"
		export Mountain=true
		export Bundle=true
		export Clean=true
		export Compile=false
		export Debug=true
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=development
		export NODE_VERSION=24
		export NODE_OPTIONS="--max-old-space-size=16384"
		;;
	debug-electron)
		echo "Using Electron workbench"
		export Electron=true
		export Bundle=true
		export Clean=true
		export Compile=false
		export Debug=true
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=development
		export NODE_VERSION=24
		export NODE_OPTIONS="--max-old-space-size=16384"
		;;
	*)
		echo "Unknown profile: $Profile"
		echo "Available profiles: debug, debug-mountain, debug-electron"
		exit 1
		;;
esac

echo ""
echo "Starting development server with hot-reload..."
echo ""

./Target/release/Maintain run --profile "$Profile"
