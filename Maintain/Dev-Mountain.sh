#!/usr/bin/env sh

#===============================================================================
# Dev-Mountain.sh - Mountain Tauri Dev Mode with Sky Hot-Reload
#===============================================================================
#
# This script starts Mountain Tauri in development mode. The Sky dev server
# is automatically started via Tauri's beforeDevCommand configuration.
#
# Usage:
#   sh Maintain/Dev-Mountain.sh                    # Default: Mountain workbench
#   sh Maintain/Dev-Mountain.sh --profile browser  # Browser workbench
#   sh Maintain/Dev-Mountain.sh --profile electron # Electron workbench
#
# Workflow:
#   1. Sets environment variables (Mountain=true, NODE_ENV=development)
#   2. Starts Mountain Tauri in dev mode
#   3. Tauri automatically starts Sky via beforeDevCommand
#   4. Hot-reload works automatically when editing Sky source files
#
# Requirements:
#   - pnpm installed
#   - Rust toolchain installed
#   - Node.js 22+ recommended
#
#===============================================================================

set -e

PROFILE="mountain"

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
		echo "  --profile, -p <name>  Workbench profile to use"
		echo "  --help, -h            Show this help message"
		echo ""
		echo "Available profiles:"
		echo "  mountain - Mountain workbench (80-90% features) [DEFAULT]"
		echo "  electron - Electron workbench (95%+ features)"
		echo "  browser  - Browser workbench (70-80% features)"
		echo ""
		echo "Environment Variables:"
		echo "  Mountain=true  Enable Mountain workbench"
		echo "  Electron=true  Enable Electron workbench"
		echo "  Browser=true   Enable Browser workbench"
		echo ""
		echo "Examples:"
		echo "  $0                    # Default Mountain dev"
		echo "  $0 --profile browser  # Browser workbench dev"
		echo "  $0 --profile electron # Electron workbench dev"
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
echo "Land Mountain Dev Mode with Hot-Reload"
echo "========================================"
echo "Profile: $PROFILE"
echo "========================================"
echo ""

case $PROFILE in
mountain)
	echo "Using Mountain workbench"
	export Mountain=true
	;;
electron)
	echo "Using Electron workbench"
	export Electron=true
	;;
browser)
	echo "Using Browser workbench"
	export Browser=true
	;;
*)
	echo "Unknown profile: $PROFILE"
	echo "Available profiles: mountain, electron, browser"
	exit 1
	;;
esac

export NODE_ENV=development
export Bundle=false
export Debug=true

echo ""
echo "========================================"
echo "Starting Mountain Tauri Development"
echo "========================================"
echo ""
echo "Note: Sky dev server will be auto-started via beforeDevCommand"
echo ""
echo "Hot-Reload: Enabled (changes to Sky source will auto-reload)"
echo ""
echo "To stop: Press Ctrl+C"
echo "========================================"
echo ""

cd Element/Mountain

pnpm tauri dev
