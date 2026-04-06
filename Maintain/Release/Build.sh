#!/usr/bin/env sh

#===============================================================================
# Release/Build.sh - Release Build Script with Profile Support
#===============================================================================
#
# This script runs the release build with configurable profiles.
# It reads configuration from .vscode/land-config.json.
#
# Usage:
#   sh Maintain/Release/Build.sh                    # Default production profile
#   sh Maintain/Release/Build.sh --profile release  # Full release with signing
#   sh Maintain/Release/Build.sh --profile web      # Web-only release
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
		export Bundle=false
		export Clean=true
		export Compile=true
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=8192"
		export RUST_LOG=info

		export Compiler="${Compiler:-esbuild}"
		if [ "$Compiler" = "Rest" ]; then
			echo "Using Rest compiler"
			export Compiler=Rest
		else
			echo "Using esbuild compiler"
			export Compiler=esbuild
		fi

		if [ "$Compiler" = "Rest" ]; then
			echo ""
			echo "Stage 3: Rest compilation of VSCode output"
			echo "=========================================="

			if [ "$NODE_ENV" = "development" ]; then
				VSCodeSourceDir="Dependency/Microsoft/Dependency/Editor/out"
			else
				VSCodeSourceDir="Dependency/Microsoft/Dependency/Editor/out-build"
			fi

			RestOutputDir="Target/Rest/Microsoft/VSCode"
			mkdir -p "$RestOutputDir"

			if [ ! -d "$VSCodeSourceDir" ]; then
				echo "[Rest] Warning: VSCode source directory not found: $VSCodeSourceDir"
				echo "[Rest] Skipping Rest compilation - ensure VSCode is built first"
			else
				echo "[Rest] Compiling from: $VSCodeSourceDir"
				echo "[Rest] Output directory: $RestOutputDir"

				if command -v Rest > /dev/null 2>&1; then
					Rest compile \
						--input "$VSCodeSourceDir" \
						--output "$RestOutputDir" \
						--target es2024 \
						--module commonjs \
						${REST_OPTIONS:+ $REST_OPTIONS}

					if [ $? -eq 0 ]; then
						echo "[Rest] Compilation successful"
					else
						echo "[Rest] Compilation failed - falling back to esbuild"
						export Compiler=esbuild
					fi
				else
					echo "[Rest] 'Rest' command not found - falling back to esbuild"
					echo "[Rest] Install @codeeditorland/rest or set REST_BINARY_PATH"
					export Compiler=esbuild
				fi
			fi
		fi
		;;
	release)
		echo "Using Mountain workbench (full release)"
		export Mountain=true
		export Bundle=false
		export Clean=true
		export Compile=true
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=8192"
		export RUST_LOG=warn

		export Compiler="${Compiler:-esbuild}"
		if [ "$Compiler" = "Rest" ]; then
			echo "Using Rest compiler"
			export Compiler=Rest
		else
			echo "Using esbuild compiler"
			export Compiler=esbuild
		fi
		;;
	web-browser)
		echo "Using Browser workbench (web-only)"
		export Browser=true
		export Bundle=false
		export Clean=true
		export Compile=true
		export Debug=false
		export Level=silent
		export Dependency=Microsoft/VSCode
		export NODE_ENV=production
		export NODE_VERSION=22
		export NODE_OPTIONS="--max-old-space-size=8192"
		export RUST_LOG=warn

		export Compiler="${Compiler:-esbuild}"
		if [ "$Compiler" = "Rest" ]; then
			echo "Using Rest compiler"
			export Compiler=Rest
		else
			echo "Using esbuild compiler"
			export Compiler=esbuild
		fi
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
