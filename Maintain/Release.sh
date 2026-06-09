#!/usr/bin/env sh

#===============================================================================
# Release.sh - Release Build Script with Profile Support
#===============================================================================
#
# This script runs the release build with configurable profiles.
# It reads configuration from .vscode/land-config.json.
#
# Usage:
#   sh Maintain/Release.sh                    # Default production profile
#   sh Maintain/Release.sh --profile release  # Full release with signing
#   sh Maintain/Release.sh --profile web      # Web-only release
#
# Available profiles:
#   production  - Production build with Mountain workbench (default)
#   release     - Full release with packaging and signing
#   web-browser - Web browser deployment (no Tauri)
#
#===============================================================================

set -e

PROFILE="production"

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
		echo "  --profile, -p <name>  Build profile to use (default: production)"
		echo "  --help, -h            Show this help message"
		echo ""
		echo "Available profiles:"
		echo "  production  - Production build with Mountain workbench (default)"
		echo "  release     - Full release with packaging and signing"
		echo "  web-browser - Web browser deployment (no Tauri)"
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
echo "Land Release Build"
echo "========================================"
echo "Profile: $PROFILE"
echo "========================================"

case $PROFILE in
production)
	echo "Using Mountain workbench (production)"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=true
	export Debug=false
	export Level=silent
	export Dependency=Microsoft/VSCode
	export NODE_ENV=production
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=8192"
	export RUST_LOG=info
	;;
release)
	echo "Using Mountain workbench (full release)"
	export Mountain=true
	export Bundle=true
	export Clean=true
	export Compile=true
	export Debug=false
	export Level=silent
	export Dependency=Microsoft/VSCode
	export NODE_ENV=production
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=8192"
	export RUST_LOG=warn
	;;
web-browser)
	echo "Using Browser workbench (web-only)"
	export Browser=true
	export Bundle=true
	export Clean=true
	export Compile=true
	export Debug=false
	export Level=silent
	export Dependency=Microsoft/VSCode
	export NODE_ENV=production
	export NODE_VERSION=22
	export NODE_OPTIONS="--max-old-space-size=8192"
	export RUST_LOG=warn
	;;
*)
	echo "Unknown profile: $PROFILE"
	echo "Available profiles: production, release, web-browser"
	exit 1
	;;
esac

echo ""
echo "Starting release build..."
echo ""

./Target/release/Maintain -- pnpm tauri build
