#!/usr/bin/env bash

#===============================================================================
# Debug/Build.sh - Debug Build Script with Profile Support
#===============================================================================
#
# This script runs the debug build with configurable profiles.
# It reads configuration from .vscode/land-config.json.
#
# Usage:
#   bash Maintain/Debug/Build.sh                    # Default debug profile
#   bash Maintain/Debug/Build.sh --profile wind     # Debug with Wind workbench
#   bash Maintain/Debug/Build.sh --profile mountain # Debug with Mountain workbench
#   bash Maintain/Debug/Build.sh --profile electron # Debug with Electron workbench
#
# Available profiles:
#   debug           - Default Browser workbench (70-80% features)
#   debug-wind      - Wind workbench (60-70% features)
#   debug-mountain  - Mountain workbench (80-90% features) [RECOMMENDED]
#   debug-electron  - Electron workbench (95%+ features)
#
#===============================================================================

set -e

# Default profile
PROFILE="debug"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --profile|-p)
      PROFILE="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --profile, -p <name>  Build profile to use (default: debug)"
      echo "  --help, -h            Show this help message"
      echo ""
      echo "Available profiles:"
      echo "  debug           - Browser workbench (70-80% features)"
      echo "  debug-wind      - Wind workbench (60-70% features)"
      echo "  debug-mountain  - Mountain workbench (80-90% features) [RECOMMENDED]"
      echo "  debug-electron  - Electron workbench (95%+ features)"
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

# Set environment variables based on profile
case $PROFILE in
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
    export NODE_VERSION=22
    export NODE_OPTIONS="--max-old-space-size=16384"
    ;;
  debug-wind)
    echo "Using Wind workbench"
    export Wind=true
    export Bundle=true
    export Clean=true
    export Compile=false
    export Debug=true
    export Level=silent
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
    export Level=silent
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
    export Level=silent
    export Dependency=Microsoft/VSCode
    export NODE_ENV=development
    export NODE_VERSION=22
    export NODE_OPTIONS="--max-old-space-size=16384"
    ;;
  *)
    echo "Unknown profile: $PROFILE"
    echo "Available profiles: debug, debug-wind, debug-mountain, debug-electron"
    exit 1
    ;;
esac

# Run the build
echo ""
echo "Starting build..."
echo ""

./Target/release/Maintain -- pnpm tauri build --debug
